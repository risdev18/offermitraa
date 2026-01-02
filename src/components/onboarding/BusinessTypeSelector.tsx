"use client";

import { useState } from "react";
import { BUSINESS_TYPES, BusinessType, saveBusinessType } from "@/lib/businessTypes";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessTypeSelectorProps {
    onSelect: (type: BusinessType) => void;
    onSkip?: () => void;
}

import { motion, AnimatePresence } from "framer-motion";

export default function BusinessTypeSelector({ onSelect, onSkip }: BusinessTypeSelectorProps) {
    const [selected, setSelected] = useState<BusinessType | null>(null);
    const [customType, setCustomType] = useState("");

    const handleSelect = (type: BusinessType) => {
        setSelected(type);
    };

    const handleConfirm = () => {
        if (selected) {
            saveBusinessType(selected);
            if (selected === 'other' && customType.trim()) {
                localStorage.setItem("businessType_custom", customType.trim());
            }
            onSelect(selected);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.2)] w-full max-w-3xl overflow-hidden relative"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="p-10 md:p-14">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 flex items-center gap-3">
                                Welcome to OfferMitra
                                <span className="text-3xl">👋</span>
                            </h2>
                            <p className="text-slate-200 text-lg font-bold">
                                अपना बिज़नेस चुनें, हम आपके लिए जादू करेंगे।
                            </p>
                        </div>
                        {onSkip && (
                            <button
                                onClick={onSkip}
                                className="text-slate-500 hover:text-white p-3 hover:bg-white/5 rounded-2xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                        {Object.values(BUSINESS_TYPES).map((business) => (
                            <button
                                key={business.id}
                                onClick={() => handleSelect(business.id)}
                                className={cn(
                                    "relative p-8 rounded-[2rem] border-2 transition-all duration-300 group flex flex-col items-center text-center",
                                    selected === business.id
                                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                        : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                )}
                            >
                                <div className={cn(
                                    "text-5xl mb-6 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6",
                                    selected === business.id ? "scale-110" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                                )}>
                                    {business.icon}
                                </div>

                                <div className={cn(
                                    "text-sm font-black uppercase tracking-widest mb-1",
                                    selected === business.id ? "text-white" : "text-slate-400"
                                )}>
                                    {business.nameHindi}
                                </div>
                                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                    {business.name}
                                </div>

                                {selected === business.id && (
                                    <motion.div
                                        layoutId="check-badge"
                                        className="absolute top-4 right-4 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Custom Input for 'Other' */}
                    {selected === 'other' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-6"
                        >
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                                Specify Your Business Category
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Toy Shop, Salon, Bakery..."
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                        </motion.div>
                    )}

                    <div className="mt-12">
                        <button
                            onClick={handleConfirm}
                            disabled={!selected || (selected === 'other' && !customType.trim())}
                            className={cn(
                                "w-full py-6 rounded-[2rem] font-black text-xl tracking-[0.1em] transition-all relative overflow-hidden group",
                                selected
                                    ? 'pro-gradient text-white shadow-2xl hover:scale-[1.02] active:scale-95'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {selected ? 'CONTINUE TO MAGIC' : 'SELECT YOUR BUSINESS'}
                                {selected && <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                            </span>
                            {selected && (
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                            )}
                        </button>
                        {selected && (
                            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mt-6 mt-4">
                                You can change this anytime from settings
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
