"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Info } from "lucide-react"

export default function NotificationToast() {
    const [notification, setNotification] = useState<{ title: string, body: string } | null>(null)

    useEffect(() => {
        const handleNewNotification = (e: any) => {
            setNotification({
                title: e.detail.title || "New Message",
                body: e.detail.body || "You have a new update in Smarth Rides."
            })

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setNotification(null)
            }, 5000)
        }

        window.addEventListener('MOCK_GMAIL_NOTIFICATION', handleNewNotification)
        return () => window.removeEventListener('MOCK_GMAIL_NOTIFICATION', handleNewNotification)
    }, [])

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] w-[90vw] max-w-[380px]"
                >
                    <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex items-start gap-4 ring-4 ring-black/5">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-black shrink-0 shadow-lg shadow-primary/20">
                            <Bell className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{notification.title}</h4>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mt-1 whitespace-pre-line">{notification.body}</p>
                            <div className="flex items-center gap-1.5 mt-3">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded-md">Real System Alpha</span>
                            </div>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-slate-300 hover:text-slate-900">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
