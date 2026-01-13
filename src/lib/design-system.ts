
import { ShopType } from "@/types";

export type DesignCategory = 'electronics' | 'grocery' | 'fashion' | 'food' | 'medical' | 'service' | 'general';
export type LayoutType = 'classic' | 'modern_split' | 'feature_image' | 'minimal_typography' | 'bold_offer' | 'magazine' | 'asymmetric';
export type ColorTheme = 'premium_dark' | 'vibrant_festival' | 'clean_light' | 'trust_blue' | 'luxury_gold' | 'fresh_green' | 'neon_night';

export interface DesignConfig {
    id: string; // unique style ID
    name: string;
    layout: LayoutType;
    theme: ColorTheme;
    // Specific style overrides
    fontHead: string;
    fontBody: string;
    bgClasses: string;
    textPrimary: string;
    textSecondary: string;
    accentColor: string;
    imageStyle: string; // rounded, border, shadow styles
    overlayStyle: string;
}

// Map ShopType to Broad Categories
export const getCategoryFromShopType = (shopType: string, productName: string = ""): DesignCategory => {
    const st = shopType.toLowerCase();
    const pn = productName.toLowerCase();

    if (st.includes('mobile') || st.includes('electronic') || st.includes('gadget') || pn.includes('phone') || pn.includes('laptop')) return 'electronics';
    if (st.includes('kirana') || st.includes('grocery') || st.includes('mart') || pn.includes('rice') || pn.includes('sugar')) return 'grocery';
    if (st.includes('cloth') || st.includes('fashion') || st.includes('boutique') || st.includes('apparel') || pn.includes('saree') || pn.includes('dress')) return 'fashion';
    if (st.includes('restaurant') || st.includes('food') || st.includes('cafe') || st.includes('bakery') || pn.includes('cake') || pn.includes('pizza')) return 'food';
    if (st.includes('medical') || st.includes('pharmacy') || st.includes('clinic')) return 'medical';
    if (st.includes('salon') || st.includes('beauty') || st.includes('spa') || st.includes('service')) return 'service';

    return 'general';
};

