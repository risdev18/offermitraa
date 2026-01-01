"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import VideoGenerator from "@/components/preview/VideoGenerator";
import { Loader2, Sparkles } from "lucide-react";

export default function SharedVideoPage() {
    const params = useParams();
    const dataString = params.data as string;
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        try {
            // Decode base64 to JSON
            const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(dataString)))));
            setData(decoded);
        } catch (e) {
            console.error("Failed to decode share data", e);
            setError(true);
        }
    }, [dataString]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-10 text-center">
                <h1 className="text-4xl font-black mb-4">Invalid Link</h1>
                <p className="text-slate-400">This offer link seems to be broken or invalid.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-8 px-10 py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                    Go to Home
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
            {/* Branding for recipient */}
            <div className="mb-10 text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-black text-[10px] uppercase tracking-widest">Shared via OfferMitra</span>
                </div>
                <h1 className="text-white/40 font-black text-[8px] uppercase tracking-[0.5em] mt-4">AI Video Marketing Suite</h1>
            </div>

            {/* Action Buttons for Viewers */}
            {(data.contactNumber || data.address) && (
                <div className="flex gap-4 mb-8 w-full max-w-lg">
                    {data.contactNumber && (
                        <a href={`tel:${data.contactNumber}`} className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                            📞 Call Shop
                        </a>
                    )}
                    {data.address && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                            📍 Directions
                        </a>
                    )}
                </div>
            )}

            <div className="w-full max-w-lg">
                <VideoGenerator
                    offerText={data.offerText}
                    productName={data.productName}
                    discount={data.discount}
                    shopType={data.shopType}
                    shopName={data.shopName}
                    language={data.language}
                    address={data.address}
                    contactNumber={data.contactNumber}
                    videoScript={data.videoScript}
                    videoTitles={data.videoTitles}
                />
            </div>

            <div className="mt-12 text-center">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-6">Create your own viral ads in 10 seconds</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-12 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all"
                >
                    Start Now - It's Free 🚀
                </button>
            </div>
        </main>
    );
}
