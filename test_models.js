
import { GoogleGenAI } from "@google/genai";

const key = "AIzaSyCuyGK60f66yxm1z4S5cpCV8jDcYrz50Ys";
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
