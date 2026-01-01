"use client";

import { useState } from "react";
import { useAccess } from "@/components/auth/AccessProvider";
import { Loader2, Check, Lock, ExternalLink } from "lucide-react";

interface AccessCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AccessCodeModal({ isOpen, onClose }: AccessCodeModalProps) {
    const { validateAccessCode, isPro } = useAccess();
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({
        type: 'idle',
        message: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: "Validating code..." });

        const result = await validateAccessCode(code);

        if (result.success) {
            setStatus({ type: 'success', message: result.message });
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setStatus({ type: 'error', message: result.message });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative">

                {/* Header */}
                <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold relative z-10">Pro Access Locked</h2>
                    <p className="text-indigo-100 text-sm mt-1 relative z-10">Get your code to unlock unlimited offers</p>
                </div>

                {/* Trial Message */}
                <div className="bg-orange-50 p-3 text-center text-orange-700 text-xs font-semibold border-b border-orange-100">
                    Your 3 free daily uses are over!
                </div>

                <div className="p-6 space-y-6">
                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="font-bold text-slate-700">Monthly Plan</h3>
                                    <p className="text-xs text-slate-400">Perfect for starters</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-indigo-600">₹99</div>
                                    <div className="text-[10px] text-slate-400">/month</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="font-bold text-slate-700">6 Months</h3>
                                    <p className="text-xs text-slate-400">Save 20% instantly</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-indigo-600">₹469</div>
                                    <div className="text-[10px] text-slate-400">/6 months</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50/50 hover:bg-amber-50 transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-widest">
                                Best Value
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="font-bold text-amber-900">Yearly Pro</h3>
                                    <p className="text-xs text-amber-700/70">Maximum savings</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-amber-600">₹949</div>
                                    <div className="text-[10px] text-amber-700/50">/year</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Access Code Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-dashed">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex justify-between">
                                <span>Have a Code?</span>
                                <a href="https://wa.me/919876543210?text=I%20want%20to%20buy%20OfferMitra%20Pro" target="_blank" className="text-indigo-500 hover:text-indigo-600">Buy Code on WhatsApp &rarr;</a>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="Enter Code Here"
                                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-mono font-bold uppercase focus:border-indigo-500 outline-none transition-all"
                                    disabled={status.type === 'loading' || status.type === 'success'}
                                />
                                <button
                                    type="submit"
                                    disabled={status.type === 'loading' || status.type === 'success' || !code}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center"
                                >
                                    {status.type === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : status.type === 'success' ? (
                                        <Check className="w-5 h-5" />
                                    ) : "Unlock"}
                                </button>
                            </div>
                        </div>

                        {status.message && (
                            <p className={`text-center text-xs font-bold ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {status.message}
                            </p>
                        )}
                    </form>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 text-xs text-gray-400 hover:text-gray-600 font-medium bg-slate-50 border-t border-slate-100"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
}
