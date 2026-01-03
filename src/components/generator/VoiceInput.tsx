"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    lang?: string; // 'hi-IN' or 'en-IN'
}

export default function VoiceInput({ onTranscript, lang = 'hi-IN' }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!isSupported) {
            alert("Voice input is not supported in this browser. Please use Chrome.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        setIsListening(true);

        // @ts-expect-error - Web Speech API types not always available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={cn(
                "p-4 rounded-2xl transition-all shadow-sm active:scale-90",
                isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20"
                    : "bg-slate-100 text-primary hover:bg-slate-200"
            )}
            title="Tap to speak"
        >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
    );
}
