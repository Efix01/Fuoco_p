
import { GoogleGenAI } from "@google/genai";

const key = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!key) {
    console.error("Error: API_KEY is missing. Please set VITE_GOOGLE_API_KEY in your .env file.");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey: key });

async function testGenerate() {
    console.log("Testing generation with gemini-2.0-flash...");
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: "Hello, are you working?",
        });
        console.log("Success! Response:");
        console.log(response.text);
    } catch (e) {
        console.error("Generation failed!");
        console.error(e);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", await e.response.text());
        }
    }
}

testGenerate();
