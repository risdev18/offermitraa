"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const languages = [
    { code: "hi", name: "हिंदी", label: "Hindi" },
    { code: "mr", name: "मराठी", label: "Marathi" },
    { code: "en", name: "English", label: "English" },
]

export function LanguageSelector({ onSelect }: { onSelect: (lang: string) => void }) {
    return (
        <Card className="w-full max-w-sm mx-auto border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Select Language</CardTitle>
                <p className="text-muted-foreground">भाषा निवडा / भाषा चुनें</p>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
                {languages.map((lang) => (
                    <Button
                        key={lang.code}
                        variant="outline"
                        className="h-16 text-xl justify-between px-6 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                        onClick={() => onSelect(lang.code)}
                    >
                        <span className="font-bold">{lang.name}</span>
                        <span className="text-base text-muted-foreground font-normal">{lang.label}</span>
                    </Button>
                ))}
            </CardContent>
        </Card>
    )
}
