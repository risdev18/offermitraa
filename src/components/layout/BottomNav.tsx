"use client";

import { Home, PlusSquare, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BottomNavProps {
    onTabChange?: (tab: string) => void;
    activeTab?: string;
    isPro?: boolean;
}

export default function BottomNav({ onTabChange, activeTab, isPro }: BottomNavProps) {
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'create', label: 'Create', icon: PlusSquare, path: '/' },
        { id: 'tracker', label: 'Tracker', icon: BarChart2, path: '/' },
        { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    ];

    const handleTabClick = (tab: typeof tabs[0]) => {
        if (tab.id === 'tracker') {
            const element = document.getElementById('revenue-tracker');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                router.push('/#revenue-tracker');
            }
        } else if (tab.id === 'create') {
            const element = document.getElementById('offer-generator');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                router.push('/#offer-generator');
            }
        } else if (tab.path !== pathname) {
            router.push(tab.path);
        }
        onTabChange?.(tab.id);
    };

    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-3 sm:hidden backdrop-blur-xl border-t transition-colors duration-500",
            isPro
                ? "bg-slate-950/80 border-white/10"
                : "bg-white/90 border-slate-200 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]"
        )}>
            <div className="max-w-md mx-auto flex items-center justify-between">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id || (pathname === tab.path && !activeTab);

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 transition-all relative group",
                                isActive
                                    ? isPro ? "text-indigo-400" : "text-primary"
                                    : "text-slate-500 hover:text-slate-400"
                            )}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="navTab"
                                    className={cn(
                                        "absolute -top-1 w-1.5 h-1.5 rounded-full",
                                        isPro ? "bg-indigo-400 shadow-[0_0_10px_#818cf8]" : "bg-primary"
                                    )}
                                />
                            )}
                            <div className={cn(
                                "p-1 rounded-lg transition-transform",
                                isActive && "scale-110"
                            )}>
                                <Icon className={cn("w-6 h-6")} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
