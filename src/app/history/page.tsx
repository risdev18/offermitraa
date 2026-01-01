"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Calendar, ShoppingBag, Eye, MessageSquare, Image as ImageIcon, Video, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { t, Language } from "@/lib/i18n";

interface HistoryItem {
    id: string;
    offerText: string;
    inputData: any;
    videoScript?: string[];
    videoTitles?: string[];
    timestamp: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isPro, setIsPro] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('hinglish');

    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem("om_history") || "[]");
        setHistory(storedHistory);
        setIsPro(localStorage.getItem("om_is_pro") === "true");
        setLanguage((localStorage.getItem("om_language") as Language) || 'hinglish');
    }, []);

    const deleteItem = (id: string) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem("om_history", JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        if (confirm(t('clear_all', language) + "?")) {
            setHistory([]);
            localStorage.setItem("om_history", "[]");
        }
    };

    const viewItem = (item: HistoryItem, mode: 'banner' | 'video' = 'banner') => {
        // Save to current session so home page picks it up
        localStorage.setItem("om_last_offer", item.offerText);
        localStorage.setItem("om_last_input", JSON.stringify(item.inputData));
        localStorage.setItem("om_last_script", JSON.stringify(item.videoScript || []));
        localStorage.setItem("om_last_titles", JSON.stringify(item.videoTitles || []));
        localStorage.setItem("om_output_mode", mode);
        window.location.href = "/";
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <main className={cn(
            "min-h-screen p-4 md:p-10 transition-colors duration-1000",
            isPro ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"
        )}>
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.location.href = "/"}
                            className={cn(
                                "p-3 rounded-2xl transition-all",
                                isPro ? "bg-white/5 hover:bg-white/10 text-white" : "bg-white hover:bg-slate-100 text-slate-600 shadow-sm"
                            )}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">{t('your_history', language)}</h1>
                            <p className={cn("text-xs font-bold uppercase tracking-widest opacity-60", isPro ? "text-indigo-400" : "text-indigo-600")}>
                                {t('previous_generations', language)} ({history.length})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className={cn(
                            "flex p-1 rounded-xl border",
                            isPro ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                        )}>
                            {(['hindi', 'hinglish', 'english'] as Language[]).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        setLanguage(l);
                                        localStorage.setItem("om_language", l);
                                    }}
                                    className={cn(
                                        "px-4 py-2 text-[8px] font-black rounded-lg transition-all uppercase tracking-widest",
                                        language === l
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {l === 'hindi' ? 'हिंदी' : l === 'hinglish' ? 'Hinglish' : 'Eng'}
                                </button>
                            ))}
                        </div>

                        {history.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="bg-red-500/10 text-red-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                                {t('clear_all', language)}
                            </button>
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {history.length > 0 ? (
                            history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={cn(
                                        "rounded-[2rem] border transition-all group relative overflow-hidden",
                                        isPro ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
                                    )}
                                >
                                    <div
                                        onClick={() => toggleExpand(item.id)}
                                        className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative z-10"
                                    >
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl",
                                                    isPro ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                                                )}>
                                                    <ShoppingBag className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-black text-lg truncate max-w-[200px]">
                                                    {item.inputData?.productName || "Unnamed Offer"}
                                                </h3>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em]",
                                                    isPro ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-sm font-medium line-clamp-1 opacity-70 italic",
                                                isPro ? "text-slate-300" : "text-slate-600"
                                            )}>
                                                "{item.offerText.slice(0, 100)}..."
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white" title="Message"><MessageSquare className="w-3 h-3" /></div>
                                                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white" title="Poster"><ImageIcon className="w-3 h-3" /></div>
                                                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white" title="Video"><Video className="w-3 h-3" /></div>
                                            </div>
                                            <div className={cn(
                                                "p-2 rounded-full transition-transform",
                                                expandedId === item.id ? "rotate-0" : ""
                                            )}>
                                                {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === item.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/10 bg-black/20 p-8 space-y-8 relative z-10"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Message Preview */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                                            <MessageSquare className="w-3 h-3" /> {t('msg', language)}
                                                        </h4>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl text-xs font-bold leading-relaxed max-h-40 overflow-y-auto scrollbar-hide",
                                                            isPro ? "bg-white/5" : "bg-slate-50"
                                                        )}>
                                                            {item.offerText}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(item.offerText);
                                                                alert(t('copied', language));
                                                            }}
                                                            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 transition-all"
                                                        >
                                                            {t('copy', language)}
                                                        </button>
                                                    </div>

                                                    {/* Banner Preview */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                                            <ImageIcon className="w-3 h-3" /> {t('banner', language)}
                                                        </h4>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center text-center gap-2 border border-dashed",
                                                            isPro ? "bg-white/5 border-white/20" : "bg-slate-50 border-slate-200"
                                                        )}>
                                                            <div className="text-[10px] font-black uppercase">{item.inputData?.shopName}</div>
                                                            <div className="text-xl font-black text-amber-500">{item.inputData?.discount}</div>
                                                            <div className="text-[8px] font-bold opacity-50 px-4">{item.inputData?.productName}</div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); viewItem(item, 'banner'); }}
                                                            className="w-full py-3 bg-amber-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
                                                        >
                                                            {t('re_view', language)} {t('banner', language)}
                                                        </button>
                                                    </div>

                                                    {/* Video Preview */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                                                            <Video className="w-3 h-3" /> {t('video', language)}
                                                        </h4>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center text-center gap-2 border border-dashed",
                                                            isPro ? "bg-white/5 border-white/20" : "bg-slate-50 border-slate-200"
                                                        )}>
                                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                                <Video className="w-5 h-5 text-purple-500" />
                                                            </div>
                                                            <div className="text-[8px] font-bold opacity-60">Animated Ad Sequence</div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); viewItem(item, 'video'); }}
                                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all"
                                                        >
                                                            {t('re_view', language)} {t('video', language)}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                                        className="text-[10px] font-black uppercase text-red-500 flex items-center gap-2 opacity-60 hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> {t('delete', language)}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-32 space-y-6">
                                <div className={cn(
                                    "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
                                    isPro ? "bg-white/5 text-slate-600" : "bg-slate-100 text-slate-400"
                                )}>
                                    <Calendar className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black tracking-tighter">{t('no_history', language)}</h2>
                                    <p className="text-sm font-bold opacity-50 uppercase tracking-widest">{t('create_first', language)}!</p>
                                </div>
                                <button
                                    onClick={() => window.location.href = "/"}
                                    className="pro-gradient text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                                >
                                    {t('create_first', language)}
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className={cn(
                    "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10",
                    isPro ? "bg-indigo-600" : "bg-indigo-400"
                )} />
                <div className={cn(
                    "absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10",
                    isPro ? "bg-purple-600" : "bg-purple-400"
                )} />
            </div>
        </main>
    );
}
