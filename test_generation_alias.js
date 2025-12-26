
import { GoogleGenAI } from "@google/genai";

const key = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!key) {
    console.error("Error: API_KEY is missing. Please set VITE_GOOGLE_API_KEY in your .env file.");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey: key });

async function testGenerateAlias() {
    console.log("Testing generation with gemini-flash-latest...");
    try {
        const response = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: "Hello, work please.",
        });
        console.log("Success with flash-latest! Response:", response.text);
    } catch (e) {
        console.error("Failed with flash-latest:", e.message);
    }

    console.log("Testing generation with gemini-pro-latest...");
    try {
        const response2 = await client.models.generateContent({
            model: 'gemini-pro-latest',
            contents: "Hello, work please.",
        });
        console.log("Success with pro-latest! Response:", response2.text);
    } catch (e) {
        console.error("Failed with pro-latest:", e.message);
    }
}

testGenerateAlias();
