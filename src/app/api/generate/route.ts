import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { shopName, productName, discount, extraInfo, language, address, catalogLink, businessType, cta, festival } = await req.json();
        const isChat = extraInfo?.includes("Chat interaction");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            // Mock Response (Updated for Festival Support)
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isChat) {
                if (productName.toLowerCase().includes("happy new year")) {
                    return NextResponse.json({ text: "✨ Happy New Year! 🎆 May this year bring massive growth. How can I help you plan your New Year marketing today? 🚀" });
                }
                return NextResponse.json({
                    text: `I understand you're asking about "${productName}". As your Rishabh AI assistant, I recommend running a limited-time offer to boost engagement! Shall we create a poster for this?`
                });
            }

            const mockFestivalLine = festival ? `🎉 *${festival} Special Offer!* 🎉` : `✨ *${shopName || "Special Offer"}* ✨`;

            return NextResponse.json({
                text: `${mockFestivalLine}\n\nAb paaiye *${productName || "Behtareen Products"}* behtareen daamo par!\n\n🔥 ${discount ? `Flat ${discount} OFF!` : "Dhamaka Offer!"}\n📍 ${address || "Visit us today"}\n\nJaldi aayein! 🏃‍♂️💨`,
                videoScript: [
                    festival ? `Namaskar! ${festival} ki dher saari shubhkamnayein! Aayiye, aayiye!` : "Namaskar! Hamare yahan aapko milega sabse sasta aur behtareen maal.",
                    `Aaj hi hamari shop ${shopName || ''} par aayein aur payein dhero offers.`,
                    `Dhamaka sale shuru ho chuki hai, sirf ${productName || 'aapke liye'}.`,
                    "Stock khatam hone se pehle jaldi karein.",
                    "Humein call karein ya shop par visit karein. Dhanyawad!"
                ],
                videoTitles: [festival || "Namaste!", "Welcome", "Mega Sale", "Hurry Up", "Visit Now"]
            });
        }

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
            YOUR GOAL: Generate a POWERFUL, UNIQUE marketing message (6-7 lines) and a 5-scene HIGH-ENERGY video script tailored to the Specific Product and Occasion.

            STRICT TONE RULES:
            - Use a "High Energy & Exciting" tone.
            - **LOUD & CLEAR**: If a Festival is provided (e.g., Holi, Diwali, Eid), you MUST mention it loudly and enthusiastically in the FIRST START of the video and text (e.g., "HOLI HAI NAMASKAR!", "EID MUBARAK!").
            - The text message must be SUBSTANTIAL (6-7 lines long), UNIQUE to the product, and persuasive. 
            
            OUTPUT FORMAT: Return a JSON object with exactly these fields:
            1. "text": (String) A POWERFUL 6-7 LINE marketing message. 
               - Start with a catchy HOOK related to the product or festival.
               - 2-3 lines describing the value/product benefits.
               - 1-2 lines on the discount/offer urgency.
               - End with a strong Call to Action.
            2. "videoScript": (Array of 5 strings) A UNIQUE script for 5 scenes based ON THE PRODUCT.
               - Scene 1 MUST start with high energy & Festival greeting if applicable: "Namaskar! Holi ki shubhkamnayein! Aayiye aayiye!"
               - Use words like "Boom!", "Dhamaka!", "Loot lo!" appropriate to the language.
            3. "videoTitles": (Array of 5 short strings) Catchy titles for each scene (max 3 words).

            IMPORTANT LANGUAGE RULES (STRICT ENFORCEMENT):
            1. **TRANSLATION IS MANDATORY**: Input text must be translated to the requested language.
            2. **Language Specifics**:
               - 'English': 100% English. High energy.
               - 'Hindi': 100% Hindi (Devanagari). Use "धमाका ऑफर", "लूट लो मौका".
               - 'Hinglish': Roman Hindi content. Use "Dhamaka Offer", "Loot Lo", "Aayiye Aayiye".

            CURRENT REQUEST LANGUAGE: "${language}"

            VIDEO SCRIPT RULES:
            - Make it UNIQUE to "${productName}". DO NOT reuse generic lines.
            - Scene 1: High Energy Welcome + Festival Greeting.
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
            FESTIVAL: ${festival || "None"}
            CTA: ${cta}
            LANG: ${language}`;
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent([systemPrompt, userMessage]);
            const response = await result.response;
            return NextResponse.json(JSON.parse(response.text()));
        } catch (geminiError) {
            console.error("Gemini API Error (Falling back to mock):", geminiError);

            // Fallback Mock Response (High Energy)
            return NextResponse.json({
                text: `🔥 *${shopName || "Special Offer"}* 🔥\n\n📢 **ATTENTION EVERYONE!** 📢\n\nAb paaiye sabse behtareen *${productName || "Products"}* pure shehar mein sabse kam daam par! 📉\n\n✨ **Why Choose Us?**\n✅ Best Quality Guaranteed 💯\n✅ Unbeatable Prices 💰\n✅ Trusted by Thousands 🤝\n\n🚀 *LIMITED TIME DEAL:* \n💥 **${discount ? `Flat ${discount} OFF!` : "Massive Discount Available!"}** 💥\n\n⏰ Jaldi karein! Stock khatam hone se pehle loot lo! 🏃‍♂️💨\n\n📍 **Visit Us:** ${address || "City Center"}\n📞 **Call Now:** ${extraInfo || "Contact Shop"}\n\n👇 *Order Now & Save Big!*`,
                videoScript: [
                    "Namaskar! Aayiye aayiye! Swagat hai aapka shehar ki sabse behtareen shop mein!",
                    `Aaj hum laye hain khaas aapke liye ${productName || 'ek shandaar product'}!`,
                    `Sirf yahi nahi, aaj mil raha hai poora ${discount || 'bhaari discount'}! Loot lo mauka!`,
                    "Stock tezi se khatam ho raha hai, toh der kis baat ki?",
                    "Abhi phone uthaiye aur humein call kariye, ya seedha shop par aayiye!"
                ],
                videoTitles: ["Aayiye Aayiye!", "Best Quality", "Loot Lo Offer", "Hurry Up!", "Visit Now"]
            });
        }
    } catch (error) {
        console.error("General API Error:", error);
        return NextResponse.json({ error: "Failed to generate offer" }, { status: 500 });
    }
}
