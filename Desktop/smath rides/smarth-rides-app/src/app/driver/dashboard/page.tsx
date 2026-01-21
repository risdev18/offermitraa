"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Power,
    LogOut,
    Navigation,
    Phone,
    MessageCircle,
    CheckCircle,
    ChevronRight,
    Star,
    Wallet,
    TrendingUp,
    MapPin,
    AlertCircle,
    UserCircle,
    FileText,
    ArrowRight,
    Clock,
    ShieldCheck
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/lib/store/useUserStore"
import { rideService, RideRequest } from "@/lib/services/rideService"
import { motion, AnimatePresence } from "framer-motion"
import IncomingRideRequest from "@/components/driver/IncomingRideRequest"

export default function DriverDashboard() {
    const router = useRouter()
    const { user, setUser, logout } = useUserStore()

    // Status State
    const [status, setStatus] = useState<'online' | 'offline'>('offline')
    const [rideStatus, setRideStatus] = useState<'idle' | 'request' | 'navigating' | 'arrived' | 'started' | 'completed'>('idle')
    const [activeRide, setActiveRide] = useState<RideRequest | null>(null)

    // UI State
    const [otpInput, setOtpInput] = useState("")
    const [stats, setStats] = useState({ today: 0, trips: 0, rating: 4.8 })

    // 0. LISTEN TO STATS
    useEffect(() => {
        if (!user?.id) return
        const unsubscribe = rideService.listenToDriverStats(user.id, (newStats) => {
            setStats(prev => ({ ...prev, ...newStats }))
        })
        return () => unsubscribe()
    }, [user?.id])

    // 1. LISTEN FOR REAL RIDES
    useEffect(() => {
        if (status !== 'online' || rideStatus !== 'idle') return

        const unsubscribe = rideService.listenForAvailableRides((rides) => {
            if (rides.length > 0 && rideStatus === 'idle') {
                setActiveRide(rides[0])
                setRideStatus('request')
            }
        })
        return () => unsubscribe()
    }, [status, rideStatus])

    // 2. LISTEN TO ACTIVE RIDE UPDATES
    useEffect(() => {
        if (!activeRide?.id) return
        const unsubscribe = rideService.listenToRide(activeRide.id, (updatedRide) => {
            setActiveRide(updatedRide)
            // If ride cancelled by passenger
            if (updatedRide.status === 'cancelled') {
                alert("Ride was cancelled by passenger")
                setRideStatus('idle')
                setActiveRide(null)
            }
        })
        return () => unsubscribe()
    }, [activeRide?.id])

    const handleAcceptRide = async () => {
        if (!activeRide?.id || !user) return
        try {
            await rideService.acceptRide(activeRide.id, user.id, user.name, user.phone)
            setRideStatus('navigating')
        } catch (e) {
            alert("Could not accept ride")
            setRideStatus('idle')
        }
    }

    const handleUpdateStatus = async (newStatus: RideRequest['status']) => {
        if (!activeRide?.id) return
        await rideService.updateRideStatus(activeRide.id, newStatus)
        setRideStatus(newStatus as any)
    }

    const handleVerifyOTP = () => {
        if (otpInput === activeRide?.otp) {
            handleUpdateStatus('started')
            setOtpInput("")
        } else {
            alert("Invalid OTP! Please check with passenger.")
        }
    }

    // --- PROTECTIVE DASHBOARD LOGIC ---
    if (!user) return null

    // 🛡️ REJECTION STATE
    if (user.status === 'rejected') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-6">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">Account Rejected</h1>
                <p className="text-slate-500 max-w-xs mb-8">Your documents did not meet our verification standards. Please update and re-submit.</p>
                <div className="flex flex-col w-full max-w-xs gap-3">
                    <Button
                        className="h-16 bg-white text-black font-black rounded-2xl"
                        onClick={() => router.push("/driver/documents")}
                    >
                        RE-UPLOAD DOCUMENTS
                    </Button>
                    <Button variant="ghost" className="text-slate-400 font-bold" onClick={() => logout()}>LOGOUT</Button>
                </div>
            </div>
        )
    }

    // 🛡️ PENDING/INCOMPLETE STATE
    if (user.status === 'pending' || user.status === 'incomplete' || !user.isApproved) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col p-8 font-sans">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-2xl font-black tracking-tighter">SMARTH<span className="text-primary">RIDES</span></h1>
                    <Button variant="ghost" className="text-slate-500 h-10 w-10 p-0" onClick={() => logout()}><LogOut /></Button>
                </header>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <Clock className="text-primary/20 h-24 w-24 -mr-4 -mt-4 rotate-12" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 uppercase italic">Verification <br /> In Progress</h2>
                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">Our team at <span className="text-white font-bold">Smarth Rides</span> is reviewing your documents. You will receive an update shortly.</p>

                        <div className="space-y-4">
                            {[
                                { label: 'Account Registered', done: true },
                                { label: 'Documents Uploaded', done: user.status === 'pending' },
                                { label: 'Phone Verification', done: true },
                                { label: 'Final Approval', done: false }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-600'}`}>
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <span className={`text-sm font-bold uppercase tracking-widest ${step.done ? 'text-white' : 'text-slate-600'}`}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="mt-8 h-16 bg-primary text-black font-black rounded-2xl group"
                        onClick={() => router.push("/driver/documents")}
                    >
                        {user.status === 'incomplete' ? "UPLOAD DOCUMENTS" : "VIEW SUBMITTED DOCS"}
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        )
    }

    // --- MAIN DASHBOARD (APPROVED) ---
    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white relative font-sans">

            {/* Header / HUD */}
            <header className="absolute top-0 inset-x-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
                            <Wallet className="text-primary h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Earnings</p>
                            <h2 className="text-2xl font-black italic tracking-tighter leading-none">₹{stats.today}</h2>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => setStatus(status === 'online' ? 'offline' : 'online')}
                        className={`h-14 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${status === 'online' ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-primary text-black shadow-lg shadow-primary/20'}`}
                    >
                        <Power className="mr-2 h-5 w-5" />
                        {status === 'online' ? 'Go Offline' : 'Go Online'}
                    </Button>
                    <Button variant="ghost" className="bg-slate-900 border border-slate-800 h-14 w-12 rounded-2xl" onClick={logout}>
                        <LogOut className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 relative flex flex-col justify-center items-center overflow-hidden">

                {/* Visual Background / Map Area */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    {status === 'online' && rideStatus === 'idle' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute h-[500px] w-[500px] rounded-full border border-primary/20"></motion.div>
                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="absolute h-[300px] w-[300px] rounded-full border border-primary/30"></motion.div>
                            <div className="text-center space-y-4 relative z-10">
                                <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto ring-2 ring-primary/20 animate-pulse">
                                    <Navigation className="h-10 w-10 text-primary" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary">Scanning for Rides</h2>
                            </div>
                        </div>
                    )}

                    {status === 'offline' && (
                        <div className="text-center space-y-8 animate-in zoom-in">
                            <h2 className="text-6xl font-black text-slate-800 uppercase italic leading-none">System <br /> Inactive</h2>
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Switch presence to start receiving requests</p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {rideStatus === 'request' && activeRide && (
                        <IncomingRideRequest
                            ride={activeRide}
                            onAccept={handleAcceptRide}
                            onReject={() => {
                                setRideStatus('idle')
                                setActiveRide(null)
                            }}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {(rideStatus === 'navigating' || rideStatus === 'arrived' || rideStatus === 'started') && activeRide && (
                        <motion.div initial={{ y: 300 }} animate={{ y: 0 }} className="absolute bottom-0 inset-x-0 z-30 p-6 space-y-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                                    <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2 }} className="h-full w-1/3 bg-primary" />
                                </div>

                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                            {rideStatus === 'navigating' ? 'Heading to Pickup' : rideStatus === 'arrived' ? 'Waiting for OTP' : 'Heading to Destination'}
                                        </p>
                                        <h3 className="text-3xl font-black text-white italic truncate max-w-[200px] uppercase">
                                            {rideStatus === 'started' ? activeRide.drop.address : activeRide.pickup.address}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md">
                                                <Star className="h-3 w-3 fill-green-500 text-green-500" />
                                                <span className="text-[10px] font-black text-green-500 uppercase">4.9 VIP Passenger</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" className="h-14 w-14 rounded-2xl bg-slate-800 border border-white/5 hover:bg-slate-700 transition-all"><Phone className="h-6 w-6" /></Button>
                                    </div>
                                </div>

                                {rideStatus === 'navigating' && (
                                    <Button className="w-full h-20 bg-primary text-black font-black text-2xl rounded-3xl uppercase tracking-tight shadow-xl shadow-primary/20 group" onClick={() => handleUpdateStatus('arrived')}>
                                        I HAVE ARRIVED <CheckCircle className="ml-3 h-8 w-8 group-hover:scale-110 transition-transform" />
                                    </Button>
                                )}

                                {rideStatus === 'arrived' && (
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="ENTER 4-DIGIT OTP"
                                                className="h-20 bg-slate-950 border-2 border-slate-800 text-4xl font-black text-center tracking-[0.5em] rounded-3xl focus:border-primary transition-all text-white placeholder:text-slate-800"
                                                maxLength={4}
                                                value={otpInput}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpInput(e.target.value)}
                                            />
                                            <Button className="h-20 w-24 bg-primary text-black font-black rounded-3xl" onClick={handleVerifyOTP}>GO</Button>
                                        </div>
                                    </div>
                                )}

                                {rideStatus === 'started' && (
                                    <Button className="w-full h-20 bg-green-600 hover:bg-green-700 text-white font-black text-2xl rounded-3xl uppercase tracking-tight shadow-xl shadow-green-500/20" onClick={() => handleUpdateStatus('completed')}>
                                        COMPLETE RIDE <CheckCircle className="ml-3 h-8 w-8" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {rideStatus === 'completed' && activeRide && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-8">
                            <div className="bg-green-500/10 h-32 w-32 rounded-full flex items-center justify-center ring-4 ring-green-500/20 animate-bounce">
                                <CheckCircle className="h-20 w-20 text-green-500" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Ride Complete</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Collect Cash Payment</p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-w-sm">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Final Trip Fare</p>
                                <h2 className="text-8xl font-black italic tracking-tighter"><span className="text-4xl text-slate-700 mr-2">₹</span>{activeRide.fare}</h2>
                            </div>
                            <Button
                                className="w-full max-w-sm h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-2xl shadow-primary/20"
                                onClick={() => {
                                    setRideStatus('idle')
                                    setActiveRide(null)
                                }}
                            >
                                DONE & ONLINE
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            <footer className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-around p-4 shrink-0">
                {[
                    { label: 'Rating', value: stats.rating, icon: Star, color: 'text-yellow-500' },
                    { label: 'Trips', value: stats.trips, icon: TrendingUp, color: 'text-blue-500' },
                    { label: 'Level', value: 'GOLD', icon: ShieldCheck, color: 'text-primary' }
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                            <h4 className="text-sm font-black text-white italic tracking-tighter leading-none">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </footer>
        </div>
    )
}
