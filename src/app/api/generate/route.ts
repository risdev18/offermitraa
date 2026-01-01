import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { shopName, productName, discount, extraInfo, language, address, catalogLink, businessType, cta } = await req.json();
        const isChat = extraInfo?.includes("Chat interaction");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            // Mock Response for Demo/Guest Mode
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay

            if (isChat) {
                if (productName.toLowerCase().includes("happy new year")) {
                    return NextResponse.json({ text: "✨ Happy New Year! 🎆 May this year bring massive growth and success to your business. How can I help you plan your New Year marketing today? 🚀" });
                }
                return NextResponse.json({
                    text: `I understand you're asking about "${productName}". As your Rishabh AI assistant, I recommend running a limited-time offer to boost engagement! Shall we create a poster for this?`
                });
            }

            return NextResponse.json({
                text: `✨ *${shopName || "Special Offer"}* ✨\n\nAb paaiye *${productName || "Behtareen Products"}* behtareen daamo par!\n\n🔥 ${discount ? `Flat ${discount} OFF!` : "Dhamaka Offer!"}\n📍 ${address || "Visit us today"}\n\nJaldi aayein! 🏃‍♂️💨`
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let systemPrompt = "";
        let userMessage = "";

        if (isChat) {
            systemPrompt = `You are Rishabh, a brilliant and friendly Indian Marketing Expert AI Assistant. 
            Your goal is to help shop owners with marketing advice, ideas, and general conversation.
            - Tone: Extremely helpful, professional yet friendly, and encouraging.
            - Language: Use the requested language (${language}). If Hinglish, use professional Roman Hindi.
            - If the user greets you (e.g., Happy New Year, Hello), respond warmly and professionally.
            - Keep responses concise and focused on business/marketing growth.`;

            userMessage = `User said: "${productName}"\nRespond as Rishabh AI Assistant.`;
        } else {
            systemPrompt = `You are an expert Indian Retail Marketing Consultant and Copywriter.
            YOUR GOAL: Take the user's RAW input (which may be messy, mixed Hindi/English, or casual notes) and transform it into a HIGHLY PROFESSIONAL, conversion-optimized marketing message.

            STRICT TONE RULES:
            - Use a "Premium & Authoritative" tone (like a premium brand advertisement).
            - Avoid cheap slang or overly casual language.
            - Use Consumer Psychology: Focus on benefits, quality, and trust.
            - Even if input is raw Hinglish like "laptop pe 5000 off hai aaj ke liye", convert it to a professional structure.

            - If language is "hindi": Use pure, formal Devanagari Hindi.
            - If language is "hinglish": Use professional Roman Hindi (Proper Hindi words written in English letters).
            - If language is "english": Use professional, premium English ONLY. Do not use Hindi words.

            STRUCTURE:
            1. Catchy Headline (Max 5 words, using *bold*)
            2. Professional Description (2-3 sentences max)
            3. Clear Pricing/Offer (e.g., *₹5,000 DISCOUNT*)
            4. Trust Builder (e.g., Quality Assured)
            5. Call to Action (e.g., *${cta || 'Visit us today'}*)

            NEVER mention mobile numbers in the AI-generated message body. 
            No intros like "Sure, here is...", just the content. 
            Use appropriate Emojis for a premium professional look.`;

            userMessage = `
            BUSINESS TYPE: ${businessType || 'Retail'}
            SHOP NAME: ${shopName}
            LOCATION: ${address}
            PRODUCT/RAW INFO: ${productName} (Notes: ${extraInfo || ''})
            OFFER DETAIL: ${discount}
            CATALOG: ${catalogLink || 'None'}
            LANGUAGE: ${language}

            Transform this raw data into a professional marketing message. Output only the message.`;
        }

        const result = await model.generateContent([systemPrompt, userMessage]);
        const response = await result.response;
        let text = response.text().trim();

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ error: "Failed to generate offer" }, { status: 500 });
    }
}
