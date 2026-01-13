import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { shopName, shopDescription, productName, discount, extraInfo, language, address, contactNumber, catalogLink, businessType, cta, festival } = await req.json();
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

            // Mock Response (3 Unique Options)
            const options = [
                `🔥 *${shopName || "Special Offer"}* 🔥\n\n📢 **ATTENTION EVERYONE!** 📢\n\nAb paaiye sabse behtareen *${productName || "Products"}* pure shehar mein sabse kam daam par! 📉\n\n✨ **Why Choose Us?**\n✅ Best Quality Guaranteed 💯\n✅ Unbeatable Prices 💰\n✅ Best Quality Service 🤝\n\n🚀 *LIMITED TIME DEAL:* \n💥 **${discount || "Massive Discount!"}** 💥\n\n⏰ Jaldi karein! Stock khatam hone se pehle loot lo! 🏃‍♂️💨\n\n📍 **Visit Us:** ${address || "Our Store"}\n📞 **Call Now:** ${contactNumber || "Contact Us"}\n\n👇 *Order Now & Save Big!*`,
                `🌟 *BIG REVEAL AT ${shopName || "OUR SHOP"}* 🌟\n\nAb shopping hogi aur bhi mazedaar! Hum laye hain aapke liye *${productName}* par ek shandaar deal. 🛍️\n\n💎 **Hamari Khoobiyan:**\n📍 Sabse Sasta, Sabse Accha\n📍 100% Original Products\n📍 Local Support & Trust\n\n🎁 **EXCLUSISVE OFFER:**\n🔥 *${discount || "Special Price"}* 🔥\n\nDon't wait! Ye offer sirf kuch hi dino ke liye hai. ⏳\n\n📍 **Location:** ${address}\n📱 **WhatsApp:** ${contactNumber}\n\n*Milte hain shop par!* 👋`,
                `🤝 *A TRUSTED NAME: ${shopName || "OFFER MITRA"}* 🤝\n\nQuality se samjhauta nahi! Local customers ke liye humne nikala hai ek dum fresh deal on *${productName}*. ✨\n\n✅ Super Fast Service\n✅ Friendly Staff\n✅ Satisfaction Guaranteed\n\n💰 **TODAY'S BEST PRICE:**\n🌟 *${discount || "Flat OFF"}* 🌟\n\nVisit today for the best experience in town! 📍\n\n📍 **Address:** ${address}\n📞 **Contact:** ${contactNumber}\n\n*Aapka swagat hai!*`
            ];

            return NextResponse.json({
                text: options[0],
                options,
                videoScript: [
                    festival ? `Namaskar! ${festival} ki dher saari shubhkamnayein! Aayiye, aayiye!` : "Namaskar! Aayiye aayiye! Swagat hai aapka shehar ki sabse behtareen shop mein!",
                    `Aaj hum laye hain khaas aapke liye ${productName || 'ek shandaar product'}!`,
                    `Sirf yahi nahi, aaj mil raha hai poora ${discount || 'bhaari discount'}! Loot lo mauka!`,
                    "Stock tezi se khatam ho raha hai, toh der kis baat ki?",
                    "Abhi phone uthaiye aur humein call kariye, ya seedha shop par aayiye!"
                ],
                videoTitles: [festival || "Namaste!", "Best Quality", "Loot Lo Offer", "Hurry Up!", "Visit Now"]
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
            systemPrompt = `You are a world-class Indian Creative Marketing Agent. Your job is to ensure that EVERY ad you write is a unique masterpiece. 
            
            STRICT RULE: NEVER use the same template twice. Even if the product is the same, change the angle, vocabulary, and structure completely.

            CRITICAL DIVERSITY PROTOCOL:
            1. **VOICE & ANGLE**: For each of the 3 options, pick a random "Life Angle":
               - Option A: *Traditional/Respectful* (Focus on sanskar, quality, and legacy).
               - Option B: *Modern/Fast-paced* (Focus on style, status, and saving time).
               - Option C: *Emotional/Local* (Focus on neighborly trust, family happiness, and community).
            2. **STRUCTURE VARIATION**: Do NOT use fixed sections. 
               - Instead of "Why Choose Us", use "Log humein pasand karte hain kyunki...", "Hamari Pehchan", or "Aapki bachat hamara vaada".
               - Vary the position of the Offer. Sometimes start with the price, sometimes end with it.
            3. **PRODUCT STORY**: Look at the product name. Write 1 line about WHY it matters in a real Indian household (e.g., if it's a mobile, talk about connecting with parents; if it's grocery, talk about home-cooked taste).
            4. **NO CLICHÉS**: Avoid robotic phrases like "Attention Everyone" or "Limited Time". Use natural starts like "Ek zaroori baat...", "Aapke liye khushkhabri...", "Shehar mein sabse bada dhamaka!".
            5. **DETAIL**: Keep the length around 10-15 lines. Use rich emojis and bold text for impact.

            OUTPUT FORMAT (JSON):
            {
                "text": "The primary/best option",
                "options": ["Option 1", "Option 2", "Option 3"],
                "videoScript": ["Scene 1", "Scene 2", "Scene 3", "Scene 4", "Scene 5"],
                "videoTitles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
            }`;

            userMessage = `
            BUSINESS_DATA:
            - Type: ${businessType}
            - Name: ${shopName}
            - Shop Description: ${shopDescription}
            - Product: ${productName}
            - Offer: ${discount}
            - Location: ${address}
            - Phone: ${contactNumber}
            - Context: ${festival || "Regular Day"} / ${extraInfo}
            
            GENERATE 3 HYPER-UNIQUE ADS. BREAK ALL TEMPLATES. USE FRESH VOCABULARY.`;
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

            const fallbackOptions = [
                `🔥 *${shopName || "Special Offer"}* 🔥\n\n📢 **ATTENTION EVERYONE!** 📢\n\nAb paaiye sabse behtareen *${productName || "Products"}* pure shehar mein sabse kam daam par! 📉\n\n✨ **Why Choose Us?**\n✅ Best Quality Guaranteed 💯\n✅ Unbeatable Prices 💰\n✅ Local Support & Love 🤝\n\n🚀 *LIMITED TIME DEAL:* \n💥 **${discount || "Massive Discount!"}** 💥\n\n⏰ Jaldi karein! Stock khatam hone se pehle loot lo! 🏃‍♂️💨\n\n📍 **Visit Us:** ${address || "Our Store"}\n📞 **Call Now:** ${contactNumber || "Contact Us"}\n\n👇 *Order Now & Save Big!*`,
                `🌟 *BIG REVEAL AT ${shopName || "OUR SHOP"}* 🌟\n\nAb shopping hogi aur bhi mazedaar! Hum laye hain aapke liye *${productName}* par ek shandaar deal. 🛍️\n\n💎 **Hamari Khoobiyan:**\n📍 Sabse Sasta, Sabse Accha\n📍 100% Original Products\n📍 Local Support & Trust\n\n🎁 **EXCLUSISVE OFFER:**\n🔥 *${discount || "Special Price"}* 🔥\n\nDon't wait! Ye offer sirf kuch hi dino ke liye hai. ⏳\n\n📍 **Location:** ${address}\n📱 **WhatsApp:** ${contactNumber}\n\n*Milte hain shop par!* 👋`
            ];

            return NextResponse.json({
                text: fallbackOptions[0],
                options: fallbackOptions,
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
