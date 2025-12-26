
import { GoogleGenAI } from "@google/genai";

const key = "AIzaSyCuyGK60f66yxm1z4S5cpCV8jDcYrz50Ys";
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
