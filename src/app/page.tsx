"use client";

import { useAccess } from "@/components/auth/AccessProvider";
import OfferForm from "@/components/generator/OfferForm";
import BannerGenerator from "@/components/preview/BannerGenerator";
import VideoGenerator from "@/components/preview/VideoGenerator";
import AccessCodeModal from "@/components/subscription/AccessCodeModal";
import BusinessTypeSelector from "@/components/onboarding/BusinessTypeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Layout, BarChart3, User, Calendar, Crown, ShieldCheck, CheckCircle2, Phone, MessageCircle, Mail, Lock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import RishabhChat from "@/components/chat/RishabhChat";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { getBusinessType, BusinessType, getBusinessConfig } from "@/lib/businessTypes";
import { t, Language } from "@/lib/i18n";
import ShopSetup, { ShopDetails } from "@/components/onboarding/ShopSetup";
import RevenueTracker from "@/components/revenue/RevenueTracker";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";

export default function Home() {
  const { usageCount, isPro, loading, incrementUsage } = useAccess();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState<string | null>(null);
  const [offerOptions, setOfferOptions] = useState<string[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [lastInputData, setLastInputData] = useState<any>(null);
  const [videoScript, setVideoScript] = useState<string[] | undefined>(undefined);
  const [videoTitles, setVideoTitles] = useState<string[] | undefined>(undefined);
  const [outputMode, setOutputMode] = useState<'banner' | 'video'>('banner');
  const [trackedReach, setTrackedReach] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [language, setLanguage] = useState<Language>('hinglish');
  const [activeTab, setActiveTab] = useState('home');
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  // Shop Setup persistence
  const [showShopSetup, setShowShopSetup] = useState(false);
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const WOW_DEMO_DATA = useMemo(() => ({
    productName: "Premium Cotton Shirts",
    discount: "BUY 1 GET 1 FREE",
    extraInfo: "Best for Office & Parties",
    shopName: shopDetails?.shopName || "Super Menswear",
    address: "Main Bazaar",
    contactNumber: shopDetails?.shopMobile || "9876543210",
    language: 'hinglish'
  }), [shopDetails]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("om_history") || "[]");
    setHistoryCount(history.length);
    setRecentHistory(history.slice(0, 5));
  }, []);

  const handleShareTrack = () => {
    setTrackedReach(prev => prev + Math.floor(Math.random() * 50) + 10);
    const currentReached = parseInt(localStorage.getItem("om_stats_customers_reached") || "0");
    const currentClicks = parseInt(localStorage.getItem("om_stats_whatsapp_clicks") || "0");
    localStorage.setItem("om_stats_customers_reached", (currentReached + 50).toString());
    localStorage.setItem("om_stats_whatsapp_clicks", (currentClicks + 1).toString());
  };

  useEffect(() => {
    try {
      const savedDetails = localStorage.getItem("om_shop_details");
      if (savedDetails) {
        setShopDetails(JSON.parse(savedDetails));
      } else {
        setShowShopSetup(true);
      }
    } catch (e) { console.error("Error reading shop details", e); }

    const businessType = getBusinessType();
    if (!businessType) {
      setShowBusinessSelector(true);
    } else {
      setSelectedBusinessType(businessType);
    }

    try {
      const savedOffer = localStorage.getItem("om_last_offer");
      const savedOptions = localStorage.getItem("om_last_options");
      const savedIndex = localStorage.getItem("om_selected_index");
      const savedData = localStorage.getItem("om_last_input");
      const savedScript = localStorage.getItem("om_last_script");
      const savedTitles = localStorage.getItem("om_last_titles");

      if (savedOffer) setGeneratedOffer(savedOffer);
      if (savedOptions) setOfferOptions(JSON.parse(savedOptions));
      if (savedIndex) setSelectedOptionIndex(parseInt(savedIndex));
      if (savedData) setLastInputData(JSON.parse(savedData));
      if (savedScript) setVideoScript(JSON.parse(savedScript));
      if (savedTitles) setVideoTitles(JSON.parse(savedTitles));

      const savedMode = localStorage.getItem("om_output_mode");
      if (savedMode) setOutputMode(savedMode as any);

      const savedLang = localStorage.getItem("om_language");
      if (savedLang) setLanguage(savedLang as Language);

      const hasDoneSomething = localStorage.getItem("om_has_interacted") === "true";
      setHasInteracted(hasDoneSomething);

      // WOW Moment: If first time, show demo
      if (!savedOffer && !hasDoneSomething) {
        setGeneratedOffer("🔥 धमाका ऑफर! \n\nSuper Menswear लाया है Premium Cotton Shirts पर शानदार सेल!\n\n✅ BUY 1 GET 1 FREE\n✅ Best for Office & Parties\n\nजल्द आएं: Main Bazaar\n📞 Call: 9876543210");
        setLastInputData(WOW_DEMO_DATA);
        setOfferOptions(["🔥 धमाका ऑफर! \n\nSuper Menswear लाया है Premium Cotton Shirts पर शानदार सेल!\n\n✅ BUY 1 GET 1 FREE\n✅ Best for Office & Parties\n\nजल्द आएं: Main Bazaar\n📞 Call: 9876543210"]);
      }
    } catch (e) {
      console.warn("Restore failed", e);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (generatedOffer) localStorage.setItem("om_last_offer", generatedOffer);
    if (offerOptions.length > 0) localStorage.setItem("om_last_options", JSON.stringify(offerOptions));
    localStorage.setItem("om_selected_index", selectedOptionIndex.toString());
    if (lastInputData) localStorage.setItem("om_last_input", JSON.stringify(lastInputData));
    if (videoScript) localStorage.setItem("om_last_script", JSON.stringify(videoScript));
    if (videoTitles) localStorage.setItem("om_last_titles", JSON.stringify(videoTitles));
  }, [generatedOffer, offerOptions, selectedOptionIndex, lastInputData, videoScript, videoTitles]);

  const handleGenerate = async (data: any) => {
    if (!isPro && usageCount >= 3) {
      setShowAccessModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedOffer(null);
    setLastInputData(data);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          shopDescription: shopDetails?.shopDescription
        }),
      });

      const result = await res.json();
      if (result.text) {
        setGeneratedOffer(result.text);
        setOfferOptions(result.options || [result.text]);
        setSelectedOptionIndex(0);
        setVideoScript(result.videoScript);
        setVideoTitles(result.videoTitles);
        incrementUsage();
        localStorage.setItem("om_has_interacted", "true");
        setHasInteracted(true);

        try {
          const history = JSON.parse(localStorage.getItem("om_history") || "[]");
          const newItem = {
            id: Date.now().toString(),
            offerText: result.text,
            inputData: data,
            videoScript: result.videoScript,
            videoTitles: result.videoTitles,
            timestamp: new Date().toISOString()
          };
          const updatedHistory = [newItem, ...history].slice(0, 50);
          localStorage.setItem("om_history", JSON.stringify(updatedHistory));
          setHistoryCount(updatedHistory.length);
          setRecentHistory(updatedHistory.slice(0, 5));
        } catch (e) {
          console.warn("Local history save failed", e);
        }

        try {
          await addDoc(collection(db, "offers_history"), {
            ...data,
            generatedText: result.text,
            createdAt: new Date().toISOString(),
            isProUser: isPro,
            shopId: `${data.shopName}_${data.contactNumber}`.replace(/\s+/g, '_'),
          });
        } catch (err) {
          console.warn("Analytics sync failed", err);
        }
      } else {
        alert("Generation failed. Please check your API Key settings.");
      }
    } catch (e) {
      alert("Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className={cn(
      "min-h-screen transition-colors duration-700 pb-24 lg:pb-0 relative overflow-x-hidden",
      isPro
        ? "bg-[#020617] text-slate-100"
        : "bg-slate-50 text-slate-900"
    )}>
      {/* Decorative Background Elements - More Premium */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className={cn(
          "absolute -top-24 -left-24 w-96 h-96 blur-[120px] rounded-full opacity-30",
          isPro ? "bg-indigo-500/20" : "bg-primary/10"
        )} />
        <div className={cn(
          "absolute top-48 -right-24 w-72 h-72 blur-[100px] rounded-full opacity-20",
          isPro ? "bg-purple-500/20" : "bg-accent/10"
        )} />
      </div>

      {/* Header - Glassmorphism */}
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300",
        isPro
          ? "bg-[#020617]/80 border-white/5"
          : "bg-white/80 border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className={cn(
                "text-lg md:text-2xl font-black tracking-tight",
                isPro ? "text-white" : "text-primary"
              )}>OfferMitra</h1>
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">AI Marketing Bot</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isPro ? (
              <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 shadow-glow">
                <Crown size={12} className="text-amber-400" /> Pro
              </div>
            ) : (
              hasInteracted && (
                <button
                  onClick={() => setShowAccessModal(true)}
                  className="hidden xs:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[10px] font-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <Crown size={14} /> Upgrade
                </button>
              )
            )}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border",
              usageCount >= 3
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : isPro
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : "bg-slate-100 text-slate-500 border-slate-200"
            )}>
              <span className="opacity-60">{t('tokens_left', language)}:</span>
              <span className="font-black">{3 - usageCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Banner - Refined */}
      <div className={cn(
        "border-b py-2.5 overflow-hidden select-none",
        isPro ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
      )}>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-16 w-max items-center"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-12">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className={cn(
                  "text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]",
                  isPro ? "text-slate-500" : "text-slate-400"
                )}>{t('trusted_by', language)}</span>
              </div>
              <div className={cn(
                "flex items-center gap-8 opacity-40 grayscale",
                isPro ? "invert" : ""
              )}>
                <span className="text-[10px] font-black italic tracking-tighter">FOR LOCAL SHOP OWNERS</span>
                <span className="text-[10px] font-black italic tracking-tighter">MADE FOR BHARAT</span>
                <span className="text-[10px] font-black italic tracking-tighter">GROW WITH AI</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-16 space-y-16 md:space-y-32">
        {/* Step 1: Generator */}
        <section id="offer-generator" className="scroll-mt-24">
          <div className="mb-10 md:mb-16 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={cn(
                "text-3xl md:text-6xl font-black mb-4 leading-[1.1] tracking-tight",
                isPro ? "text-white" : "text-primary"
              )}>
                {language === 'hindi' ? "24 घंटे में ज्यादा ग्राहक पाएं" : "Get More Customers in 24 Hours"}
              </h2>
              <p className={cn(
                "text-sm md:text-xl font-medium opacity-60 max-w-2xl",
                isPro ? "text-slate-300" : "text-slate-600"
              )}>
                AI-powered marketing kit for your shop. Generate posters & videos in seconds.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-50 bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                  Join other <span className={isPro ? "text-indigo-400" : "text-primary"}>smart</span> shop owners today
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              "rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl p-6 md:p-16 relative overflow-hidden",
              isPro
                ? "bg-[#0f172a]/50 border-white/5 shadow-indigo-500/5"
                : "bg-white border-slate-100"
            )}
          >
            <OfferForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              isPro={isPro}
              defaultValues={lastInputData}
              usageCount={usageCount}
              shopDetails={shopDetails}
              businessType={selectedBusinessType}
              language={language}
              onLanguageChange={setLanguage}
            />
          </motion.div>
        </section>

        {/* Results Screen */}
        <AnimatePresence>
          {generatedOffer && (
            <motion.section
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 md:space-y-16"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className={cn(
                    "text-2xl md:text-4xl font-black mb-2 tracking-tight",
                    isPro ? "text-white" : "text-slate-900"
                  )}>Your Marketing Kit</h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Ready to blast on WhatsApp</p>
                    <p className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
                      💡 Tip: Post one offer daily to increase sales
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex p-1.5 rounded-2xl border self-center md:self-auto",
                  isPro ? "bg-white/5 border-white/10" : "bg-slate-200/50 border-slate-200"
                )}>
                  <button
                    onClick={() => setOutputMode('banner')}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      outputMode === 'banner'
                        ? isPro ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-400"
                    )}
                  >
                    Graphics
                  </button>
                  <div className="relative group">
                    <button
                      onClick={() => {
                        if (!isPro) {
                          setShowAccessModal(true);
                        } else {
                          setOutputMode('video');
                        }
                      }}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        outputMode === 'video'
                          ? isPro ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-400"
                      )}
                    >
                      Video Ad {isPro ? "" : <Lock size={10} />}
                    </button>
                    {!isPro && (
                      <div className="absolute -top-3 right-0 bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest hidden group-hover:block whitespace-nowrap z-10">
                        Pro Only
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
                {/* Visual Preview */}
                <div className={cn(
                  "rounded-[2.5rem] md:rounded-[3.5rem] p-3 md:p-10 relative shadow-2xl border-4 md:border-8 flex flex-col items-center min-h-[500px] justify-center",
                  isPro ? "bg-slate-950 border-white/5" : "bg-slate-900 border-slate-800"
                )}>
                  {outputMode === 'banner' ? (
                    <BannerGenerator
                      text={offerOptions[selectedOptionIndex] || generatedOffer}
                      shopType={getBusinessType() || "grocery"}
                      shopName={lastInputData?.shopName}
                      isPro={isPro}
                      language={lastInputData?.language}
                      address={lastInputData?.address}
                      contactNumber={lastInputData?.contactNumber}
                      productName={lastInputData?.productName}
                      shopDescription={shopDetails?.shopDescription}
                      onShare={handleShareTrack}
                      productImage={lastInputData?.productImage}
                      shopImage={lastInputData?.shopImage || shopDetails?.shopPhoto}
                    />
                  ) : (
                    <VideoGenerator
                      offerText={offerOptions[selectedOptionIndex] || generatedOffer}
                      productName={lastInputData?.productName || ""}
                      discount={lastInputData?.discount || ""}
                      shopType={getBusinessType() || "grocery"}
                      shopName={lastInputData?.shopName || shopDetails?.shopName}
                      language={lastInputData?.language}
                      address={lastInputData?.address}
                      contactNumber={lastInputData?.contactNumber}
                      videoScript={videoScript}
                      videoTitles={videoTitles}
                      onShare={handleShareTrack}
                      productImage={lastInputData?.productImage}
                      shopImage={lastInputData?.shopImage || shopDetails?.shopPhoto}
                      shopDescription={shopDetails?.shopDescription}
                    />
                  )}
                </div>

                {/* WhatsApp Text Kit */}
                <div className="space-y-8">
                  <div className={cn(
                    "rounded-[2.5rem] border p-8 md:p-10 shadow-2xl relative overflow-hidden",
                    isPro ? "bg-[#0f172a]/80 border-white/10" : "bg-white border-slate-100"
                  )}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <h3 className={cn("text-lg font-black tracking-tight", isPro ? "text-indigo-400" : "text-primary")}>Copy & Paste</h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">3 Unique AI Variations</span>
                      </div>
                      <div className={cn(
                        "flex gap-2 p-1 rounded-full",
                        isPro ? "bg-white/5" : "bg-slate-100"
                      )}>
                        {offerOptions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedOptionIndex(idx)}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all",
                              selectedOptionIndex === idx
                                ? isPro ? "bg-indigo-600 text-white shadow-glow" : "bg-primary text-white scale-110 shadow-lg"
                                : "text-slate-400 hover:text-slate-500"
                            )}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={cn(
                      "p-6 md:p-8 rounded-3xl font-medium whitespace-pre-wrap leading-relaxed min-h-[160px] max-h-[400px] overflow-y-auto italic border text-sm md:text-base mb-8",
                      isPro
                        ? "bg-slate-950/50 border-white/5 text-slate-300 shadow-inner"
                        : "bg-slate-50 border-slate-100 text-slate-800"
                    )}>
                      {offerOptions[selectedOptionIndex] || generatedOffer}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(offerOptions[selectedOptionIndex] || generatedOffer || "");
                          localStorage.setItem("om_has_interacted", "true");
                          setHasInteracted(true);
                          const currentSent = parseInt(localStorage.getItem("om_stats_offers_sent") || "0");
                          localStorage.setItem("om_stats_offers_sent", (currentSent + 1).toString());
                          alert("AI Variation " + (selectedOptionIndex + 1) + " Copied! 📋");
                        }}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 border-2",
                          isPro
                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                            : "bg-white border-slate-200 text-primary hover:bg-slate-50"
                        )}
                      >
                        Copy Tool
                      </button>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(offerOptions[selectedOptionIndex] || generatedOffer || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          handleShareTrack();
                          localStorage.setItem("om_has_interacted", "true");
                          setHasInteracted(true);
                          const currentSent = parseInt(localStorage.getItem("om_stats_offers_sent") || "0");
                          localStorage.setItem("om_stats_offers_sent", (currentSent + 1).toString());
                        }}
                        className="w-full bg-[#25D366] text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} /> Send Now
                      </a>
                    </div>
                  </div>

                  {isPro && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-indigo-600 to-primary p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
                    >
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                          </div>
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">AI Insight</h4>
                        </div>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                          This copy is optimized for <span className="text-white font-bold underline decoration-amber-400">conversion</span>.
                          Sending this at <span className="text-white font-bold">11:00 AM</span> will likely increase your customer reach by 15%.
                        </p>
                      </div>
                      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 2: Revenue Tracker */}
        <section id="revenue-tracker" className="scroll-mt-24">
          <div className="mb-10 md:mb-16 text-center md:text-left">
            <h2 className={cn(
              "text-3xl md:text-5xl font-black mb-4 tracking-tight",
              isPro ? "text-white" : "text-slate-900"
            )}>Revenue Tracker</h2>
            <p className={cn(
              "text-sm md:text-xl font-medium opacity-60",
              isPro ? "text-slate-300" : "text-slate-600"
            )}>Monitor your daily sales, expenses, and profits in one place.</p>
          </div>
          <div className={cn(
            "rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 border shadow-2xl overflow-hidden",
            isPro ? "bg-[#0f172a]/50 border-white/5" : "bg-white border-slate-100"
          )}>
            <RevenueTracker isPro={isPro} language={language} />
          </div>
        </section>

        {/* Pro Upsell */}
        {!isPro && (
          <section className="relative py-12">
            <div className="bg-primary rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(67,56,202,0.4)]">
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20">
                  <Crown size={32} className="text-amber-400 animate-float" />
                </div>
                <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">Scale Your Shop <br />Like a Pro</h2>
                <p className="text-indigo-100 mb-12 text-base md:text-xl font-medium">Get unlimited AI generation, premium branding, and deep business analytics.</p>
                {hasInteracted && (
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="bg-white text-primary px-10 py-6 md:px-16 md:py-8 rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs md:text-sm"
                  >
                    Unlock Pro - Only ₹99
                  </button>
                )}
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Join the fast growing community</p>
              </div>
              {/* Animated Accents */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-400/20 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" style={{ animationDelay: '2s' }} />
              </div>
            </div>
          </section>
        )}

        {/* My Posters / History Section */}
        {recentHistory.length > 0 && (
          <section className="scroll-mt-24 mb-20 md:mb-32">
            <div className="flex items-end justify-between mb-8 md:mb-12">
              <div>
                <h2 className={cn(
                  "text-2xl md:text-4xl font-black mb-2 tracking-tight",
                  isPro ? "text-white" : "text-slate-900"
                )}>My Posters History</h2>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-[0.2em]",
                  isPro ? "text-slate-500" : "text-slate-400"
                )}>Your recent creations</p>
              </div>
              <Link href="/history" className={cn(
                "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all",
                isPro ? "text-indigo-400" : "text-primary"
              )}>
                View All <CheckCircle2 size={12} />
              </Link>
            </div>

            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-hide snap-x">
              {recentHistory.map((item: any, i) => (
                <div key={i} className={cn(
                  "min-w-[200px] md:min-w-[240px] p-4 rounded-[2rem] border snap-center cursor-pointer hover:scale-95 transition-transform",
                  isPro ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-xl"
                )} onClick={() => {
                  setGeneratedOffer(item.offerText);
                  setLastInputData(item.inputData);
                  setOfferOptions([item.offerText]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <div className={cn(
                    "aspect-[4/5] rounded-2xl mb-4 flex items-center justify-center text-center p-4 border border-dashed relative overflow-hidden",
                    isPro ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200"
                  )}>
                    <div className="z-10">
                      <div className="text-[8px] font-black uppercase opacity-50 mb-1">{item.inputData?.shopName}</div>
                      <div className="text-lg font-black text-amber-500 leading-none mb-1">{item.inputData?.discount}</div>
                      <div className="text-[8px] font-bold opacity-70 line-clamp-2">{item.inputData?.productName}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString()}</span>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Sparkles size={10} /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials Social Proof */}
        <section className="py-12 md:py-20 relative overflow-hidden">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest mb-4 border border-emerald-500/20">
              <ShieldCheck size={12} /> Verified App for Business
            </div>
            <h2 className={cn(
              "text-3xl md:text-5xl font-black tracking-tight mb-4",
              isPro ? "text-white" : "text-slate-900"
            )}>Shop Owners Love Us</h2>
            <p className="text-sm text-slate-400 font-medium">Join the fastest growing community of smart shopkeepers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Rajesh Kumar", shop: "Rajesh Kirana Store", text: "My sales doubled in just 1 week! The WhatsApp messages are magic.", loc: "Delhi" },
              { name: "Amit Singh", shop: "Mobile World", text: "Best app for festivals. I made 50 posters for Diwali in 10 mins.", loc: "Mumbai" },
              { name: "Priya Sharma", shop: "Priya Boutique", text: "Very easy to use. My customers love the professional designs.", loc: "Jaipur" }
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={cn(
                  "p-8 rounded-[2rem] border relative",
                  isPro ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-xl"
                )}>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className={cn(
                  "text-base font-bold mb-6 italic leading-relaxed",
                  isPro ? "text-slate-300" : "text-slate-600"
                )}>"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className={cn("font-black text-sm", isPro ? "text-white" : "text-slate-900")}>{t.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.shop}, {t.loc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Support Hub */}
        <section className="py-20 md:py-32">
          <div className="text-center mb-16 md:mb-24">
            <h3 className={cn(
              "text-xs font-black uppercase tracking-[0.5em] mb-4",
              isPro ? "text-indigo-400" : "text-slate-400"
            )}>Support Hub</h3>
            <h2 className={cn(
              "text-3xl md:text-5xl font-black tracking-tight",
              isPro ? "text-white" : "text-slate-900"
            )}>We're Here to Help</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                id: 'whatsapp',
                icon: <MessageCircle className="w-10 h-10" />,
                label: 'WhatsApp Support',
                color: 'bg-emerald-500',
                link: 'https://wa.me/8468943268',
                desc: 'Chat with our team'
              },
              {
                id: 'email',
                icon: <Mail className="w-10 h-10" />,
                label: 'Email Official',
                color: 'bg-indigo-600',
                link: 'mailto:saffarlabs@gmail.com',
                desc: 'Send us an inquiry'
              },
              {
                id: 'call',
                icon: <Phone className="w-10 h-10" />,
                label: 'Call Us Now',
                color: 'bg-primary',
                link: 'tel:8468943268',
                desc: 'Support: 8468943268'
              }
            ].map((item) => (
              <motion.a
                key={item.id}
                href={item.link}
                target={item.id === 'whatsapp' ? '_blank' : '_self'}
                rel="noopener noreferrer"
                whileHover={{ y: -10 }}
                className={cn(
                  "p-8 md:p-12 rounded-[2.5rem] flex flex-col items-center text-center transition-all border shadow-xl group",
                  isPro
                    ? "bg-[#0f172a] border-white/5 hover:border-white/10"
                    : "bg-white border-slate-100 hover:border-primary/20"
                )}
              >
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 transition-transform",
                  item.color
                )}>
                  {item.icon}
                </div>
                <h4 className={cn("text-lg font-black mb-2", isPro ? "text-white" : "text-slate-900")}>{item.label}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                <div className={cn(
                  "mt-6 py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                  isPro
                    ? "bg-white/5 border-white/10 text-indigo-400 group-hover:bg-white/10"
                    : "bg-slate-50 border-slate-100 text-primary group-hover:bg-primary/5"
                )}>
                  Connect →
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        <footer className={cn(
          "pt-20 pb-40 border-t",
          isPro ? "border-white/5" : "border-slate-200"
        )}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <span className={cn("font-black text-2xl tracking-tight", isPro ? "text-white" : "text-primary")}>OfferMitra</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">A Product of SaffarLabs Mitra</p>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-6">
              <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <a href="mailto:saffarlabs@gmail.com" className="hover:text-primary transition-colors">Support</a>
                <Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link>
              </div>
              <a href="tel:8468943268" className={cn(
                "flex items-center gap-2 text-[10px] font-black px-6 py-3 rounded-full border transition-all hover:scale-105",
                isPro
                  ? "bg-white/5 border-white/10 text-indigo-400"
                  : "bg-primary/5 border-primary/10 text-primary"
              )}>
                <Phone size={12} />
                CUSTOMER CARE: 8468943268
              </a>
            </div>

            <div className="text-center lg:text-right space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Made with ❤️ in India
              </p>
              <p className="text-[10px] font-bold text-slate-300 uppercase">© 2026 SaffarLabs Mitra</p>
            </div>
          </div>
        </footer>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} isPro={isPro} />
      <RishabhChat />

      {showBusinessSelector && (
        <BusinessTypeSelector
          onSelect={(type: BusinessType) => {
            setShowBusinessSelector(false);
            setSelectedBusinessType(type);
          }}
        />
      )}

      <AccessCodeModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
      />

      {showShopSetup && (
        <ShopSetup
          onComplete={(details) => {
            setShopDetails(details);
            setShowShopSetup(false);
          }}
        />
      )}
    </main>
  );
}

