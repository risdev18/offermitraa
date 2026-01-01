"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
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
                body: JSON.stringify({ shopType }),
            });
            const data = await res.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error("Fetch Suggestions Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [shopType]);

    return (
        <div className={cn(
            "space-y-4 p-5 rounded-3xl transition-all duration-500",
            isPro
                ? "bg-slate-800/20 border border-white/5 shadow-inner"
                : "bg-indigo-50/50 border border-indigo-100"
        )}>
            <div className="flex items-center justify-between">
                <h3 className={cn(
                    "text-xs font-black uppercase tracking-widest flex items-center gap-2",
                    isPro ? "text-indigo-300" : "text-indigo-800"
                )}>
                    <Sparkles className="w-4 h-4" />
                    AI Ideas for {shopType.charAt(0).toUpperCase() + shopType.slice(1)}
                </h3>
                <button
                    onClick={fetchSuggestions}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-all",
                        isPro ? "text-slate-400 hover:text-white" : "text-indigo-600 hover:text-indigo-800"
                    )}
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelectSuggestion(s)}
                            className={cn(
                                "text-left p-4 rounded-2xl transition-all group active:scale-[0.98] border border-transparent",
                                isPro
                                    ? "bg-white/5 hover:bg-white/10 hover:border-indigo-500/30"
                                    : "bg-white border-indigo-50/50 hover:border-indigo-500 hover:shadow-lg"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-xs font-black line-clamp-1",
                                    isPro ? "text-indigo-100 group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600"
                                )}>
                                    {s.title}
                                </span>
                                <ArrowRight className={cn(
                                    "w-3 h-3 transition-transform group-hover:translate-x-1",
                                    isPro ? "text-slate-600 group-hover:text-indigo-400" : "text-indigo-300 group-hover:text-indigo-500"
                                )} />
                            </div>
                            <div className="flex gap-2">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                    isPro ? "bg-black/60 text-slate-300" : "bg-slate-200 text-slate-700"
                                )}>
                                    {s.product}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                    isPro ? "bg-indigo-500/30 text-indigo-200" : "bg-green-100 text-green-800"
                                )}>
                                    {s.discount}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
