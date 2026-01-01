import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { shopType } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            // Mock Suggestions for Demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mocks: Record<string, any[]> = {
                kirana: [
                    { title: "Sunday Grocery Sale", product: "All Pulses & Rice", discount: "10% Off" },
                    { title: "Monthly Ration Pack", product: "Oil + Sugar + Flour", discount: "Save ₹200" },
                    { title: "Buy 1 Get 1", product: "Surf Excel", discount: "BOGO" }
                ],
                mobile: [
                    { title: "Exchange Mela", product: "Old Smartphone", discount: "Extra ₹2000 off" },
                    { title: "Screen Guard Fee", product: "All Models", discount: "Free with Service" },
                    { title: "New Launch Offer", product: "Samsung Galaxy M Series", discount: "Zero Down Payment" }
                ],
                clothing: [
                    { title: "End of Season Sale", product: "Jeans & Shirts", discount: "Flat 50% Off" },
                    { title: "Kurta Special", product: "Cotton Kurtas", discount: "Buy 2 Get 1 Free" },
                    { title: "Wedding Collection", product: "Lehengas & Suits", discount: "Early Bird 20%" }
                ]
            };
            return NextResponse.json({
                suggestions: mocks[shopType as string] || [
                    { title: "Special Deal", product: "Top Items", discount: "Best Price" },
                    { title: "Festival Sale", product: "Our Collection", discount: "Combo Offer" }
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a marketing expert for small Indian businesses.
            Suggest 3 catchy and popular offer ideas for a "${shopType}" shop in India.
            
            Return ONLY a JSON array of objects with the following keys:
            - title: A short catchy title (e.g., "Sunday Maha Sale")
            - product: The product or category (e.g., "Rice and Oil")
            - discount: The discount amount (e.g., "10% Off" or "Buy 1 Get 1")
            
            Return the JSON and nothing else.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean text if it contains markdown code blocks
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const suggestions = JSON.parse(text);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Suggestions Error:", error);
        return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
    }
}
