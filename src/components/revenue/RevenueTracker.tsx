"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    Plus,
    IndianRupee,
    Wallet,
    CreditCard,
    Receipt,
    Trash2,
    ChevronRight,
    Share2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    X,
    BarChart3,
    RotateCcw,
    MousePointer2,
    Send,
    Users,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toPng as toImage } from "html-to-image";
import { t, Language } from "@/lib/i18n";

interface ExpenseLog {
    rent: number;
    staff: number;
    stock: number;
    electricity: number;
    other: number;
}

interface RevenueEntry {
    id: string;
    date: string;
    cashSales: number;
    onlineSales: number;
    totalRevenue: number;
    expenses: ExpenseLog;
    totalExpenses: number;
    netProfit: number;
    isDummy?: boolean;
}

const STORAGE_KEY = "om_revenue_logs";

const DUMMY_DATA: RevenueEntry[] = [
    {
        id: "dummy-1",
        date: new Date().toISOString().split("T")[0],
        cashSales: 4500,
        onlineSales: 3200,
        totalRevenue: 7700,
        expenses: { rent: 0, staff: 500, stock: 2000, electricity: 0, other: 100 },
        totalExpenses: 2600,
        netProfit: 5100,
        isDummy: true
    },
    {
        id: "dummy-2",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        cashSales: 3800,
        onlineSales: 2900,
        totalRevenue: 6700,
        expenses: { rent: 0, staff: 500, stock: 1500, electricity: 0, other: 50 },
        totalExpenses: 2050,
        netProfit: 4650,
        isDummy: true
    }
];

