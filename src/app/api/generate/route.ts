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
            - Use Emojis (✨, 🚀, 💡) to make the chat lively.
            RESPONSE FORMAT: Return a JSON object with a single field "text".`;

            userMessage = `User said: "${productName}"\nRespond as Rishabh AI Assistant.`;
        } else {
            systemPrompt = `You are an expert Indian Retail Marketing Consultant and Copywriter (Creative & Viral Specialist).
            YOUR GOAL: Generate a POWERFUL, UNIQUE, and HIGH-CONVERSION marketing message (WhatsApp format) and a 5-scene HIGH-ENERGY video script.

            CRITICAL RULES FOR "TEXT" (WhatsApp Message):
            1. **DIVERSITY IS KEY**: Do NOT always start with "Namaskar" or "Big News". Mix it up! Use "Are wah!", "Khushkhabri!", "Attention!", "Hello Ji!", etc.
            2. **EMOJI OVERLOAD**: Use 5-10 relevant emojis throughout the text. Make it colorful and visual. (e.g., 🔥, 🎉, 🛍️, 💸, 🏃‍♂️).
            3. **FORMATTING**: Use Bold (*Text*), Italics, and Bullet points.
            4. **STRUCTURE**:
               - **Headline**: Catchy, urgent, short. (e.g. *DHAMAKA OFFER!* 💥)
               - **Product**: Clear value proposition.
               - **Offer**: The specific discount/deal.
               - **CTA**: Clear instruction (Call/Visit).
            5. **TONE**: ${festival ? "FESTIVE & JOYFUL" : "URGENT & EXCITING"}.

            CRITICAL RULES FOR "VIDEO SCRIPT":
            1. **Scene 1**: MUST be a high-energy "Hook". (e.g. "Ruka ruka ruka!", "Kya aap pareshan hain?", "Tyohar ki badhai!").
            2. **Voice Over Style**: Write exactly what the voiceover should say. Conversational and punchy.

            LANGUAGE RULES:
            - Language: "${language}"
            - **Hinglish**: Use natural, conversational Roman Hindi (e.g., "Sabse sasta!", "Mauka haath se na jaane de!").
            
            OUTPUT FORMAT: JSON with "text", "videoScript" (5 strings), "videoTitles" (5 strings).`;

            userMessage = `
            BUSINESS: ${businessType}
            SHOP NAME: ${shopName}
            LOCATION: ${address}
            PRODUCT/SERVICE: ${productName}
            DETAILS: ${extraInfo}
            DISCOUNT/OFFER: ${discount}
            FESTIVAL/OCCASION: ${festival || "None"}
            CTA: ${cta}
            
            Task: Generate unique content for this specific shop and product. Do not use generic placeholders.`;
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