// Define 5-7 Varied Styles per category
const STYLES: Record<DesignCategory, DesignConfig[]> = {
    electronics: [
        {
            id: 'elec_1', name: 'Tech Dark', layout: 'feature_image', theme: 'premium_dark',
            fontHead: 'font-sans font-black tracking-tighter', fontBody: 'font-mono',
            bgClasses: "bg-slate-950 border-slate-800 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]",
            textPrimary: "text-white", textSecondary: "text-slate-400", accentColor: "bg-cyan-500 text-black",
            imageStyle: "rounded-3xl border border-slate-700 shadow-2xl shadow-cyan-500/20",
            overlayStyle: "bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"
        },
        {
            id: 'elec_2', name: 'Sleek White', layout: 'modern_split', theme: 'clean_light',
            fontHead: 'font-sans font-bold', fontBody: 'font-sans',
            bgClasses: "bg-white border-slate-100",
            textPrimary: "text-slate-900", textSecondary: "text-slate-500", accentColor: "text-blue-600 bg-blue-50",
            imageStyle: "rounded-none w-full shadow-lg",
            overlayStyle: "hidden"
        },
        {
            id: 'elec_3', name: 'Cyber Alert', layout: 'bold_offer', theme: 'neon_night',
            fontHead: 'font-mono font-black', fontBody: 'font-mono font-bold',
            bgClasses: "bg-zinc-900 border-yellow-500/20",
            textPrimary: "text-yellow-400", textSecondary: "text-zinc-500", accentColor: "bg-red-600 text-white",
            imageStyle: "rounded-xl border-4 border-yellow-400 rotate-1 grayscale hover:grayscale-0 transition-all",
            overlayStyle: "bg-yellow-400/5"
        },
        {
            id: 'elec_4', name: 'Product Hero', layout: 'minimal_typography', theme: 'clean_light',
            fontHead: 'font-sans font-black tracking-widest uppercase', fontBody: 'font-sans',
            bgClasses: "bg-slate-100 border-white",
            textPrimary: "text-black", textSecondary: "text-slate-600", accentColor: "text-white bg-black",
            imageStyle: "rounded-[3rem] shadow-2xl scale-105 border-8 border-white",
            overlayStyle: "hidden"
        },
        {
            id: 'elec_5', name: 'Flash Sale', layout: 'asymmetric', theme: 'vibrant_festival',
            fontHead: 'font-sans font-black italic', fontBody: 'font-sans font-bold',
            bgClasses: "bg-gradient-to-br from-indigo-600 to-purple-700",
            textPrimary: "text-white", textSecondary: "text-indigo-200", accentColor: "bg-white text-indigo-600 shadow-lg",
            imageStyle: "rounded-[2rem] -rotate-3 border-4 border-white/20 shadow-2xl",
            overlayStyle: "bg-noise opacity-20"
        }
    ],
    grocery: [
        {
            id: 'groc_1', name: 'Fresh Market', layout: 'classic', theme: 'fresh_green',
            fontHead: 'font-serif font-black', fontBody: 'font-sans font-bold',
            bgClasses: "bg-green-50 border-green-100",
            textPrimary: "text-green-900", textSecondary: "text-green-700", accentColor: "bg-orange-500 text-white",
            imageStyle: "rounded-[2rem] shadow-xl border-4 border-white",
            overlayStyle: "bg-gradient-to-b from-transparent to-green-100/50"
        },
        {
            id: 'groc_2', name: 'Super Saver', layout: 'bold_offer', theme: 'vibrant_festival',
            fontHead: 'font-sans font-black uppercase', fontBody: 'font-sans font-bold',
            bgClasses: "bg-yellow-400 border-yellow-500",
            textPrimary: "text-red-700", textSecondary: "text-red-900", accentColor: "bg-white text-red-600",
            imageStyle: "rounded-full aspect-square border-4 border-red-600 shadow-lg p-2 bg-white",
            overlayStyle: "bg-pattern-dots opacity-10"
        },
        {
            id: 'groc_3', name: 'Monthly Ration', layout: 'magazine', theme: 'clean_light',
            fontHead: 'font-sans font-bold tracking-tight', fontBody: 'font-sans',
            bgClasses: "bg-orange-50 border-orange-100",
            textPrimary: "text-orange-950", textSecondary: "text-orange-800/60", accentColor: "text-orange-600 underline",
            imageStyle: "rounded-xl shadow-md rotate-2 border-2 border-white",
            overlayStyle: "hidden"
        },
        {
            id: 'groc_4', name: 'Organic', layout: 'minimal_typography', theme: 'fresh_green',
            fontHead: 'font-serif italic', fontBody: 'font-sans font-light',
            bgClasses: "bg-[#FDFBF7] border-[#E8E6E1]",
            textPrimary: "text-[#2C3E50]", textSecondary: "text-[#7F8C8D]", accentColor: "bg-[#27AE60] text-white",
            imageStyle: "rounded-[4rem] rounded-tl-none shadow-xl grayscale-[10%]",
            overlayStyle: "hidden"
        },
        {
            id: 'groc_5', name: 'Big Basket Style', layout: 'modern_split', theme: 'clean_light',
            fontHead: 'font-sans font-black', fontBody: 'font-sans font-medium',
            bgClasses: "bg-white border-slate-100",
            textPrimary: "text-slate-900", textSecondary: "text-slate-500", accentColor: "bg-[#84C225] text-white",
            imageStyle: "rounded-none w-full border-b-4 border-[#84C225]",
            overlayStyle: "hidden"
        }
    ],
    fashion: [
        {
            id: 'fash_1', name: 'Luxury Boutique', layout: 'minimal_typography', theme: 'luxury_gold',
            fontHead: 'font-serif italic font-medium text-2xl', fontBody: 'font-sans font-light',
            bgClasses: "bg-[#F5F5F0] border-[#E0E0D0]",
            textPrimary: "text-[#1A1A1A]", textSecondary: "text-[#555555]", accentColor: "text-[#A67C00]",
            imageStyle: "rounded-none h-[60%] w-full object-cover grayscale-[20%]",
            overlayStyle: "bg-stone-900/10"
        },
        {
            id: 'fash_2', name: 'Trend Setter', layout: 'feature_image', theme: 'clean_light',
            fontHead: 'font-sans font-black tracking-[0.2em] uppercase', fontBody: 'font-sans',
            bgClasses: "bg-pink-50 border-pink-100",
            textPrimary: "text-slate-900", textSecondary: "text-slate-500", accentColor: "bg-black text-white px-4 py-1",
            imageStyle: "rounded-[3rem] shadow-2xl rotate-[-2deg] border-8 border-white",
            overlayStyle: "hidden"
        },
        {
            id: 'fash_3', name: 'Urban Street', layout: 'bold_offer', theme: 'premium_dark',
            fontHead: 'font-sans font-black italic', fontBody: 'font-mono',
            bgClasses: "bg-black",
            textPrimary: "text-white", textSecondary: "text-zinc-500", accentColor: "bg-white text-black",
            imageStyle: "rounded-none border-x-8 border-white w-[90%] mx-auto grayscale",
            overlayStyle: "bg-grid-white/[0.05]"
        },
        {
            id: 'fash_4', name: 'Summer Collection', layout: 'asymmetric', theme: 'vibrant_festival',
            fontHead: 'font-serif font-black text-4xl', fontBody: 'font-sans',
            bgClasses: "bg-sky-200 border-none",
            textPrimary: "text-sky-900", textSecondary: "text-sky-700", accentColor: "bg-yellow-300 text-sky-900",
            imageStyle: "rounded-full aspect-square w-[120%] -ml-[10%] shadow-xl border-8 border-white/50",
            overlayStyle: "bg-gradient-to-t from-sky-300/50 to-transparent"
        },
        {
            id: 'fash_5', name: 'Elegant Sale', layout: 'classic', theme: 'clean_light',
            fontHead: 'font-sans font-thin tracking-[0.3em]', fontBody: 'font-serif',
            bgClasses: "bg-white border-2 border-black",
            textPrimary: "text-black", textSecondary: "text-gray-500", accentColor: "bg-black text-white rounded-full",
            imageStyle: "rounded-t-[10rem] border border-black",
            overlayStyle: "hidden"
        }
    ],
    food: [
        {
            id: 'food_1', name: 'Delicious', layout: 'feature_image', theme: 'vibrant_festival',
            fontHead: 'font-sans font-black', fontBody: 'font-sans font-bold',
            bgClasses: "bg-orange-500 border-orange-600",
            textPrimary: "text-white", textSecondary: "text-orange-100", accentColor: "bg-yellow-400 text-orange-900",
            imageStyle: "rounded-[3rem] shadow-2xl scale-110 rotate-3 border-4 border-white/20",
            overlayStyle: "bg-gradient-to-t from-black/50 to-transparent"
        },
        {
            id: 'food_2', name: 'Cafe Menu', layout: 'magazine', theme: 'clean_light',
            fontHead: 'font-serif font-bold', fontBody: 'font-serif italic',
            bgClasses: "bg-[#FFF8E1] border-none", // Cream
            textPrimary: "text-[#5D4037]", textSecondary: "text-[#8D6E63]", accentColor: "text-[#D84315]",
            imageStyle: "rounded-full aspect-square border-8 border-white shadow-md",
            overlayStyle: "bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-50"
        },
        {
            id: 'food_3', name: 'Dark Craving', layout: 'modern_split', theme: 'premium_dark',
            fontHead: 'font-sans font-black uppercase text-3xl', fontBody: 'font-sans',
            bgClasses: "bg-[#1A1A1A]",
            textPrimary: "text-white", textSecondary: "text-gray-400", accentColor: "bg-red-600 text-white rounded-lg",
            imageStyle: "w-full rounded-b-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
            overlayStyle: "hidden"
        },
        {
            id: 'food_4', name: 'Fresh Juice', layout: 'minimal_typography', theme: 'fresh_green',
            fontHead: 'font-sans font-black tracking-tight', fontBody: 'font-sans font-medium',
            bgClasses: "bg-lime-400 border-none",
            textPrimary: "text-green-900", textSecondary: "text-green-800", accentColor: "bg-white text-green-700",
            imageStyle: "rounded-[2rem] border-4 border-white/50 shadow-lg",
            overlayStyle: "bg-gradient-to-br from-yellow-300/30 to-transparent"
        },
        {
            id: 'food_5', name: 'Zomato Style', layout: 'classic', theme: 'clean_light',
            fontHead: 'font-sans font-black', fontBody: 'font-sans',
            bgClasses: "bg-white border-slate-100",
            textPrimary: "text-slate-900", textSecondary: "text-slate-500", accentColor: "bg-red-500 text-white rounded-xl",
            imageStyle: "rounded-xl overflow-hidden aspect-video object-cover",
            overlayStyle: "hidden"
        }
    ],
    medical: [
        {
            id: 'med_1', name: 'Trust Care', layout: 'minimal_typography', theme: 'trust_blue',
            fontHead: 'font-sans font-bold', fontBody: 'font-sans',
            bgClasses: "bg-sky-50 border-sky-100",
            textPrimary: "text-sky-900", textSecondary: "text-sky-600", accentColor: "bg-blue-600 text-white",
            imageStyle: "rounded-2xl border border-sky-100 shadow-md",
            overlayStyle: "hidden"
        },
        {
            id: 'med_2', name: 'Emergency', layout: 'bold_offer', theme: 'vibrant_festival',
            fontHead: 'font-sans font-black uppercase', fontBody: 'font-sans font-bold',
            bgClasses: "bg-red-50 border-red-100",
            textPrimary: "text-red-800", textSecondary: "text-red-600", accentColor: "bg-red-600 text-white animate-pulse",
            imageStyle: "rounded-full border-4 border-red-100",
            overlayStyle: "hidden"
        },
        {
            id: 'med_3', name: 'Ayurveda', layout: 'classic', theme: 'fresh_green',
            fontHead: 'font-serif font-bold', fontBody: 'font-sans',
            bgClasses: "bg-[#F1F8E9] border-[#DCEDC8]",
            textPrimary: "text-[#33691E]", textSecondary: "text-[#558B2F]", accentColor: "text-[#1B5E20] border-b-2 border-[#1B5E20]",
            imageStyle: "rounded-t-[50%] border-4 border-white shadow-lg",
            overlayStyle: "hidden"
        }
    ],
    service: [
        {
            id: 'serv_1', name: 'Professional', layout: 'classic', theme: 'clean_light',
            fontHead: 'font-sans font-bold', fontBody: 'font-sans',
            bgClasses: "bg-slate-50 border-slate-200",
            textPrimary: "text-slate-900", textSecondary: "text-slate-500", accentColor: "text-indigo-600 bg-indigo-50",
            imageStyle: "rounded-xl shadow-lg",
            overlayStyle: "hidden"
        },
        {
            id: 'serv_2', name: 'Golden Hour', layout: 'feature_image', theme: 'luxury_gold',
            fontHead: 'font-serif font-medium italic', fontBody: 'font-sans',
            bgClasses: "bg-[#1c1917] border-stone-800",
            textPrimary: "text-[#fbbf24]", textSecondary: "text-stone-400", accentColor: "bg-[#fbbf24] text-black",
            imageStyle: "rounded-[3rem] border border-[#fbbf24]/30 shadow-2xl shadow-[#fbbf24]/10",
            overlayStyle: "bg-gradient-to-b from-black/50 to-transparent"
        },
        {
            id: 'serv_3', name: 'Bold Service', layout: 'modern_split', theme: 'trust_blue',
            fontHead: 'font-sans font-black uppercase', fontBody: 'font-sans font-bold',
            bgClasses: "bg-blue-600 border-none",
            textPrimary: "text-white", textSecondary: "text-blue-100", accentColor: "bg-white text-blue-600",
            imageStyle: "rounded-none w-[90%] mx-auto mt-4 shadow-2xl rotate-1",
            overlayStyle: "bg-blue-700/50"
        }
    ],
    general: [
        {
            id: 'gen_1', name: 'Universal Clean', layout: 'classic', theme: 'clean_light',
            fontHead: 'font-sans font-bold', fontBody: 'font-sans',
            bgClasses: "bg-white border-slate-200",
            textPrimary: "text-slate-900", textSecondary: "text-slate-500", accentColor: "bg-indigo-600 text-white",
            imageStyle: "rounded-2xl shadow-xl",
            overlayStyle: "hidden"
        },
        {
            id: 'gen_2', name: 'Bold Notice', layout: 'bold_offer', theme: 'vibrant_festival',
            fontHead: 'font-sans font-black uppercase tracking-tight', fontBody: 'font-sans font-bold',
            bgClasses: "bg-yellow-300 border-black",
            textPrimary: "text-black", textSecondary: "text-slate-800", accentColor: "bg-black text-yellow-300 px-2",
            imageStyle: "rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            overlayStyle: "bg-[url('https://www.transparenttextures.com/patterns/diagonal-striped-brick.png')] opacity-10"
        },
        {
            id: 'gen_3', name: 'Minimalist', layout: 'minimal_typography', theme: 'clean_light',
            fontHead: 'font-sans font-thin text-3xl', fontBody: 'font-sans',
            bgClasses: "bg-stone-50 border-stone-100",
            textPrimary: "text-stone-800", textSecondary: "text-stone-400", accentColor: "text-stone-900 underline",
            imageStyle: "rounded-full aspect-square w-32 md:w-48 mx-auto grayscale",
            overlayStyle: "hidden"
        },
        {
            id: 'gen_4', name: 'Dark Mode', layout: 'feature_image', theme: 'premium_dark',
            fontHead: 'font-sans font-bold', fontBody: 'font-sans',
            bgClasses: "bg-slate-900 border-slate-800",
            textPrimary: "text-white", textSecondary: "text-slate-400", accentColor: "text-blue-400",
            imageStyle: "rounded-xl border border-slate-700",
            overlayStyle: "hidden"
        },
        {
            id: 'gen_5', name: 'Festival General', layout: 'asymmetric', theme: 'vibrant_festival',
            fontHead: 'font-serif font-black', fontBody: 'font-sans',
            bgClasses: "bg-gradient-to-r from-pink-500 to-rose-500",
            textPrimary: "text-white", textSecondary: "text-pink-100", accentColor: "bg-white text-pink-600",
            imageStyle: "rounded-[3rem] shadow-lg border-4 border-white/30",
            overlayStyle: "bg-pattern-circles opacity-10"
        }
    ]
};

// Ensure fallback
const GENERIC_STYLES = STYLES.general;

export const getRandomStyle = (category: DesignCategory, excludeId?: string): DesignConfig => {
    const categoryStyles = STYLES[category] || GENERIC_STYLES;

    // Always mix in some "general" styles for variety if category list is short (<4), but we ensured >3 for most.
    // To strictly follow "category aware", we should prefer category styles.
    // But to ensure "non-repeating", we need a pool.

    // Let's stick to category styles primarily, but fallback to general if needed.
    let pool = [...categoryStyles];
    // Add general styles to pool if pool is small
    if (pool.length < 5) {
        pool = [...pool, ...GENERIC_STYLES];
    }

    // Filter out previous
    const candidates = excludeId ? pool.filter(s => s.id !== excludeId) : pool;

    // Fallback if filtering removed everything (e.g. only 1 style exists)
    const finalPool = candidates.length > 0 ? candidates : pool;

    const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
    return selected;
};
