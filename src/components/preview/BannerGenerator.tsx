"use client";

import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Loader2, Image as ImageIcon, MessageCircle, RefreshCw, Sparkles, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesignConfig, getCategoryFromShopType, getRandomStyle } from "@/lib/design-system";

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

export default function BannerGenerator({
    text, shopType, shopName, isPro, language, address, contactNumber,
    productName, shopDescription, onShare, productImage, shopImage
}: BannerGeneratorProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    // Design System State
    const [currentStyle, setCurrentStyle] = useState<DesignConfig | null>(null);
    const [category, setCategory] = useState<string>('general');

    // Initialize or Update Style when relevant props change
    useEffect(() => {
        const cat = getCategoryFromShopType(shopType || 'general', productName);
        setCategory(cat);
        // Only set initial style if not set (to avoid reset on unrelated rerenders) or if text changed radically
        if (!currentStyle) {
            setCurrentStyle(getRandomStyle(cat));
        }
    }, [shopType, productName, text]);

    // Regeneration Handler
    const handleRegenerate = () => {
        if (!currentStyle) return;
        const newStyle = getRandomStyle(category as any, currentStyle.id);
        setCurrentStyle(newStyle);
    };

    const handleDownload = async () => {
        if (!bannerRef.current) return;
        setIsCapturing(true);

        try {
            // Force fonts to load before capture (hacky but often needed)
            await document.fonts.ready;

            const dataUrl = await toPng(bannerRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
            });

            const link = document.createElement("a");
            link.download = `offer-mitra-${shopName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            onShare?.();
        } catch (err) {
            console.error("Capture failed", err);
            alert("Download failed. Please try again.");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleShare = async () => {
        if (!bannerRef.current) return;
        setIsCapturing(true);

        try {
            await document.fonts.ready;
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
                    text: `🔥 *${shopName || "My Shop"} Special Offer* 🔥\n\n${text}\n\n📍 *Visit us:* ${address || "At Store"}\n📞 *Call:* ${contactNumber || ""}\n\n⏳ *Limited Time Offer - Hurry Up!*`,
                });
                onShare?.();
            } else {
                const link = document.createElement("a");
                link.download = `offer-mitra-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
                alert("Poster saved! Sending to WhatsApp...");
                window.open(`https://wa.me/?text=${encodeURIComponent(`🔥 *${shopName || "My Shop"} Special Offer* 🔥\n\n${text}\n\n📍 *Visit:* ${address || "Store"}`)}`, '_blank');
                onShare?.();
            }
        } catch (err) {
            console.error("Share failed", err);
            alert("Sharing failed. Try downloading instead.");
        } finally {
            setIsCapturing(false);
        }
    };

    if (!currentStyle) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

    // Parse Text Content for Layouts
    const lines = text.split('\n').map(l => l.trim().replace(/\*/g, "")).filter(l => l.length > 2);
    const headline = lines[0] || "Special Offer";
    let description = lines[1] || "";
    if (description.toUpperCase().includes("ATTENTION") || description.toUpperCase().includes("ANNOUNCEMENT")) {
        description = lines[2] || description;
    }
    const productDisplay = productName || description.substring(0, 20);
    // Extract Offer
    let mainOffer = text.match(/(\d+(?:%|₹)\s*OFF)|(Flat\s*\d+(?:%|₹))|(Buy\s*\d+\s*Get\s*\d+)|(₹\s*\d+)/gi)?.[0] || "";
    if (!mainOffer) {
        const genericMatch = text.match(/OFF|Sale|Discount|Loot|Dhamaka/i)?.[0];
        if (genericMatch) mainOffer = "SUPER SALE";
    }

    // --- RENDER LAYOUTS ---

    // Common Elements
    const ShopBranding = () => (
        <div className={cn("flex flex-col items-center gap-2", currentStyle.layout === 'modern_split' ? "items-start" : "")}>
            {shopImage && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                    <img src={shopImage} alt="Shop" className="w-full h-full object-cover" />
                </div>
            )}
            <div className={cn(
                "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                currentStyle.theme === 'premium_dark' ? "bg-white/10 text-white border-white/10" : "bg-white/80 text-slate-800 border-slate-200"
            )}>
                {shopName || "My Shop"}
            </div>
        </div>
    );

    const ProductImage = () => productImage ? (
        <div className={cn("overflow-hidden relative", currentStyle.imageStyle)}>
            <img src={productImage} alt="Product" className="w-full h-full object-cover" />
        </div>
    ) : null;

    const FooterDetails = () => (
        <div className={cn(
            "p-4 rounded-xl backdrop-blur-md border w-full text-center relative z-10",
            currentStyle.theme === 'premium_dark' ? "bg-black/40 border-white/10 text-slate-300" : "bg-white/60 border-white text-slate-600"
        )}>
            <div className="flex flex-col gap-1 text-[10px] md:text-xs font-bold uppercase tracking-wide">
                {address && <span>📍 {address}</span>}
                {contactNumber && <span className={cn("text-sm md:text-base font-black", currentStyle.theme === 'premium_dark' ? "text-white" : "text-black")}>📞 {contactNumber}</span>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 w-full max-w-[500px] mx-auto">
            {/* Generator Controls */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Palette size={14} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Style</div>
                        <div className="text-xs font-black text-slate-800">{currentStyle.name}</div>
                    </div>
                </div>
                <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg active:scale-95"
                >
                    <RefreshCw size={12} /> Regenerate
                </button>
            </div>

            {/* Canvas */}
            <div className="w-full flex justify-center transform transition-all duration-500">
                <div
                    ref={bannerRef}
                    className={cn(
                        "relative w-full aspect-[4/5] overflow-hidden flex flex-col shadow-2xl transition-all duration-700",
                        currentStyle.bgClasses,
                        // Add padding based on layout
                        currentStyle.layout === 'modern_split' ? "p-0" : "p-6 md:p-8"
                    )}
                >
                    {/* Dynamic Overlay */}
                    <div className={cn("absolute inset-0 pointer-events-none z-0", currentStyle.overlayStyle)} />

                    {/* --- LAYOUT SWITCHER --- */}

                    {/* 1. CLASSIC LAYOUT */}
                    {currentStyle.layout === 'classic' && (
                        <div className="relative z-10 flex flex-col h-full items-center text-center justify-between">
                            <ShopBranding />
                            <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full">
                                <h2 className={cn("text-3xl md:text-4xl", currentStyle.fontHead, currentStyle.textPrimary)}>{headline}</h2>
                                {productImage && <div className="w-48 h-48 md:w-64 md:h-64 my-2"><ProductImage /></div>}
                                <div className={cn("text-base", currentStyle.fontBody, currentStyle.textSecondary)}>{description.substring(0, 60)}...</div>
                                {mainOffer && (
                                    <div className={cn("px-6 py-2 rounded-lg text-xl md:text-3xl font-black shadow-xl scale-110", currentStyle.accentColor, currentStyle.fontHead)}>
                                        {mainOffer}
                                    </div>
                                )}
                            </div>
                            <FooterDetails />
                        </div>
                    )}

                    {/* 2. FEATURE IMAGE LAYOUT */}
                    {currentStyle.layout === 'feature_image' && (
                        <div className="relative z-10 flex flex-col h-full items-center justify-between">
                            <div className="absolute top-6 left-6 z-20"><ShopBranding /></div>
                            <div className="w-full flex-1 relative flex items-center justify-center my-4">
                                {productImage ? (
                                    <div className={cn("w-[90%] aspect-square relative z-10", currentStyle.imageStyle)}>
                                        <img src={productImage} className="w-full h-full object-cover rounded-[inherit]" />
                                    </div>
                                ) : (
                                    <div className="text-4xl font-black text-center opacity-20 rotate-12">NO IMAGE</div>
                                )}
                            </div>
                            <div className="w-full mt-auto relative z-20 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                                <h2 className={cn("text-2xl md:text-4xl mb-2", currentStyle.fontHead, currentStyle.textPrimary)}>{productDisplay}</h2>
                                <div className="flex justify-between items-end">
                                    <div className={cn("text-sm max-w-[60%]", currentStyle.fontBody, currentStyle.textSecondary)}>{description.substring(0, 50)}</div>
                                    <div className={cn("text-xl font-black", currentStyle.accentColor)}>{mainOffer}</div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                    <FooterDetails />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. MODERN SPLIT LAYOUT */}
                    {currentStyle.layout === 'modern_split' && (
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="h-[55%] relative overflow-hidden">
                                {productImage ? <img src={productImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                    <h2 className={cn("text-3xl font-black text-white", currentStyle.fontHead)}>{productDisplay}</h2>
                                </div>
                                <div className="absolute top-4 left-4"><ShopBranding /></div>
                            </div>
                            <div className={cn("flex-1 p-6 flex flex-col justify-between", currentStyle.bgClasses)}>
                                <div>
                                    <h3 className={cn("text-xl mb-2", currentStyle.fontHead, currentStyle.textPrimary)}>{headline}</h3>
                                    <p className={cn("text-sm", currentStyle.fontBody, currentStyle.textSecondary)}>{description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className={cn("text-xs font-bold", currentStyle.textSecondary)}>{address}</div>
                                    {mainOffer && <div className={cn("px-4 py-2 text-lg font-black rounded-lg", currentStyle.accentColor)}>{mainOffer}</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. BOLD OFFER LAYOUT */}
                    {currentStyle.layout === 'bold_offer' && (
                        <div className="relative z-10 flex flex-col h-full items-center justify-center text-center p-4">
                            <div className="absolute top-4 w-full flex justify-center opacity-80"><ShopBranding /></div>
                            <div className={cn("text-5xl md:text-7xl font-black leading-none mb-4 uppercase", currentStyle.fontHead, currentStyle.textPrimary)}>
                                {mainOffer || "SALE"}
                            </div>
                            <div className="w-full max-w-[200px] aspect-square mx-auto mb-6 relative">
                                {productImage && (
                                    <div className={cn("w-full h-full overflow-hidden", currentStyle.imageStyle)}>
                                        <img src={productImage} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <h2 className={cn("text-xl md:text-2xl mb-2 uppercase tracking-widest", currentStyle.fontHead, currentStyle.textSecondary)}>{productDisplay}</h2>
                            <div className={cn("px-6 py-1 rounded-full text-sm font-bold mt-4", currentStyle.accentColor)}>
                                Call: {contactNumber}
                            </div>
                            <div className="absolute bottom-4 left-0 w-full text-center text-[10px] opacity-50 uppercase tracking-[0.2em] px-4">
                                {address}
                            </div>
                        </div>
                    )}

                    {/* 5. MINIMAL TYPOGRAPHY */}
                    {currentStyle.layout === 'minimal_typography' && (
                        <div className="relative z-10 flex flex-col h-full text-left p-8">
                            <div className="mb-auto">
                                <div className={cn("text-[10px] uppercase tracking-[0.3em] mb-4 font-bold", currentStyle.textSecondary)}>{shopName}</div>
                                <h1 className={cn("text-5xl md:text-6xl font-black leading-none mb-6", currentStyle.fontHead, currentStyle.textPrimary)}>
                                    {headline.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
                                </h1>
                                <p className={cn("text-sm max-w-[80%]", currentStyle.textSecondary)}>{description}</p>
                            </div>
                            <div className="absolute right-0 top-1/4 w-[40%] aspect-[3/4] opacity-50 mix-blend-multiply">
                                {productImage && <img src={productImage} className={cn("w-full h-full object-cover", currentStyle.imageStyle)} />}
                            </div>
                            <div className="mt-8 border-t-2 pt-4 w-full" style={{ borderColor: 'currentColor' }}>
                                <div className="flex justify-between items-end">
                                    <div className={cn("text-4xl font-black", currentStyle.accentColor)}>{mainOffer}</div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold uppercase tracking-wider">{contactNumber}</div>
                                        <div className="text-[10px] opacity-60">{address}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. ASYMMETRIC / MAGAZINE */}
                    {(currentStyle.layout === 'asymmetric' || currentStyle.layout === 'magazine') && (
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="absolute top-4 right-4 z-30"><ShopBranding /></div>
                            <div className="w-[85%] aspect-square relative z-20 mt-8 self-center">
                                {productImage && <div className={cn("w-full h-full overflow-hidden", currentStyle.imageStyle)}><img src={productImage} className="w-full h-full object-cover" /></div>}
                                <div className={cn("absolute -bottom-6 -right-6 px-6 py-4 text-2xl font-black rounded-xl shadow-xl z-30", currentStyle.accentColor)}>
                                    {mainOffer || "Best Deal"}
                                </div>
                            </div>
                            <div className="mt-auto p-4 relative z-10">
                                <h2 className={cn("text-3xl font-black mb-2", currentStyle.fontHead, currentStyle.textPrimary)}>{productDisplay}</h2>
                                <p className={cn("text-sm mb-4 line-clamp-2", currentStyle.textSecondary)}>{description}</p>
                                <FooterDetails />
                            </div>
                        </div>
                    )}


                    {/* Watermark for Free Users */}
                    {!isPro && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-bold text-white uppercase tracking-widest pointer-events-none z-50">
                            Made with OfferMitra
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                    onClick={handleDownload}
                    disabled={isCapturing}
                    className="flex-1 py-4 rounded-xl border-2 border-slate-200 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                    {isCapturing ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                    Save Image
                </button>
                <button
                    onClick={handleShare}
                    disabled={isCapturing}
                    className="flex-1 bg-[#25D366] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:shadow-lg hover:bg-green-600 transition-all"
                >
                    <Share2 className="w-4 h-4" />
                    Share WhatsApp
                </button>
            </div>
        </div>
    );
}
