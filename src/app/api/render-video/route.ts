import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import * as googleTTS from "google-tts-api";
import { spawn } from "child_process";

const ffmpegPath = require("ffmpeg-static");

// Helper to download a file from URL
async function downloadFile(url: string, destPath: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(destPath, Buffer.from(buffer));
}

// Helper function to process video with FFmpeg
async function processVideo(
    imagePaths: string[],
    audioPaths: string[],
    tempDir: string,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        // Create inputs.txt for images
        const concatTxtPath = path.join(tempDir, "inputs.txt");
        const fileContent = imagePaths.map(img => `file '${img.replace(/\\/g, '/')}'\nduration 4`).join('\n') + `\nfile '${imagePaths[imagePaths.length - 1].replace(/\\/g, '/')}'`;
        fs.writeFileSync(concatTxtPath, fileContent);

        // Audio List
        const audioListPath = path.join(tempDir, "audio_inputs.txt");
        if (audioPaths.length > 0) {
            const audioContent = audioPaths.map(a => `file '${a.replace(/\\/g, '/')}'`).join('\n');
            fs.writeFileSync(audioListPath, audioContent);
        }

        // Build FFmpeg arguments
        const args = [
            "-f", "concat",
            "-safe", "0",
            "-i", concatTxtPath
        ];

        if (audioPaths.length > 0) {
            args.push("-f", "concat", "-safe", "0", "-i", audioListPath);
        }

        // Map streams
        args.push("-map", "0:v");
        if (audioPaths.length > 0) {
            args.push("-map", "1:a");
        }

        // Codecs and output
        args.push(
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", // Important for web playback
            "-y", // Overwrite output
            outputPath
        );

        console.log("Spawning FFmpeg with args:", args.join(" "));

        const process = spawn(ffmpegPath, args);

        let stderrData = "";

        process.stderr.on("data", (data) => {
            stderrData += data.toString();
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                console.error("FFmpeg process exited with code " + code);
                console.error("FFmpeg stderr:", stderrData);
                reject(new Error(`FFmpeg exited with code ${code}`));
            }
        });

        process.on("error", (err) => {
            console.error("FFmpeg spawn error:", err);
            reject(err);
        });
    });
}

export async function POST(req: NextRequest) {
    let tempDir = "";
    try {
        const { images, script, language } = await req.json();

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const sessionId = uuidv4();
        tempDir = path.join(os.tmpdir(), "om_render_" + sessionId);
        await fs.promises.mkdir(tempDir, { recursive: true });

        // 1. Save Images
        const imagePaths: string[] = [];
        for (let i = 0; i < images.length; i++) {
            const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
            const imagePath = path.join(tempDir, `image_${i}.png`);
            await fs.promises.writeFile(imagePath, base64Data, 'base64');
            imagePaths.push(imagePath);
        }

        // 2. Generate Audio per scene
        const audioPaths: string[] = [];
        for (let i = 0; i < (script?.length || 0); i++) {
            try {
                const text = script[i];
                if (text) {
                    // Force normal speed (slow: false)
                    // "Remove pause": We utilize google-tts-api defaults which are generally continuous.
                    // We map 'hinglish' to 'hi' as well for better accent, or 'en' if specifically requested.
                    const targetLang = (language === 'english') ? 'en' : 'hi';

                    const url = googleTTS.getAudioUrl(text, {
                        lang: targetLang,
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

        // 3. Create Video with FFmpeg
        const outputPath = path.join(tempDir, "output.mp4");

        await processVideo(imagePaths, audioPaths, tempDir, outputPath);

        // 4. Return Result
        const buffer = await fs.promises.readFile(outputPath);

        // Cleanup (Async, don't wait)
        fs.promises.rm(tempDir, { recursive: true, force: true }).catch(console.error);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": 'attachment; filename="offer_video.mp4"',
            }
        });

    } catch (e) {
        console.error("Render error:", e);
        // Attempt cleanup in case of error
        if (tempDir) fs.promises.rm(tempDir, { recursive: true, force: true }).catch(console.error);

        return NextResponse.json({ error: "Internal Render Error" }, { status: 500 });
    }
}
