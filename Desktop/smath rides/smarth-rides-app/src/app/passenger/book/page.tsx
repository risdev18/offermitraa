"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft,
    Clock,
    MapPin,
    Search,
    Navigation2,
    X,
    CarFront,
    ChevronRight,
    Sparkles,
    Star,
    History,
    Home,
    Briefcase,
    ShieldCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { rideService } from "@/lib/services/rideService"
import { useUserStore } from "@/lib/store/useUserStore"

// Dynamic Map
const Map = dynamic(() => import("@/components/map/MapComponent"), { ssr: false })

export default function BookRide() {
    const router = useRouter()
    const { user } = useUserStore()
    const [step, setStep] = useState<'search' | 'estimate'>('search')
    const [fare, setFare] = useState(85)
    const [offer, setOffer] = useState(85)
    const [loading, setLoading] = useState(false)

    // Input States
    const [pickup, setPickup] = useState("Shivaji Nagar, Pune")
    const [destination, setDestination] = useState("")

    const handleConfirm = async () => {
        if (!user) return
        setLoading(true)
        try {
            const rideId = await rideService.createRideRequest({
                passengerId: user.id || "",
                passengerName: user.name,
                passengerPhone: user.phone,
                pickup: { address: pickup, lat: 18.5204, lng: 73.8567 },
                drop: { address: destination, lat: 18.5204, lng: 73.8567 },
                fare: offer,
            })
            router.push(`/passenger/tracking?rideId=${rideId}`)
        } catch (e) {
            alert("Error requesting ride")
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-950 font-sans">

            {/* PERSISTENT MAP BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <Map />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 pointer-events-none"></div>
            </div>

            {/* TOP NAVIGATION */}
            <header className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between">
                <Button size="icon" className="rounded-2xl h-12 w-12 bg-white/10 backdrop-blur-xl border border-white/5 text-white" onClick={() => step === 'estimate' ? setStep('search') : router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 py-2 px-4 rounded-full flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Safe Ride Protocol Active</span>
                </div>
            </header>

            {/* SEARCH SHEET (PROFESSIONAL & CLEAN) */}
            <AnimatePresence mode="wait">
                {step === 'search' && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-x-0 bottom-0 h-[85vh] bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] z-20 flex flex-col p-8 overflow-y-auto no-scrollbar"
                    >
                        {/* Header */}
                        <div className="space-y-2 mb-8">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Where To?</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Professional Mobility Service</p>
                        </div>

                        {/* Professional Search Box */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 shadow-inner space-y-4 relative mb-8">
                            <div className="absolute left-[38px] top-[48px] bottom-[48px] w-[2px] bg-slate-200 dashed-border"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-4 w-4 rounded-full bg-green-500 ring-4 ring-green-100 shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">Current Pickup</p>
                                    <Input
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                        className="bg-transparent border-0 h-10 p-0 text-slate-900 font-bold text-lg focus-visible:ring-0 placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="h-[1px] bg-slate-200 ml-10"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 shrink-0 animate-pulse"></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">Destination</p>
                                    <Input
                                        autoFocus
                                        placeholder="Enter drop-off location"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="bg-transparent border-0 h-10 p-0 text-slate-900 font-black text-2xl focus-visible:ring-0 placeholder:text-slate-200 italic"
                                    />
                                </div>
                                {destination && (
                                    <div className="flex gap-2 relative z-10">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300" onClick={() => setDestination("")}><X /></Button>
                                        <Button
                                            size="sm"
                                            className="h-10 bg-primary text-black font-black uppercase tracking-widest px-4 rounded-xl shadow-lg shadow-primary/20"
                                            onClick={() => setStep('estimate')}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent & Suggestions */}
                        <div className="space-y-8 flex-1">
                            <section className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <History className="h-3.5 w-3.5" /> Recent Destinations
                                    </h3>
                                    <Button variant="ghost" className="text-[10px] font-black text-primary uppercase h-auto p-0 hover:bg-transparent tracking-widest">Clear All</Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Home, label: 'Home', addr: 'Kothrud, Pune' },
                                        { icon: Briefcase, label: 'Office', addr: 'Magarpatta' }
                                    ].map((place, i) => (
                                        <button key={i} className="flex flex-col items-start gap-3 p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-slate-100 transition-all text-left">
                                            <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 shadow-sm">
                                                <place.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-slate-900 leading-none mb-1">{place.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{place.addr}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4 pb-20">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Search className="h-3.5 w-3.5" /> Nearby Locations
                                </h3>
                                <div className="space-y-1">
                                    {[
                                        { name: 'Phoenix Market City', area: 'Viman Nagar', dist: '4.2 km' },
                                        { name: 'Seasons Mall', area: 'Hadapsar', dist: '2.8 km' },
                                        { name: 'Pavilion Mall', area: 'Senapati Bapat Rd', dist: '5.1 km' }
                                    ].map((loc, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setDestination(loc.name);
                                                setStep('estimate');
                                            }}
                                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                    <MapPin className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-slate-900 uppercase tracking-tight group-hover:text-black">{loc.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.area} • {loc.dist}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* ESTIMATE SHEET */}
            <AnimatePresence>
                {step === 'estimate' && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-x-0 bottom-0 bg-white rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] z-30 p-8 pt-4 pb-12 flex flex-col"
                    >
                        <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto mt-2 mb-8"></div>

                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="bg-slate-900 text-primary text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest inline-flex items-center gap-2 mb-3">
                                        <CarFront className="h-3 w-3" /> Standard Utility Auto
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{destination.split(',')[0]}</h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Connecting with nearest pilots</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase ml-auto mb-1">Estimated Fare</p>
                                    <h3 className="text-6xl font-black text-slate-900 italic tracking-tighter leading-none"><span className="text-2xl text-slate-300 mr-1 italic">₹</span>{offer}</h3>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 shadow-inner space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-primary" /> Negotiate Your Price
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {[offer - 10, offer, offer + 10, offer + 20].map((bid) => (
                                            <button
                                                key={bid}
                                                onClick={() => setOffer(bid)}
                                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${offer === bid ? 'bg-primary text-black' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary'}`}
                                            >
                                                ₹{bid}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Custom Bid</p>
                                            <div className="flex items-center">
                                                <span className="text-2xl font-black text-slate-300 italic mr-2">₹</span>
                                                <input
                                                    type="number"
                                                    value={offer}
                                                    onChange={(e) => setOffer(Number(e.target.value))}
                                                    className="bg-transparent text-5xl font-black text-slate-950 w-32 outline-none italic tracking-tighter"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="h-16 w-16 rounded-2xl border-slate-200 bg-white text-xl font-black text-slate-900 active:scale-90 transition-transform shadow-sm" onClick={() => setOffer(Math.max(10, offer - 5))}>-5</Button>
                                            <Button variant="outline" className="h-16 w-16 rounded-2xl border-slate-200 bg-white text-xl font-black text-slate-900 active:scale-90 transition-transform shadow-sm" onClick={() => setOffer(offer + 5)}>+5</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-20 bg-slate-950 hover:bg-black text-white rounded-[2rem] font-black text-2xl uppercase tracking-tight shadow-xl shadow-slate-900/40 relative overflow-hidden group"
                                onClick={handleConfirm}
                                disabled={loading}
                            >
                                {loading ? <Loader2 /> : (
                                    <>
                                        <span className="relative z-10 flex items-center gap-3">CONFIRM BOOKING <ArrowLeft className="h-8 w-8 rotate-180 group-hover:translate-x-2 transition-transform" /></span>
                                        <Sparkles className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 text-primary opacity-20 group-hover:opacity-100 transition-opacity animate-pulse" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Loader2() {
    return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-8 w-8 border-4 border-primary border-t-white rounded-full"></motion.div>
}
