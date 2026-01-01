"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send, Wand2, Store, Tag, Loader2, Phone, Calendar, MapPin } from "lucide-react";
import { ShopType, OfferType, Language } from "@/types";
import { cn } from "@/lib/utils";
import VoiceInput from "./VoiceInput";
import AIIdeas from "./AIIdeas";
import { getBusinessType, getBusinessConfig } from "@/lib/businessTypes";
import { getTemplateForBusiness, TEMPLATES } from "@/lib/templates";
import { t } from "@/lib/i18n";

interface OfferFormProps {
    onGenerate: (data: any) => void;
    isGenerating: boolean;
    isPro?: boolean;
}

export default function OfferForm({ onGenerate, isGenerating, isPro }: OfferFormProps) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [language, setLanguage] = useState<Language>('hinglish');
    const [showContactField, setShowContactField] = useState(false);

    const businessType = getBusinessType();
    const businessConfig = businessType ? getBusinessConfig(businessType) : null;
    const template = businessConfig ? getTemplateForBusiness(businessConfig.defaultTemplate) : null;
    const shopType = watch("shopType") || "kirana";

    const onSubmit = (data: any) => {
        onGenerate({
            ...data,
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
        "w-full p-4 rounded-2xl border-2 transition-all outline-none text-lg font-bold shadow-sm focus:ring-2",
        isPro
            ? "bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20"
            : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/10"
    );

    const labelClasses = cn(
        "text-sm font-black flex items-center gap-2 mb-2",
        isPro ? "text-indigo-100" : "text-slate-700"
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* AI Ideas Section */}
            <AIIdeas shopType={shopType} onSelectSuggestion={handleSelectSuggestion} isPro={isPro} />

            {/* Shop Name Input */}
            <div className="space-y-1">
                <label className={labelClasses}>
                    <Store className="w-5 h-5" />
                    दुकान का नाम (Shop Name) – {template?.tagline}
                </label>
                <input
                    type="text"
                    placeholder="Ex: Sharma Kirana, Global Medicals..."
                    {...register("shopName", { required: "Shop name is required" })}
                    className={inputClasses}
                />
                {errors.shopName && <p className="text-red-500 text-xs font-black mt-1">✗ दुकान का नाम ज़रूरी है</p>}
            </div>

            {/* Contact & Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className={labelClasses}>
                        <Phone className="w-5 h-5 text-green-500" />
                        मोबाइल नंबर (WhatsApp No.)
                    </label>
                    <input
                        type="tel"
                        placeholder="Ex: 9876543210"
                        {...register("contactNumber", {
                            required: "Mobile number is required",
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "10 अंकों का नंबर डालें"
                            }
                        })}
                        className={inputClasses}
                        maxLength={10}
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs font-black mt-1">✗ {errors.contactNumber.message as string}</p>}
                </div>

                <div className="space-y-1">
                    <label className={labelClasses}>
                        <MapPin className="w-5 h-5 text-red-500" />
                        दुकान का पता (Shop Address)
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Main Road, Near Bus Stand..."
                        {...register("address", { required: "Address is required" })}
                        className={inputClasses}
                    />
                    {errors.address && <p className="text-red-500 text-xs font-black mt-1">✗ पता ज़रूरी है</p>}
                </div>
            </div>

            {/* Product Input with Voice */}
            <div className="space-y-1">
                <label className={labelClasses}>प्रोडक्ट / सर्विस का नाम</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ex: laptop pe 5000 off hai aaj ke liye..."
                        {...register("productName", { required: "Product name is required" })}
                        className={inputClasses}
                    />
                    <VoiceInput onTranscript={handleVoiceInput} />
                </div>
                {errors.productName && <p className="text-red-500 text-xs font-black mt-1">✗ प्रोडक्ट का नाम ज़रूरी है</p>}
            </div>

            {/* Discount */}
            <div className="space-y-1">
                <label className={labelClasses}>डिस्काउंट / ऑफर</label>
                <input
                    type="text"
                    placeholder="Ex: ₹99, 50% OFF, Buy 1 Get 1"
                    {...register("discount")}
                    className={inputClasses}
                />
                <p className={cn("text-xs font-bold mt-1", isPro ? "text-slate-500" : "text-slate-400")}>💡 Tip: ₹99 converts better than ₹100</p>
            </div>

            {/* Extra Info & Store Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className={labelClasses}>Extra Info (Optional)</label>
                    <input
                        type="text"
                        placeholder="Ex: stock is low, guarantee 2 year..."
                        {...register("extraInfo")}
                        className={inputClasses}
                    />
                </div>
                <div className="space-y-1">
                    <label className={labelClasses}>
                        <Tag className="w-4 h-4 text-orange-400" />
                        Online Store Link (Optional)
                    </label>
                    <input
                        type="url"
                        placeholder="Ex: https://shop.me/myitem"
                        {...register("catalogLink")}
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Language Toggle */}
            <div className={cn(
                "flex p-1.5 rounded-2xl border transition-all",
                isPro ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200"
            )}>
                {(['hindi', 'hinglish', 'english'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={cn(
                            "flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                            language === lang
                                ? "bg-white text-indigo-700 shadow-xl scale-100"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {lang === 'hindi' ? '🇮🇳 हिंदी' : lang === 'hinglish' ? '🔤 Hinglish' : '🇺🇸 English'}
                    </button>
                ))}
            </div>

            {/* Generate Button */}
            <button
                type="submit"
                disabled={isGenerating}
                className={cn(
                    "w-full text-white font-black py-6 rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 text-xl group overflow-hidden relative",
                    isGenerating ? "opacity-70 cursor-not-allowed" : "hover:shadow-indigo-500/25"
                )}
                style={template ? {
                    background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.primaryColor}dd 100%)`
                } : {
                    background: `linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)`
                }}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin w-6 h-6" /> बन रहा है...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        ऑफर बनाएं
                    </>
                )}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
            </button>

        </form>
    );
}
