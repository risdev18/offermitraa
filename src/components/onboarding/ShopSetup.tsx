"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Store, FileText, ChevronRight, Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopSetupProps {
    onComplete: (data: ShopDetails) => void;
}

export interface ShopDetails {
    shopName: string;
    shopDescription: string;
    shopMobile: string;
    shopPhoto: string | null; // Base64 string for local storage
}

export default function ShopSetup({ onComplete }: ShopSetupProps) {
    const [step, setStep] = useState(1);
    const [shopName, setShopName] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [shopMobile, setShopMobile] = useState("");
    const [shopPhoto, setShopPhoto] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Voice Welcome for first-time users
        const welcomeText = "Welcome to OfferMitra! Hope you will enjoy the experience.";
        const speakWelcome = () => {
            const utterance = new SpeechSynthesisUtterance(welcomeText);
            const voices = window.speechSynthesis.getVoices();
            const engVoice = voices.find(v => v.lang.includes('en-GB')) || voices.find(v => v.lang.includes('en-US')) || voices[0];
            if (engVoice) utterance.voice = engVoice;
            utterance.rate = 1.2; // High energy
            utterance.pitch = 1.1; // Slightly higher pitch for excitement
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', speakWelcome, { once: true });
        } else {
            speakWelcome();
        }

        return () => window.speechSynthesis.cancel();
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setShopPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isStep1Valid = shopName.trim().length > 0 && shopDescription.trim().length > 0 && shopMobile.trim().length === 10;
    const isStep2Valid = !!shopPhoto; // Photo is mandatory as per "Fields to collect (mandatory)... Shop Photo"

    // Wait, requirement says "Fields to collect (mandatory): Shop Name, Shop Description, Shop Photo".
    // And "Progress-style layout (Step 1 of 2 feeling)".
    // So maybe Step 1: Text details, Step 2: Photo?

    const handleContinue = () => {
        if (step === 1 && isStep1Valid) {
            setStep(2);
        } else if (step === 2 && isStep2Valid) {
            // Save data
            const details: ShopDetails = {
                shopName,
                shopDescription,
                shopMobile,
                shopPhoto
            };

            try {
                localStorage.setItem("om_shop_details", JSON.stringify(details));

                // Simulate redirect delay as per "Redirect to main app page (2nd page) within 2 seconds"
                // Since this is a modal on the main page, we just close it (which reveals the main page)
                // but we can show a "Success" state first.
                setIsLeaving(true);
                setTimeout(() => {
                    onComplete(details);
                }, 2000);
            } catch (error) {
                console.error("Failed to save shop details", error);
                alert("Failed to save data. Please try again (Local Storage might be full).");
            }
        }
    };

    if (isLeaving) {
        return (
            <div className="fixed inset-0 bg-[#020617] z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/50">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Setup Complete!</h2>
                    <p className="text-slate-400">Loading your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                {/* Dynamic Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/30 blur-[80px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, -50, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/30 blur-[80px] rounded-full"
                    />
                </div>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: step === 1 ? "50%" : "100%" }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                </div>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                            {step === 1 ? "Shop Details" : "Visual Identity"}
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">
                            {step === 1 ? "Tell us about your business to personalize your experience." : "Add a photo to make your brand stand out."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 ml-1">Shop Name</label>
                                    <div className="relative group">
                                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={shopName}
                                            onChange={(e) => setShopName(e.target.value)}
                                            placeholder="e.g. Raju Kirana Store"
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 ml-1">Description</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                        <textarea
                                            value={shopDescription}
                                            onChange={(e) => setShopDescription(e.target.value.slice(0, 300))}
                                            placeholder="Short description of your services..."
                                            className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all font-medium resize-none"
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono">
                                            {shopDescription.length}/300
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 ml-1">Shop Mobile (WhatsApp Number)</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="tel"
                                            value={shopMobile}
                                            onChange={(e) => setShopMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="10 digit mobile number"
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all font-medium"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic ml-1">* This will be used as the default contact number for all offers.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 ml-1">Shop Photo</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                                            shopPhoto
                                                ? "border-indigo-500/50 bg-black"
                                                : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />

                                        {shopPhoto ? (
                                            <>
                                                <img src={shopPhoto} alt="Shop Preview" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                    <p className="text-white font-bold text-sm uppercase tracking-widest">Change Photo</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8 text-indigo-500" />
                                                </div>
                                                <p className="text-slate-400 font-medium">Click to upload photo</p>
                                                <p className="text-slate-600 text-xs mt-2">JPG, PNG (Max 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer / Buttons */}
                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                        {step === 2 ? (
                            <button
                                onClick={() => setStep(1)}
                                className="text-slate-500 hover:text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors"
                            >
                                Back
                            </button>
                        ) : (
                            <div /> // Spacer
                        )}

                        <button
                            onClick={handleContinue}
                            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                            className={cn(
                                "flex items-center gap-3 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all",
                                (step === 1 ? isStep1Valid : isStep2Valid)
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-105"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            {step === 1 ? "Next Step" : "Finish Setup"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
