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
    shopDescription?: string;
}

const BG_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3";

export default function VideoGenerator({
    offerText, productName, discount, shopType, shopName,
    language = "hi", address, contactNumber, videoScript, videoTitles, onShare, productImage, shopImage, shopDescription
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

    const nextScene = () => {
        if (isSceneLocked) return;
        setScene((prev) => (prev + 1) % 5);
    };

    useEffect(() => {
        if (isMuting && hasInteracted) {
            const timer = setInterval(nextScene, 5000);
            return () => clearInterval(timer);
        }
    }, [isMuting, scene, hasInteracted]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuting;
            audioRef.current.volume = 0.2;
            if (!isMuting && hasInteracted) {
                audioRef.current.play().catch(console.error);
            } else {
                audioRef.current.pause();
            }
        }
    }, [isMuting, hasInteracted]);

    const scenes = [
        {
            bg: "bg-gradient-to-br from-indigo-900 via-primary to-indigo-800",
            icon: shopImage ? (
                <div className="relative w-48 h-48 mb-6">
                    <img src={shopImage} alt="Shop" className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl" />
                </div>
            ) : (
                <ShoppingBag size={80} className="text-white mb-6 opacity-90" />
            ),
            title: videoTitles?.[0]?.toUpperCase() || (shopName || "SPECIAL OFFER").toUpperCase(),
            subtitle: shopDescription?.toUpperCase() || "PREMIUM AD EXPERIENCE",
            animation: { scale: [0.8, 1], opacity: [0, 1] },
            voiceText: videoScript?.[0] || `नमस्कार! स्वागत है ${shopName || 'हमारी दुकान'} में।`
        },
        {
            bg: "bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900",
            icon: productImage ? (
                <div className="relative mb-6">
                    <img src={productImage} alt="Product" className="w-56 h-56 object-cover rounded-3xl border-4 border-white/20 shadow-2xl" />
                </div>
            ) : (
                <Sparkles size={80} className="text-white mb-6 opacity-90" />
            ),
            title: videoTitles?.[1]?.toUpperCase() || productName.toUpperCase(),
            subtitle: "BEST QUALITY ASSURED",
            animation: { x: [-20, 0], opacity: [0, 1] },
            voiceText: videoScript?.[1] || `हम लाए हैं ${productName}। एकदम बेस्ट क्वालिटी!`
        },
        {
            bg: "bg-gradient-to-br from-accent via-orange-600 to-red-600",
            icon: <div className="text-8xl font-black text-white mb-6 drop-shadow-2xl">{discount}</div>,
            title: videoTitles?.[2]?.toUpperCase() || "HUGE DISCOUNT",
            subtitle: "LIMITED PERIOD ONLY",
            animation: { scale: [1.5, 1], rotate: [5, 0], opacity: [0, 1] },
            voiceText: videoScript?.[2] || `धमाका ऑफर! मिल रहा है पूरे ${discount} का डिस्काउंट।`
        },
        {
            bg: "bg-gradient-to-br from-primary via-indigo-700 to-purple-800",
            icon: <MapPin size={80} className="text-white mb-6 opacity-90" />,
            title: "VISIT US",
            subtitle: address || "NEAR YOU",
            animation: { y: [20, 0], opacity: [0, 1] },
            voiceText: videoScript?.[3] || `हमारा पता है: ${address || 'हमारी दुकान पर'}।`
        },
        {
            bg: "bg-gradient-to-br from-slate-900 via-primary to-slate-900",
            icon: <Phone size={80} className="text-white mb-6 opacity-90" />,
            title: "ORDER NOW",
            subtitle: contactNumber || "CALL US",
            animation: { scale: [0.9, 1.1, 1], opacity: [0, 1] },
            voiceText: videoScript?.[4] || `अभी कॉल करें ${contactNumber || 'हमारे नंबर पर'}।`
        }
    ];

    useEffect(() => {
        if (!isMuting && hasInteracted && typeof window !== 'undefined' && window.speechSynthesis) {
            const text = scenes[scene].voiceText;
            window.speechSynthesis.cancel();
            setIsSceneLocked(true);
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            let voice = voices.find(v => v.lang.includes('hi-IN')) || voices.find(v => v.lang.includes('en-IN')) || voices[0];
            if (voice) utterance.voice = voice;
            utterance.rate = 1.3; // Higher energy
            utterance.onend = () => { setIsSceneLocked(false); setTimeout(nextScene, 400); };
            utterance.onerror = () => { setIsSceneLocked(false); nextScene(); };
            window.speechSynthesis.speak(utterance);
        }
    }, [scene, isMuting, hasInteracted]);

    const handleStartWithSound = () => { setIsMuting(false); setHasInteracted(true); };
    const toggleMute = () => { setIsMuting(!isMuting); setHasInteracted(true); };

    const downloadVideo = async () => {
        if (!bannerRef.current) return;
        setIsCapturing(true); setIsMuting(true);
        const capturedImages: string[] = [];
        try {
            for (let i = 0; i < 5; i++) {
                setRenderStatus(`Capturing ${i + 1}/5...`);
                setScene(i); setRenderProgress(10 + (i * 15));
                await new Promise(r => setTimeout(r, 800));
                capturedImages.push(await toPng(bannerRef.current!, { quality: 0.9, pixelRatio: 2 }));
            }
            setRenderStatus("Rendering on Server..."); setRenderProgress(80);
            const response = await fetch('/api/render-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: capturedImages, script: scenes.map(s => s.voiceText), language })
            });
            if (!response.ok) throw new Error("Render Failed");
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `OfferAd_${Date.now()}.mp4`;
            link.click();
            setRenderStatus("Done!"); setRenderProgress(100);
        } catch (e) { alert("Generation failed. Try again."); }
        finally { setTimeout(() => setIsCapturing(false), 2000); setScene(0); }
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full">
            <audio ref={audioRef} src={BG_MUSIC_URL} loop />
            <div className="relative w-[320px] md:w-[380px] h-[568px] md:h-[675px] rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-slate-900 bg-black">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={scene}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={cn("absolute inset-0 flex flex-col items-center justify-center p-12 text-center", scenes[scene].bg)}
                    >
                        <div className="absolute top-10 left-10 right-10 flex gap-2">
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    {scene === i && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 7, ease: "linear" }} className="h-full bg-accent" />}
                                    {scene > i && <div className="h-full w-full bg-white/60" />}
                                </div>
                            ))}
                        </div>
                        <motion.div animate={scenes[scene].animation} className="flex flex-col items-center">
                            <div className="mb-8">{scenes[scene].icon}</div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">{scenes[scene].title}</h2>
                            <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest border border-white/10">{scenes[scene].subtitle}</div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
                {isCapturing && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center p-8 text-center text-white">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-accent" />
                        <h3 className="font-black text-xl mb-1">PRO AD GENERATING</h3>
                        <p className="text-xs text-white/50 font-bold uppercase tracking-widest">{renderStatus}</p>
                        <div className="mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div animate={{ width: `${renderProgress}%` }} className="h-full bg-accent" />
                        </div>
                    </div>
                )}
                {isMuting && !hasInteracted && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white cursor-pointer" onClick={handleStartWithSound}>
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl mb-6"><Volume2 size={32} /></div>
                        <h3 className="font-black text-2xl mb-1">READY TO PLAY?</h3>
                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Tap to start preview</p>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl w-full">
                <button onClick={toggleMute} className={cn("p-5 rounded-2xl transition-all border-2", isMuting ? "bg-slate-50 border-slate-100 text-slate-300" : "bg-primary/5 border-primary text-primary")}>
                    {isMuting ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <button onClick={downloadVideo} disabled={isCapturing} className="flex-1 flex items-center justify-center gap-2 py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 active:translate-y-1">
                    <Download size={16} /> Save HD Video
                </button>
                <button
                    onClick={() => {
                        const data = {
                            offerText, productName, discount, shopType, shopName,
                            language, address, contactNumber, videoScript, videoTitles
                        };
                        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
                        const shareUrl = `${window.location.origin}/v/${encoded}`;
                        navigator.clipboard.writeText(shareUrl);
                        alert("Link Copied! Share this on WhatsApp status. 🚀");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:translate-y-1"
                >
                    <Share2 size={16} /> Share Link
                </button>
            </div>
        </div>
    );
}
