"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, ShieldAlert, Share2, Star, Navigation, MapPin, User, Search, Loader2, XCircle, MessageSquare, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { rideService, RideRequest } from "@/lib/services/rideService"
import { useUserStore } from "@/lib/store/useUserStore"

// Dynamic Map
const Map = dynamic(() => import("@/components/map/MapComponent"), { ssr: false })

function TrackingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const rideId = searchParams.get('rideId')

    const [ride, setRide] = useState<RideRequest | null>(null)
    const [searchStatusText, setSearchStatusText] = useState("Connecting to Global Fleet...")
    const { user } = useUserStore()

    // 1. LISTEN TO RIDE UPDATES
    useEffect(() => {
        if (!rideId) return
        const unsubscribe = rideService.listenToRide(rideId, (updatedRide) => {
            setRide(updatedRide)
        })
        return () => unsubscribe()
    }, [rideId])

    // 2. ROTATING STATUS TEXT (Only while searching)
    useEffect(() => {
        if (!ride || ride.status !== 'pending') return

        const texts = [
            "Connecting to Global Fleet...",
            "Matching Priority Pilots...",
            "Encrypting Ride Channel...",
            "Optimizing Efficiency Routes..."
        ]
        let i = 0
        const interval = setInterval(() => {
            i = (i + 1) % texts.length
            setSearchStatusText(texts[i])
        }, 2500)

        return () => clearInterval(interval)
    }, [ride?.status])

    const handleCancel = async () => {
        if (!rideId) return
        if (confirm("Are you sure you want to cancel this request?")) {
            await rideService.cancelRide(rideId)
            router.push('/passenger/book')
        }
    }

    if (!rideId) return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-black text-white uppercase italic">Session Invalid</h1>
            <p className="text-slate-500 mb-8">Could not locate active ride tracking ID.</p>
            <Button className="w-full max-w-xs h-16 bg-white text-black font-black rounded-2xl" onClick={() => router.push('/passenger')}>RETURN TO HUB</Button>
        </div>
    )

    return (
        <div className="relative h-screen w-full flex flex-col bg-slate-950 font-sans">
            <div className="absolute inset-0 z-0">
                <Map />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950/80 pointer-events-none"></div>
            </div>

            {/* RADAR SCAN OVERLAY (SEARCHING) */}
            <AnimatePresence>
                {(!ride || ride.status === 'pending') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md p-8"
                    >
                        {/* High-Tech Radar */}
                        <div className="relative h-64 w-64 flex items-center justify-center mb-12">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute inset-0 border border-primary/20 rounded-full"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: [0.5, 2], opacity: [0.8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.75, ease: "linear" }}
                                />
                            ))}
                            <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.5)] z-10">
                                <Search className="h-8 w-8 text-black animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-2 text-center">
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter h-10">{searchStatusText}</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Encrypted Handshake In Progress</p>
                        </div>

                        <Button
                            variant="ghost"
                            className="mt-16 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl font-black uppercase tracking-widest px-8 h-12 border border-slate-800"
                            onClick={handleCancel}
                        >
                            Abort Connection
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER (IF DRIVER ASSIGNED) */}
            <AnimatePresence>
                {ride && ride.status !== 'pending' && (
                    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="relative z-10 p-6">
                        <div className="bg-slate-900 border border-white/5 backdrop-blur-xl p-4 rounded-3xl flex items-center gap-4 shadow-2xl">
                            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 animate-bounce">
                                <Navigation className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">
                                    {ride.status === 'accepted' ? 'Pilot is arriving' : ride.status === 'arrived' ? 'Pilot reached' : 'Encryption Active'}
                                </p>
                                <h2 className="text-lg font-black text-white uppercase italic tracking-tight truncate max-w-[240px] leading-none">
                                    {ride.status === 'started' ? 'On Trip to Destination' : 'Pickup at Current Location'}
                                </h2>
                            </div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* BOTTOM PANEL (DRIVER DETAILS) */}
            <AnimatePresence>
                {ride && ride.status !== 'pending' && (
                    <motion.div initial={{ y: 400 }} animate={{ y: 0 }} className="mt-auto relative z-10 p-6 pb-10">
                        <div className="bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
                            {/* Dark Status Banner */}
                            <div className="bg-slate-950 p-6 flex justify-between items-center border-b border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Secure OTP</p>
                                    <h3 className="text-4xl font-black text-primary tracking-[0.3em] italic leading-none">{ride.otp}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Est. Wait</p>
                                    <div className="flex items-center justify-end gap-2">
                                        <Clock className="h-5 w-5 text-slate-400" />
                                        <p className="text-2xl font-black text-white italic tracking-tighter">4 MINS</p>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Profile */}
                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="h-20 w-20 rounded-3xl bg-slate-800 border-2 border-white/5 flex items-center justify-center overflow-hidden relative group">
                                        <User className="h-10 w-10 text-slate-600" />
                                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none mb-2">{ride.driverName}</h2>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500/10 px-2 py-1 rounded-lg flex items-center gap-1.5 ring-1 ring-green-500/20">
                                                <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                                                <span className="text-xs font-black text-green-500 tracking-widest">4.8</span>
                                            </div>
                                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">• {user?.vehicleNumber || 'AUTO PILOT'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Control Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <Button variant="ghost" className="flex flex-col h-20 gap-2 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white">
                                        <Phone className="h-6 w-6 text-primary" /> Call Pilot
                                    </Button>
                                    <Button variant="ghost" className="flex flex-col h-20 gap-2 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white">
                                        <MessageSquare className="h-6 w-6 text-primary" /> Message
                                    </Button>
                                    <Button className="flex flex-col h-20 gap-2 bg-red-600/10 border border-red-500/20 rounded-2xl hover:bg-red-600 text-white transition-all font-black text-[10px] uppercase tracking-widest">
                                        <ShieldAlert className="h-6 w-6" /> SOS Alert
                                    </Button>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl border-white/5 bg-slate-950 font-black uppercase tracking-widest text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all text-xs"
                                        onClick={handleCancel}
                                    >
                                        Cancel Ride Execution
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function RideTracking() {
    return (
        <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center p-8"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
            <TrackingContent />
        </Suspense>
    )
}
