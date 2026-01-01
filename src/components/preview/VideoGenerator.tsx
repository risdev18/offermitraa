"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Music, Volume2, VolumeX, Download, Share2, MapPin, Phone, Link as LinkIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

interface VideoGeneratorProps {
    offerText: string;
    productName: string;
    discount: string;
    shopType: string;
    shopName?: string;
    language?: string;
    address?: string;
    contactNumber?: string;
    videoScript?: string[];
    videoTitles?: string[];
    onShare?: () => void;
}

export default function VideoGenerator({
    offerText, productName, discount, shopType, shopName,
    language = "hi", address, contactNumber, videoScript, videoTitles, onShare
}: VideoGeneratorProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [scene, setScene] = useState(0);
    const [isMuting, setIsMuting] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isSceneLocked, setIsSceneLocked] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    // Scene advancement logic - PROTECTED
    const nextScene = () => {
        if (isSceneLocked) return;
        setScene((prev) => (prev + 1) % 5);
    };

    useEffect(() => {
        // Fallback timer - only if muted or speech fails
        if (isMuting) {
            const timer = setInterval(nextScene, 7000);
            return () => clearInterval(timer);
        }
    }, [isMuting, scene]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const scenes = [
        {
            bg: "bg-indigo-700",
            icon: <ShoppingBag className="w-20 h-20 text-white mb-6" />,
            title: videoTitles?.[0]?.toUpperCase() || (shopName || "SPECIAL OFFER").toUpperCase(),
            subtitle: "PREMIUM BUSINESS AD",
            animation: { y: [30, -10, 0], scale: [0.7, 1.1, 1] },
            voiceText: videoScript?.[0] || ((language === "hi" || language === "hindi")
                ? `नमस्कार! स्वागत है ${shopName || 'हमारी दुकान'} में। आईये, आईये! हमारे पास है आपके लिए एक खास ऑफर।`
                : (language === "hinglish")
                    ? `Namaskar! Swagat hai ${shopName || 'humari shop'} mein. Aayiye, Aayiye! Humare paas hai aapke liye ek khaas offer.`
                    : `Welcome to ${shopName || 'our shop'}. Come in! We have a special offer just for you.`)
        },
        {
            bg: "bg-purple-700",
            icon: <Sparkles className="w-20 h-20 text-white mb-6" />,
            title: videoTitles?.[1]?.toUpperCase() || productName.toUpperCase(),
            subtitle: "BEST QUALITY ASSURED",
            animation: { x: [-150, 20, 0], opacity: [0, 1] },
            voiceText: videoScript?.[1] || ((language === "hi" || language === "hindi")
                ? `हम लाए हैं ${productName}। एकदम बेस्ट क्वालिटी, वो भी सबसे कम दाम में।`
                : (language === "hinglish")
                    ? `Hum laye hain ${productName}. Ekdum best quality, wo bhi sabse kam daam mein.`
                    : `We present ${productName}. Best quality guaranteed at the lowest price.`)
        },
        {
            bg: "bg-orange-600",
            icon: <div className="text-8xl font-black text-white mb-6 drop-shadow-xl">{discount}</div>,
            title: videoTitles?.[2]?.toUpperCase() || "FLAT DISCOUNT",
            subtitle: "LIMITED PERIOD OFFER",
            animation: { scale: [0, 1.6, 1], rotate: [0, 15, 0] },
            voiceText: videoScript?.[2] || ((language === "hi" || language === "hindi")
                ? `धमाका ऑफर! मिल रहा है पूरे ${discount} का डिस्काउंट। जल्दी करें, मौका हाथ से न जाने दें!`
                : (language === "hinglish")
                    ? `Dhamaka offer! Mil raha hai poore ${discount} ka discount. Jaldi karein, mauka haath se na jaane dein!`
                    : `Boom! Get a flat ${discount} discount. Hurry up, don't miss this chance!`)
        },
        {
            bg: "bg-pink-600",
            icon: <MapPin className="w-20 h-20 text-white mb-6" />,
            title: videoTitles?.[3]?.toUpperCase() || "VISIT US NOW",
            subtitle: address || "NEAR YOU",
            animation: { opacity: [0, 1], scale: [0.8, 1.1, 1] },
            voiceText: videoScript?.[3] || ((language === "hi" || language === "hindi")
                ? `आज ही आएं: ${address || 'हमारी दुकान पर'}। हम आपका इंतज़ार कर रहे हैं।`
                : (language === "hinglish")
                    ? `Aaj hi aayein: ${address || 'humari shop par'}. Hum aapka intezaar kar rahe hain.`
                    : `Visit us today at: ${address || 'our store'}. We are waiting for you.`)
        },
        {
            bg: "bg-green-700",
            icon: <Phone className="w-20 h-20 text-white mb-6" />,
            title: videoTitles?.[4]?.toUpperCase() || "CONTACT US",
            subtitle: contactNumber || "CALL NOW",
            animation: {
                opacity: [0, 1],
                y: [50, 0],
                scale: [1, 1.2, 1]
            },
            voiceText: videoScript?.[4] || ((language === "hi" || language === "hindi")
                ? `अभी कॉल करें ${contactNumber || 'हमारे नंबर पर'}। सोचिये मत, अभी आर्डर करें!`
                : (language === "hinglish")
                    ? `Abhi call karein ${contactNumber || 'humare number par'}. Sochiye mat, abhi order karein!`
                    : `Call us now at ${contactNumber || 'our number'}. Don't think, just order!`)
        }
    ];

    // Handle Voice Over - MAX ROBUSTNESS
    useEffect(() => {
        if (!isMuting && typeof window !== 'undefined' && window.speechSynthesis) {
            const text = scenes[scene].voiceText;

            const speak = () => {
                window.speechSynthesis.cancel();
                setIsSceneLocked(true);

                const utterance = new SpeechSynthesisUtterance(text);

                // Force system to load voices
                let voices = window.speechSynthesis.getVoices();

                const applyVoice = () => {
                    // Logic:
                    // 1. Hindi (Devanagari) -> Needs 'hi-IN' voice.
                    // 2. Hinglish & English -> Needs 'en-IN' (Indian English) or 'en-US' (Global).

                    // Normalize language check
                    const langLower = (language || 'hi').toLowerCase();
                    const isHindi = langLower === 'hi' || langLower === 'hindi';

                    let selectedVoice = null;
                    const availableVoices = window.speechSynthesis.getVoices();

                    if (isHindi) {
                        // Strict Hindi (Devanagari)
                        selectedVoice = availableVoices.find(v => v.lang === 'hi-IN' && v.name.includes('Neural')) ||
                            availableVoices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
                            availableVoices.find(v => v.lang === 'hi-IN');
                    } else {
                        // English / Hinglish -> Prefer Indian English, then US English
                        // Use safe navigational checks and prioritize Neural voices
                        selectedVoice =
                            availableVoices.find(v => v.lang === 'en-IN' && v.name.includes('Neural')) ||
                            availableVoices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
                            availableVoices.find(v => v.lang === 'en-IN') ||
                            availableVoices.find(v => v.lang === 'en-US' && v.name.includes('Neural')) ||
                            availableVoices.find(v => v.lang === 'en-US');
                    }

                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                        utterance.lang = selectedVoice.lang;
                    }

                    // Professional Speaking Rate - slightly faster for flow, no dead air
                    utterance.rate = 1.1;
                    utterance.pitch = 1.0; // Natural pitch
                    utterance.volume = 1;

                    utterance.onend = () => {
                        setIsSceneLocked(false);
                        // SEAMLESS TRANSITION - No pause
                        nextScene();
                    };

                    utterance.onerror = (e) => {
                        console.error("Speech error:", e);
                        setIsSceneLocked(false);
                        nextScene();
                    };

                    window.speechSynthesis.speak(utterance);
                };

                if (voices.length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        voices = window.speechSynthesis.getVoices();
                        applyVoice();
                    };
                } else {
                    applyVoice();
                }
            };

            // Immediate start
            const speechTimeout = setTimeout(speak, 10);
            return () => {
                clearTimeout(speechTimeout);
                window.speechSynthesis.cancel();
            };
        }
    }, [scene, isMuting, language]);

    const handleStartWithSound = () => {
        setIsMuting(false);
        setHasInteracted(true);
    };

    const toggleMute = () => {
        setIsMuting(!isMuting);
        setHasInteracted(true);
    };

    return (
        <div ref={bannerRef} className="relative w-full max-w-[420px] aspect-[9/16] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black mx-auto border-[6px] border-slate-900 group">
            {/* Animated Background */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={scene}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6 }}
                    className={cn("absolute inset-0 flex flex-col items-center justify-center text-center p-10", scenes[scene].bg)}
                >
                    {/* Dynamic High-Energy Stickers */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: [1, 1.2, 1], rotate: [-20, -15, -20] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute top-28 left-6 z-20 bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-[10px] tracking-tighter shadow-xl border-2 border-black"
                    >
                        {scene % 2 === 0 ? "🔥 LIVE" : "⚡ HOT"}
                    </motion.div>

                    <motion.div
                        animate={scenes[scene].animation}
                        transition={{ duration: 0.8, ease: "backOut" }} // Snappier animations
                        className="relative z-10"
                    >
                        <div className="relative inline-block mb-4">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [-2, 2, -2]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {scenes[scene].icon}
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg"
                            >
                                DEAL
                            </motion.div>
                        </div>
                        <h2 className={cn(
                            "font-black text-white leading-tight mb-4 tracking-tighter drop-shadow-2xl uppercase",
                            scenes[scene].title.length > 20 ? "text-2xl" : scenes[scene].title.length > 12 ? "text-4xl" : "text-6xl"
                        )}>
                            {scenes[scene].title}
                        </h2>
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="inline-block px-10 py-4 bg-white text-black rounded-full font-black text-sm tracking-widest border-4 border-black/10 shadow-2xl transform skew-x-[-10deg]"
                        >
                            {scenes[scene].subtitle}
                        </motion.div>
                    </motion.div>

                    {/* Footer Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="absolute bottom-16 left-0 right-0 px-10 z-10"
                    >
                        <p className={cn(
                            "text-white/90 font-bold leading-relaxed italic drop-shadow-md text-center",
                            offerText.length > 100 ? "text-[10px]" : "text-xs"
                        )}>
                            "{offerText.slice(0, 150)}{offerText.length > 150 ? '...' : ''}"
                        </p>
                    </motion.div>

                    {/* Simulated UI Overlay */}
                    <div className="absolute right-4 bottom-48 flex flex-col gap-5 text-white z-20">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">🔥</div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">Reach</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">💬</div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">Viral</span>
                        </div>
                    </div>

                    {/* TAP TO PLAY OVERLAY - ONLY IF MUTED & NO INTERACTION */}
                    {isMuting && !hasInteracted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handleStartWithSound}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer group"
                        >
                            <div className="p-8 bg-white/20 rounded-full border-4 border-white/40 group-hover:scale-110 transition-transform shadow-2xl">
                                <Volume2 className="w-16 h-16 text-white group-hover:animate-bounce" />
                            </div>
                            <p className="mt-8 text-white font-black text-2xl uppercase tracking-[0.4em] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">Play with Voice</p>
                            <p className="mt-2 text-indigo-300 font-bold text-sm uppercase tracking-widest opacity-80 italic animate-pulse">Click Anyway to Start</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Sound Toggle Button */}
            <button
                onClick={toggleMute}
                className="absolute top-24 right-8 z-30 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-black/60 transition-all border border-white/20 shadow-2xl"
                title={isMuting ? "Unmute Voiceover" : "Mute Voiceover"}
            >
                {isMuting ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Video Progress Bars */}
            <div className="absolute top-8 left-8 right-8 flex gap-2 z-30">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        {scene === i && (
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: isMuting ? 5 : 9, ease: "linear" }}
                                className="h-full bg-yellow-400 shadow-[0_0_15px_#facc15]"
                            />
                        )}
                        {scene > i && <div className="h-full w-full bg-white" />}
                    </div>
                ))}
            </div>

            {/* Actions Frame Layer */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 z-30">
                <button
                    onClick={async () => {
                        const element = bannerRef.current;
                        if (!element) return;
                        setIsCapturing(true);
                        try {
                            const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2, cacheBust: true });
                            const link = document.createElement('a');
                            link.download = `offer-frame-${Date.now()}.png`;
                            link.href = dataUrl;
                            link.click();
                            onShare?.();
                        } catch (e) {
                            console.error("Frame capture failed", e);
                        } finally {
                            setIsCapturing(false);
                        }
                    }}
                    className="flex-1 bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-3 h-3" /> Save Frame
                </button>
                <button
                    onClick={async () => {
                        try {
                            const data = {
                                offerText, productName, discount, shopType, shopName,
                                language, address, contactNumber, videoScript, videoTitles
                            };
                            const jsonString = JSON.stringify(data);
                            const encoded = btoa(unescape(encodeURIComponent(jsonString)));
                            const shareUrl = `${window.location.origin}/v/${encodeURIComponent(encoded)}`;

                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: `${shopName || 'Business'} Special Offer`,
                                        text: 'Check out this video ad for our new offer!',
                                        url: shareUrl
                                    });
                                } catch (e) {
                                    console.log("Share failed", e);
                                    await navigator.clipboard.writeText(shareUrl);
                                    alert("Video Link copied to clipboard! 🔗\nYou can now paste it in WhatsApp.");
                                }
                            } else {
                                await navigator.clipboard.writeText(shareUrl);
                                alert("Video Link copied to clipboard! 🔗\nYou can now paste it in WhatsApp.");
                            }
                        } catch (err) {
                            console.error("Error generating share link:", err);
                        }
                    }}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                    <LinkIcon className="w-3 h-3" /> Copy Link
                </button>
                <button
                    onClick={async () => {
                        const element = bannerRef.current;
                        if (!element) return;

                        const confirm = window.confirm("Generate and Download Video File?\nThis takes about 15-20 seconds to render on the server.");
                        if (!confirm) return;

                        setIsCapturing(true); // Hide UI
                        setIsMuting(true); // Silence during capture
                        const capturedImages: string[] = [];

                        try {
                            // Loop through scenes and capture
                            for (let i = 0; i < 5; i++) {
                                setScene(i);
                                // Wait for render & animation
                                await new Promise(r => setTimeout(r, 1500));
                                const dataUrl = await toPng(element, { quality: 0.9, cacheBust: true });
                                capturedImages.push(dataUrl);
                            }

                            // Send to Server
                            const response = await fetch('/api/render-video', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    images: capturedImages,
                                    script: scenes.map(s => s.voiceText), // Use text from scenes
                                    language: language
                                })
                            });

                            if (!response.ok) throw new Error("Rendering failed on server. Ensure FFmpeg is installed.");

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `offer-mitra-${Date.now()}.mp4`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            alert("Video Downloaded! 🚀\nYou can now share it on WhatsApp!");

                        } catch (e) {
                            console.error("Video generation failed", e);
                            alert("Video generation failed. Please try again later.");
                        } finally {
                            setIsCapturing(false);
                            setScene(0);
                            setIsMuting(false); // Restore sound
                        }
                    }}
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-3 h-3" /> Download MP4
                </button>
                <button
                    onClick={async () => {
                        const element = bannerRef.current;
                        if (!element) return;
                        setIsCapturing(true);
                        try {
                            const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2, cacheBust: true });
                            const blob = await (await fetch(dataUrl)).blob();
                            const file = new File([blob], 'offer-ad.png', { type: 'image/png' });

                            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    files: [file],
                                    title: 'Video Offer Ad',
                                    text: 'Check out our new business ad!'
                                });
                                onShare?.();
                            } else {
                                const link = document.createElement('a');
                                link.download = `offer-frame-${Date.now()}.png`;
                                link.href = dataUrl;
                                link.click();
                                onShare?.();
                                alert("Poster saved to gallery! You can now share it manually on WhatsApp.");
                            }
                        } catch (e) {
                            console.error("Frame share failed", e);
                        } finally {
                            setIsCapturing(false);
                        }
                    }}
                    className="flex-1 bg-green-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                    <Share2 className="w-3 h-3" /> WhatsApp
                </button>
            </div>
        </div>
    );
}
