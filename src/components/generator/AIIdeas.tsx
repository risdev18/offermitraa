"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Suggestion {
    title: string;
    product: string;
    discount: string;
}

interface AIIdeasProps {
    shopType: string;
    onSelectSuggestion: (suggestion: Suggestion) => void;
    isPro?: boolean;
    language?: string;
}

export default function AIIdeas({ shopType, onSelectSuggestion, isPro, language = 'en' }: AIIdeasProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async () => {
        if (!shopType) return;
        setLoading(true);
        try {
            const res = await fetch("/api/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopType }),
            });
            const data = await res.json();
            if (data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions);
            } else {
                setSuggestions(FALLBACK_SUGGESTIONS[shopType as keyof typeof FALLBACK_SUGGESTIONS] || FALLBACK_SUGGESTIONS.grocery);
            }
        } catch (error) {
            console.error("Fetch Suggestions Error:", error);
            setSuggestions(FALLBACK_SUGGESTIONS[shopType as keyof typeof FALLBACK_SUGGESTIONS] || FALLBACK_SUGGESTIONS.grocery);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [shopType]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2",
                        isPro ? "text-indigo-400" : "text-primary"
                    )}>
                        <Sparkles size={14} />
                        {language === 'hindi' ? "AI सुझाव" : "AI Suggestions"}
                    </h3>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Trending for your shop</span>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        fetchSuggestions();
                    }}
                    disabled={loading}
                    className={cn(
                        "p-2 rounded-xl transition-all active:scale-95 group",
                        isPro ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
                    )}
                >
                    <RefreshCw size={14} className={cn(loading && "animate-spin", isPro ? "text-slate-400" : "text-slate-500")} />
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide no-scrollbar">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-20 w-48 rounded-2xl animate-pulse shrink-0",
                                isPro ? "bg-white/5" : "bg-slate-100"
                            )}
                        />
                    ))
                ) : (
                    suggestions.map((suggestion, index) => (
                        <motion.button
                            key={index}
                            type="button"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelectSuggestion(suggestion)}
                            className={cn(
                                "px-6 py-5 rounded-2xl text-left shrink-0 transition-all border-2 flex flex-col gap-1 shadow-sm active:scale-95 group relative overflow-hidden min-w-[180px]",
                                isPro
                                    ? "bg-slate-900 border-white/5 hover:border-indigo-500"
                                    : "bg-white border-slate-100 hover:border-primary"
                            )}
                        >
                            <div className="flex flex-col gap-0.5 relative z-10">
                                <span className={cn(
                                    "text-sm font-black tracking-tight",
                                    isPro ? "text-white" : "text-slate-900"
                                )}>
                                    {suggestion.product}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    isPro ? "text-indigo-400" : "text-accent"
                                )}>
                                    {suggestion.discount}
                                </span>
                            </div>
                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500" />
                            <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                    ))
                )}
                {(!loading && suggestions.length === 0) && (
                    <div className="text-center py-4 w-full">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            No suggestions found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const FALLBACK_SUGGESTIONS: Record<string, Suggestion[]> = {
    grocery: [
        { title: "Limited Time Deal", product: "Daily Essentials", discount: "Flat 10% Off" },
        { title: "Special Combo", product: "Oil + Rice Bundle", discount: "Save ₹150" },
        { title: "Stock Up Sale", product: "Monthly Groceries", discount: "Extra 5% Off" }
    ],
    kirana: [
        { title: "Limited Time Deal", product: "Daily Essentials", discount: "Flat 10% Off" },
        { title: "Special Combo", product: "Oil + Rice Bundle", discount: "Save ₹150" },
        { title: "Stock Up Sale", product: "Monthly Groceries", discount: "Extra 5% Off" }
    ],
    mobile: [
        { title: "Exchange Mela", product: "Old Smartphones", discount: "Extra ₹2000 Off" },
        { title: "New Launch Sale", product: "Smartphone Series", discount: "No Cost EMI" }
    ],
    clothing: [
        { title: "Seasonal Sale", product: "All New Arrivals", discount: "Up to 50% Off" },
        { title: "Family Combo", product: "Men & Women Collection", discount: "Buy 2 Get 1 Free" }
    ],
    medical: [
        { title: "Health First", product: "Vitamins & Meds", discount: "Flat 10% Off" },
        { title: "Home Care", product: "First Aid Kits", discount: "Extra 5% Off" }
    ]
};
