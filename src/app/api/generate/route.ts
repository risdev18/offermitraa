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
                text: `✨ *${shopName || "Special Offer"}* ✨\n\nAb paaiye *${productName || "Behtareen Products"}* behtareen daamo par!\n\n🔥 ${discount ? `Flat ${discount} OFF!` : "Dhamaka Offer!"}\n📍 ${address || "Visit us today"}\n\nJaldi aayein! 🏃‍♂️💨`,
                videoScript: [
                    "Namaste! Hamare yahan aapko milega sabse sasta aur behtareen maal.",
                    `Aaj hi hamari shop ${shopName || ''} par aayein aur payein dhero offers.`,
                    `Dhamaka sale shuru ho chuki hai, sirf ${productName || 'aapke liye'}.`,
                    "Stock khatam hone se pehle jaldi karein.",
                    "Humein call karein ya shop par visit karein. Dhanyawad!"
                ],
                videoTitles: ["Namaste!", "Welcome", "Mega Sale", "Hurry Up", "Visit Now"]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        let systemPrompt = "";
        let userMessage = "";

        if (isChat) {
            systemPrompt = `You are Rishabh, a brilliant and friendly Indian Marketing Expert AI Assistant. 
            Your goal is to help shop owners with marketing advice, ideas, and general conversation.
            - Tone: Extremely helpful, professional yet friendly, and encouraging.
            - Language: Use the requested language (${language}). If Hinglish, use professional Roman Hindi.
            - Keep responses concise and focused on business/marketing growth.
            RESPONSE FORMAT: Return a JSON object with a single field "text".`;

            userMessage = `User said: "${productName}"\nRespond as Rishabh AI Assistant.`;
        } else {
            systemPrompt = `You are an expert Indian Retail Marketing Consultant and Copywriter.
            YOUR GOAL: Generate a professional marketing message and a 5-scene high-energy video script.

            STRICT TONE RULES:
            - Use a "Premium & Authoritative" tone like a high-end commercial.
            - Use Consumer Psychology: Focus on benefits and quality.
            
            OUTPUT FORMAT: Return a JSON object with exactly these fields:
            1. "text": (String) Poster content including Headline (bold), Description, Price (bold), Trust Builder, CTA.
            2. "videoScript": (Array of 5 strings) A unique script for 5 scenes based ON THE PRODUCT.
            3. "videoTitles": (Array of 5 short strings) Catchy titles for each scene (max 3 words).

            IMPORTANT LANGUAGE RULES (STRICT ENFORCEMENT):
            1. **TRANSLATION IS MANDATORY**: You must TRANSLATE the user's input content into the requested language.
               - If Input is Hinglish/Hindi and Request is 'English' -> TRANSLATE to PURE ENGLISH.
               - Example: Input "Sasta milega", Request "English" -> Output "Available at low prices". (NOT "Sasta milega").
            
            2. **Language Specifics**:
               - 'English': 100% English. No Hindi words. No "Namaste". Use "Welcome".
               - 'Hindi': 100% Hindi (Devanagari).
               - 'Hinglish': Roman Hindi content.

            CURRENT REQUEST LANGUAGE: "${language}"

            VIDEO SCRIPT RULES:
            - Make it UNIQUE to "${productName}". 
            - Scene 1: Hook, Scene 2: Product Highlight, Scene 3: The Deal (${discount}), Scene 4: Urgency, Scene 5: Visit/Call.
            - Script must match the REQUEST LANGUAGE perfectly (Translate if needed).`;

            userMessage = `
            BUSINESS: ${businessType}
            SHOP: ${shopName}
            LOCATION: ${address}
            PRODUCT: ${productName}
            DETAILS: ${extraInfo}
            OFFER: ${discount}
            LANG: ${language}`;
        }

        const result = await model.generateContent([systemPrompt, userMessage]);
        const response = await result.response;
        return NextResponse.json(JSON.parse(response.text()));
    } catch (error) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ error: "Failed to generate offer" }, { status: 500 });
    }
}
