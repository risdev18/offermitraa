"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Upload,
    CheckCircle,
    FileText,
    AlertCircle,
    ArrowLeft,
    ShieldCheck,
    Trash2,
    Eye,
    Loader2,
    Sparkles,
    Lock
} from "lucide-react"
import { useUserStore } from "@/lib/store/useUserStore"
import { storageService } from "@/lib/services/storageService"
import { driverService } from "@/lib/services/driverService"
import { notificationService } from "@/lib/services/notificationService"
import { motion, AnimatePresence } from "framer-motion"

export default function DriverDocuments() {
    const router = useRouter()
    const { user, setUser } = useUserStore()
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState("")

    // Document State
    const [uploads, setUploads] = useState<{ [key: string]: { file: File, preview: string } }>({})

    const documentConfigs = [
        { id: 'licenseUrl', label: 'Driving License', icon: FileText, desc: 'Clear photo of the front side' },
        { id: 'rcBookUrl', label: 'RC Book (Vehicle Registration)', icon: ShieldCheck, desc: 'Registration Certificate front' },
        { id: 'insuranceUrl', label: 'Insurance Copy', icon: Lock, desc: 'Valid insurance document' }
    ]

    const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const preview = URL.createObjectURL(file)
            setUploads(prev => ({ ...prev, [docId]: { file, preview } }))
        }
    }

    const removeFile = (docId: string) => {
        setUploads(prev => {
            const next = { ...prev }
            delete next[docId]
            return next
        })
    }

    const handleSubmit = async () => {
        if (!user) return
        if (Object.keys(uploads).length < 3) {
            alert("Please upload all 3 required documents.")
            return
        }

        setUploading(true)
        try {
            const documentUrls: any = {}
            const docKeys = Object.keys(uploads)

            for (let i = 0; i < docKeys.length; i++) {
                const docId = docKeys[i]
                const docConfig = documentConfigs.find(d => d.id === docId)
                setUploadProgress(`Optimizing ${docConfig?.label}... (${i + 1}/${docKeys.length})`)

                try {
                    // Using our Base64/Direct Storage logic
                    const base64Data = await storageService.uploadDriverDocument(
                        user.id,
                        docId,
                        uploads[docId].file
                    )
                    documentUrls[docId] = base64Data
                } catch (err: any) {
                    throw new Error(`Failed to process ${docConfig?.label}.`)
                }
            }

            setUploadProgress("Syncing with Global Database...")
            await driverService.updateDriverDocuments(user.id, documentUrls)

            // TRIGGER GMAIL NOTIFICATION
            setUploadProgress("Notifying Admin via Gmail...")
            await notificationService.sendNewDriverNotification({
                name: user.name,
                phone: user.phone,
                vehicleNumber: user.vehicleNumber,
                documents: documentUrls
            })

            // Sync local state
            setUser({ ...user, status: 'pending', isApproved: false })

            setUploadProgress("All Systems Verified!")
            setTimeout(() => {
                router.push("/driver/dashboard")
            }, 1000)

        } catch (e: any) {
            console.error("Submission Error:", e)
            setUploadProgress("Verification Failed")
            alert(`APPLICATION ERROR: ${e.message || "Connection lost during sync"}. Please ensure your photos are clear and try again.`)
        } finally {
            setUploading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-6 lg:p-12 selection:bg-primary selection:text-black">

            {/* Header Area */}
            <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="p-0 text-slate-500 hover:text-white transition-colors h-auto flex items-center gap-2 mb-4 group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to Hub</span>
                    </Button>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Vetting & <br /> Verification</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Enterprise Compliance Standard v4.0</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center ring-2 ring-primary/20">
                        <CheckCircle className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                        <h2 className="text-lg font-black uppercase italic tracking-tight leading-none text-white">Action Required</h2>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {documentConfigs.map((doc, idx) => {
                    const upload = uploads[doc.id]
                    return (
                        <Card key={doc.id} className="bg-slate-900/40 border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all relative">
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="p-8 pb-4">
                                    <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                                        <doc.icon className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">{doc.label}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{doc.desc}</p>
                                </div>

                                <div className="flex-1 px-8 pb-8 flex flex-col justify-end">
                                    {upload ? (
                                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/5 group/preview">
                                            <img src={upload.preview} alt="Upload Preview" className="h-full w-full object-cover grayscale group-hover/preview:grayscale-0 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-white/20 bg-black/40 backdrop-blur" onClick={() => removeFile(doc.id)}>
                                                    <Trash2 className="h-5 w-5 text-red-500" />
                                                </Button>
                                            </div>
                                            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-lg">
                                                <CheckCircle className="h-4 w-4 text-black" />
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary/20">
                                                    <Upload className="h-5 w-5 text-slate-500 group-hover:text-primary" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-600 group-hover:text-primary uppercase tracking-widest">Select Image</span>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(doc.id, e)} />
                                        </label>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="max-w-4xl mx-auto mt-12">
                <div className="bg-slate-900 border border-white/5 p-8 md:p-12 rounded-[3.5rem] relative overflow-hidden">
                    <div className="absolute -top-12 -right-12">
                        <ShieldCheck className="text-white/5 h-48 w-48 rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Enterprise Guarantee</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xl">By submitting these documents, you confirm they are original and legally valid under Indian Motor Vehicles Act. Documents are encrypted and handled by Smarth Rides Secure Core.</p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <Button
                                className="w-full md:flex-1 h-20 bg-primary text-black font-black text-2xl rounded-3xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all relative overflow-hidden group"
                                onClick={handleSubmit}
                                disabled={uploading}
                            >
                                <span className={`${uploading ? 'opacity-0' : 'opacity-100'} flex items-center gap-3 relative z-10`}>
                                    SUBMIT VERIFICATION <Sparkles className="h-6 w-6 group-hover:animate-pulse" />
                                </span>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-black" />
                                    </div>
                                )}
                            </Button>

                            {uploading && (
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] animate-pulse">{uploadProgress}</p>
                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                        <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/3 bg-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <p className="max-w-4xl mx-auto text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-12 py-8 border-t border-white/5">
                Privacy Protected Connection • Smarth Rides India 2026
            </p>
        </div>
    )
}
