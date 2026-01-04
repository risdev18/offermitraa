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
    RotateCcw
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
        currentBalance: displayLogs.reduce((sum, l) => sum + l.netProfit, 0)
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
        <div ref={containerRef} className="space-y-8">
            {isShowingDummy && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between">
                    <p className="text-primary text-xs font-bold px-2">Showing sample data. Add your first sale to start tracking!</p>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase">Add Now</button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <StatCard
                    label="Current Balance"
                    value={allTimeStats.currentBalance.toLocaleString()}
                    icon={Wallet}
                    color="text-emerald-500"
                    accent
                    onClick={() => setIsAddModalOpen(true)}
                />
                <StatCard
                    label="Today's Sales"
                    value={todayStats.totalRevenue.toLocaleString()}
                    icon={IndianRupee}
                    color="text-accent"
                    onClick={() => setIsAddModalOpen(true)}
                />
                <StatCard
                    label="Total Expenses"
                    value={allTimeStats.totalExpenses.toLocaleString()}
                    icon={ArrowDownRight}
                    color="text-rose-500"
                    onClick={() => setIsAddModalOpen(true)}
                />
                <StatCard
                    label="Weekly Revenue"
                    value={weekData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
                    icon={BarChart3}
                    color="text-primary"
                    onClick={() => setActiveTab('week')}
                />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        {(["today", "week", "month"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
                            title="Clear All Data"
                        >
                            <RotateCcw size={16} />
                            Reset All
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Plus size={18} />
                            Add Sale
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "today" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                            {todayEntries.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Split</h3>
                                            <div className="space-y-4">
                                                <SplitItem label="Total Cash" value={todayStats.cashSales} icon={Wallet} color="text-orange-500" />
                                                <SplitItem label="Total Online" value={todayStats.onlineSales} icon={CreditCard} color="text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Expenses</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.entries(todayStats.expenses).map(([key, val]) => (
                                                    <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight capitalize">{key}</span>
                                                        <span className="font-extrabold text-sm">₹{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* List today's entries */}
                                    {todayEntries.length >= 1 && (
                                        <div className="space-y-4 border-t border-slate-100 pt-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h1 className="text-xs font-black uppercase tracking-widest text-slate-400">Sales Records</h1>
                                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-tighter">{todayEntries.length} Entries</span>
                                            </div>
                                            {todayEntries.map((log) => (
                                                <div key={log.id} className="p-6 bg-slate-50 rounded-[1.5rem] flex justify-between items-center border border-slate-100 hover:border-primary/20 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                            <Receipt size={16} className="text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-lg text-slate-900 leading-none mb-1">₹{log.totalRevenue.toLocaleString()}</p>
                                                            <div className="flex gap-2">
                                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Profit: ₹{log.netProfit}</p>
                                                                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Exp: ₹{log.totalExpenses}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteEntry(log.id, log.isDummy)}
                                                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[9px] tracking-widest"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <IndianRupee size={40} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No entries for today yet</p>
                                    <button onClick={() => setIsAddModalOpen(true)} className="mt-6 text-primary font-black uppercase text-[10px] tracking-widest border-b-2 border-primary pb-1">Record Your First Sale</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "week" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex items-end justify-between gap-4">
                            {weekData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                    <div className="w-full bg-slate-50 rounded-2xl h-48 relative overflow-hidden flex flex-col justify-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(d.revenue / maxWeekRevenue) * 100}%` }}
                                            className="w-full bg-primary/20 border-t-4 border-primary rounded-t-lg"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/60 backdrop-blur-sm">
                                            <span className="font-black text-[10px]">₹{d.revenue}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400">{d.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === "month" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {displayLogs.slice(0, 7).map((log) => (
                                <div key={log.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center w-12">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.date).toLocaleDateString("en-IN", { month: "short" })}</p>
                                            <p className="text-xl font-extrabold">{new Date(log.date).getDate()}</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-lg">₹{log.totalRevenue.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                Net Profit: <span className={log.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>₹{log.netProfit}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteEntry(log.id, log.isDummy)} className="p-3 text-slate-300 hover:text-rose-500 transition-all">
                                        <Trash2 size={18} />
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl">
                            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-extrabold mb-8 italic">Add Daily Sales</h2>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cash Sales (₹)</label>
                                        <input type="number" placeholder="4500" value={formData.cashSales} onChange={e => setFormData({ ...formData, cashSales: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">UPI / Online (₹)</label>
                                        <input type="number" placeholder="3200" value={formData.onlineSales} onChange={e => setFormData({ ...formData, onlineSales: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary/50 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-2">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400">Expenses</h4>
                                        <span className="text-[9px] text-slate-400 italic">Enter Total OR breakdown below</span>
                                    </div>
                                    <div className="space-y-2">
                                        <input type="number" placeholder="Total Expenses (Optional)" value={formData.totalExpenses} onChange={e => setFormData({ ...formData, totalExpenses: e.target.value })} className="w-full p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl font-bold text-rose-900 placeholder:text-rose-300 outline-none focus:border-rose-300 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="number" placeholder="Rent" value={formData.rent} onChange={e => setFormData({ ...formData, rent: e.target.value })} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400" />
                                        <input type="number" placeholder="Staff" value={formData.staff} onChange={e => setFormData({ ...formData, staff: e.target.value })} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400" />
                                        <input type="number" placeholder="Inventory" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400" />
                                        <input type="number" placeholder="Other" value={formData.other} onChange={e => setFormData({ ...formData, other: e.target.value })} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Save Today's Log</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, accent, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium transition-all hover:scale-[1.02] cursor-pointer active:scale-95",
                accent && "ring-4 ring-primary/5 border-primary/10"
            )}
        >
            <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-4 rounded-2xl bg-slate-50", color)}>
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tight">
                <span className="text-accent mr-1">₹</span>
                {value}
            </p>
        </div>
    );
}

function SplitItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
                <Icon size={18} className={color} />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className="font-extrabold text-xl text-slate-900">
                <span className="text-accent text-sm mr-1">₹</span>
                {value.toLocaleString()}
            </span>
        </div>
    );
}
