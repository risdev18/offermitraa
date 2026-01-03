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
    if (!response.ok) throw new Error(`Failed to download file from ${url}`);
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(destPath, Buffer.from(buffer));
}

// Background Music URL (Energetic/Corporate)
const BG_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3"; // Energetic Hip Hop

// Helper function to process video with FFmpeg
async function processVideo(
    imagePaths: string[],
    audioPaths: string[],
    tempDir: string,
    outputPath: string,
    bgMusicPath?: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        let ffmpegExecutable = ffmpegPath;

        // Ensure absolute path on Windows/Turbopack
        if (typeof ffmpegExecutable === 'string' && !path.isAbsolute(ffmpegExecutable)) {
            ffmpegExecutable = path.resolve(process.cwd(), ffmpegExecutable);
        }

        if (!ffmpegExecutable || !fs.existsSync(ffmpegExecutable)) {
            // Fallback: try to find it in common node_modules location
            const fallbackPath = path.resolve(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe");
            if (fs.existsSync(fallbackPath)) {
                ffmpegExecutable = fallbackPath;
            } else {
                reject(new Error(`FFmpeg binary not found at ${ffmpegExecutable}`));
                return;
            }
        }

        // Each image should show for 4-5 seconds. Total duration around 20-25s.
        const durationPerImage = 5;

        // 1. Create a filter_complex to handle images, zoom effects, and audio mixing
        // This is more robust than the concat demuxer for adding effects.

        const args: string[] = [];

        // Add image inputs
        imagePaths.forEach(img => {
            args.push("-loop", "1", "-t", durationPerImage.toString(), "-i", img);
        });

        // Add voice inputs
        if (audioPaths.length > 0) {
            // We'll concat voice parts first or use them in filter_complex
            audioPaths.forEach(aud => {
                args.push("-i", aud);
            });
        }

        // Add BG Music
        if (bgMusicPath) {
            args.push("-stream_loop", "-1", "-i", bgMusicPath);
        }

        // Filter Complex
        let filter = "";

        // 1. Process Images with Zoom/Pan and Concat
        // We'll use a more reliable zoompan config
        for (let i = 0; i < imagePaths.length; i++) {
            // scale and then zoompan
            filter += `[${i}:v]scale=1280:2276:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,zoompan=z='min(zoom+0.0012,1.5)':d=${durationPerImage * 25}:s=1080x1920:fps=25[v${i}];`;
        }

        // Concat video segments
        for (let i = 0; i < imagePaths.length; i++) {
            filter += `[v${i}]`;
        }
        filter += `concat=n=${imagePaths.length}:v=1:a=0[v_out];`;

        // 2. Process Audio
        if (audioPaths.length > 0) {
            // Concat voice segments
            const voiceStartIndex = imagePaths.length;
            for (let i = 0; i < audioPaths.length; i++) {
                filter += `[${voiceStartIndex + i}:a]`;
            }
            filter += `concat=n=${audioPaths.length}:v=0:a=1[voice_raw];`;

            // Normalize and Boost voice volume
            filter += `[voice_raw]volume=3.0[voice_out];`;

            if (bgMusicPath) {
                const bgMusicIndex = imagePaths.length + audioPaths.length;
                // Mix Voice and BG Music
                // Make BG music MUCH quieter (0.07) so voice is clear
                filter += `[${bgMusicIndex}:a]volume=0.07[bg_low];`;
                filter += `[voice_out][bg_low]amix=inputs=2:duration=first:dropout_transition=2[a_out]`;
            } else {
                filter += `[voice_out]anull[a_out]`;
            }
        } else if (bgMusicPath) {
            const bgMusicIndex = imagePaths.length;
            filter += `[${bgMusicIndex}:a]volume=0.15[a_out]`;
        }

        args.push("-filter_complex", filter);
        args.push("-map", "[v_out]");
        if (audioPaths.length > 0 || bgMusicPath) {
            args.push("-map", "[a_out]");
        }

        // Output settings
        args.push(
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-tune", "stillimage",
            "-pix_fmt", "yuv420p",
            "-r", "25",
            "-b:v", "2M",
            "-maxrate", "2M",
            "-bufsize", "4M",
            "-movflags", "+faststart",
            "-y",
            "-t", (imagePaths.length * durationPerImage).toString(), // Ensure output length matches
            outputPath
        );

        console.log("Spawning FFmpeg at:", ffmpegExecutable);
        console.log("Args:", args.join(" "));

        const ffmpegProcess = spawn(ffmpegExecutable, args);

        let stderrData = "";
        ffmpegProcess.stderr.on("data", (data) => {
            stderrData += data.toString();
        });

        ffmpegProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                console.error("FFmpeg process exited with code " + code);
                console.error("FFmpeg stderr:", stderrData);
                reject(new Error(`FFmpeg exited with code ${code}. Error: ${stderrData}`));
            }
        });

        ffmpegProcess.on("error", (err) => {
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
                // google-tts-api has a 200 char limit
                let text = script[i];
                if (text) {
                    if (text.length > 200) text = text.substring(0, 197) + "...";

                    let targetLang = 'hi';
                    if (language === 'hinglish') targetLang = 'en-IN';
                    if (language === 'english') targetLang = 'en';

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

        // 3. Download BG Music
        const bgMusicPath = path.join(tempDir, "bg_music.mp3");
        let hasBgMusic = false;
        try {
            await downloadFile(BG_MUSIC_URL, bgMusicPath);
            hasBgMusic = true;
        } catch (e) {
            console.error("Bg music download failed:", e);
        }

        // 4. Create Video with FFmpeg
        const outputPath = path.join(tempDir, "output.mp4");

        await processVideo(imagePaths, audioPaths, tempDir, outputPath, hasBgMusic ? bgMusicPath : undefined);

        // 5. Return Result
        const buffer = await fs.promises.readFile(outputPath);

        // Cleanup (Async)
        fs.promises.rm(tempDir, { recursive: true, force: true }).catch(console.error);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="offer_video_${sessionId.slice(0, 8)}.mp4"`,
            }
        });

    } catch (e: any) {
        console.error("Render error logic:", e);
        if (tempDir) fs.promises.rm(tempDir, { recursive: true, force: true }).catch(console.error);

        return NextResponse.json({
            error: "Internal Render Error",
            details: e.message || String(e)
        }, { status: 500 });
    }
}

