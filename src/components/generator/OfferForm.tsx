"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Send, Wand2, Store, Tag, Loader2, Phone, Calendar, MapPin, Sparkles, Upload, X, Image as ImageIcon } from "lucide-react";
import { ShopType, OfferType, Language } from "@/types";
import { cn } from "@/lib/utils";
import VoiceInput from "./VoiceInput";
import AIIdeas from "./AIIdeas";
import { getBusinessType, getBusinessConfig } from "@/lib/businessTypes";
import { getTemplateForBusiness, TEMPLATES } from "@/lib/templates";
import { t } from "@/lib/i18n";
import { ShopDetails } from "../onboarding/ShopSetup";

interface OfferFormProps {
    onGenerate: (data: any) => void;
    isGenerating: boolean;
    isPro?: boolean;
    defaultValues?: any;
    usageCount?: number;
    shopDetails?: ShopDetails | null;
    businessType: string | null;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

export default function OfferForm({ onGenerate, isGenerating, isPro, defaultValues, usageCount = 0, shopDetails, businessType, language, onLanguageChange }: OfferFormProps) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: defaultValues || {}
    });

    const [productImage, setProductImage] = useState<string | null>(defaultValues?.productImage || null);


    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
            if (defaultValues.language) onLanguageChange(defaultValues.language);
        }
    }, [defaultValues, reset]);

    useEffect(() => {
        if (shopDetails) {
            if (shopDetails.shopName) setValue("shopName", shopDetails.shopName);
            if (shopDetails.shopPhoto) setValue("shopImage", shopDetails.shopPhoto);
            if (shopDetails.shopMobile) setValue("contactNumber", shopDetails.shopMobile);
        }
    }, [shopDetails, setValue]);

    // Festival Magic Logic 🪄
    const festivalValue = watch("festival");
    const [magicActive, setMagicActive] = useState(false);

    useEffect(() => {
        const MAGIC_SUGGESTIONS: Record<string, string> = {
            "diwali": "✨ Shubh Deepawali! Big Festival Sale 🪔",
            "holi": "🎨 Happy Holi! Colors of Joy Sale 🌈",
            "eid": "🌙 Eid Mubarak! Special Festive Offer ✨",
            "christmas": "🎄 Merry Christmas! Santa's Special Deal 🎅",
            "navratri": "💃 Happy Navratri! Dandiya Night Special 🕉️",
            "new year": "🎉 Happy New Year! New Beginnings Sale 🎆",
            "rakhi": "🎁 Happy Rakshabandhan! Sibling Special 🧵",
            "independence": "🇮🇳 Jai Hind! Freedom Sale 🇮🇳",
            "republic": "🇮🇳 Republic Day Special Offer 🇮🇳",
            "wedding": "💍 Wedding Season Special! Shadi Shopping 👰",
            "summer": "☀️ Beat the Heat! Summer Cool Offer 🍦",
            "monsoon": "☔ Monsoon Madness! Rainy Day Sale 🌧️",
            "winter": "❄️ Winter Warmth! Cozy Deals 🧣"
        };

        if (festivalValue) {
            const lowerOccasion = festivalValue.toLowerCase();
            const matchedKey = Object.keys(MAGIC_SUGGESTIONS).find(k => lowerOccasion.includes(k));

            if (matchedKey) {
                // Only auto-fill if extraInfo is empty to avoid overwriting user input
                const currentExtra = watch("extraInfo");
                if (!currentExtra || currentExtra === MAGIC_SUGGESTIONS[matchedKey]) {
                    setValue("extraInfo", MAGIC_SUGGESTIONS[matchedKey]);
                    setMagicActive(true);
                    setTimeout(() => setMagicActive(false), 2000);
                }
            }
        }
    }, [festivalValue, setValue, watch]);

    const businessConfig = businessType ? getBusinessConfig(businessType as any) : getBusinessConfig('grocery');
    const template = businessConfig ? getTemplateForBusiness(businessConfig.defaultTemplate) : null;
    const shopType = watch("shopType") || "kirana";

    const onSubmit = (data: any) => {
        onGenerate({
            ...data,
            shopName: data.shopName || shopDetails?.shopName,
            contactNumber: data.contactNumber || shopDetails?.shopMobile,
            shopImage: data.shopImage || shopDetails?.shopPhoto,
            productImage: productImage,
            language,
            businessType: businessType || 'grocery',
            cta: businessConfig?.ctaText || 'Call Now',
            templateId: template?.id || 'urgent',
            tagline: template?.tagline || '',
            urgencyLine: template?.urgencyLine || ''
        });
    };

    const handleVoiceInput = (text: string) => {
        const currentName = watch("productName") || "";
        setValue("productName", currentName + (currentName ? " " : "") + text);
    };

    const handleSelectSuggestion = (s: any) => {
        setValue("productName", s.product);
        setValue("discount", s.discount);
        setValue("extraInfo", s.title);
    };

    const inputClasses = cn(
        "w-full p-4 rounded-2xl border-2 transition-all outline-none text-base font-bold shadow-sm focus:ring-4",
        isPro
            ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/10"
            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary/5"
    );

    const labelClasses = cn(
        "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2 ml-1",
        isPro ? "text-slate-400" : "text-slate-500"
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            <div className="space-y-10">
                {/* AI Ideas Section */}
                <AIIdeas shopType={businessType || "grocery"} onSelectSuggestion={handleSelectSuggestion} isPro={isPro} language={language} />


                {/* Shop Name Input - Hidden if already provided */}
                {!shopDetails?.shopName && (
                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <Store size={14} className={isPro ? "text-indigo-400" : "text-primary"} />
                            {t('shop_name', language)}
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Sharma Kirana Store"
                            {...register("shopName", { required: !shopDetails?.shopName ? "Shop name is required" : false })}
                            className={inputClasses}
                        />
                        {errors.shopName && <p className="text-red-500 text-[9px] font-black mt-1 uppercase tracking-widest">✗ Required</p>}
                    </div>
                )}

                {/* Contact & Address Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {!shopDetails?.shopMobile && (
                        <div className="space-y-1">
                            <label className={labelClasses}>
                                <Phone size={14} className={isPro ? "text-indigo-400" : "text-primary"} />
                                {t('mobile_number', language)}
                            </label>
                            <input
                                type="tel"
                                placeholder="9876543210"
                                {...register("contactNumber", {
                                    required: !shopDetails?.shopMobile ? "Mobile number is required" : false,
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Enter 10 digit number"
                                    }
                                })}
                                className={inputClasses}
                                maxLength={10}
                            />
                            {errors.contactNumber && <p className="text-red-500 text-[9px] font-black mt-1 uppercase tracking-widest">✗ {errors.contactNumber.message as string}</p>}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <MapPin size={14} className={isPro ? "text-indigo-400" : "text-primary"} />
                            {t('address', language)}
                        </label>
                        <input
                            type="text"
                            placeholder="Near Bus Stand, Mumbai"
                            {...register("address", { required: "Address is required" })}
                            className={inputClasses}
                        />
                        {errors.address && <p className="text-red-500 text-[9px] font-black mt-1 uppercase tracking-widest">✗ Required</p>}
                    </div>
                </div>

                {/* Product Input with Voice */}
                <div className="space-y-1">
                    <label className={labelClasses}>
                        <Sparkles size={14} className={isPro ? "text-indigo-400" : "text-primary"} />
                        {t('product_name', language)}
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Ex: Special Diwali Laptop Deal"
                            {...register("productName", { required: "Product name is required" })}
                            className={inputClasses}
                        />
                        <VoiceInput
                            onTranscript={handleVoiceInput}
                            lang={language === 'hindi' ? 'hi-IN' : 'en-IN'}
                        />
                    </div>
                    {errors.productName && <p className="text-red-500 text-[9px] font-black mt-1 uppercase tracking-widest">✗ Required</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Discount */}
                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <Tag size={14} className="text-accent" />
                            {t('offer_discount', language)}
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: 50% OFF or ₹99"
                            {...register("discount")}
                            className={cn(inputClasses, "border-accent/20 focus:border-accent focus:ring-accent/5")}
                        />
                    </div>

                    {/* Festival / Occasion Input */}
                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <Calendar size={14} className={isPro ? "text-indigo-400" : "text-primary"} />
                            {t('occasion', language)}
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Diwali, Wedding Season"
                            {...register("festival")}
                            className={inputClasses}
                        />
                        {magicActive && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
                                ✨ Magic Applied!
                            </div>
                        )}
                    </div>
                </div>

                {/* Extra Info */}
                <div className="space-y-1">
                    <label className={labelClasses}>{t('extra_benefits', language)}</label>
                    <input
                        type="text"
                        placeholder="Ex: Limited stock, 2 years warranty..."
                        {...register("extraInfo")}
                        className={inputClasses}
                    />
                </div>

                {/* Product Photo Upload */}
                <div className="space-y-1">
                    <label className={labelClasses}>
                        <ImageIcon size={14} className={isPro ? "text-indigo-400" : "text-primary"} />
                        {t('product_photo_optional', language)}
                    </label>
                    <div className="flex items-center gap-6">
                        <div
                            onClick={() => document.getElementById('productPhoto')?.click()}
                            className={cn(
                                "w-28 h-28 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group shrink-0",
                                productImage
                                    ? "border-primary bg-primary/5"
                                    : isPro ? "border-slate-700 bg-slate-800/50 hover:border-indigo-500" : "border-slate-200 bg-slate-50 hover:border-primary"
                            )}
                        >
                            {productImage ? (
                                <img src={productImage} alt="Product" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                                <Upload className={cn("w-6 h-6 mb-1", isPro ? "text-slate-600" : "text-slate-300")} />
                            )}
                            {!productImage && <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Upload</span>}
                            <input
                                id="productPhoto"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setProductImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            {productImage ? (
                                <button
                                    type="button"
                                    onClick={() => setProductImage(null)}
                                    className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <X size={12} /> Remove
                                </button>
                            ) : (
                                <p className="text-[10px] font-bold text-slate-400 max-w-[180px] leading-relaxed">
                                    Upload a photo of your product for a <span className={isPro ? "text-indigo-400" : "text-primary"}>better ad quality</span>.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Language & Submit Section */}
            <div className="pt-8 space-y-8 border-t border-slate-100/10">
                <div className={cn(
                    "flex p-1.5 rounded-2xl border",
                    isPro ? "bg-white/5 border-white/5" : "bg-slate-100 border-slate-200"
                )}>
                    {(['hindi', 'hinglish'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => {
                                onLanguageChange(lang);
                                localStorage.setItem("om_language", lang);
                            }}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em]",
                                language === lang
                                    ? isPro ? "bg-indigo-600 text-white shadow-glow" : "bg-white text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-500"
                            )}
                        >
                            {lang === 'hindi' ? 'Hindi / हिंदी' : 'Hinglish'}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className={cn(
                            "w-full font-black py-6 md:py-8 rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 text-xl md:text-2xl disabled:opacity-50",
                            isPro
                                ? "bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500"
                                : "bg-primary text-white shadow-primary/30 hover:bg-primary/90"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin w-8 h-8" /> {t('generating', language)}...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-8 h-8" /> {t('create_offer', language)}
                            </>
                        )}
                    </button>
                    {!isPro && (
                        <div className="absolute -top-3 -right-3 bg-accent text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-bounce shadow-lg">
                            Instant AI
                        </div>
                    )}
                </div>

                <div className="text-center">
                    {isPro ? (
                        <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 shadow-glow">
                            <Sparkles size={14} className="text-amber-400" /> Professional Mode Enabled
                        </div>
                    ) : (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                            Daily Usage: <span className="text-primary font-black">{3 - usageCount}</span> of 3 remaining
                        </p>
                    )}
                </div>
            </div>
        </form>

    );
}
