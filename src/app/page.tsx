"use client";

import { useAccess } from "@/components/auth/AccessProvider";
import OfferForm from "@/components/generator/OfferForm";
import BannerGenerator from "@/components/preview/BannerGenerator";
import VideoGenerator from "@/components/preview/VideoGenerator";
import AccessCodeModal from "@/components/subscription/AccessCodeModal";
import BusinessTypeSelector from "@/components/onboarding/BusinessTypeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Sparkles, Video, Image as ImageIcon, Crown, Calendar, MessageSquare, Play, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import RishabhChat from "@/components/chat/RishabhChat";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { getBusinessType, BusinessType, getBusinessConfig } from "@/lib/businessTypes";
import { t, Language } from "@/lib/i18n";

export default function Home() {
  const { usageCount, isPro, loading, incrementUsage } = useAccess();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState<string | null>(null);
  const [lastInputData, setLastInputData] = useState<any>(null);
  const [videoScript, setVideoScript] = useState<string[] | undefined>(undefined);
  const [videoTitles, setVideoTitles] = useState<string[] | undefined>(undefined);
  const [outputMode, setOutputMode] = useState<'banner' | 'video'>('banner');
  const [trackedReach, setTrackedReach] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [language, setLanguage] = useState<Language>('hinglish');

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("om_history") || "[]");
    setHistoryCount(history.length);
  }, []);

  const handleShareTrack = () => {
    setTrackedReach(prev => prev + Math.floor(Math.random() * 50) + 10);
  };

  // Check if business type is selected on mount and restore data
  useEffect(() => {
    const businessType = getBusinessType();
    if (!businessType) {
      setShowBusinessSelector(true);
    }

    // Restore last session
    try {
      const savedOffer = localStorage.getItem("om_last_offer");
      const savedData = localStorage.getItem("om_last_input");
      const savedScript = localStorage.getItem("om_last_script");
      const savedTitles = localStorage.getItem("om_last_titles");

      if (savedOffer) setGeneratedOffer(savedOffer);
      if (savedData) setLastInputData(JSON.parse(savedData));
      if (savedScript) setVideoScript(JSON.parse(savedScript));
      if (savedTitles) setVideoTitles(JSON.parse(savedTitles));

      const savedMode = localStorage.getItem("om_output_mode");
      if (savedMode) setOutputMode(savedMode as any);

      const savedLang = localStorage.getItem("om_language");
      if (savedLang) setLanguage(savedLang as Language);
    } catch (e) {
      console.warn("Failed to restore session");
    }
  }, []);

  // Persist current session
  useEffect(() => {
    if (generatedOffer) localStorage.setItem("om_last_offer", generatedOffer);
    if (lastInputData) localStorage.setItem("om_last_input", JSON.stringify(lastInputData));
    if (videoScript) localStorage.setItem("om_last_script", JSON.stringify(videoScript));
    if (videoTitles) localStorage.setItem("om_last_titles", JSON.stringify(videoTitles));
  }, [generatedOffer, lastInputData, videoScript, videoTitles]);

  const handleGenerate = async (data: any) => {
    // Check usage limit
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
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.text) {
        setGeneratedOffer(result.text);
        setVideoScript(result.videoScript);
        setVideoTitles(result.videoTitles);
        incrementUsage();

        // Save to local history
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
          const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50
          localStorage.setItem("om_history", JSON.stringify(updatedHistory));
          setHistoryCount(updatedHistory.length);
        } catch (e) {
          console.warn("Local history save failed", e);
        }

        try {
          // Log to global history (Crores of Data Optimized)
          await addDoc(collection(db, "offers_history"), {
            ...data,
            generatedText: result.text,
            createdAt: new Date().toISOString(),
            isProUser: isPro,
            shopId: `${data.shopName}_${data.contactNumber}`.replace(/\s+/g, '_'),
            clientDetails: {
              ip: 'logged',
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
            }
          });

          // Log to partitioned shop storage for massive scalability
          const shopSlug = (data.shopName || 'anonymous').toLowerCase().replace(/\s+/g, '-');
          await addDoc(collection(db, `shops/${shopSlug}/generations`), {
            product: data.productName,
            discount: data.discount,
            language: data.language,
            isPro: isPro,
            timestamp: new Date().toISOString(),
            fullText: result.text
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
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // No more Login needed

  return (
    <main className={cn(
      "min-h-screen transition-colors duration-1000 pb-20 relative overflow-hidden",
      isPro
        ? "bg-[#020617] text-white dark"
        : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={cn(
          "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20",
          isPro ? "bg-indigo-600" : "bg-indigo-400"
        )} />
        <div className={cn(
          "absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20",
          isPro ? "bg-purple-600" : "bg-purple-400"
        )} />
        {isPro && (
          <div className="absolute bottom-0 left-[20%] w-[60%] h-[30%] bg-pink-600/10 blur-[150px] rounded-full" />
        )}

        {/* Dynamic Interactive Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[10%] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -60, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full"
        />
      </div>

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500",
        isPro
          ? "bg-slate-950/80 border-white/5 shadow-2xl"
          : "bg-white/80 border-slate-200 shadow-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className={cn(
              "p-2 md:p-3 rounded-2xl shadow-xl transform hover:scale-110 active:scale-95 transition-all cursor-pointer",
              isPro ? "pro-gradient shadow-indigo-500/20" : "bg-indigo-600 shadow-indigo-200"
            )}>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className={cn(
                "text-lg md:text-2xl font-black tracking-tight flex items-center gap-1 md:gap-2",
                isPro ? "text-white" : "text-slate-900"
              )}>
                OfferMitra
                {isPro && (
                  <span className="pro-gradient bg-clip-text text-transparent text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </h1>
              <p className={cn("text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]", isPro ? "text-indigo-400" : "text-indigo-600")}>
                AI Marketing Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={() => window.location.href = '/history'}
              className={cn(
                "flex items-center gap-2 px-3 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isPro ? "bg-slate-900 text-slate-400 hover:text-white border border-white/5" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              title={t('history', language)}
            >
              <Calendar className="w-4 h-4 md:hidden text-indigo-500" />
              <span className="hidden md:inline">{t('history', language)}</span>
              {historyCount > 0 && (
                <span className="bg-indigo-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                  {historyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className={cn(
                "hidden sm:block px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isPro ? "bg-slate-900 text-slate-400 hover:text-white border border-white/5" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {t('admin', language)}
            </button>
            <button
              onClick={() => setShowAccessModal(true)}
              className={cn(
                "px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all shadow-xl active:scale-95 truncate sm:overflow-visible",
                isPro
                  ? "pro-gradient text-white shadow-purple-500/25"
                  : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700"
              )}
            >
              {isPro ? t('dashboard', language) : t('activate_pro', language)}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-4 md:p-10 max-w-[1600px] mx-auto space-y-16 mt-4">

        <div className={cn(
          "max-w-3xl mx-auto p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] transition-all duration-1000 shadow-2xl relative group overflow-hidden",
          isPro
            ? "glass-card border-white/10"
            : "bg-white border border-slate-200"
        )}>
          {isPro && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />
          )}

          <div className="flex items-center gap-6 mb-10">
            <div className={cn(
              "p-4 rounded-3xl shadow-lg",
              isPro ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
            )}>
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className={cn("text-3xl font-black tracking-tighter", isPro ? "text-white" : "text-slate-900")}>
                Create Viral Offer
              </h2>
              <p className={cn("text-xs font-bold uppercase tracking-widest mt-1 opacity-80", isPro ? "text-indigo-200" : "text-slate-600")}>
                AI-Powered Marketing Intelligence
              </p>
            </div>
          </div>

          <OfferForm onGenerate={handleGenerate} isGenerating={isGenerating} isPro={isPro} defaultValues={lastInputData} usageCount={usageCount} />
        </div>

        {/* RESULTS SECTION */}
        {generatedOffer && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">

            {/* INSIGHTS */}
            {isPro && (() => {
              const config = getBusinessConfig(getBusinessType());
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Industry Suggestion', value: config.peakEngagementTime, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Live Reach Tracker', value: trackedReach.toLocaleString(), sub: `/ ${config.averageReach.match(/\d+/)?.[0] || '1.5k'} Goal`, icon: Send, color: 'text-indigo-400', bg: 'bg-indigo-400/10', progress: (trackedReach / (parseInt(config.averageReach.match(/\d+/)?.[0] || '1500')) * 100) },
                    { label: 'Trust Index', value: '9.8 / 10', sub: 'High Trust Rating', icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-card border-white/5 p-10 rounded-[2.5rem] hover:scale-105 transition-all duration-500 group">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40">{stat.label}</h3>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
                        {stat.sub && <p className="text-slate-500 text-xs font-bold uppercase">{stat.sub}</p>}
                      </div>
                      {stat.progress !== undefined && (
                        <div className="w-full h-2.5 bg-slate-800 rounded-full mt-6 overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(stat.progress, 100)}%` }}
                            className="h-full pro-gradient shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* WhatsApp Text Preview */}
              <div className={cn(
                "lg:col-span-5 p-10 rounded-[3rem] shadow-2xl space-y-8 flex flex-col transition-all relative overflow-hidden",
                isPro ? "glass-card border-white/5" : "bg-white border border-slate-100"
              )}>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest">WhatsApp Text</h3>
                    <p className="text-[10px] font-black text-indigo-500 tracking-widest uppercase mt-1">AI Optimized Copy</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedOffer);
                      alert("Copied to clipboard! 📋");
                    }}
                    className={cn(
                      "flex items-center gap-2 px-8 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border",
                      isPro ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    Copy
                  </button>
                </div>

                <textarea
                  value={generatedOffer}
                  onChange={(e) => setGeneratedOffer(e.target.value)}
                  className={cn(
                    "w-full h-[500px] p-10 rounded-[2.5rem] font-bold outline-none resize-none text-lg transition-all leading-relaxed relative z-10",
                    isPro
                      ? "bg-black/30 text-indigo-100 border border-white/5 focus:border-indigo-500/50"
                      : "bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-400"
                  )}
                />

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generatedOffer)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleShareTrack}
                  className="w-full bg-[#25D366] text-white font-black py-7 rounded-[2.5rem] shadow-2xl hover:bg-[#20b85a] hover:scale-[1.02] transition-all flex items-center justify-center gap-5 text-xl active:scale-95 group relative z-10"
                >
                  <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  WhatsApp par bhejein
                </a>
              </div>

              {/* Visual Preview */}
              <div className={cn(
                "lg:col-span-12 xl:col-span-7 p-10 rounded-[3rem] shadow-2xl space-y-10 flex flex-col transition-all relative overflow-hidden",
                isPro ? "glass-card border-white/10" : "bg-white border border-slate-100"
              )}>
                <div className="flex bg-slate-900/40 p-2 rounded-[1.5rem] border border-white/5 w-fit relative z-10">
                  <button
                    onClick={() => setOutputMode('banner')}
                    className={cn(
                      "flex items-center gap-3 px-10 py-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                      outputMode === 'banner' ? "pro-gradient text-white shadow-xl" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <ImageIcon className="w-4 h-4" /> Graphics
                  </button>
                  <button
                    onClick={() => setOutputMode('video')}
                    className={cn(
                      "flex items-center gap-3 px-10 py-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                      outputMode === 'video' ? "pro-gradient text-white shadow-xl" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Video className="w-4 h-4" /> Video Ad
                  </button>
                </div>

                <div className="flex justify-center relative z-10">
                  {outputMode === 'banner' ? (
                    <BannerGenerator
                      text={generatedOffer}
                      shopType={getBusinessType() || "grocery"}
                      shopName={lastInputData?.shopName}
                      isPro={isPro}
                      language={lastInputData?.language}
                      address={lastInputData?.address}
                      contactNumber={lastInputData?.contactNumber}
                      onShare={handleShareTrack}
                    />
                  ) : (
                    <VideoGenerator
                      offerText={generatedOffer}
                      productName={lastInputData?.productName || ""}
                      discount={lastInputData?.discount || ""}
                      shopType={getBusinessType() || "grocery"}
                      shopName={lastInputData?.shopName}
                      language={lastInputData?.language}
                      address={lastInputData?.address}
                      contactNumber={lastInputData?.contactNumber}
                      videoScript={videoScript}
                      videoTitles={videoTitles}
                      onShare={handleShareTrack}
                      productImage={lastInputData?.productImage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC MARKETING CLIPS / VISUALS */}
        <section className="py-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase italic">Viral Marketing Lab</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Boost SEO', color: 'bg-blue-500', icon: Zap },
              { label: 'High CTR', color: 'bg-emerald-500', icon: Crown },
              { label: 'Viral Reach', color: 'bg-purple-500', icon: Sparkles },
              { label: 'AI Magic', color: 'bg-pink-500', icon: Video }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative h-64 rounded-[2.5rem] overflow-hidden group cursor-pointer"
              >
                <div className={cn("absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity", item.color)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <item.icon className="w-12 h-12 text-white mb-4 drop-shadow-lg" />
                  <p className="text-white font-black text-lg uppercase tracking-widest">{item.label}</p>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/20">
                    Preview Clip
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEEDBACK SECTION */}
        <section className="max-w-3xl mx-auto p-12 rounded-[3rem] glass-card border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden bg-slate-900/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-6 mb-10">
            <div className="p-4 rounded-3xl bg-indigo-500/20 text-indigo-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">Share Feedback</h2>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60 text-slate-400">Help us improve your experience</p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Thank you for your feedback! 🚀'); }}>
            <textarea
              placeholder="What can we do better? Your suggestions help us grow!"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-white/20 h-32 resize-none"
            />
            <button className="w-full pro-gradient text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all uppercase tracking-widest text-xs">
              Submit Feedback 🚀
            </button>
          </form>
        </section>

        <footer className="mt-32 pb-16 text-center">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mx-auto mb-8" />
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-indigo-500/40">
            {t('powered_by_ai', language)}
          </p>
          <div className="mt-8 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-800" />
              {t('customer_support', language)}
            </p>
            <a
              href="mailto:rishabhsonawane2007@gmail.com"
              className="text-sm font-black text-indigo-400 hover:text-indigo-300 transition-colors tracking-tight"
            >
              rishabhsonawane2007@gmail.com
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 opacity-50 uppercase tracking-widest">{t('network_active', language)}</span>
          </div>

          <div className="mt-8 opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              Made with ❤️ by Rishabh Sonawane
            </p>
          </div>
        </footer>

        <RishabhChat />
      </div>

      {/* Business Type Selector */}
      {showBusinessSelector && (
        <BusinessTypeSelector
          onSelect={(type: BusinessType) => {
            setShowBusinessSelector(false);
          }}
        />
      )}

      <AccessCodeModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
      />
    </main>
  );
}
