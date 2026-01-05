"use client";

import { useAccess } from "@/components/auth/AccessProvider";
import OfferForm from "@/components/generator/OfferForm";
import BannerGenerator from "@/components/preview/BannerGenerator";
import VideoGenerator from "@/components/preview/VideoGenerator";
import AccessCodeModal from "@/components/subscription/AccessCodeModal";
import BusinessTypeSelector from "@/components/onboarding/BusinessTypeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Layout, BarChart3, User, Calendar, Crown, ShieldCheck, CheckCircle2, Phone, MessageCircle, Mail } from "lucide-react";
import { useState, useEffect } from "react";
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

  // Shop Setup persistence
  const [showShopSetup, setShowShopSetup] = useState(false);
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("om_history") || "[]");
    setHistoryCount(history.length);
  }, []);

  const handleShareTrack = () => {
    setTrackedReach(prev => prev + Math.floor(Math.random() * 50) + 10);
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
    } catch (e) {
      console.warn("Failed to restore session");
    }
  }, []);

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
      "min-h-screen bg-slate-50 text-slate-900 pb-24 lg:pb-0 relative overflow-x-hidden",
      isPro && "bg-slate-900 text-white"
    )}>
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      {/* Header - Minimalist */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-primary">OfferMitra</h1>
          </div>

          <div className="flex items-center gap-4">
            {!isPro && (
              <button
                onClick={() => setShowAccessModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-xs font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all"
              >
                <Crown size={14} />
                Go Pro (₹99)
              </button>
            )}
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600">
              <span className={cn(usageCount >= 3 ? "text-red-500" : "text-primary")}>{3 - usageCount}</span>/3 Left
            </div>
          </div>
        </div>
      </header>
      {/* Trust Banner - Marquee Version */}
      <div className="bg-slate-50 border-b border-slate-100 py-3 overflow-hidden select-none">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex whitespace-nowrap gap-12 w-max items-center"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-widest">{t('trusted_by', language)}</span>
              </div>
              <div className="flex items-center gap-6 opacity-30">
                <span className="text-xs font-black italic tracking-tighter">LOCAL SHOPS</span>
                <span className="text-xs font-black italic tracking-tighter">BIG STORES</span>
                <span className="text-xs font-black italic tracking-tighter">RETAILERS</span>
                <span className="text-xs font-black italic tracking-tighter">MARKETERS</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-12 space-y-12 md:space-y-20">
        {/* Step 1: Generator */}
        <section id="offer-generator" className="scroll-mt-24">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-2">Create Viral Offer</h2>
            <p className="text-slate-500 font-medium">Generate high-converting ads in seconds.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium p-6 md:p-12">
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
          </div>
        </section>

        {/* Results Screen - Full Screen WOW */}
        <AnimatePresence>
          {generatedOffer && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Marketing Kit</h2>
                <div className="flex p-1 bg-slate-200 rounded-xl">
                  <button
                    onClick={() => setOutputMode('banner')}
                    className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", outputMode === 'banner' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
                  >
                    Graphics
                  </button>
                  <button
                    onClick={() => setOutputMode('video')}
                    className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", outputMode === 'video' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
                  >
                    Video Ad
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* Visual Preview */}
                <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-8 relative shadow-2xl border-4 md:border-8 border-slate-800 h-full flex flex-col items-center">
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
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-premium space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">WhatsApp Message</h3>
                      <div className="flex gap-2">
                        {offerOptions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedOptionIndex(idx)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                              selectedOptionIndex === idx
                                ? "bg-primary text-white scale-110 shadow-lg"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            )}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-medium whitespace-pre-wrap text-slate-800 leading-relaxed min-h-[120px] max-h-[400px] overflow-y-auto italic">
                      {offerOptions[selectedOptionIndex] || generatedOffer}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          const textArea = document.createElement("textarea");
                          const textToCopy = offerOptions[selectedOptionIndex] || generatedOffer || "";
                          textArea.value = textToCopy;
                          document.body.appendChild(textArea);
                          textArea.select();
                          try {
                            document.execCommand('copy');
                            alert("Option " + (selectedOptionIndex + 1) + " Copied! 📋");
                          } catch (err) {
                            console.error('Copy failed', err);
                          }
                          document.body.removeChild(textArea);
                        }}
                        className="w-full py-4 rounded-xl border-2 border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95"
                      >
                        Copy Text
                      </button>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(offerOptions[selectedOptionIndex] || generatedOffer || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleShareTrack}
                        className="w-full bg-[#25D366] text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-xl shadow-green-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        Send WhatsApp
                      </a>
                    </div>
                  </div>

                  {isPro && (
                    <div className="bg-primary text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h4 className="font-bold mb-2">Pro Insight</h4>
                        <p className="text-indigo-100 text-sm">This offer has a 12% higher chance of conversion based on peak engagement trends.</p>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl -mr-12 -mt-12" />
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 2: Revenue Tracker */}
        <section id="revenue-tracker" className="scroll-mt-24">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-2">Revenue Tracker</h2>
            <p className="text-slate-500 font-medium">Monitor your business health daily.</p>
          </div>
          <RevenueTracker isPro={isPro} language={language} />
        </section>

        {/* Pro Upsell - Calm & Consistent */}
        {!isPro && (
          <section className="bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="text-3xl font-extrabold mb-4">Unlimited Potential with Pro</h2>
              <p className="text-indigo-100 mb-8 font-medium">Unlock daily tracker history, unlimited AI offers, and premium video templates.</p>
              <button
                onClick={() => setShowAccessModal(true)}
                className="bg-white text-primary px-10 py-5 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-sm"
              >
                Join Pro - ₹99/month
              </button>
            </div>
            {/* Subtle patterns instead of loud blobs */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-white/10 opacity-30" />
          </section>
        )}

        {/* Support Hub - 3D Animated Cubes */}
        <section className="py-12">
          <div className="text-center mb-10">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Direct Support</h3>
            <p className="text-slate-500 text-sm">Tap on a cube to connect with us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            {[
              {
                id: 'whatsapp',
                icon: <MessageCircle className="w-8 h-8" />,
                label: 'WhatsApp',
                color: 'bg-emerald-500',
                link: 'https://wa.me/8468943268',
                desc: 'Fast Chat'
              },
              {
                id: 'email',
                icon: <Mail className="w-8 h-8" />,
                label: 'Email',
                color: 'bg-indigo-600',
                link: 'mailto:saffarlabs@gmail.com',
                desc: 'Official Inquiry'
              },
              {
                id: 'call',
                icon: <Phone className="w-8 h-8" />,
                label: 'Call Us',
                color: 'bg-primary',
                link: 'tel:8468943268',
                desc: 'Instant Help'
              }
            ].map((item) => (
              <motion.a
                key={item.id}
                href={item.link}
                target={item.id === 'whatsapp' ? '_blank' : '_self'}
                rel="noopener noreferrer"
                whileHover={{
                  rotateY: 180,
                  scale: 1.05
                }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative h-48 group cursor-pointer"
              >
                {/* Front Side */}
                <div
                  style={{ backfaceVisibility: "hidden" }}
                  className={cn(
                    "absolute inset-0 rounded-3xl md:rounded-[2.5rem] flex flex-col items-center justify-center p-6 shadow-2xl transition-all",
                    item.color, "text-white"
                  )}
                >
                  {item.icon}
                  <span className="mt-4 font-black uppercase tracking-widest text-xs">{item.label}</span>
                </div>

                {/* Back Side (The "Turned" motion redirected state feeling) */}
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                  className="absolute inset-0 rounded-3xl md:rounded-[2.5rem] bg-white flex flex-col items-center justify-center p-6 shadow-2xl border-2 border-slate-100"
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white mb-2", item.color)}>
                    <Sparkles size={20} />
                  </div>
                  <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{item.desc}</span>
                  <span className="text-primary font-bold text-xs mt-1">Open Now →</span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        <footer className="pt-20 pb-32 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={18} />
                <span className="font-extrabold text-primary text-lg">OfferMitra</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Product of SaffarLabs Mitra</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">Privacy</Link>
                <a href="mailto:saffarlabs@gmail.com" className="hover:text-primary transition-colors cursor-pointer">Support Email</a>
                <Link href="/admin" className="hover:text-primary transition-colors cursor-pointer">Admin</Link>
              </div>
              <a href="tel:8468943268" className="flex items-center gap-2 text-[11px] font-black text-primary hover:scale-105 transition-all bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                <Phone size={12} />
                CUSTOMER CARE: 8468943268
              </a>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Made with ❤️ in India
              </p>
              <p className="text-[8px] font-medium text-slate-300 mt-1 uppercase tracking-tighter">© 2026 SaffarLabs Mitra</p>
            </div>
          </div>
        </footer>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
