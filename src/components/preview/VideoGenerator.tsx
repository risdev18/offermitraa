"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Music, Volume2, VolumeX, Download, Share2, MapPin, Phone } from "lucide-react";
import html2canvas from "html2canvas";
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
    onShare?: () => void;
}

export default function VideoGenerator({ offerText, productName, discount, shopType, shopName, language = "hi", address, contactNumber, onShare }: VideoGeneratorProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [scene, setScene] = useState(0);
    const [isMuting, setIsMuting] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isSceneLocked, setIsSceneLocked] = useState(false);

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
            title: (shopName || "SPECIAL OFFER").toUpperCase(),
            subtitle: "PREMIUM BUSINESS AD",
            animation: { y: [30, -10, 0], scale: [0.7, 1.1, 1] },
            voiceText: (language === "hi" || language === "hindi")
                ? `नमस्ते! ${shopName || 'हमारी दुकान'} की तरफ से यह एक विशेष संदेश है। आज ही हमारे यहाँ आएं।`
                : (language === "hinglish")
                    ? `Namaste! ${shopName || 'Hamari shop'} ki taraf se ye ek vishesh sandesh hai. Aaj hi humare yahan aayein.`
                    : `Welcome to ${shopName || 'our premium shop'}. We have an exclusive business offer just for you today!`
        },
        {
            bg: "bg-purple-700",
            icon: <Sparkles className="w-20 h-20 text-white mb-6" />,
            title: productName.toUpperCase(),
            subtitle: "BEST QUALITY ASSURED",
            animation: { x: [-150, 20, 0], opacity: [0, 1] },
            voiceText: (language === "hi" || language === "hindi")
                ? `हम लेकर आए हैं आपके लिए सबसे बेहतरीन ${productName}। इसकी क्वालिटी का कोई तोड़ नहीं है।`
                : (language === "hinglish")
                    ? `Hum lekar aaye hain aapke liye sabse behtareen ${productName}. Iski quality ka koi tod nahi hai.`
                    : `Check out our world-class ${productName}. We guarantee the best quality at the most affordable prices!`
        },
        {
            bg: "bg-orange-600",
            icon: <div className="text-8xl font-black text-white mb-6 drop-shadow-xl">{discount}</div>,
            title: "FLAT DISCOUNT",
            subtitle: "LIMITED PERIOD OFFER",
            animation: { scale: [0, 1.6, 1], rotate: [0, 15, 0] },
            voiceText: (language === "hi" || language === "hindi")
                ? `शानदार मौका! मिल रहा है पूरे ${discount} का भारी डिस्काउंट। यह ऑफर सिर्फ कुछ समय के लिए है।`
                : (language === "hinglish")
                    ? `Shandar mauka! Mil raha hai poore ${discount} ka bhari discount. Ye offer sirf kuch samay ke liye hai.`
                    : `Grab this amazing deal! Get a flat ${discount} discount right now. Hurry, this is a limited time offer!`
        },
        {
            bg: "bg-pink-600",
            icon: <MapPin className="w-20 h-20 text-white mb-6" />,
            title: "VISIT US NOW",
            subtitle: address || "NEAR YOU",
            animation: { opacity: [0, 1], scale: [0.8, 1.1, 1] },
            voiceText: (language === "hi" || language === "hindi")
                ? `हमारा पता नोट करें: ${address || 'हमारी दुकान पर आएं'}। हम आपका इंतज़ार कर रहे हैं।`
                : (language === "hinglish")
                    ? `Humara pata note karein: ${address || 'Humari shop par aayein'}. Hum aapka intezaar kar rahe hain.`
                    : `Visit us today at: ${address || 'our store near you'}. We are ready to serve you with the best deals!`
        },
        {
            bg: "bg-green-700",
            icon: <Phone className="w-20 h-20 text-white mb-6 animate-bounce" />,
            title: "CONTACT US",
            subtitle: contactNumber || "CALL NOW",
            animation: { opacity: [0, 1], y: [50, 0] },
            voiceText: (language === "hi" || language === "hindi")
                ? `ज्यादा जानकारी के लिए डायल करें ${contactNumber || 'हमारा नंबर'}। अभी कॉल करें या व्हाट्सएप करें!`
                : (language === "hinglish")
                    ? `Zyada jankari ke liye dial karein ${contactNumber || 'Humara number'}. Abhi call karein ya whatsapp karein!`
                    : `For more details, please call us at ${contactNumber || 'our business number'}. Contact us on WhatsApp today!`
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
                    // Try to find a Deep/Male voice for Amitabh-style impact
                    const hindiVoice = voices.find(v =>
                        (v.lang.startsWith('hi') || v.name.includes('Hindi')) &&
                        (v.name.includes('Male') || v.name.includes('Premium')) &&
                        !v.name.includes('English')
                    ) || voices.find(v => (v.lang.startsWith('hi') || v.name.includes('Hindi')));

                    const indianEng = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Male')) ||
                        voices.find(v => v.lang.includes('en-IN'));

                    const isHindiRequest = language === 'hi' || language === 'hindi' || language === 'hinglish';
                    const isPureEnglish = language === 'english';

                    if (isHindiRequest && hindiVoice) {
                        utterance.voice = hindiVoice;
                        utterance.lang = "hi-IN";
                    } else if (isHindiRequest && language === 'hinglish') {
                        // Hinglish (Roman Script) needs en-IN male to sound like Indian speaking Hindi
                        utterance.voice = indianEng || voices[0];
                        utterance.lang = "en-IN";
                    } else if (isHindiRequest) {
                        utterance.lang = "hi-IN";
                    } else {
                        utterance.voice = indianEng || voices[0];
                        utterance.lang = "en-IN";
                    }

                    // AMITABH STYLE: Optimized for engagement
                    utterance.rate = 1.15; // Increased speed as requested
                    utterance.pitch = 0.85; // Slightly adjusted pitch for better clarity at higher speed

                    utterance.onend = () => {
                        setIsSceneLocked(false);
                        setTimeout(nextScene, 500); // More dramatic pause
                    };

                    utterance.onerror = () => {
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

            const speechTimeout = setTimeout(speak, 50);
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
                            {scenes[scene].icon}
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity }}
                                className="absolute -top-4 -right-4 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg"
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
                        <div className="inline-block px-8 py-3 bg-white text-black rounded-full font-black text-xs tracking-widest border-4 border-black/10 shadow-xl transform skew-x-[-10deg]">
                            {scenes[scene].subtitle}
                        </div>
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
                        const canvas = await html2canvas(element, { scale: 2 });
                        const link = document.createElement('a');
                        link.download = `offer-frame-${Date.now()}.png`;
                        link.href = canvas.toDataURL();
                        link.click();
                        onShare?.();
                    }}
                    className="flex-1 bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-3 h-3" /> Save Frame
                </button>
                <button
                    onClick={async () => {
                        const element = bannerRef.current;
                        if (!element) return;
                        const canvas = await html2canvas(element, { scale: 2 });
                        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r));
                        if (!blob) return;
                        const file = new File([blob], 'offer-ad.png', { type: 'image/png' });
                        if (navigator.share && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Video Offer Ad',
                                text: 'Check out our new business ad!'
                            });
                            onShare?.();
                        } else {
                            onShare?.();
                            alert("Sharing not supported on this browser. Use the 'Save Frame' button instead.");
                        }
                    }}
                    className="flex-1 bg-green-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                    <Share2 className="w-3 h-3" /> WhatsApp Ad
                </button>
            </div>
        </div>
    );
}
