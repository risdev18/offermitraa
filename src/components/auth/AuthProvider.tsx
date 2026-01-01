"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    checkUsageDiff: () => boolean;
    incrementUsage: () => Promise<void>;
    upgradeToPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
    checkUsageDiff: () => true,
    incrementUsage: async () => { },
    upgradeToPremium: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const isDemoMode = () => {
        const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        return !key || key === "your_api_key" || key === "mock_key";
    };

    useEffect(() => {
        try {
            // If demo mode, don't even listen to real auth to avoid crashes
            if (isDemoMode()) {
                setLoading(false);
                return;
            }

            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                setUser(firebaseUser);

                if (firebaseUser) {
                    // Real-time listener for user profile
                    const userRef = doc(db, "users", firebaseUser.uid);
                    const unsubProfile = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setUserProfile(docSnap.data() as UserProfile);
                        } else {
                            // Create new profile if not exists
                            const newProfile: UserProfile = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                phoneNumber: firebaseUser.phoneNumber,
                                messageCount: 0,
                                isPremium: true, // Everyone is premium/free now
                                subscriptionExpiry: null,
                                createdAt: Date.now(),
                            };
                            setDoc(userRef, newProfile).catch(console.error);
                            setUserProfile(newProfile);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Error fetching profile:", error);
                        setLoading(false); // Ensure loading stops on error
                    });

                    return () => unsubProfile();
                } else {
                    setUserProfile(null);
                    setLoading(false);
                }
            }, (error) => {
                console.error("Auth State Error:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase Auth Init Error:", e);
            setLoading(false);
        }
    }, []);

    const signInWithGoogle = async () => {
        if (isDemoMode()) {
            console.log("Demo Mode: Google Login Simulated");
            const mockGoogleUser: any = {
                uid: "demo-google-user-789",
                displayName: "Shop Owner (Demo)",
                email: "demo@example.com",
                photoURL: "",
                emailVerified: true,
                isAnonymous: false,
            };
            setUser(mockGoogleUser);
            return;
        }

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        if (isDemoMode()) {
            setUser(null);
        }
    };

    const checkUsageDiff = () => {
        return true; // No payment/usage limits
    };

    const incrementUsage = async () => {
        if (!user) return;

        // Still increment for stats, but it won't block anyone
        if (!userProfile) {
            const newCount = 1;
            setUserProfile(prev => prev ? { ...prev, messageCount: newCount } : {
                uid: user.uid,
                email: user.email,
                phoneNumber: user.phoneNumber,
                messageCount: newCount,
                isPremium: true,
                subscriptionExpiry: null,
                createdAt: Date.now(),
            });
            return;
        }

        const newCount = userProfile.messageCount + 1;
        const userRef = doc(db, "users", user.uid);

        try {
            await setDoc(userRef, { messageCount: newCount }, { merge: true });
        } catch (e) {
            console.warn("Update usage failed", e);
        }
    };

    const upgradeToPremium = async () => {
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        try {
            await setDoc(userRef, {
                isPremium: true,
                subscriptionExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days dummy expiry
            }, { merge: true });

            if (userProfile) {
                setUserProfile({ ...userProfile, isPremium: true });
            }
        } catch (e) {
            console.error("Upgrade to premium failed", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout, checkUsageDiff, incrementUsage, upgradeToPremium }}>
            {children}
        </AuthContext.Provider>
    );
}
