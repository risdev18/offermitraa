"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2, Check } from "lucide-react";
import { useState } from "react";

// Mock Razorpay type
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLANS = [
    { id: "p_99", name: "Monthly", price: 99, duration: "1 Month" },
    { id: "p_249", name: "Quarterly", price: 249, duration: "3 Months" },
    { id: "p_949", name: "Yearly", price: 949, duration: "1 Year" },
];

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
    const { user, upgradeToPremium } = useAuth(); // We need to add upgradeToPremium to AuthContext
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async (plan: typeof PLANS[0]) => {
        setProcessing(true);

        try {
            // 1. Create Order on Server
            const orderRes = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: plan.price,
                    planId: plan.id,
                }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok || orderData.error) {
                throw new Error(orderData.error || "Failed to create order");
            }

            // 2. Open Razorpay Checkout
            // Check if Razorpay is loaded
            if (typeof window.Razorpay === 'undefined') {
                alert("Razorpay SDK not loaded. Please check your internet connection.");
                setProcessing(false);
                return;
            }

            const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

            if (!keyId || keyId === "rzp_test_placeholder") {
                // Simulation for Demo if keys are missing
                setTimeout(() => {
                    upgradeToPremium().then(() => {
                        setProcessing(false);
                        onClose();
                        alert("Premium Activated! (Demo Mode Success) 🚀");
                    });
                }, 1000);
                return;
            }

            const options = {
                key: keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "OfferMitra",
                description: `Premium Subscription - ${plan.name}`,
                order_id: orderData.id,
                handler: function (response: any) {
                    // Payment Success
                    console.log("Payment Success:", response);

                    // Update user profile in DB
                    upgradeToPremium().then(() => {
                        setProcessing(false);
                        onClose();
                        alert("Subscription Successful! 🎉");
                    });
                },
                prefill: {
                    name: user?.displayName || "",
                    email: user?.email || "",
                    contact: user?.phoneNumber || "",
                },
                theme: {
                    color: "#4F46E5",
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response: any) {
                console.error("Payment Failed:", response.error);
                alert(`Payment Failed: ${response.error.description}`);
                setProcessing(false);
            });

        } catch (err: any) {
            console.error("Razorpay Error", err);
            alert(err.message || "An error occurred during payment");
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative">

                {/* Header */}
                <div className="bg-indigo-600 p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <h2 className="text-2xl font-bold relative z-10">Upgrade to Pro 🚀</h2>
                    <p className="text-indigo-100 text-sm mt-1 relative z-10">Unlock Unlimited Offers</p>
                </div>

                {/* Limit Message */}
                <div className="bg-orange-50 p-2 text-center text-orange-700 text-xs font-semibold border-b border-orange-100">
                    You've used your 3 free daily offers!
                </div>

                {/* Plans */}
                <div className="p-6 space-y-3">
                    {PLANS.map((plan) => (
                        <div key={plan.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group" onClick={() => handlePayment(plan)}>
                            <div>
                                <h3 className="font-bold text-gray-800 group-hover:text-indigo-700">{plan.name}</h3>
                                <p className="text-xs text-gray-500">{plan.duration}</p>
                            </div>
                            <div className="bg-gray-100 group-hover:bg-white px-3 py-1 rounded-lg text-gray-900 font-bold shadow-sm">
                                ₹{plan.price}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Features */}
                <div className="px-6 pb-6 space-y-2">
                    {["Unlimited AI Generations", "Remove Watermark", "Priority Support"].map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" /> {feat}
                        </div>
                    ))}
                </div>

                {/* Mock Button for Dev */}
                <div className="px-6 pb-4">
                    <button onClick={() => { upgradeToPremium(); onClose(); }} className="w-full text-xs text-gray-300 hover:text-gray-500 underline">
                        [Dev Only] Bypass Payment
                    </button>
                </div>

            </div>
        </div>
    );
}
