// Conversion‑focused template definitions
export type TemplateId = 'urgent' | 'sunday' | 'festival' | 'clearance';

export interface Template {
    id: TemplateId;
    name: string; // display name
    primaryColor: string; // background gradient base
    ctaText: string; // default CTA button label
    tagline: string; // short headline shown on poster
    urgencyLine: string; // e.g., "Only today", "Till 9 PM"
}

export const TEMPLATES: Record<TemplateId, Template> = {
    urgent: {
        id: 'urgent',
        name: 'Urgent Sale',
        primaryColor: '#ff3b30', // red
        ctaText: 'Call Now',
        tagline: '⚡️ आज ही खरीदें',
        urgencyLine: 'Only today',
    },
    sunday: {
        id: 'sunday',
        name: 'Sunday Special',
        primaryColor: '#22c55e', // green
        ctaText: 'Visit Today',
        tagline: '🌞 रविवार का ऑफर',
        urgencyLine: 'आज रविवार है',
    },
    festival: {
        id: 'festival',
        name: 'Festival Offer',
        primaryColor: '#f59e0b', // orange
        ctaText: 'WhatsApp Us',
        tagline: '🎉 त्यौहार की खुशियाँ',
        urgencyLine: 'सीमित स्टॉक',
    },
    clearance: {
        id: 'clearance',
        name: 'Stock Clearance',
        primaryColor: '#ef4444', // bright red
        ctaText: 'Visit Today',
        tagline: '🛒 स्टॉक क्लियरेंस',
        urgencyLine: 'Limited stock',
    },
};

/** Helper to get template based on business config */
export const getTemplateForBusiness = (defaultTemplate: TemplateId) => {
    return TEMPLATES[defaultTemplate] ?? TEMPLATES['urgent'];
};
