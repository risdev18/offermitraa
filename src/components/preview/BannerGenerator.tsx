"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Loader2, Image as ImageIcon, MessageCircle } from "lucide-react";
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
    shopDescription?: string;
    onShare?: () => void;
    productImage?: string;
    shopImage?: string;
}

const PREMIUM_BACKGROUNDS = [
    "bg-slate-900 border border-amber-500/30",         // Premium Black
    "bg-gradient-to-br from-indigo-950 via-primary to-indigo-900", // Deep Blue
    "bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900", // Royal Purple
    "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900", // Sleek
    "bg-gradient-to-br from-yellow-100 to-orange-200 border-none", // Festival (Brighter)
    "bg-gradient-to-br from-blue-100 to-indigo-200 border-none",   // Professional (Brighter)
];

export default function BannerGenerator({
    text, shopType, shopName, isPro, language, address, contactNumber,
    productName, shopDescription, onShare, productImage, shopImage
}: BannerGeneratorProps) {
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
        <div className="space-y-8 w-full">
            {/* Background Selector */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
                {activeBackgrounds.map((bg, i) => (
                    <button
                        key={i}
                        onClick={() => setBgIndex(i)}
                        className={cn(
                            "w-12 h-12 rounded-xl transition-all shadow-md transform active:scale-95 flex-shrink-0 border-2",
                            bg,
                            bgIndex === i ? "ring-4 ring-primary/20 scale-110 border-white" : "grayscale-[50%] opacity-60 border-transparent"
                        )}
                    />
                ))}
            </div>

            {/* Canvas Area */}
            <div className="w-full flex justify-center py-2">
                <div
                    ref={bannerRef}
                    className={cn(
                        "relative p-6 md:p-14 rounded-3xl md:rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] min-h-[450px] md:min-h-[650px] w-full max-w-[500px] flex flex-col items-center text-center overflow-hidden transition-all duration-700",
                        activeBackgrounds[finalBgIndex]
                    )}
                >
                    {/* Decorative Premium Overlay */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

                    <div {... (shopImage ? { className: "mb-6 flex flex-col items-center gap-2" } : { className: "mb-10" })}>
                        {shopImage && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg">
                                <img src={shopImage} alt="Shop" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className={cn(
                            "p-3 px-10 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] border-2 shadow-xl backdrop-blur-md",
                            isDarkBg
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : "bg-white/90 text-primary border-primary/10"
                        )}>
                            {shopName || `${shopType} Exclusive`}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col justify-center items-center w-full space-y-6">
                        {(() => {
                            const lines = text.split('\n').map(l => l.trim().replace(/\*/g, "")).filter(l => l.length > 2);
                            const headline = lines[0] || (language === 'hindi' ? "विशेष ऑफर" : "Special Offer");
                            let description = lines[1] || "";
                            if (description.toUpperCase().includes("ATTENTION") || description.toUpperCase().includes("ANNOUNCEMENT")) {
                                description = lines[2] || description;
                            }
                            const productDisplay = productName || description;
                            let mainOffer = text.match(/(\d+(?:%|₹)\s*OFF)|(Flat\s*\d+(?:%|₹))|(Buy\s*\d+\s*Get\s*\d+)|(₹\s*\d+)/gi)?.[0] || "";
                            if (!mainOffer) {
                                const genericMatch = text.match(/OFF|Sale|Discount|Loot|Dhamaka/i)?.[0];
                                if (genericMatch) mainOffer = "SUPER SALE";
                            }

                            return (
                                <>
                                    <h2 className={cn(
                                        "font-black tracking-tighter leading-[1.1] transition-all",
                                        headline.length > 30 ? "text-lg md:text-xl" : "text-xl md:text-5xl",
                                        isDarkBg ? "text-white/90" : "text-slate-900"
                                    )}>
                                        {headline}
                                    </h2>

                                    {productImage && (
                                        <div className="my-2 md:my-4 w-full flex justify-center">
                                            <div className="w-32 h-32 md:w-64 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white shadow-2xl transform rotate-1">
                                                <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}

                                    {productDisplay && (
                                        <h1 className={cn(
                                            "text-3xl md:text-7xl font-black uppercase tracking-tighter my-1 md:my-2 drop-shadow-2xl",
                                            isDarkBg ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200" : "text-slate-900"
                                        )}>
                                            {productDisplay}
                                        </h1>
                                    )}

                                    {description && description !== productDisplay && (
                                        <p className={cn(
                                            "text-sm md:text-lg font-bold opacity-80 max-w-[90%] md:max-w-[80%] line-clamp-3 leading-tight",
                                            isDarkBg ? "text-indigo-200/80" : "text-slate-600"
                                        )}>
                                            {description}
                                        </p>
                                    )}

                                    {mainOffer && mainOffer !== "OFF" && (
                                        <div className={cn(
                                            "mt-4 md:mt-6 p-4 md:p-10 rounded-2xl md:rounded-[3rem] transform rotate-[-2deg] shadow-2xl transition-all",
                                            isDarkBg
                                                ? "bg-gradient-to-r from-accent to-orange-600 text-white scale-110"
                                                : "bg-red-600 text-white scale-105"
                                        )}>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">
                                                {language === 'hindi' ? "सीमित समय" : "Limited Time"}
                                            </div>
                                            <div className={cn(
                                                "font-black tracking-tighter drop-shadow-lg",
                                                mainOffer.length > 8 ? "text-lg md:text-4xl" : "text-2xl md:text-6xl"
                                            )}>
                                                {mainOffer}
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
                            "p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] backdrop-blur-xl border transition-all",
                            isDarkBg
                                ? "bg-black/30 border-white/5 shadow-2xl"
                                : "bg-white/50 border-white shadow-xl"
                        )}>
                            <div className="grid grid-cols-1 gap-3">
                                {address && (
                                    <div className={cn(
                                        "flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest",
                                        isDarkBg ? "text-indigo-300" : "text-slate-500"
                                    )}>
                                        📍 {address}
                                    </div>
                                )}
                                {contactNumber && (
                                    <div className={cn(
                                        "flex items-center justify-center gap-2 text-base md:text-lg font-black",
                                        isDarkBg ? "text-accent" : "text-primary"
                                    )}>
                                        📞 {contactNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                        {shopDescription && (
                            <div className="mt-4 px-4">
                                <p className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60 italic",
                                    isDarkBg ? "text-white" : "text-slate-900"
                                )}>
                                    "{shopDescription}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-6">
                <button
                    onClick={handleDownload}
                    disabled={isCapturing}
                    className={cn(
                        "flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 border-2",
                        isDarkBg
                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                            : "bg-white border-slate-200 text-primary hover:bg-slate-50"
                    )}
                >
                    {isCapturing ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                    Save Poster
                </button>
                <button
                    onClick={handleShare}
                    disabled={isCapturing}
                    className="flex-1 bg-[#25D366] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                >
                    <MessageCircle className="w-4 h-4" />
                    Share WhatsApp
                </button>
            </div>

        </div>
    );
}
