"use client"

import { ReactNode } from "react"
import { useUserStore } from "@/lib/store/useUserStore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Users,
    ShieldCheck,
    FileText,
    LayoutDashboard,
    Settings,
    LogOut,
    Car,
    Bell
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { user, logout } = useUserStore()
    const router = useRouter()
    const pathname = usePathname()

    if (!user || user.role !== 'admin') {
        return null
    }

    const navItems = [
        { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
        { label: 'Driver Approvals', icon: ShieldCheck, href: '/admin/drivers' },
        { label: 'Passenger List', icon: Users, href: '/admin/passengers' },
        { label: 'Ride History', icon: FileText, href: '/admin/rides' },
    ]

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Sidebar - Persistent for Desktop, hidden on mobile */}
            <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl z-20">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="text-black h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter">SMARTH<span className="text-primary italic">ADMIN</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Console</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 rounded-xl text-sm font-black transition-all group ${isActive ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600">AD</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate">Rishabh Admin</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase truncate">Super Control</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-12 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black"
                        onClick={() => logout()}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        LOGOUT
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
                            {navItems.find(n => n.href === pathname)?.label || 'Console'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative rounded-xl border border-slate-200 dark:border-slate-800 h-10 w-10">
                            <Bell className="h-5 w-5 text-slate-500" />
                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></div>
                        </Button>
                        <div className="hidden lg:block text-right">
                            <p className="text-xs font-black">19 Jan, 2026</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">System Online</p>
                        </div>
                    </div>
                </header>

                {/* Scrollable Viewport */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
