"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
    title: string;
    product: string;
    discount: string;
}

interface AIIdeasProps {
    shopType: string;
    onSelectSuggestion: (suggestion: Suggestion) => void;
    isPro?: boolean;
}

export default function AIIdeas({ shopType, onSelectSuggestion, isPro }: AIIdeasProps) {
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
        <div className={cn(
            "space-y-6 p-6 rounded-[2rem] transition-all duration-500",
            isPro
                ? "bg-slate-900 border border-slate-800 shadow-2xl"
                : "bg-slate-50 border border-slate-100"
        )}>
            <div className="flex items-center justify-between">
                <h3 className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2",
                    isPro ? "text-slate-400" : "text-slate-500"
                )}>
                    <Sparkles size={14} className="text-primary" />
                    Offer Ideas
                </h3>
                <button
                    onClick={fetchSuggestions}
                    disabled={loading}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-all p-2 rounded-lg hover:bg-slate-200/50",
                        isPro ? "text-slate-400 hover:text-white" : "text-primary/60 hover:text-primary"
                    )}
                >
                    <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Generating Brilliance...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelectSuggestion(s)}
                            className={cn(
                                "text-left p-6 rounded-2xl transition-all group active:scale-[0.98] border-2",
                                isPro
                                    ? "bg-slate-800 border-slate-700 hover:border-primary"
                                    : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-xl shadow-sm"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={cn(
                                    "text-sm font-black leading-tight",
                                    isPro ? "text-white" : "text-slate-900"
                                )}>
                                    {s.title}
                                </span>
                                <ArrowRight className={cn(
                                    "w-4 h-4 transition-transform group-hover:translate-x-1",
                                    isPro ? "text-slate-600" : "text-slate-300 group-hover:text-primary"
                                )} />
                            </div>
                            <div className="flex gap-2">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg",
                                    isPro ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
                                )}>
                                    {s.product}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg",
                                    isPro ? "bg-primary text-white" : "bg-accent/10 text-accent font-black"
                                )}>
                                    {s.discount}
                                </span>
                            </div>
                        </button>
                    ))}
                    {suggestions.length === 0 && !loading && (
                        <p className="text-center py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            No suggestions found. Try refreshing!
                        </p>
                    )}
                </div>
            )}
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
