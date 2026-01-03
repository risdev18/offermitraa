"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Music, Volume2, VolumeX, Download, Share2, MapPin, Phone, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
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
    productImage?: string;
    shopImage?: string;
}

const BG_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3";

export default function VideoGenerator({
    offerText, productName, discount, shopType, shopName,
    language = "hi", address, contactNumber, videoScript, videoTitles, onShare, productImage, shopImage
}: VideoGeneratorProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [scene, setScene] = useState(0);
    const [isMuting, setIsMuting] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isSceneLocked, setIsSceneLocked] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderStatus, setRenderStatus] = useState("");

    // Scene advancement logic
    const nextScene = () => {
        if (isSceneLocked) return;
        setScene((prev) => (prev + 1) % 5);
    };

    useEffect(() => {
        if (isMuting && hasInteracted) {
            const timer = setInterval(nextScene, 7000);
            return () => clearInterval(timer);
        }
    }, [isMuting, scene, hasInteracted]);

    // Cleanup speech and audio
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Sync Audio Ref with isMuting
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuting;
            audioRef.current.volume = 0.25; // Lower preview volume
            if (!isMuting && hasInteracted) {
                audioRef.current.play().catch(console.error);
            } else {
                audioRef.current.pause();
            }
        }
    }, [isMuting, hasInteracted]);

    const scenes = [
        {
            bg: "bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900",
            icon: shopImage ? (
                <div className="relative w-48 h-48 mb-6">
                    <img
                        src={shopImage}
                        alt="Shop"
                        className="w-full h-full object-cover rounded-full border-4 border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.2)] animate-pulse-slow"
                    />
                    <div className="absolute inset-[-10px] rounded-full border border-white/10 animate-spin-slow-reverse" />
                </div>
            ) : (
                <ShoppingBag className="w-24 h-24 text-white mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
            ),
            title: videoTitles?.[0]?.toUpperCase() || (shopName || "SPECIAL OFFER").toUpperCase(),
            subtitle: "PREMIUM BUSINESS AD",
            animation: { y: [40, -10, 0], scale: [0.6, 1.1, 1], opacity: [0, 1] },
            voiceText: videoScript?.[0] || (language === "hi" || language === "hindi"
                ? `नमस्कार! स्वागत है ${shopName || 'हमारी दुकान'} में। आईये, आईये! हमारे पास है आपके लिए एक खास ऑफर।`
                : `Welcome to ${shopName || 'our shop'}. Come in! We have a special offer just for you.`)
        },
        {
            bg: "bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700",
            icon: productImage ? (
                <div className="relative mb-6 group">
                    <img
                        src={productImage}
                        alt="Product"
                        className="w-56 h-56 object-cover rounded-3xl border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-sm rotate-12 shadow-lg">HOT DEAL</div>
                </div>
            ) : (
                <Sparkles className="w-24 h-24 text-white mb-6" />
            ),
            title: videoTitles?.[1]?.toUpperCase() || productName.toUpperCase(),
            subtitle: "BEST QUALITY ASSURED",
            animation: { x: [-100, 20, 0], opacity: [0, 1], rotate: [-5, 5, 0] },
            voiceText: videoScript?.[1] || (language === "hi" || language === "hindi"
                ? `हम लाए हैं ${productName}। एकदम बेस्ट क्वालिटी, वो भी सबसे कम दाम में।`
                : `We present ${productName}. Best quality guaranteed at the lowest price.`)
        },
        {
            bg: "bg-gradient-to-br from-orange-500 via-red-600 to-orange-700",
            icon: <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-9xl font-black text-white mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">{discount}</motion.div>,
            title: videoTitles?.[2]?.toUpperCase() || "FLAT DISCOUNT",
            subtitle: "LIMITED PERIOD OFFER",
            animation: { scale: [0, 1.8, 1], rotate: [0, 20, 0], opacity: [0, 1] },
            voiceText: videoScript?.[2] || (language === "hi" || language === "hindi"
                ? `धमाका ऑफर! मिल रहा है पूरे ${discount} का डिस्काउंट। जल्दी करें, मौका हाथ से न जाने दें!`
                : `Boom! Get a flat ${discount} discount. Hurry up, don't miss this chance!`)
        },
        {
            bg: "bg-gradient-to-br from-pink-500 via-rose-600 to-purple-700",
            icon: <MapPin className="w-24 h-24 text-white mb-6" />,
            title: videoTitles?.[3]?.toUpperCase() || "VISIT US NOW",
            subtitle: address || "NEAR YOU",
            animation: { opacity: [0, 1], scale: [0.8, 1.2, 1], y: [20, 0] },
            voiceText: videoScript?.[3] || (language === "hi" || language === "hindi"
                ? `हमारा पता नोट करें: ${address || 'हमारी दुकान पर'}। हम आपका इंतज़ार कर रहे हैं।`
                : `Visit us today at: ${address || 'our store'}. We are waiting for you.`)
        },
        {
            bg: "bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800",
            icon: <Phone className="w-24 h-24 text-white mb-6" />,
            title: videoTitles?.[4]?.toUpperCase() || "CONTACT US",
            subtitle: contactNumber || "CALL NOW",
            animation: { opacity: [0, 1], y: [60, -10, 0], scale: [1, 1.3, 1] },
            voiceText: videoScript?.[4] || (language === "hi" || language === "hindi"
                ? `अभी कॉल करें ${contactNumber || 'हमारे नंबर पर'}। सोचिये मत, अभी आर्डर करें!`
                : `Call us now at ${contactNumber || 'our number'}. Don't think, just order!`)
        }
    ];

    // Voice Over Logic
    useEffect(() => {
        if (!isMuting && hasInteracted && typeof window !== 'undefined' && window.speechSynthesis) {
            const text = scenes[scene].voiceText;
            const speak = () => {
                window.speechSynthesis.cancel();
                setIsSceneLocked(true);
                const utterance = new SpeechSynthesisUtterance(text);

                const applyVoice = () => {
                    const availableVoices = window.speechSynthesis.getVoices();
                    const langLower = (language || 'hi').toLowerCase();
                    const isHindi = langLower === 'hi' || langLower === 'hindi';

                    let voice = isHindi
                        ? availableVoices.find(v => v.lang === 'hi-IN')
                        : availableVoices.find(v => v.lang === 'en-IN');

                    if (!voice) voice = availableVoices.find(v => v.lang.includes('IN'));
                    if (!voice) voice = availableVoices[0];

                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang;
                    }

                    utterance.rate = 1.2;
                    utterance.pitch = 1.0;
                    utterance.onend = () => {
                        setIsSceneLocked(false);
                        nextScene();
                    };
                    utterance.onerror = () => {
                        setIsSceneLocked(false);
                        nextScene();
                    };
                    window.speechSynthesis.speak(utterance);
                };

                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.onvoiceschanged = applyVoice;
                } else {
                    applyVoice();
                }
            };
            const timer = setTimeout(speak, 50);
            return () => {
                clearTimeout(timer);
                window.speechSynthesis.cancel();
            };
        }
    }, [scene, isMuting, hasInteracted, language]);

    const handleStartWithSound = () => {
        setIsMuting(false);
        setHasInteracted(true);
    };

    const toggleMute = () => {
        setIsMuting(!isMuting);
        setHasInteracted(true);
    };

    const downloadVideo = async () => {
        const element = bannerRef.current;
        if (!element) return;

        setIsCapturing(true);
        setIsMuting(true);
        setRenderProgress(10);
        setRenderStatus("Initializing Camera...");

        const capturedImages: string[] = [];

        try {
            for (let i = 0; i < 5; i++) {
                setRenderStatus(`Capturing Scene ${i + 1} of 5...`);
                setScene(i);
                setRenderProgress(10 + (i * 10));
                await new Promise(r => setTimeout(r, 1200));
                const dataUrl = await toPng(element, { quality: 0.9, pixelRatio: 2 });
                capturedImages.push(dataUrl);
            }

            setRenderStatus("Mixing Voice & Music on Server...");
            setRenderProgress(70);

            const response = await fetch('/api/render-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    images: capturedImages,
                    script: scenes.map(s => s.voiceText),
                    language: language
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || "Server Render Failed");
            }

            setRenderStatus("Finalizing Video File...");
            setRenderProgress(90);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `OfferMitra_${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setRenderStatus("Success!");
            setRenderProgress(100);
            setTimeout(() => {
                setIsCapturing(false);
                setRenderStatus("");
            }, 2000);

        } catch (e) {
            console.error(e);
            alert("Generation failed. Please try again.");
            setIsCapturing(false);
            setRenderStatus("");
        } finally {
            setScene(0);
        }
    };

    const handleShare = async () => {
        const data = {
            offerText, productName, discount, shopType, shopName,
            language, address, contactNumber, videoScript, videoTitles
        };
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        const shareUrl = `${window.location.origin}/v/${encodeURIComponent(encoded)}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${shopName || 'Business'} Offer`,
                    text: 'Check out this video ad!',
                    url: shareUrl
                });
                onShare?.();
            } catch (e) {
                navigator.clipboard.writeText(shareUrl);
                alert("Link copied!");
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert("Link copied!");
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <audio ref={audioRef} src={BG_MUSIC_URL} loop />

            <div className="relative group perspective-1000 w-full flex justify-center py-4">
                <div
                    ref={bannerRef}
                    className="relative w-[320px] md:w-[380px] h-[568px] md:h-[675px] rounded-[3.5rem] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)] bg-black border-[8px] border-slate-900 flex-shrink-0"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={scene}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn("absolute inset-0 flex flex-col items-center justify-center text-center p-12", scenes[scene].bg)}
                        >
                            <div className="absolute top-10 left-10 right-10 flex gap-2 z-30">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                        {scene === i && (
                                            <motion.div
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: isMuting ? 6 : 9, ease: "linear" }}
                                                className="h-full bg-yellow-400 shadow-[0_0_15px_#facc15]"
                                            />
                                        )}
                                        {scene > i && <div className="h-full w-full bg-white" />}
                                    </div>
                                ))}
                            </div>

                            <motion.div
                                animate={scenes[scene].animation}
                                transition={{ duration: 0.8, ease: "backOut" }}
                                className="relative z-10 w-full flex flex-col items-center"
                            >
                                <div className="mb-8">{scenes[scene].icon}</div>
                                <h2 className={cn(
                                    "font-black text-white leading-none mb-6 tracking-tighter drop-shadow-2xl uppercase italic",
                                    scenes[scene].title.length > 20 ? "text-3xl" : "text-5xl"
                                )}>
                                    {scenes[scene].title}
                                </h2>
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="inline-block px-8 py-3 bg-white text-black rounded-2xl font-black text-xs tracking-widest border-b-4 border-slate-300 shadow-xl"
                                >
                                    {scenes[scene].subtitle}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Rendering Info Overlay */}
                    {isCapturing && (
                        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center p-8 text-center">
                            <div className="relative mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {renderProgress < 100 ? (
                                        <span className="text-white font-black text-xl">{renderProgress}%</span>
                                    ) : (
                                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                                    )}
                                </div>
                            </div>
                            <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tight">Generating Ad</h3>
                            <p className="text-indigo-300 text-sm font-bold animate-pulse">{renderStatus}</p>

                            <div className="mt-12 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${renderProgress}%` }}
                                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                        </div>
                    )}

                    {isMuting && !hasInteracted && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartWithSound}
                                className="bg-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] mb-6 group"
                            >
                                <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            </motion.button>
                            <h3 className="text-white font-black text-2xl mb-2 tracking-tight">READY TO PLAY?</h3>
                            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Click to Hear the Magic</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 bg-white/5 p-4 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
                <button
                    onClick={toggleMute}
                    className={cn(
                        "p-5 rounded-2xl transition-all border",
                        isMuting ? "bg-white/5 border-white/10 text-white/50" : "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                    )}
                >
                    {isMuting ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
                </button>

                <button
                    onClick={downloadVideo}
                    disabled={isCapturing}
                    className="flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_10px_30px_rgba(79,70,229,0.4)] active:translate-y-1"
                >
                    {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    Save HD Video
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-3 px-8 py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_10px_30px_rgba(219,39,119,0.4)] active:translate-y-1"
                >
                    <Share2 className="w-5 h-5" />
                    Share
                </button>
            </div>
        </div>
    );
}
