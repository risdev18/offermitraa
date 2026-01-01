// Business type definitions and configuration
import React from "react";
import { ShoppingBag, Smartphone, HeartPulse, Shirt, Utensils, Wrench, MoreHorizontal } from "lucide-react";

export type BusinessType =
    | "grocery"
    | "mobile"
    | "medical"
    | "clothing"
    | "restaurant"
    | "hardware"
    | "other";

export interface BusinessConfig {
    primaryColor: string; // hex color for UI theme
    ctaText: string; // default CTA button label
    tone: "friendly" | "exciting" | "trustworthy" | "stylish";
    defaultTemplate: "urgent" | "sunday" | "festival" | "clearance";
    peakEngagementTime: string; // Analysis: Best time to post
    averageReach: string; // Analysis: Estimated reach
}

export const BUSINESS_CONFIG: Record<BusinessType, BusinessConfig> = {
    grocery: {
        primaryColor: "#22c55e",
        ctaText: "Call Now",
        tone: "friendly",
        defaultTemplate: "urgent",
        peakEngagementTime: "08:30 AM - 10:30 AM",
        averageReach: "1.5k - 2k Households",
    },
    mobile: {
        primaryColor: "#3b82f6",
        ctaText: "Visit Today",
        tone: "exciting",
        defaultTemplate: "clearance",
        peakEngagementTime: "06:00 PM - 09:00 PM",
        averageReach: "2.5k+ Tech Seekers",
    },
    medical: {
        primaryColor: "#10b981",
        ctaText: "WhatsApp Us",
        tone: "trustworthy",
        defaultTemplate: "festival",
        peakEngagementTime: "07:00 AM - 11:00 AM",
        averageReach: "1k-1.2k Local Radius",
    },
    clothing: {
        primaryColor: "#f97316",
        ctaText: "Visit Today",
        tone: "stylish",
        defaultTemplate: "sunday",
        peakEngagementTime: "04:30 PM - 08:30 PM",
        averageReach: "3k+ Trend Watchers",
    },
    restaurant: {
        primaryColor: "#ef4444",
        ctaText: "Reserve Table",
        tone: "friendly",
        defaultTemplate: "sunday",
        peakEngagementTime: "07:30 PM - 10:00 PM",
        averageReach: "2k-4k Foodies",
    },
    hardware: {
        primaryColor: "#8b5cf6",
        ctaText: "Call Now",
        tone: "trustworthy",
        defaultTemplate: "clearance",
        peakEngagementTime: "10:00 AM - 01:00 PM",
        averageReach: "800 - 1.5k Professionals",
    },
    other: {
        primaryColor: "#6366f1",
        ctaText: "Contact Us",
        tone: "friendly",
        defaultTemplate: "urgent",
        peakEngagementTime: "05:00 PM - 07:00 PM",
        averageReach: "1.2k+ Mixed Audience",
    },
};

/** Helper to get stored business type from localStorage */
export const getStoredBusinessType = (): BusinessType | null => {
    if (typeof window === "undefined") return null;
    const val = localStorage.getItem("businessType");
    return val as BusinessType | null;
};

/** Alias used by components */
export const getBusinessType = getStoredBusinessType;

/** Save selected business type */
export const setStoredBusinessType = (type: BusinessType) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("businessType", type);
    }
};
export const saveBusinessType = setStoredBusinessType;

/** Get config for current or default business type */
export const getBusinessConfig = (type: BusinessType | null): BusinessConfig => {
    return type && BUSINESS_CONFIG[type] ? BUSINESS_CONFIG[type] : BUSINESS_CONFIG["grocery"];
};

/** Business type list for selector UI */
export const BUSINESS_TYPES: Record<BusinessType, { id: BusinessType; name: string; nameHindi: string; icon: React.ReactNode }> = {
    grocery: { id: "grocery", name: "Grocery/Kirana", nameHindi: "किराना", icon: <ShoppingBag size={32} /> },
    mobile: { id: "mobile", name: "Mobile/Electronics", nameHindi: "मोबाइल", icon: <Smartphone size={32} /> },
    medical: { id: "medical", name: "Medical/Pharmacy", nameHindi: "मेडिकल", icon: <HeartPulse size={32} /> },
    clothing: { id: "clothing", name: "Clothing/Fashion", nameHindi: "कपड़े", icon: <Shirt size={32} /> },
    restaurant: { id: "restaurant", name: "Restaurant/Food", nameHindi: "रेस्टोरेंट", icon: <Utensils size={32} /> },
    hardware: { id: "hardware", name: "Hardware/Tools", nameHindi: "हार्डवेयर", icon: <Wrench size={32} /> },
    other: { id: "other", name: "Other", nameHindi: "अन्य", icon: <MoreHorizontal size={32} /> },
};