export default function RevenueTracker({ isPro, language = 'hinglish' }: { isPro: boolean, language?: Language }) {
    const [logs, setLogs] = useState<RevenueEntry[]>([]);
    const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        cashSales: "",
        onlineSales: "",
        rent: "",
        staff: "",
        stock: "",
        electricity: "",
        other: "",
        totalExpenses: ""
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setLogs(parsed.length > 0 ? parsed : []);
            } catch (e) {
                console.error("Failed to parse revenue logs", e);
            }
        }
    }, []);

    useEffect(() => {
        // Only save if these are not dummy logs
        if (!logs.some(l => l.isDummy)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        }
    }, [logs]);

    const isShowingDummy = logs.length === 0 && !localStorage.getItem("om_revenue_interacted");
    const displayLogs = logs.length > 0 ? logs.filter(l => !l.isDummy) : (isShowingDummy ? DUMMY_DATA : []);

    const todayStr = new Date().toISOString().split("T")[0];

    // Sum all entries for today
    const todayEntries = displayLogs.filter(l => l.date === todayStr);
    const todayStats = {
        totalRevenue: todayEntries.reduce((sum, l) => sum + l.totalRevenue, 0),
        netProfit: todayEntries.reduce((sum, l) => sum + l.netProfit, 0),
        totalExpenses: todayEntries.reduce((sum, l) => sum + l.totalExpenses, 0),
        cashSales: todayEntries.reduce((sum, l) => sum + l.cashSales, 0),
        onlineSales: todayEntries.reduce((sum, l) => sum + l.onlineSales, 0),
        expenses: todayEntries.reduce((acc, l) => {
            acc.rent += l.expenses.rent;
            acc.staff += l.expenses.staff;
            acc.stock += l.expenses.stock;
            acc.electricity += l.expenses.electricity;
            acc.other += l.expenses.other;
            return acc;
        }, { rent: 0, staff: 0, stock: 0, electricity: 0, other: 0 })
    };

    // Calculate All-Time stats for Balance and Total Expenses
    const allTimeStats = {
        totalRevenue: displayLogs.reduce((sum, l) => sum + l.totalRevenue, 0),
        totalExpenses: displayLogs.reduce((sum, l) => sum + l.totalExpenses, 0),
        currentBalance: displayLogs.reduce((sum, l) => sum + l.netProfit, 0),
        offersSent: parseInt(localStorage.getItem("om_stats_offers_sent") || "0"),
        whatsappClicks: parseInt(localStorage.getItem("om_stats_whatsapp_clicks") || "0"),
        customersReached: parseInt(localStorage.getItem("om_stats_customers_reached") || "0")
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const cash = parseFloat(formData.cashSales) || 0;
        const online = parseFloat(formData.onlineSales) || 0;
        const rent = parseFloat(formData.rent) || 0;
        const staff = parseFloat(formData.staff) || 0;
        const stock = parseFloat(formData.stock) || 0;
        const elec = parseFloat(formData.electricity) || 0;
        const other = parseFloat(formData.other) || 0;
        const directTotalExp = parseFloat(formData.totalExpenses) || 0;

        const totalRevenue = cash + online;
        const totalExpenses = directTotalExp || (rent + staff + stock + elec + other);
        const netProfit = totalRevenue - totalExpenses;

        const newEntry: RevenueEntry = {
            id: Date.now().toString(),
            date: todayStr,
            cashSales: cash,
            onlineSales: online,
            totalRevenue,
            expenses: { rent, staff, stock, electricity: elec, other },
            totalExpenses,
            netProfit
        };

        setLogs(prev => {
            const actualLogs = prev.filter(l => !l.isDummy);
            localStorage.setItem("om_revenue_interacted", "true");
            return [newEntry, ...actualLogs];
        });

        setIsAddModalOpen(false);
        resetForm();
        alert("✅ Daily sales log saved successfully!");
    };

    const resetForm = () => {
        setFormData({
            cashSales: "", onlineSales: "", rent: "",
            staff: "", stock: "", electricity: "", other: "",
            totalExpenses: ""
        });
    };

    const getWeekStats = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        return last7Days.map(date => {
            const entry = displayLogs.find(l => l.date === date);
            return {
                date,
                label: new Date(date).toLocaleDateString("en-IN", { weekday: "short" }),
                revenue: entry?.totalRevenue || 0,
                profit: entry?.netProfit || 0
            };
        });
    };

    const weekData = getWeekStats();
    const maxWeekRevenue = Math.max(...weekData.map(d => d.revenue), 1000);

    const getGrowth = (): string | null => {
        if (displayLogs.length < 2) return null;
        const sorted = [...displayLogs].sort((a, b) => b.date.localeCompare(a.date));
        const latest = sorted[0].totalRevenue;
        const previous = sorted[1].totalRevenue;
        if (previous === 0) return "100";
        return (((latest - previous) / previous) * 100).toFixed(1);
    };

    const growth = getGrowth();

    const handleReset = () => {
        if (confirm("Are you sure you want to clear ALL revenue logs? This cannot be undone.")) {
            setLogs([]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            localStorage.setItem("om_revenue_interacted", "true");
        }
    };

    const deleteEntry = (id: string, isDummy?: boolean) => {
        if (isDummy) {
            if (confirm("This is sample data. Hide sample data and start fresh?")) {
                localStorage.setItem("om_revenue_interacted", "true");
                // Force state update to refresh isShowingDummy
                setLogs([]);
            }
            return;
        }
        if (confirm("Delete this entry?")) {
            setLogs(prev => {
                const updated = prev.filter(l => l.id !== id);
                if (updated.length === 0) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
                }
                return updated;
            });
        }
    };

    const handleExport = async () => {
        if (!containerRef.current) return;
        try {
            const dataUrl = await toImage(containerRef.current, { backgroundColor: "#ffffff" });
            const link = document.createElement('a');
            link.download = `Revenue_Report.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error(err); }
    };

    return (
        <div ref={containerRef} className="space-y-12">
            {isShowingDummy && (
                <div className={cn(
                    "p-6 rounded-[2rem] border-2 border-dashed flex flex-col md:flex-row items-center justify-between gap-6 transition-all",
                    isPro
                        ? "bg-indigo-500/5 border-indigo-500/20"
                        : "bg-primary/5 border-primary/20"
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                            isPro ? "bg-indigo-600 text-white" : "bg-primary text-white"
                        )}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <p className={cn(
                                "text-xs font-black uppercase tracking-[0.15em]",
                                isPro ? "text-indigo-400" : "text-primary"
                            )}>🔥 Aaj pehla offer bhejiye, yahin revenue dikhega</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Start tracking your business growth automatically</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={cn(
                            "w-full md:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all text-white",
                            isPro ? "bg-indigo-600 shadow-indigo-600/20" : "bg-primary shadow-primary/20"
                        )}
                    >
                        Add Today's Sales
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <StatCard
                    label="Current Balance"
                    value={allTimeStats.currentBalance.toLocaleString()}
                    icon={Wallet}
                    color={isPro ? "text-indigo-400" : "text-emerald-500"}
                    isPro={isPro}
                    accent
                    onClick={() => setIsAddModalOpen(true)}
                />
                <StatCard
                    label="Today's Sales"
                    value={todayStats.totalRevenue.toLocaleString()}
                    icon={IndianRupee}
                    color="text-amber-500"
                    isPro={isPro}
                    onClick={() => setIsAddModalOpen(true)}
                />
                <StatCard
                    label="Offers Sent"
                    value={allTimeStats.offersSent.toLocaleString()}
                    icon={Send}
                    color={isPro ? "text-indigo-400" : "text-primary"}
                    isPro={isPro}
                    noCurrency
                />
                <StatCard
                    label="Reached"
                    value={(allTimeStats.customersReached || (allTimeStats.offersSent * 12)).toLocaleString()}
                    icon={Users}
                    color={isPro ? "text-indigo-400" : "text-slate-400"}
                    isPro={isPro}
                    noCurrency
                />
            </div>

            {/* Revenue Trend Graph */}
            <div className={cn(
                "rounded-[2.5rem] border p-6 md:p-12 shadow-2xl transition-all",
                isPro
                    ? "bg-slate-900 border-white/5"
                    : "bg-white border-slate-100"
            )}>
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className={cn(
                            "text-sm font-black uppercase tracking-[0.2em]",
                            isPro ? "text-white" : "text-slate-900"
                        )}>Revenue Trend</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Last 7 Days Growth Analytics</p>
                    </div>
                    {growth && (
                        <div className={cn(
                            "px-5 py-2.5 rounded-2xl flex items-center gap-2 border",
                            parseFloat(growth) >= 0
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                            {parseFloat(growth) >= 0 ? <TrendingUp size={16} /> : <ArrowDownRight size={16} />}
                            <span className="text-xs font-black tracking-widest">{growth}%</span>
                        </div>
                    )}
                </div>

                <div className="h-64 w-full relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isPro ? "#6366f1" : "var(--primary)"} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={isPro ? "#6366f1" : "var(--primary)"} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area Path */}
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            d={`M 0 100 ${weekData.map((d, i) => `L ${i * 100} ${100 - (d.revenue / maxWeekRevenue) * 80}`).join(' ')} L 600 100 Z`}
                            fill="url(#chartGradient)"
                            stroke="none"
                        />

                        {/* Line Path */}
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            d={`M 0 ${100 - (weekData[0].revenue / maxWeekRevenue) * 80} ${weekData.slice(1).map((d, i) => `L ${(i + 1) * 100} ${100 - (d.revenue / maxWeekRevenue) * 80}`).join(' ')}`}
                            fill="none"
                            stroke={isPro ? "#6366f1" : "var(--primary)"}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data Points */}
                        {weekData.map((d, i) => (
                            <motion.circle
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1 + (i * 0.1) }}
                                cx={i * 100}
                                cy={100 - (d.revenue / maxWeekRevenue) * 80}
                                r="6"
                                fill={isPro ? "#020617" : "white"}
                                stroke={isPro ? "#6366f1" : "var(--primary)"}
                                strokeWidth="3"
                                className="cursor-pointer"
                            />
                        ))}
                    </svg>

                    <div className="flex justify-between mt-8">
                        {weekData.map((d, i) => (
                            <div key={i} className="text-center">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{d.label}</span>
                                <p className={cn(
                                    "text-[10px] font-black mt-1",
                                    isPro ? "text-slate-300" : "text-slate-900"
                                )}>₹{d.revenue >= 1000 ? (d.revenue / 1000).toFixed(1) + 'k' : d.revenue}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={cn(
                "rounded-[2.5rem] border p-6 md:p-12 shadow-2xl overflow-hidden",
                isPro ? "bg-slate-900 border-white/5" : "bg-white border-slate-100"
            )}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                    <div className={cn(
                        "flex p-1.5 rounded-2xl border",
                        isPro ? "bg-white/5 border-white/5" : "bg-slate-100 border-slate-200"
                    )}>
                        {(["today", "week", "month"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all",
                                    activeTab === tab
                                        ? isPro ? "bg-indigo-600 text-white shadow-glow" : "bg-white text-primary shadow-sm"
                                        : "text-slate-500 hover:text-slate-400"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleReset}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                isPro ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-rose-50 text-rose-600"
                            )}
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all text-white",
                                isPro ? "bg-indigo-600 shadow-indigo-600/20" : "bg-primary shadow-primary/20"
                            )}
                        >
                            <Plus size={18} />
                            Add Sale
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "today" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            {todayEntries.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Today's Split
                                            </h3>
                                            <div className="space-y-4">
                                                <SplitItem label="Total Cash" value={todayStats.cashSales} icon={Wallet} color="text-orange-500" isPro={isPro} />
                                                <SplitItem label="Total Online" value={todayStats.onlineSales} icon={CreditCard} color="text-indigo-400" isPro={isPro} />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Today's Expenses
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.entries(todayStats.expenses).map(([key, val]) => (
                                                    <div
                                                        key={key}
                                                        className={cn(
                                                            "p-5 rounded-2xl border flex justify-between items-center transition-all",
                                                            isPro ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-100"
                                                        )}
                                                    >
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight capitalize">{key}</span>
                                                        <span className={cn(
                                                            "font-black text-sm",
                                                            isPro ? "text-slate-100" : "text-slate-900"
                                                        )}>₹{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* List today's entries */}
                                    <div className="space-y-6 border-t border-white/5 pt-12">
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sales Records</h1>
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                isPro ? "bg-indigo-500/10 text-indigo-400" : "bg-primary/5 text-primary"
                                            )}>{todayEntries.length} Transactions</span>
                                        </div>
                                        <div className="space-y-4">
                                            {todayEntries.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className={cn(
                                                        "p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 border transition-all group",
                                                        isPro
                                                            ? "bg-slate-800/40 border-white/5 hover:border-indigo-500/30"
                                                            : "bg-slate-50 border-slate-100 hover:shadow-xl shadow-sm"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={cn(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                            isPro ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"
                                                        )}>
                                                            <Receipt size={24} className={isPro ? "text-indigo-400" : "text-slate-400"} />
                                                        </div>
                                                        <div>
                                                            <p className={cn(
                                                                "text-2xl font-black mb-1.5 tracking-tight",
                                                                isPro ? "text-white" : "text-slate-900"
                                                            )}>₹{log.totalRevenue.toLocaleString()}</p>
                                                            <div className="flex gap-4">
                                                                <p className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                                                                    <ArrowUpRight size={12} /> Profit: ₹{log.netProfit}
                                                                </p>
                                                                <p className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                                                                    <ArrowDownRight size={12} /> Exp: ₹{log.totalExpenses}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteEntry(log.id, log.isDummy)}
                                                        className={cn(
                                                            "w-full sm:w-auto px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all",
                                                            isPro
                                                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 text-white"
                                                                : "bg-white border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white"
                                                        )}
                                                    >
                                                        Delete Record
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={cn(
                                    "text-center py-24 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center",
                                    isPro ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"
                                )}>
                                    <div className={cn(
                                        "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6",
                                        isPro ? "bg-slate-900 text-white shadow-glow" : "bg-white text-slate-300 shadow-xl"
                                    )}>
                                        <IndianRupee size={40} />
                                    </div>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">No entries for today yet</p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className={cn(
                                            "mt-8 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 pb-1.5 transition-all",
                                            isPro ? "text-indigo-400 border-indigo-400/30 hover:border-indigo-400" : "text-primary border-primary/20 hover:border-primary"
                                        )}
                                    >Record Your First Sale</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "week" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12">
                            <div className="h-80 flex items-end justify-between gap-4 md:gap-8 px-4">
                                {weekData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-6 group">
                                        <div className={cn(
                                            "w-full rounded-[1.5rem] md:rounded-[2.5rem] h-full relative overflow-hidden flex flex-col justify-end border shadow-inner transition-all",
                                            isPro ? "bg-slate-800/50 border-white/5" : "bg-slate-100 border-slate-200"
                                        )}>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(d.revenue / maxWeekRevenue) * 100}%` }}
                                                transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                                className={cn(
                                                    "w-full border-t-4 border-white shadow-2xl relative",
                                                    isPro ? "bg-gradient-to-t from-indigo-600 to-indigo-400" : "bg-gradient-to-t from-primary to-primary/60"
                                                )}
                                            >
                                                <div className="absolute top-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[8px] font-black text-white/80 uppercase">₹{d.revenue}</span>
                                                </div>
                                            </motion.div>
                                            <div className={cn(
                                                "absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md transform translate-y-4 group-hover:translate-y-0",
                                                isPro ? "bg-[#020617]/90" : "bg-white/95"
                                            )}>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</span>
                                                <span className={cn(
                                                    "font-black text-xl leading-none",
                                                    isPro ? "text-white" : "text-primary"
                                                )}>₹{d.revenue}</span>
                                                <div className="mt-4 flex flex-col items-center gap-1">
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase">Profit: ₹{d.profit}</span>
                                                    <div className="w-8 h-1 bg-emerald-500/20 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                isPro ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-400 group-hover:text-primary"
                                            )}>{d.label}</span>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase opacity-60">{d.date.split('-').slice(1).reverse().join(' / ')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "month" && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pt-4">
                            {displayLogs.slice(0, 10).map((log) => (
                                <div
                                    key={log.id}
                                    className={cn(
                                        "p-8 rounded-[2rem] border flex items-center justify-between group transition-all",
                                        isPro
                                            ? "bg-slate-800/30 border-white/5 hover:border-indigo-500/20"
                                            : "bg-slate-50 border-slate-100 hover:shadow-lg"
                                    )}
                                >
                                    <div className="flex items-center gap-10">
                                        <div className={cn(
                                            "text-center w-16 p-4 rounded-2xl border",
                                            isPro ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-sm"
                                        )}>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{new Date(log.date).toLocaleDateString("en-IN", { month: "short" })}</p>
                                            <p className={cn(
                                                "text-2xl font-black leading-none",
                                                isPro ? "text-white" : "text-primary"
                                            )}>{new Date(log.date).getDate()}</p>
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "font-black text-2xl mb-1 tracking-tight",
                                                isPro ? "text-white" : "text-slate-900"
                                            )}>₹{log.totalRevenue.toLocaleString()}</p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                                <span className="text-slate-500">Net Profit:</span>
                                                <span className={log.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}>₹{log.netProfit.toLocaleString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteEntry(log.id, log.isDummy)}
                                        className={cn(
                                            "p-4 rounded-2xl transition-all",
                                            isPro ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                                        )}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Sales Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={cn(
                                "w-full max-w-lg rounded-[3rem] p-8 md:p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] border",
                                isPro ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
                            )}
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-10 right-10 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X size={28} />
                            </button>

                            <div className="mb-10">
                                <h2 className={cn(
                                    "text-3xl font-black italic tracking-tight mb-2",
                                    isPro ? "text-white" : "text-slate-900"
                                )}>Add Daily Sales</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Track your earnings for today, {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long' })}</p>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Cash Sales (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="4500"
                                            value={formData.cashSales}
                                            onChange={e => setFormData({ ...formData, cashSales: e.target.value })}
                                            className={cn(
                                                "w-full p-5 rounded-2xl font-black text-lg outline-none border-2 transition-all",
                                                isPro
                                                    ? "bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 focus:border-indigo-500"
                                                    : "bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:border-primary"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">UPI / Online (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="3200"
                                            value={formData.onlineSales}
                                            onChange={e => setFormData({ ...formData, onlineSales: e.target.value })}
                                            className={cn(
                                                "w-full p-5 rounded-2xl font-black text-lg outline-none border-2 transition-all",
                                                isPro
                                                    ? "bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 focus:border-indigo-500"
                                                    : "bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:border-primary"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between ml-2">
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Fixed Expenses
                                        </h4>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Total Expenses (Optional)"
                                            value={formData.totalExpenses}
                                            onChange={e => setFormData({ ...formData, totalExpenses: e.target.value })}
                                            className={cn(
                                                "w-full p-5 rounded-2xl font-black text-lg outline-none border-2 transition-all",
                                                isPro
                                                    ? "bg-rose-500/10 border-rose-500/10 text-rose-500 placeholder:text-rose-900/50 focus:border-rose-500"
                                                    : "bg-rose-50 border-rose-100 text-rose-900 placeholder:text-rose-200 focus:border-rose-300"
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['rent', 'staff', 'stock', 'other'] as const).map((field) => (
                                            <input
                                                key={field}
                                                type="number"
                                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                value={formData[field]}
                                                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                                                className={cn(
                                                    "p-4 rounded-xl text-xs font-black uppercase tracking-widest outline-none border transition-all",
                                                    isPro
                                                        ? "bg-white/5 border-white/10 text-white placeholder:text-slate-700 focus:border-indigo-500"
                                                        : "bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-primary"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={cn(
                                        "w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl active:scale-95 transition-all text-white mt-4",
                                        isPro ? "bg-indigo-600 shadow-indigo-600/30" : "bg-primary shadow-primary/30"
                                    )}
                                >
                                    💾 Save Today's Log
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, accent, onClick, noCurrency, isPro }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border transition-all hover:scale-[1.02] cursor-pointer active:scale-95 flex flex-col justify-between shadow-2xl relative overflow-hidden group",
                isPro
                    ? "bg-slate-900 border-white/5"
                    : "bg-white border-slate-100 shadow-slate-200/50",
                accent && (isPro ? "ring-2 ring-indigo-500 ring-offset-4 ring-offset-[#020617] !border-indigo-500/20" : "ring-4 ring-primary/5 border-primary/20"),
                !onClick && "cursor-default hover:scale-100"
            )}
        >
            <div className="flex flex-col gap-4 relative z-10">
                <div className={cn(
                    "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12",
                    isPro ? "bg-slate-950 border border-white/10" : "bg-slate-50 border border-slate-100",
                    color
                )}>
                    <Icon size={isPro ? 24 : 18} className="md:w-6 md:h-6" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</span>
            </div>
            <p className={cn(
                "text-2xl md:text-4xl font-black tracking-tighter truncate mt-6 relative z-10",
                isPro ? "text-white" : "text-slate-900"
            )}>
                {!noCurrency && <span className="text-amber-500 mr-0.5 md:mr-1 text-sm md:text-base align-top mt-2 inline-block">₹</span>}
                {value}
            </p>
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform",
                isPro ? "bg-indigo-500" : "bg-primary"
            )} />
        </div>
    );
}

function SplitItem({ label, value, icon: Icon, color, isPro }: any) {
    return (
        <div className={cn(
            "flex items-center justify-between p-6 rounded-2xl border transition-all",
            isPro ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
        )}>
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-lg", isPro ? "bg-slate-950" : "bg-white shadow-sm")}>
                    <Icon size={18} className={color} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className={cn(
                "font-black text-lg md:text-2xl",
                isPro ? "text-slate-100" : "text-slate-900"
            )}>
                <span className="text-amber-500 text-xs mr-1 align-top mt-1 inline-block">₹</span>
                {value.toLocaleString()}
            </span>
        </div>
    );
}

