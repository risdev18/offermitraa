"use client"

import { useState, useEffect } from "react"
import { driverService, DriverData } from "@/lib/services/driverService"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    FileText,
    User,
    Phone,
    Car,
    ShieldCheck,
    Search,
    Filter,
    ChevronRight,
    ArrowUpRight,
    MapPin
} from "lucide-react"

export default function AdminDriversPage() {
    const [drivers, setDrivers] = useState<DriverData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const unsubscribe = driverService.listenToDrivers((updatedDrivers) => {
            setDrivers(updatedDrivers)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleStatusChange = async (driverId: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this driver?`)) return
        try {
            await driverService.verifyDriver(driverId, status)
            setSelectedDriver(null)
        } catch (e: any) {
            alert("Error updating status: " + e.message)
        }
    }

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm)
    )

    // Modal to show Base64 image
    const PreviewModal = () => {
        if (!previewUrl) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in" onClick={() => setPreviewUrl(null)}>
                <div className="relative max-w-5xl max-h-[90vh] w-full bg-slate-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <FileText className="text-primary h-5 w-5" />
                            </div>
                            <h3 className="font-black uppercase tracking-tight">Document Verification</h3>
                        </div>
                        <Button variant="ghost" className="rounded-full h-10 w-10 hover:bg-white/10" onClick={() => setPreviewUrl(null)}>
                            <XCircle className="w-6 h-6" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
                        <img src={previewUrl} alt="Document" className="max-w-full h-auto rounded-xl shadow-2xl" />
                    </div>
                    <div className="p-6 border-t border-white/5 bg-slate-900/50 text-center">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Enterprise Document Viewer High-Security Connection</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20">
            <PreviewModal />

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Drivers', value: drivers.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Pending Approval', value: drivers.filter(d => d.status === 'pending').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Verified', value: drivers.filter(d => d.status === 'approved').length, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Fleet Active', value: drivers.filter(d => d.status === 'online').length, icon: Car, color: 'text-primary', bg: 'bg-primary/10' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden group">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* List Panel */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 pl-4 rounded-[2rem] shadow-sm">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            placeholder="Search by name, phone or vehicle..."
                            className="bg-transparent flex-1 outline-none font-bold text-sm h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="ghost" className="rounded-2xl h-10 px-4 text-slate-500 font-black text-[10px] uppercase">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {filteredDrivers.map(d => (
                            <div
                                key={d.id}
                                onClick={() => setSelectedDriver(d)}
                                className={`flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border ${selectedDriver?.id === d.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'} rounded-[1.8rem] transition-all cursor-pointer group animate-in slide-in-from-left duration-300`}
                            >
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm relative">
                                    <User className="h-8 w-8 text-slate-400" />
                                    {d.status === 'online' && <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-slate-900"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white truncate uppercase tracking-tight">{d.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${d.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {d.status || 'NEW'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold tracking-wide">{d.phone} • {d.vehicleNumber || 'No VH'}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <ArrowUpRight className={`h-5 w-5 transition-all ${selectedDriver?.id === d.id ? 'text-primary transform rotate-45 scale-125' : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1'}`} />
                                    <p className="text-[10px] font-medium text-slate-400">{new Date(d.createdAt as any).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="w-full lg:w-[460px]">
                    {selectedDriver ? (
                        <div className="sticky top-8 space-y-6">
                            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden ring-1 ring-slate-100">
                                <div className="h-32 bg-slate-50 dark:bg-slate-800 relative">
                                    <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-3xl bg-white dark:bg-slate-900 border-8 border-white dark:border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
                                        <User className="h-12 w-12 text-slate-300" />
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Button size="sm" variant="outline" className="rounded-xl h-9 bg-white/20 backdrop-blur text-xs font-black border-white/20" onClick={() => setSelectedDriver(null)}>
                                            <ChevronRight className="rotate-180 h-4 w-4 mr-1" /> BACK
                                        </Button>
                                    </div>
                                </div>

                                <CardContent className="pt-16 pb-8 px-8 space-y-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Driver Profile</p>
                                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">{selectedDriver.name}</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase">
                                                <Phone className="h-3.5 w-3.5" /> {selectedDriver.phone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase">
                                                <Car className="h-3.5 w-3.5" /> {selectedDriver.vehicleNumber || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                                            <FileText className="h-4 w-4 text-primary" /> Verification Documents
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Driving License', key: 'licenseUrl' },
                                                { label: 'RC Book Front', key: 'rcBookUrl' },
                                                { label: 'Insurance Copy', key: 'insuranceUrl' }
                                            ].map((docType) => {
                                                const url = selectedDriver.documents?.[docType.key as keyof typeof selectedDriver.documents];
                                                const isUploaded = !!url;
                                                return (
                                                    <div key={docType.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl group transition-all hover:bg-white dark:hover:bg-slate-700">
                                                        <div>
                                                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{docType.label}</span>
                                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isUploaded ? 'text-green-500' : 'text-slate-400'}`}>
                                                                {isUploaded ? '✓ SYNCED' : 'NOT FOUND'}
                                                            </p>
                                                        </div>
                                                        {isUploaded ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9 px-4 rounded-xl font-black bg-white dark:bg-slate-900 text-primary border-primary/20 hover:bg-primary shadow-sm active:scale-95 transition-all text-[10px] uppercase"
                                                                onClick={() => setPreviewUrl(url as string)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" /> View
                                                            </Button>
                                                        ) : (
                                                            <div className="text-[10px] text-slate-400 font-black italic opacity-50">MISSING</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Box */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-16 rounded-3xl shadow-xl shadow-green-500/10 active:scale-[0.98] transition-all text-lg tracking-tight uppercase"
                                            onClick={() => handleStatusChange(selectedDriver.id!, 'approved')}
                                            disabled={selectedDriver.status === 'approved'}
                                        >
                                            <CheckCircle className="mr-3 h-6 w-6" /> APPROVE DRIVER
                                        </Button>
                                        <Button
                                            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-500 font-black h-16 rounded-3xl active:scale-[0.98] transition-all text-lg tracking-tight uppercase"
                                            onClick={() => handleStatusChange(selectedDriver.id!, 'rejected')}
                                            disabled={selectedDriver.status === 'rejected'}
                                        >
                                            <XCircle className="mr-3 h-6 w-6" /> REJECT APPLICATION
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-400 space-y-4 bg-slate-50/50 dark:bg-slate-900/20 animate-pulse">
                            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <User className="h-10 w-10 text-slate-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-black uppercase tracking-widest text-sm">Selection Required</p>
                                <p className="text-xs font-medium text-slate-400">Choose a driver from the left to manage</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Users(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
