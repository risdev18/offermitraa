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
    X
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
    date: string; // YYYY-MM-DD
    cashSales: number;
    onlineSales: number;
    totalRevenue: number;
    expenses: ExpenseLog;
    totalExpenses: number;
    netProfit: number;
}

const STORAGE_KEY = "om_revenue_logs";

export default function RevenueTracker({ isPro, language = 'hinglish' }: { isPro: boolean, language?: Language }) {
    const [logs, setLogs] = useState<RevenueEntry[]>([]);
    const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        cashSales: "",
        onlineSales: "",
        rent: "",
        staff: "",
        stock: "",
        electricity: "",
        other: ""
    });

    const handleExport = async () => {
        if (!containerRef.current) return;
        try {
            const dataUrl = await toImage(containerRef.current, {
                quality: 0.95,
                backgroundColor: isPro ? "#020617" : "#f8fafc",
                style: {
                    borderRadius: '0'
                }
            });
            const link = document.createElement('a');
            link.download = `Revenue_Report_${todayStr}.png`;
            link.href = dataUrl;
            link.click();
            alert("Summary Image Downloaded! You can now share it on WhatsApp.");
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export summary.");
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setLogs(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse revenue logs", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }, [logs]);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayEntry = logs.find(l => l.date === todayStr);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();

        const cash = parseFloat(formData.cashSales) || 0;
        const online = parseFloat(formData.onlineSales) || 0;
        const rent = parseFloat(formData.rent) || 0;
        const staff = parseFloat(formData.staff) || 0;
        const stock = parseFloat(formData.stock) || 0;
        const elec = parseFloat(formData.electricity) || 0;
        const other = parseFloat(formData.other) || 0;

        const totalRevenue = cash + online;
        const totalExpenses = rent + staff + stock + elec + other;
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

        // Update or Add
        setLogs(prev => {
            const existingIdx = prev.findIndex(l => l.date === todayStr);
            if (existingIdx > -1) {
                const updated = [...prev];
                updated[existingIdx] = newEntry;
                return updated;
            }
            return [newEntry, ...prev];
        });

        setIsAddModalOpen(false);
        setFormData({
            cashSales: "",
            onlineSales: "",
            rent: "",
            staff: "",
            stock: "",
            electricity: "",
            other: ""
        });
    };

    const deleteEntry = (id: string) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            setLogs(logs.filter(l => l.id !== id));
        }
    };

    // Stats calculation
    const getWeekStats = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        return last7Days.map(date => {
            const entry = logs.find(l => l.date === date);
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

    const getMonthStats = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthLogs = logs.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalRevenue = monthLogs.reduce((acc, l) => acc + l.totalRevenue, 0);
        const totalExpenses = monthLogs.reduce((acc, l) => acc + l.totalExpenses, 0);
        const netProfit = totalRevenue - totalExpenses;

        return { totalRevenue, totalExpenses, netProfit, count: monthLogs.length };
    };

    const monthStats = getMonthStats();

    const getGrowth = (): string | null => {
        if (logs.length < 2) return null;
        const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
        const latest = sorted[0].totalRevenue;
        const previous = sorted[1].totalRevenue;
        if (previous === 0) return "100";
        return (((latest - previous) / previous) * 100).toFixed(1);
    };

    const growth = getGrowth();

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full rounded-[2.5rem] p-6 md:p-10 transition-all duration-500",
                isPro ? "glass-card border-white/10" : "bg-white border border-slate-200 shadow-xl"
            )}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-4 rounded-3xl shadow-lg",
                        isPro ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    )}>
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className={cn("text-3xl font-black tracking-tighter", isPro ? "text-white" : "text-slate-900")}>
                            {t('revenue_tracker', language)}
                        </h2>
                        <p className={cn("text-xs font-bold uppercase tracking-widest mt-1 opacity-80", isPro ? "text-emerald-200" : "text-slate-600")}>
                            Track Sales, Expenses & Profits
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className={cn(
                            "flex items-center justify-center p-4 rounded-2xl transition-all border",
                            isPro ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                        title="Download Summary"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={cn(
                            "flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95",
                            isPro ? "pro-gradient text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                        {t('add_sales', language)}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100/50 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-fit mb-10">
                {(["today", "week", "month"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                            activeTab === tab
                                ? isPro ? "pro-gradient text-white shadow-lg" : "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === "today" && (
                        <motion.div
                            key="today"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {todayEntry ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard
                                            label="Total Revenue"
                                            value={`₹${todayEntry.totalRevenue.toLocaleString()}`}
                                            icon={IndianRupee}
                                            color="text-emerald-500"
                                            isPro={isPro}
                                        />
                                        <StatCard
                                            label="Total Expenses"
                                            value={`₹${todayEntry.totalExpenses.toLocaleString()}`}
                                            icon={Receipt}
                                            color="text-rose-500"
                                            isPro={isPro}
                                        />
                                        <StatCard
                                            label="Net Profit"
                                            value={`₹${todayEntry.netProfit.toLocaleString()}`}
                                            icon={TrendingUp}
                                            color={todayEntry.netProfit >= 0 ? "text-indigo-500" : "text-rose-500"}
                                            isPro={isPro}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Revenue Breakdown */}
                                        <div className={cn(
                                            "p-8 rounded-[2rem] border",
                                            isPro ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                        )}>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-60">Revenue Breakdown</h3>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl">
                                                            <Wallet className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-bold">Cash Sales</span>
                                                    </div>
                                                    <span className="font-black text-xl">₹{todayEntry.cashSales.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                                                            <CreditCard className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-bold">UPI / Online</span>
                                                    </div>
                                                    <span className="font-black text-xl">₹{todayEntry.onlineSales.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expense Breakdown */}
                                        <div className={cn(
                                            "p-8 rounded-[2rem] border",
                                            isPro ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                        )}>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-60">Expense Breakdown</h3>
                                            <div className="space-y-4">
                                                {Object.entries(todayEntry.expenses).map(([key, val]) => (
                                                    val > 0 && (
                                                        <div key={key} className="flex items-center justify-between text-sm">
                                                            <span className="font-bold text-slate-500 uppercase tracking-tighter capitalize">{key}</span>
                                                            <span className="font-black">₹{val.toLocaleString()}</span>
                                                        </div>
                                                    )
                                                ))}
                                                {todayEntry.totalExpenses === 0 && (
                                                    <p className="text-sm font-bold text-slate-500 italic">No expenses recorded today</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {growth && (
                                        <div className={cn(
                                            "p-6 rounded-2xl flex items-center justify-between border",
                                            parseFloat(growth) >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                {parseFloat(growth) >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                                <p className="font-black uppercase tracking-widest text-xs">
                                                    Your sales {parseFloat(growth) >= 0 ? "increased" : "decreased"} by {Math.abs(parseFloat(growth))}% compared to yesterday
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                    <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full">
                                        <Calendar className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">No Data for Today</h3>
                                        <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">Add your daily sales to start tracking your business growth!</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all"
                                    >
                                        Set up today's log <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "week" && (
                        <motion.div
                            key="week"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                                {weekData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="w-full flex justify-center items-end h-48 bg-slate-50 dark:bg-white/5 rounded-2xl overflow-hidden relative">
                                            {/* Tooltip */}
                                            <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-100%] bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md z-10 whitespace-nowrap">
                                                ₹{d.revenue.toLocaleString()}
                                            </div>

                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(d.revenue / maxWeekRevenue) * 100}%` }}
                                                transition={{ delay: i * 0.1 }}
                                                className={cn(
                                                    "w-full rounded-t-xl transition-all group-hover:opacity-80",
                                                    isPro ? "pro-gradient" : "bg-indigo-500"
                                                )}
                                            />

                                            {d.revenue > 0 && d.profit < 0 && (
                                                <div className="absolute bottom-0 w-full h-[10%] bg-rose-500/50" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{d.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={cn(
                                    "p-8 rounded-[2rem] flex items-center justify-between border",
                                    isPro ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                )}>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Weekly Average</h4>
                                        <p className="text-2xl font-black">₹{(weekData.reduce((acc, d) => acc + d.revenue, 0) / 7).toFixed(0)}</p>
                                    </div>
                                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className={cn(
                                    "p-8 rounded-[2rem] flex items-center justify-between border",
                                    isPro ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                )}>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Highest Daily</h4>
                                        <p className="text-2xl font-black">₹{maxWeekRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "month" && (
                        <motion.div
                            key="month"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    label="Monthly Revenue"
                                    value={`₹${monthStats.totalRevenue.toLocaleString()}`}
                                    icon={IndianRupee}
                                    color="text-emerald-500"
                                    isPro={isPro}
                                />
                                <StatCard
                                    label="Monthly Expenses"
                                    value={`₹${monthStats.totalExpenses.toLocaleString()}`}
                                    icon={Receipt}
                                    color="text-rose-500"
                                    isPro={isPro}
                                />
                                <StatCard
                                    label="Total Net Profit"
                                    value={`₹${monthStats.netProfit.toLocaleString()}`}
                                    icon={TrendingUp}
                                    color={monthStats.netProfit >= 0 ? "text-indigo-500" : "text-rose-500"}
                                    isPro={isPro}
                                />
                            </div>

                            <div className={cn(
                                "p-10 rounded-[3rem] border overflow-hidden relative",
                                isPro ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                            )}>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black">History (Recent)</h3>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{monthStats.count} entries this month</span>
                                </div>

                                <div className="space-y-4">
                                    {logs.slice(0, 10).map((log) => (
                                        <div
                                            key={log.id}
                                            className={cn(
                                                "p-6 rounded-2xl flex items-center justify-between group transition-all",
                                                isPro ? "hover:bg-white/5" : "hover:bg-white border hover:border-indigo-500/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                                                        {new Date(log.date).toLocaleDateString("en-IN", { month: "short" })}
                                                    </p>
                                                    <p className="text-xl font-black">{new Date(log.date).getDate()}</p>
                                                </div>
                                                <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
                                                <div>
                                                    <p className="font-black">₹{log.totalRevenue.toLocaleString()}</p>
                                                    <p className={cn("text-[10px] font-bold uppercase", log.netProfit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                        {log.netProfit >= 0 ? "+" : ""} ₹{log.netProfit.toLocaleString()} profit
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setFormData({
                                                            cashSales: log.cashSales.toString(),
                                                            onlineSales: log.onlineSales.toString(),
                                                            rent: log.expenses.rent.toString(),
                                                            staff: log.expenses.staff.toString(),
                                                            stock: log.expenses.stock.toString(),
                                                            electricity: log.expenses.electricity.toString(),
                                                            other: log.expenses.other.toString()
                                                        });
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-indigo-500/10 text-indigo-500 rounded-lg"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteEntry(log.id)}
                                                    className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <p className="text-center py-10 text-slate-500 font-bold italic">No history yet</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={cn(
                                "relative w-full max-w-2xl rounded-[3rem] p-10 overflow-hidden shadow-2xl",
                                isPro ? "bg-slate-900 border border-white/10" : "bg-white"
                            )}
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 text-slate-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black capitalize">{todayStr === new Date().toISOString().split("T")[0] ? "Today's Sales" : "Edit Log"}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(todayStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Cash Sales (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.cashSales}
                                            onChange={(e) => setFormData({ ...formData, cashSales: e.target.value })}
                                            placeholder="0"
                                            className={cn(
                                                "w-full px-8 py-5 rounded-2xl outline-none border font-black text-xl transition-all",
                                                isPro ? "bg-black/40 border-white/5 focus:border-emerald-500/50" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Online / UPI (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.onlineSales}
                                            onChange={(e) => setFormData({ ...formData, onlineSales: e.target.value })}
                                            placeholder="0"
                                            className={cn(
                                                "w-full px-8 py-5 rounded-2xl outline-none border font-black text-xl transition-all",
                                                isPro ? "bg-black/40 border-white/5 focus:border-blue-500/50" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 flex items-center gap-2">
                                        <Receipt className="w-3 h-3" /> Expenses (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { key: "rent", label: "Rent" },
                                            { key: "staff", label: "Staff" },
                                            { key: "stock", label: "Inventory" },
                                            { key: "electricity", label: "Electricity" },
                                            { key: "other", label: "Other" }
                                        ].map((exp) => (
                                            <div key={exp.key} className="space-y-1">
                                                <input
                                                    type="number"
                                                    value={formData[exp.key as keyof typeof formData]}
                                                    onChange={(e) => setFormData({ ...formData, [exp.key]: e.target.value })}
                                                    placeholder={exp.label}
                                                    className={cn(
                                                        "w-full px-6 py-3 rounded-xl outline-none border text-sm font-bold transition-all",
                                                        isPro ? "bg-black/20 border-white/5 focus:border-rose-500/50" : "bg-slate-100/50 border-slate-200 focus:border-indigo-500"
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={cn(
                                        "w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-lg",
                                        isPro ? "pro-gradient text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    )}
                                >
                                    Save Daily Log
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, isPro }: any) {
    return (
        <div className={cn(
            "p-8 rounded-[2.5rem] border group transition-all duration-500",
            isPro ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:shadow-lg"
        )}>
            <div className="flex items-center gap-4 mb-4">
                <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform bg-opacity-20", color.replace('text', 'bg'))}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40">{label}</h3>
            </div>
            <p className={cn("text-3xl font-black", color)}>{value}</p>
        </div>
    );
}
