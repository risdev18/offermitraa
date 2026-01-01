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
            YOUR GOAL: Generate a POWERFUL marketing message (6-7 lines) that instantly attracts customers and a 5-scene HIGH-ENERGY video script.

            STRICT TONE RULES:
            - Use a "High Energy & Exciting" tone (e.g., "Dhamaka Offer", "Loot Lo", "Aayiye Aayiye").
            - Use Consumer Psychology: Create FOMO (Fear Of Missing Out) and excitement.
            - The text message must be SUBSTANTIAL (6-7 lines long) using emojis, bullets, and persuasive selling. It must look like a professional WhatsApp Business broadast.
            
            OUTPUT FORMAT: Return a JSON object with exactly these fields:
            1. "text": (String) A POWERFUL 6-7 LINE marketing message. 
               - Start with a catchy HOOK (e.g. 📢 ATTENTION).
               - 2-3 lines describing the value/product benefits.
               - 1-2 lines on the discount/offer urgency.
               - End with a strong Call to Action (Shop Name, Address, Link).
            2. "videoScript": (Array of 5 strings) A unique script for 5 scenes based ON THE PRODUCT.
               - Scene 1 MUST start with high energy: "Namaskar! Aayiye aayiye!" or "Hello! Big News!"
               - Use words like "Boom!", "Dhamaka!", "Loot lo!" appropriate to the language.
            3. "videoTitles": (Array of 5 short strings) Catchy titles for each scene (max 3 words).

            IMPORTANT LANGUAGE RULES (STRICT ENFORCEMENT):
            1. **TRANSLATION IS MANDATORY**: You must TRANSLATE the user's input content into the requested language.
               - If Input is Hinglish/Hindi and Request is 'English' -> TRANSLATE to PURE ENGLISH.
            2. **Language Specifics**:
               - 'English': 100% English. High energy keywords like "Mega Sale", "Grab it now".
               - 'Hindi': 100% Hindi (Devanagari). Use "धमाका ऑफर", "लूट लो मौका".
               - 'Hinglish': Roman Hindi content. Use "Dhamaka Offer", "Loot Lo", "Aayiye Aayiye".

            CURRENT REQUEST LANGUAGE: "${language}"

            VIDEO SCRIPT RULES:
            - Make it UNIQUE to "${productName}". 
            - Scene 1: High Energy Welcome ("Aaiye Aaiye!").
            - Scene 2: Product Reveal (Best Quality).
            - Scene 3: The Offer (${discount} - "Loot lo!").
            - Scene 4: Urgency ("Abhi aao!").
            - Scene 5: Final CTA (Call/Visit).`;

            userMessage = `
            BUSINESS: ${businessType}
            SHOP: ${shopName}
            LOCATION: ${address}
            PRODUCT: ${productName}
            DETAILS: ${extraInfo}
            OFFER: ${discount}
            CTA: ${cta}
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
