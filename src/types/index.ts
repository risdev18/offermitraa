export type ShopType = 'kirana' | 'medical' | 'mobile' | 'hardware' | 'clothing' | 'other';
export type OfferType = 'daily' | 'festival' | 'discount' | 'new_stock';
export type Language = 'hindi' | 'hinglish' | 'english';

export interface UserProfile {
    uid: string;
    phoneNumber: string | null;
    email: string | null;
    shopName?: string;
    messageCount: number;
    isPremium: boolean;
    subscriptionExpiry: number | null; // Timestamp
    createdAt: number;
}

export interface OfferData {
    id: string;
    userId: string;
    shopName?: string;
    shopType: ShopType;
    offerType: OfferType;
    productName: string;
    discount?: string;
    extraInfo?: string;
    language: Language;
    generatedText: string;
    createdAt: number;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    description: string;
}
