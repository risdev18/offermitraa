"use client";

import { Home, PlusSquare, BarChart2, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

interface BottomNavProps {
    onTabChange?: (tab: string) => void;
    activeTab?: string;
}

export default function BottomNav({ onTabChange, activeTab }: BottomNavProps) {
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
            // Scroll to tracker if on home, or navigate
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 px-6 pb-6 pt-3 sm:hidden">
            <div className="max-w-md mx-auto flex items-center justify-between">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id || (pathname === tab.path && !activeTab);

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all relative",
                                isActive ? "text-primary" : "text-slate-400"
                            )}
                        >
                            {isActive && (
                                <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
                            )}
                            <Icon className={cn("w-6 h-6", isActive && "animate-pulse")} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
