"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Send, Wand2, Store, Tag, Loader2, Phone, Calendar, MapPin, Sparkles } from "lucide-react";
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
}

export default function OfferForm({ onGenerate, isGenerating, isPro, defaultValues, usageCount = 0, shopDetails, businessType }: OfferFormProps) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: defaultValues || {}
    });

    const [language, setLanguage] = useState<Language>('hinglish');

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
            if (defaultValues.language) setLanguage(defaultValues.language);
        }
    }, [defaultValues, reset]);

    useEffect(() => {
        if (shopDetails) {
            if (shopDetails.shopName) setValue("shopName", shopDetails.shopName);
            if (shopDetails.shopPhoto) setValue("shopImage", shopDetails.shopPhoto);
            if (shopDetails.shopMobile) setValue("contactNumber", shopDetails.shopMobile);
        }
    }, [shopDetails, setValue]);

    const businessConfig = businessType ? getBusinessConfig(businessType as any) : getBusinessConfig('grocery');
    const template = businessConfig ? getTemplateForBusiness(businessConfig.defaultTemplate) : null;
    const shopType = watch("shopType") || "kirana";

    const onSubmit = (data: any) => {
        onGenerate({
            ...data,
            shopName: data.shopName || shopDetails?.shopName,
            contactNumber: data.contactNumber || shopDetails?.shopMobile,
            shopImage: data.shopImage || shopDetails?.shopPhoto,
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
        "w-full p-4 rounded-2xl border-2 transition-all outline-none text-lg font-bold shadow-sm focus:ring-4",
        isPro
            ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/10"
            : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary/5"
    );

    const labelClasses = cn(
        "text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2 ml-1",
        isPro ? "text-slate-400" : "text-slate-500"
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

            <div className="space-y-8">
                {/* AI Ideas Section */}
                <AIIdeas shopType={businessType || "grocery"} onSelectSuggestion={handleSelectSuggestion} isPro={isPro} />

                {/* Shop Name Input - Hidden if already provided */}
                {!shopDetails?.shopName && (
                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <Store size={14} className="text-primary" />
                            Shop Name
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Sharma Kirana Store"
                            {...register("shopName", { required: !shopDetails?.shopName ? "Shop name is required" : false })}
                            className={inputClasses}
                        />
                        {errors.shopName && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">✗ Required</p>}
                    </div>
                )}

                {/* Contact & Address Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {!shopDetails?.shopMobile && (
                        <div className="space-y-1">
                            <label className={labelClasses}>
                                <Phone size={14} className="text-primary" />
                                Mobile Number
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
                            {errors.contactNumber && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">✗ {errors.contactNumber.message as string}</p>}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <MapPin size={14} className="text-primary" />
                            Shop Address
                        </label>
                        <input
                            type="text"
                            placeholder="Near Bus Stand, Mumbai"
                            {...register("address", { required: "Address is required" })}
                            className={inputClasses}
                        />
                        {errors.address && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">✗ Required</p>}
                    </div>
                </div>

                {/* Product Input with Voice */}
                <div className="space-y-1">
                    <label className={labelClasses}>
                        Product or Service Name
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
                    {errors.productName && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">✗ Required</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Discount */}
                    <div className="space-y-1">
                        <label className={labelClasses}>
                            <Tag size={14} className="text-accent" />
                            Offer / Discount
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
                            <Calendar size={14} className="text-primary" />
                            Occasion
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Diwali, Wedding Season"
                            {...register("festival")}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Extra Info */}
                <div className="space-y-1">
                    <label className={labelClasses}>Additional Details (Optional)</label>
                    <input
                        type="text"
                        placeholder="Ex: Limited stock, 2 years warranty..."
                        {...register("extraInfo")}
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Language & Submit Section */}
            <div className="pt-6 space-y-8">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    {(['hindi', 'hinglish'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => {
                                setLanguage(lang);
                                localStorage.setItem("om_language", lang);
                            }}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                                language === lang
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {lang === 'hindi' ? 'Hindi' : 'Hinglish'}
                        </button>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isGenerating}
                    className={cn(
                        "w-full bg-primary text-white font-black py-6 rounded-[2rem] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-xl disabled:opacity-50"
                    )}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin w-6 h-6" /> Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-6 h-6" /> Create Offer
                        </>
                    )}
                </button>

                <div className="text-center">
                    {isPro ? (
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <Sparkles size={12} /> Unlimited Pro Access
                        </div>
                    ) : (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Daily Limit: <span className="text-primary">{3 - usageCount}</span> of 3 remaining
                        </p>
                    )}
                </div>
            </div>
        </form>
    );
}
