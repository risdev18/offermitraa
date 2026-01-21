"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Navigation2, Star, CheckCircle, XCircle, Sparkles } from "lucide-react"
import { RideRequest } from "@/lib/services/rideService"

interface IncomingRideRequestProps {
    ride: RideRequest;
    onAccept: () => void;
    onReject: () => void;
}

export default function IncomingRideRequest({ ride, onAccept, onReject }: IncomingRideRequestProps) {
    const [timeLeft, setTimeLeft] = useState(15)

    useEffect(() => {
        if (timeLeft <= 0) {
            onReject()
            return
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        return () => clearInterval(timer)
    }, [timeLeft, onReject])

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
        >
            <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
                {/* Banner / Header */}
                <div className="bg-primary p-6 text-center space-y-1 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_50%,transparent_75%)] bg-[length:20px_20px] opacity-20"></div>
                    <h2 className="text-2xl font-black text-black uppercase italic tracking-tight">New Ride Request</h2>
                    <div className="flex items-center justify-center gap-2 text-black/60 font-black text-xs uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" /> Expires in {timeLeft}s
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Fare & Stats */}
                    <div className="flex justify-between items-end border-b border-white/5 pb-6">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" /> Passenger's Offer Price
                            </p>
                            <h3 className="text-5xl font-black text-white italic tracking-tighter">
                                <span className="text-2xl text-slate-600 mr-1 italic">₹</span>{ride.fare}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Distance</p>
                            <p className="font-black text-white uppercase italic">1.2 KM AWAY</p>
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="space-y-6 relative">
                        {/* Connection Line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500 to-red-500 opacity-20"></div>

                        <div className="flex items-start gap-4">
                            <div className="h-4 w-4 rounded-full bg-green-500 ring-4 ring-green-500/10 mt-1 z-10 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Pickup Address</p>
                                <p className="font-bold text-white leading-tight uppercase tracking-tight">{ride.pickup.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-4 w-4 rounded-full bg-red-500 ring-4 ring-red-500/10 mt-1 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Drop Address</p>
                                <p className="font-bold text-slate-300 leading-tight uppercase tracking-tight">{ride.drop.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* User Rating */}
                    <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-black text-slate-400">
                                {ride.passengerName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">{ride.passengerName}</p>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-primary text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase">4.8 Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-16 rounded-2xl border-white/10 hover:bg-white/5 font-black text-slate-400 hover:text-white transition-all uppercase"
                            onClick={onReject}
                        >
                            Decline
                        </Button>
                        <Button
                            className="flex-[2] h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-500/20 active:scale-95 transition-all uppercase"
                            onClick={onAccept}
                        >
                            Accept Ride
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
