"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Mic, Volume2, VolumeX, Loader2, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function RishabhChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Namaste! I am Rishabh, your personal marketing assistant. How can I help you grow your business today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim() || isLoading) return;

        const newMessages = [...messages, { role: "user" as const, content: messageText }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: messageText,
                    shopName: "User",
                    extraInfo: "Chat interaction with Rishabh AI Assistant",
                    language: "hinglish",
                    cta: "Ask more"
                }),
            });

            const data = await res.json();
            if (data.text) {
                setMessages([...newMessages, { role: "assistant", content: data.text }]);
                if (isSpeaking) {
                    speak(data.text);
                }
            } else {
                setMessages([...newMessages, { role: "assistant", content: "I'm having a little trouble thinking right now. Could you try again?" }]);
            }
        } catch (error) {
            setMessages([...newMessages, { role: "assistant", content: "Error connecting to the brain. Please check your internet!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            utterance.lang = "hi-IN";
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            // @ts-ignore
            window.recognition.stop();
            setIsListening(false);
        } else {
            // @ts-ignore
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = "hi-IN";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                handleSend(transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognition.start();
            // @ts-ignore
            window.recognition = recognition;
        }
    };

    return (
        <>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[60] p-4 bg-indigo-600 text-white rounded-full shadow-[0_10px_40px_rgba(79,70,229,0.4)] border-2 border-white/20"
            >
                <MessageSquare className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className="fixed bottom-24 right-6 z-[60] w-[400px] h-[600px] bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pro-gradient flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black tracking-tight">Rishabh AI</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsSpeaking(!isSpeaking)}
                                    className={cn(
                                        "p-2 rounded-xl transition-all",
                                        isSpeaking ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/40"
                                    )}
                                >
                                    {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
                        >
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex flex-col max-w-[85%]",
                                        m.role === 'user' ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-lg",
                                        m.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-slate-900 text-indigo-100 border border-white/5 rounded-tl-none"
                                    )}>
                                        {m.content}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-30 px-2">
                                        {m.role === 'user' ? 'YOU' : 'Rishabh AI'}
                                    </span>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-3">
                                    <div className="p-4 bg-slate-900 rounded-[1.5rem] rounded-tl-none border border-white/5 flex gap-1">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-slate-950 border-t border-white/5">
                            <div className="relative flex items-center gap-3">
                                <button
                                    onClick={toggleListening}
                                    className={cn(
                                        "p-4 rounded-2xl transition-all shadow-lg",
                                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                                    )}
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask Rishabh anything..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-white/20"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
