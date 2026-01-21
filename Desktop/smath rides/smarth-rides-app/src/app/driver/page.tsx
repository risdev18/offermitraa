"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/store/useUserStore"

export default function DriverRedirect() {
    const router = useRouter()
    const { user } = useUserStore()

    useEffect(() => {
        if (!user) {
            router.push("/")
        } else if (user.role === 'driver') {
            router.push("/driver/dashboard")
        } else {
            router.push("/passenger")
        }
    }, [user, router])

    return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Redirecting...</div>
}
