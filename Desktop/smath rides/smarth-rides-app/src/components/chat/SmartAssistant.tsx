"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function SmartAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I am your Smarth Rides AI Assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, loading])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        // Mock AI Response Logic
        setTimeout(() => {
            let botResponse = "I'm still learning about Smarth Rides logistics. Could you please rephrase that?"
            const query = input.toLowerCase()

            if (query.includes("book") || query.includes("ride")) {
                botResponse = "To book a ride, go to the Passenger tab, enter your destination in 'Where To?', and confirm your fare estimate!"
            } else if (query.includes("driver") || query.includes("register")) {
                botResponse = "Drivers can register via the Driver tab. You'll need to upload your License, RC Book, and Insurance for verification."
            } else if (query.includes("verify") || query.includes("pending")) {
                botResponse = "Verification usually takes 2-4 hours. Our admins review documents for safety and compliance."
            } else if (query.includes("clear") || query.includes("reset")) {
                botResponse = "Data reset requests can be handled via the Admin panel's System Settings."
            } else if (query.includes("earning") || query.includes("450")) {
                botResponse = "The earnings display in the prototype might be static. In a live system, your earnings update instantly after every completed trip."
            } else if (query.includes("hello") || query.includes("hi")) {
                botResponse = "Namaste! I am Smarth Rides Assistant. Ready to get you moving!"
            }

            const botMsg: Message = { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }
            setMessages(prev => [...prev, botMsg])
            setLoading(false)
        }, 1200)
    }

    return (
        <>
            {/* FLOATING ACTION BUTTON */}
            <motion.div
                className="fixed bottom-6 right-6 z-[1000]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-16 w-16 rounded-full bg-primary text-black shadow-2xl shadow-primary/20 flex items-center justify-center p-0 border-4 border-slate-900"
                >
                    {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
                    {!isOpen && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-slate-950">1</span>
                    )}
                </Button>
            </motion.div>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[600px] bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-2xl z-[1000] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-black rounded-2xl flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-black font-black uppercase italic tracking-tight leading-none">Smart Assistant</h3>
                                    <p className="text-black/60 text-[10px] font-black uppercase tracking-widest mt-1">Live AI Support</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-full text-black/40 text-[10px] font-bold">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-slate-900 text-slate-400'}`}>
                                            {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-black rounded-tr-none' : 'bg-slate-900 text-slate-300 rounded-tl-none'}`}>
                                            {msg.text}
                                            <p className={`text-[9px] mt-2 font-bold uppercase opacity-40 ${msg.sender === 'user' ? 'text-black' : 'text-slate-500'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center">
                                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                        </div>
                                        <div className="bg-slate-900 p-4 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-slate-900/50 border-t border-white/5">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your question..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 h-14 bg-slate-950 border border-white/5 rounded-2xl px-6 outline-none focus:border-primary/30 transition-all text-white placeholder:text-slate-700 font-medium"
                                />
                                <Button
                                    onClick={handleSend}
                                    className="h-14 w-14 rounded-2xl bg-primary text-black p-0 hover:bg-white transition-colors"
                                >
                                    <Send className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
