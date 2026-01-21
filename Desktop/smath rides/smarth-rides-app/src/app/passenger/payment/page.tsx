"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, Star, ThumbsUp, CheckCircle } from "lucide-react"

export default function PaymentFeedback() {
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [paid, setPaid] = useState(false)

    if (paid) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 bg-success text-white text-center space-y-6">
                <CheckCircle className="h-24 w-24" />
                <h1 className="text-4xl font-black">Ride Completed!</h1>
                <p className="text-xl opacity-90">Thank you for riding with Smarth.</p>
                <Button
                    className="w-full bg-white text-success hover:bg-white/90 font-bold text-lg h-14"
                    onClick={() => router.push('/passenger')}
                >
                    Book New Ride
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/20 p-6 flex flex-col justify-end md:justify-center">
            <Card className="shadow-2xl border-0">
                <CardHeader className="text-center border-b pb-6">
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mb-2">Total Fare</p>
                    <h1 className="text-5xl font-black flex items-center justify-center text-foreground">
                        <IndianRupee className="h-8 w-8" /> 85
                    </h1>
                    <p className="text-xs text-success font-bold mt-2 flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Includes all taxes
                    </p>
                </CardHeader>

                <CardContent className="space-y-8 pt-8">
                    {/* Payment Methods */}
                    <div className="space-y-3">
                        <h3 className="font-bold">Select Payment Method</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-20 flex flex-col gap-1 hover:border-primary hover:bg-primary/5">
                                <span className="text-2xl">💵</span>
                                Cash
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col gap-1 hover:border-primary hover:bg-primary/5">
                                <span className="text-2xl">📱</span>
                                UPI
                            </Button>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-3 text-center">
                        <h3 className="font-bold">Rate Driver: Raju</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-2 transition-transform hover:scale-110 active:scale-95`}
                                >
                                    <Star
                                        className={`h-10 w-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {['Safe Driving', 'Polite', 'Clean Auto'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-full h-16 text-xl shadow-lg"
                        onClick={() => setPaid(true)}
                        disabled={rating === 0}
                    >
                        Pay & Submit
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
