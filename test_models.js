
import { GoogleGenAI } from "@google/genai";

const key = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!key) {
    console.error("Error: API_KEY is missing. Please set VITE_GOOGLE_API_KEY in your .env file.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

async function list() {
    try {
        const response = await ai.models.list();
        console.log("Models:");
        for await (const model of response) {
            console.log(model.name);
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

list();
