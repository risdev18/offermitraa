"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerGeneratorProps {
    text: string;
    shopType: string;
    shopName?: string;
    isPro?: boolean;
    language?: string;
    address?: string;
    contactNumber?: string;
    productName?: string;
    onShare?: () => void;
}

const PREMIUM_BACKGROUNDS = [
    "bg-slate-900 border border-amber-500/30",         // Premium Black
    "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900", // Royal Blue
    "bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900", // Royal Purple
    "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900", // Sleek
    "bg-gradient-to-br from-yellow-100 to-orange-200 border-none", // Festival (Brighter)
    "bg-gradient-to-br from-blue-100 to-indigo-200 border-none",   // Professional (Brighter) e
];

export default function BannerGenerator({ text, shopType, shopName, isPro, language, address, contactNumber, productName, onShare }: BannerGeneratorProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [bgIndex, setBgIndex] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);

    const activeBackgrounds = PREMIUM_BACKGROUNDS;
    const finalBgIndex = Math.min(bgIndex, activeBackgrounds.length - 1);
    const isDarkBg = finalBgIndex < 4; // First 4 are dark premium themes

    const handleDownload = async () => {
        if (!bannerRef.current) return;
        setIsCapturing(true);

        try {
            // Using toPng for better reliability
            const dataUrl = await toPng(bannerRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
            });

            const link = document.createElement("a");
            link.download = `offer-mitra-poster-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            onShare?.();
        } catch (err) {
            console.error("Capture failed", err);
            alert("Download failed. Please try again or take a screenshot.");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleShare = async () => {
        if (!bannerRef.current) return;
        setIsCapturing(true);

        try {
            const dataUrl = await toPng(bannerRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `offer-${Date.now()}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Business Offer',
                    text: 'Check out this offer from ' + (shopName || 'my shop!'),
                });
                onShare?.();
            } else {
                // Fallback for browsers that don't support file sharing
                const link = document.createElement("a");
                link.download = `offer-mitra-poster-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
                alert("Poster saved to gallery! You can now share it manually on WhatsApp.");
                onShare?.();
            }
        } catch (err) {
            console.error("Share failed", err);
            alert("Sharing failed. Try downloading instead.");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="space-y-4 w-full">
            {/* Background Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {activeBackgrounds.map((bg, i) => (
                    <button
                        key={i}
                        onClick={() => setBgIndex(i)}
                        className={cn(
                            "w-14 h-14 rounded-2xl transition-all shadow-lg transform active:scale-95 flex-shrink-0 border-2",
                            bg,
                            bgIndex === i ? "ring-4 ring-indigo-500 scale-110 border-white" : "grayscale-[50%] opacity-70 border-transparent"
                        )}
                    />
                ))}
            </div>

            {/* Canvas Area - LARGER */}
            <div className="w-full flex justify-center py-4">
                <div
                    ref={bannerRef}
                    className={cn(
                        "relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl min-h-[550px] md:min-h-[650px] w-full max-w-[600px] flex flex-col items-center text-center overflow-hidden transition-all duration-700",
                        activeBackgrounds[finalBgIndex]
                    )}
                >
                    {/* Decorative Premium Overlay - Always Active for everyone */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
                    <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-amber-500/20 rounded-tl-3xl" />
                    <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-indigo-500/20 rounded-br-3xl" />

                    {/* Header Tag */}
                    <div className={cn(
                        "mb-8 p-3 px-10 rounded-2xl text-[14px] font-black uppercase tracking-[0.3em] border-2 shadow-xl backdrop-blur-md",
                        isDarkBg
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            : "bg-white/90 text-indigo-700 border-indigo-100"
                    )}>
                        {shopName || `${shopType} Exclusive`}
                    </div>

                    {/* Main Content Area - Intelligently Parsed */}
                    <div className="flex-1 flex flex-col justify-center items-center w-full space-y-6">
                        {(() => {
                            const lines = text.split('\n').map(l => l.trim().replace(/\*/g, "")).filter(l => l.length > 2);
                            const headline = lines[0] || (language === 'hindi' ? "विशेष ऑफर" : "Special Offer");

                            // Smarter Description: If line 1 is generic "Attention", take line 2
                            let description = lines[1] || "";
                            if (description.toUpperCase().includes("ATTENTION") || description.toUpperCase().includes("ANNOUNCEMENT")) {
                                description = lines[2] || description;
                            }

                            // Use productName explicitly if available, otherwise try to extract
                            const productDisplay = productName || description;

                            // Smarter Offer Extraction
                            let mainOffer = text.match(/(\d+(?:%|₹)\s*OFF)|(Flat\s*\d+(?:%|₹))|(Buy\s*\d+\s*Get\s*\d+)|(₹\s*\d+)/gi)?.[0] || "";

                            // Fallback: If no specific number/deal found, look for generic keywords
                            if (!mainOffer) {
                                const genericMatch = text.match(/OFF|Sale|Discount|Loot|Dhamaka/i)?.[0];
                                if (genericMatch) {
                                    mainOffer = "SUPER SALE"; // Default to a better looking badge than just "OFF"
                                }
                            }

                            return (
                                <>
                                    <h2 className={cn(
                                        "font-black tracking-tighter leading-[1.1] transition-all",
                                        headline.length > 30 ? "text-3xl" : "text-4xl md:text-6xl",
                                        isDarkBg ? "text-white" : "text-slate-900"
                                    )}>
                                        {headline}
                                    </h2>

                                    {productDisplay && (
                                        <h1 className={cn(
                                            "text-5xl md:text-7xl font-black uppercase tracking-tighter my-2 drop-shadow-2xl",
                                            isDarkBg ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200" : "text-slate-900"
                                        )}>
                                            {productDisplay}
                                        </h1>
                                    )}

                                    {description && description !== productDisplay && (
                                        <p className={cn(
                                            "text-lg font-bold opacity-80 max-w-[80%] line-clamp-3 leading-tight",
                                            isDarkBg ? "text-indigo-200" : "text-slate-600"
                                        )}>
                                            {description}
                                        </p>
                                    )}

                                    {mainOffer && mainOffer !== "OFF" && (
                                        <div className={cn(
                                            "mt-6 p-6 md:p-10 rounded-[3rem] transform rotate-[-2deg] shadow-2xl transition-all hover:rotate-0",
                                            isDarkBg
                                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white scale-110"
                                                : "bg-red-600 text-white scale-105"
                                        )}>
                                            <div className="text-xs font-black uppercase tracking-[0.3em] mb-1">
                                                {language === 'hindi' ? "सीमित समय के लिए" : "Limited Time"}
                                            </div>
                                            <div className={cn(
                                                "font-black tracking-tighter drop-shadow-lg",
                                                mainOffer.length > 8 ? "text-3xl md:text-5xl" : "text-5xl md:text-7xl"
                                            )}>
                                                {mainOffer}
                                            </div>
                                            <div className="text-sm font-black uppercase tracking-widest mt-1 opacity-90">
                                                {language === 'hindi' ? "भारी बचत" : "Maximum Savings"}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Contact Section */}
                    <div className="w-full mt-10 space-y-4">
                        <div className={cn(
                            "p-6 rounded-[2.5rem] backdrop-blur-xl border transition-all",
                            isDarkBg
                                ? "bg-black/40 border-slate-700 shadow-2xl"
                                : "bg-white/70 border-white shadow-xl"
                        )}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {address && (
                                    <div className={cn(
                                        "flex items-center justify-center gap-2 text-xs font-bold leading-tight",
                                        isDarkBg ? "text-blue-300" : "text-slate-700"
                                    )}>
                                        <span className="text-xl">📍</span> {address}
                                    </div>
                                )}
                                {contactNumber && (
                                    <div className={cn(
                                        "flex items-center justify-center gap-2 text-sm font-black",
                                        isDarkBg ? "text-amber-400" : "text-green-700"
                                    )}>
                                        <span className="text-xl">📞</span> {contactNumber}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={cn(
                            "text-[10px] font-black px-6 py-2 px-8 rounded-full inline-block uppercase tracking-[0.2em]",
                            isDarkBg
                                ? "bg-slate-900 shadow-xl border border-slate-800 text-indigo-400"
                                : "bg-white shadow-lg text-slate-400"
                        )}>
                            OfferMitra SUCCESS
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={isCapturing}
                    className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all active:scale-95"
                >
                    {isCapturing ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
                    Download
                </button>
                <button
                    onClick={handleShare}
                    disabled={isCapturing}
                    className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#20b85a] transition-all shadow-lg shadow-green-900/10 active:scale-95"
                >
                    <Share2 className="w-5 h-5" />
                    Share Poster
                </button>
            </div>
        </div>
    );
}
