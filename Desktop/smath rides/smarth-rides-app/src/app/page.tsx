"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Lock, ArrowRight, User, Phone, Car, MapPin, ShieldCheck, UserCircle } from "lucide-react"
import { authService, UserRole } from "@/lib/services/authService"
import { useUserStore } from "@/lib/store/useUserStore"
import { motion, AnimatePresence } from "framer-motion"

export default function UnifiedAuth() {
  const router = useRouter()
  const { user, setUser } = useUserStore()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<UserRole>('passenger')

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    vehicleNumber: ""
  })

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'driver') router.push("/driver/dashboard");
      else if (user.role === 'admin') router.push("/admin/drivers");
      else router.push("/passenger");
    }
  }, [user, router])

  const handleAuth = async () => {
    const identifier = formData.phone
    if (!identifier || !formData.password) return
    if (!isLogin && !formData.name) return

    setLoading(true)
    try {
      if (isLogin) {
        let finalIdentifier = identifier
        if (role !== 'admin' && /^\d{10}$/.test(identifier)) {
          finalIdentifier = "+91 " + identifier
        }

        const u = await authService.login(finalIdentifier, formData.password, role)
        if (u) {
          const userStatus = (u as any).status || (u as any).verificationStatus || (u.role === 'driver' ? 'incomplete' : 'approved')
          setUser({
            id: u.id || "",
            name: u.name,
            phone: u.phone,
            role: u.role,
            vehicleNumber: u.vehicleNumber,
            isApproved: u.isApproved,
            status: userStatus
          })
        } else {
          alert(`Invalid ${role} credentials. Please check your details.`)
        }
      } else {
        await authService.register({
          name: formData.name,
          phone: "+91 " + formData.phone,
          password: formData.password,
          role: role,
          vehicleNumber: role === 'driver' ? formData.vehicleNumber : undefined
        })
        alert("Account Created! You can now login.")
        setIsLogin(true)
      }
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Auth Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-40"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-[440px] space-y-8"
      >
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-1.5 rounded-full"
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Production v2.0</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2">
            SMARTH<span className="text-primary italic">RIDES</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm tracking-wide">Premium Urban Mobility Redefined</p>
        </div>

        {/* Auth Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-1">

          {/* Professional Segmented Control (Tabs) */}
          <div className="bg-slate-950/50 p-2 flex rounded-[2rem] border-b border-white/5">
            {[
              { id: 'passenger', label: 'Passenger', icon: UserCircle },
              { id: 'driver', label: 'Driver', icon: Car },
              isLogin ? { id: 'admin', label: 'Admin', icon: ShieldCheck } : null
            ].filter(Boolean).map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setRole(tab.id as UserRole)}
                className={`flex-1 relative flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] transition-all duration-300 z-10 ${role === tab.id ? 'text-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {role === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-[1.5rem] -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`h-4 w-4 ${role === tab.id ? 'text-black' : 'text-slate-500'}`} />
                <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{isLogin ? "Welcome Back" : "Join the Platform"}</h2>
                <p className="text-slate-500 text-sm">{isLogin ? "Please sign in to continue" : "Create a new professional account"}</p>
              </div>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-primary hover:underline underline-offset-4 decoration-2"
              >
                {isLogin ? "Create Account" : "Back to Login"}
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="group space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 transition-colors group-focus-within:text-primary" />
                        <Input
                          placeholder="Ex: Rajesh Kumar"
                          className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl pl-14 font-bold focus:border-primary focus:bg-slate-950 transition-all border-2"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    {role === 'driver' && (
                      <motion.div className="group space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Auto PV Number</label>
                        <div className="relative">
                          <Car className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-primary" />
                          <Input
                            placeholder="MH 12 AB 1234"
                            className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl pl-14 font-bold focus:border-primary focus:bg-slate-950 transition-all border-2 uppercase"
                            value={formData.vehicleNumber}
                            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="group space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                  {role === 'admin' ? 'Secret Identity' : 'Mobile Number'}
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-slate-600 group-focus-within:text-primary" />
                    {role !== 'admin' && <span className="text-slate-500 font-bold text-sm">+91</span>}
                  </div>
                  <Input
                    placeholder={role === 'admin' ? "Admin ID" : "00000 00000"}
                    maxLength={role === 'admin' ? 30 : 10}
                    className={`h-14 bg-slate-950/50 border-slate-800 rounded-2xl font-bold focus:border-primary focus:bg-slate-950 transition-all border-2 text-lg ${role !== 'admin' ? 'pl-[4.5rem] tracking-widest' : 'pl-14'}`}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: role === 'admin' ? e.target.value : e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="group space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-primary" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl pl-14 font-bold focus:border-primary focus:bg-slate-950 transition-all border-2"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full h-16 bg-primary text-black font-black text-xl rounded-2xl shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] mt-4"
              onClick={handleAuth}
              disabled={loading || !formData.phone || !formData.password}
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <span className="flex items-center gap-2 tracking-tight">
                  {isLogin ? "GO ONLINE" : "REGISTER AS DRIVER"} <ArrowRight className="h-6 w-6" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center space-y-3 px-12">
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            Secure enterprise infrastructure powered by <span className="text-slate-400 font-bold">Smarth Intelligence</span>. Data encryption active.
          </p>
          <div className="flex flex-col gap-1 text-[10px] text-slate-600 font-bold">
            <p>📞 Support: <span className="text-primary">+91 84689 43268</span></p>
            <p>📧 Email: <span className="text-primary">saffarlabs@gmail.com</span></p>
          </div>
          <p className="text-[9px] text-slate-700 uppercase tracking-widest">✓ Live GPS Tracking Available</p>
        </div>
      </motion.div>
    </div>
  )
}
