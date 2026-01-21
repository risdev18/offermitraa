"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Navigation, LogOut, User as UserIcon } from "lucide-react"
import { useUserStore } from "@/lib/store/useUserStore"

// Dynamic import for Map to avoid SSR window error
const Map = dynamic(() => import("@/components/map/MapComponent"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">Loading Map...</div>
})

export default function PassengerHome() {
    const router = useRouter()
    const { user, logout } = useUserStore()

    // Auth Check
    useEffect(() => {
        if (!user) {
            router.push("/")
        }
    }, [user, router])

    const [location] = useState({ lat: 18.5204, lng: 73.8567 })

    if (!user) return null

    return (
        <div className="relative h-screen w-full flex flex-col font-sans">
            {/* Full Bleed Map Background */}
            <div className="absolute inset-0 z-0">
                <Map center={location} />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80 pointer-events-none"></div>
            </div>

            {/* Top Navigation Bar (Glassmorphism) */}
            <div className="relative z-20 p-6 pt-12">
                <Card className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="flex items-center p-4 gap-4">
                        <div className="h-12 w-12 bg-primary/20 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Your Presence</p>
                            <h2 className="font-black text-white uppercase italic tracking-tight truncate leading-none">Shivaji Nagar, Pune</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Bottom Action Sheet */}
            <div className="mt-auto relative z-20 p-6 pb-12 space-y-6">
                <div className="flex justify-end">
                    <Button size="icon" className="h-14 w-14 rounded-full bg-white text-black shadow-2xl hover:scale-110 active:scale-90 transition-all">
                        <Navigation className="h-7 w-7" />
                    </Button>
                </div>

                <Card className="bg-white rounded-[3.5rem] p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.4)] border-0">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-2">Ready to move</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Enter your destination to begin</p>
                        </div>

                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-focus-within:bg-primary/20 group-focus-within:text-primary transition-all">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                readOnly
                                className="w-full h-18 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-[2rem] pl-20 pr-8 text-xl font-black text-slate-900 placeholder:text-slate-300 outline-none cursor-pointer transition-all shadow-inner"
                                placeholder="Where to?"
                                onClick={() => router.push('/passenger/book')}
                            />
                        </div>

                        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                            {[
                                { name: 'Home', icon: '🏠' },
                                { name: 'Office', icon: '💼' },
                                { name: 'Mall', icon: '🛒' },
                                { name: 'Airport', icon: '✈️' }
                            ].map((place) => (
                                <button
                                    key={place.name}
                                    onClick={() => router.push('/passenger/book')}
                                    className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl whitespace-nowrap hover:bg-slate-100 transition-all group"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform">{place.icon}</span>
                                    <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{place.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
