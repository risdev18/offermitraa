import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import * as googleTTS from "google-tts-api";

// Helper to download a file from URL
async function downloadFile(url: string, destPath: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(destPath, Buffer.from(buffer));
}

export async function POST(req: NextRequest) {
    try {
        const { images, script, language } = await req.json();

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const sessionId = uuidv4();
        const tempDir = path.join(os.tmpdir(), "om_render_" + sessionId);
        await fs.promises.mkdir(tempDir, { recursive: true });

        // 1. Save Images
        const imagePaths = [];
        for (let i = 0; i < images.length; i++) {
            const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
            const imagePath = path.join(tempDir, `image_${i}.png`);
            await fs.promises.writeFile(imagePath, base64Data, 'base64');
            imagePaths.push(imagePath);
        }

        // 2. Generate Audio per scene
        const audioPaths = [];
        for (let i = 0; i < (script?.length || 0); i++) {
            try {
                const text = script[i];
                if (text) {
                    const url = googleTTS.getAudioUrl(text, {
                        lang: (language === 'hindi' || language === 'hi') ? 'hi' : 'en',
                        slow: false,
                        host: 'https://translate.google.com',
                    });
                    const audioPath = path.join(tempDir, `audio_${i}.mp3`);
                    await downloadFile(url, audioPath);
                    audioPaths.push(audioPath);
                }
            } catch (e) {
                console.error("Audio gen failed for index " + i, e);
            }
        }

        // 3. Create FFmpeg Command
        // Strategy: Create a slide show. 
        // We will use a complex filter to make a video from images, 4 seconds each.
        // Audio will be mixed.

        const outputPath = path.join(tempDir, "output.mp4");

        return new Promise((resolve, reject) => {
            const cmd = ffmpeg();

            // Add inputs (Images)
            imagePaths.forEach(img => {
                cmd.input(img).inputOptions(['-loop 1', '-t 4']); // 4 seconds per image
            });

            // Add inputs (Audios) - Optional: we can just concat them
            // For simplicity V1: We will create a background video track of concatenated images
            // and a separate audio track.

            // Let's rely on a simpler filter: concat demuxer is easier for files
            // We will create a 'inputs.txt' for ffmpeg concat
            /**
             * file 'image_0.png'
             * duration 4
             * file 'image_1.png'
             * duration 4
             * ...
             */

            const concatTxtPath = path.join(tempDir, "inputs.txt");
            const fileContent = imagePaths.map(img => `file '${img.replace(/\\/g, '/')}'\nduration 4`).join('\n') + `\nfile '${imagePaths[imagePaths.length - 1].replace(/\\/g, '/')}'`; // Repeat last for stream end logic

            fs.writeFileSync(concatTxtPath, fileContent);

            // Audio Concat
            // We need to concat audio files into one.
            const audioListPath = path.join(tempDir, "audio_inputs.txt");
            if (audioPaths.length > 0) {
                const audioContent = audioPaths.map(a => `file '${a.replace(/\\/g, '/')}'`).join('\n');
                fs.writeFileSync(audioListPath, audioContent);
            }

            // Build CLI command manually or via fluent
            // fluent-ffmpeg concat is finicky with images + durations.
            // We will use input('inputs.txt').inputFormat('concat')

            const proc = ffmpeg()
                .input(concatTxtPath)
                .inputOptions(['-f concat', '-safe 0'])
                .videoCodec('libx264')
                .outputOptions(['-pix_fmt yuv420p', '-movflags +faststart']);

            if (audioPaths.length > 0) {
                proc.input(audioListPath)
                    .inputOptions(['-f concat', '-safe 0']);
                // .complexFilter('amerge=inputs=2') if we had music
            }

            // Add silent audio if no audio, to ensure video compatibility? 
            // No, let's just output.

            proc
                .save(outputPath)
                .on('end', async () => {
                    // Read and send
                    try {
                        const buffer = await fs.promises.readFile(outputPath);
                        // Cleanup
                        // await fs.promises.rm(tempDir, { recursive: true, force: true }); 
                        // Keep temp for debugging for now if needed, or cleanup

                        resolve(new NextResponse(buffer, {
                            headers: {
                                "Content-Type": "video/mp4",
                                "Content-Disposition": 'attachment; filename="offer_video.mp4"',
                            }
                        }));
                    } catch (e) {
                        resolve(NextResponse.json({ error: "Read Failed" }, { status: 500 }));
                    }
                })
                .on('error', (err: any) => {
                    console.error("FFmpeg error:", err);
                    resolve(NextResponse.json({ error: "Rendering Failed. Ensure FFmpeg is installed." }, { status: 500 }));
                });
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
