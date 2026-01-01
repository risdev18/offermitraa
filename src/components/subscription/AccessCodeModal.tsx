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
                    {/* Access Code Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                Enter Access Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="e.g. OM-PRO-XXXXX"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-lg font-mono font-bold text-center focus:border-indigo-500 outline-none transition-all"
                                disabled={status.type === 'loading' || status.type === 'success'}
                            />
                        </div>

                        {status.message && (
                            <p className={`text-center text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {status.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status.type === 'loading' || status.type === 'success' || !code}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                            {status.type === 'loading' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : status.type === 'success' ? (
                                <Check className="w-5 h-5" />
                            ) : "Unlock Now"}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400 font-bold">OR</span>
                        </div>
                    </div>

                    {/* Buy Section */}
                    <div className="text-center space-y-4 pb-2">
                        <p className="text-sm text-gray-500">Don't have a code yet?</p>
                        <a
                            href="https://forms.gle/your-google-form-link" // Replace with actual link
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                        >
                            Get Pro Access Code <ExternalLink className="w-4 h-4" />
                        </a>
                        <p className="text-[10px] text-gray-400 mt-2">
                            Manual payment via UPI handled on the next page.
                        </p>
                    </div>
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
