
import { GoogleGenAI } from "@google/genai";

// import dotenv from 'dotenv'; // Removing missing dependency
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
let envApiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GOOGLE_API_KEY=(.*)/);
    if (match) {
        envApiKey = match[1].trim();
    }
} catch (e) {
    console.warn("Could not read .env file");
}



async function listModels() {
    const apiKey = envApiKey || process.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env");
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        // The new SDK might have a different way to list models or might not support it directly on the client instance easily without looking at docs.
        // But let's try the standard way if it simulates the previous SDK or check the error message hint: "Call ListModels".

        // Note: @google/genai is the new SDK. The methods often hang off `ai.models`.
        // Let's try to see if we can list them. 
        // If this is the *new* SDK (v0.0.x or so), it might be `ai.models.list()`.

        console.log("Attempting to list models...");
        const response = await ai.models.list();

        console.log("Available Models:");
        // The response might be an async iterable or a list.
        for await (const model of response) {
            console.log(`- ${model.name} (${model.displayName})`);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
