"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/store/useUserStore"
import {
    Users,
    Car,
    TrendingUp,
    ShieldCheck,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Map,
    History
} from "lucide-react"
import { motion } from "framer-motion"
import { dataPurgeService } from "@/lib/services/dataPurgeService"

export default function AdminOverview() {
    const stats = [
        { label: 'Total Revenue', value: '₹1,24,500', trend: '+12.5%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Active Pilots', value: '142', trend: '+4.2%', icon: Car, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Total Passengers', value: '2,840', trend: '+8.1%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Safety Verified', value: '98.2%', trend: '+0.4%', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Real-time Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Command Overview</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Global mobility operations monitor</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20"
                        onClick={async () => {
                            if (confirm("🚨 WARNING: This will PERMANENTLY DELETE ALL RIDES, DRIVERS, AND PASSENGERS. Are you sure you want to start fresh?")) {
                                await dataPurgeService.clearAllAppData();
                                alert("Database Wiped Successfully. Restarting...");
                                window.location.reload();
                            }
                        }}
                    >
                        Emergency Fresh Start
                    </Button>
                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Live Ops: Active</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        <stat.icon className="h-7 w-7" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-md ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                                    <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" /> Active Logistics
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">Live ride stream</CardDescription>
                            </div>
                            <Button variant="ghost" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">Export Logs</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((ride, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer">
                                    <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <Map className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Ride #SR-892{i}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ongoing • 4.2 KM Left</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">₹142.00</p>
                                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">In Transit</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary Stats */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white rounded-[3rem] shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8">
                            <ShieldCheck className="h-12 w-12 text-primary opacity-20" />
                        </div>
                        <CardContent className="p-10 space-y-6">
                            <h3 className="text-2xl font-black italic uppercase tracking-tight leading-none">Security <br /> Monitor</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>System Load</span>
                                        <span>24%</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[24%] bg-primary"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Database Latency</span>
                                        <span>12ms</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[12%] bg-green-500"></div>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-14 bg-white text-black font-black uppercase rounded-2xl text-xs tracking-widest hover:bg-primary transition-all">Health Check</Button>
                        </CardContent>
                    </Card>

                    {/* Email Logs Mock */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-tight italic mb-6">Recent System Alerts</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Driver Reg: Ramesh S.', status: 'Sent to Gmail' },
                                { title: 'Ride Request Alert', status: 'Delivered' },
                                { title: 'Security Auth Token', status: 'Sent' }
                            ].map((log, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{log.title}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{log.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
