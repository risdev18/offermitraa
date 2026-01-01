"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AccessContextType {
    usageCount: number;
    isPro: boolean;
    loading: boolean;
    incrementUsage: () => void;
    validateAccessCode: (code: string) => Promise<{ success: boolean; message: string }>;
    logoutPro: () => void;
}

const AccessContext = createContext<AccessContextType>({
    usageCount: 0,
    isPro: false,
    loading: true,
    incrementUsage: () => { },
    validateAccessCode: async () => ({ success: false, message: "" }),
    logoutPro: () => { },
});

export const useAccess = () => useContext(AccessContext);

export function AccessProvider({ children }: { children: React.ReactNode }) {
    const [usageCount, setUsageCount] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            // Load stats from localStorage
            const storedUsage = localStorage.getItem("om_usage_count");
            const storedPro = localStorage.getItem("om_is_pro");
            const storedCode = localStorage.getItem("om_pro_code");

            if (storedUsage) setUsageCount(parseInt(storedUsage));

            if (storedPro === "true" && storedCode) {
                // Verify with server
                try {
                    const res = await fetch("/api/validate-code", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: storedCode, checkOnly: true })
                    });
                    if (res.ok) {
                        setIsPro(true);
                    } else {
                        // Code was deleted or disabled
                        setIsPro(false);
                        localStorage.removeItem("om_is_pro");
                        localStorage.removeItem("om_pro_code");
                    }
                } catch (e) {
                    console.error("Access verification failed", e);
                    setIsPro(true); // Keep legacy access if server is down? Or be strict?
                }
            }

            setLoading(false);
        };

        checkAccess();
    }, []);

    const incrementUsage = () => {
        if (isPro) return; // Don't count for Pro users

        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem("om_usage_count", newCount.toString());
    };

    const logoutPro = () => {
        setIsPro(false);
        localStorage.removeItem("om_is_pro");
        localStorage.removeItem("om_pro_code");
    };

    const validateAccessCode = async (code: string): Promise<{ success: boolean; message: string }> => {
        if (!code) return { success: false, message: "Please enter a code" };

        try {
            const res = await fetch("/api/validate-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim().toUpperCase() })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Unlock Pro
                setIsPro(true);
                localStorage.setItem("om_is_pro", "true");
                localStorage.setItem("om_pro_code", code.trim().toUpperCase());
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.error || "Invalid Access Code" };
            }

        } catch (error) {
            console.error("Validation error:", error);
            return { success: false, message: "Something went wrong. Try again." };
        }
    };

    return (
        <AccessContext.Provider value={{ usageCount, isPro, loading, incrementUsage, validateAccessCode, logoutPro }}>
            {children}
        </AccessContext.Provider>
    );
}
