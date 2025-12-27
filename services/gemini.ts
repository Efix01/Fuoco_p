
import { GoogleGenAI, Type } from "@google/genai";
import { BurnParameters, SimulationResult, ChatMessage, Aspect } from "../types";

// --- CONFIGURAZIONE AI ANTIGRAVITY ---

export const checkApiKey = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
  } catch (e) {
    console.warn("Selezione API Key non disponibile.");
  }
};

const getAiClient = () => {
  const key = (import.meta.env && import.meta.env.VITE_GOOGLE_API_KEY) || (process.env as any).API_KEY; // Fallback for flexibility
  if (!key) throw new Error("API Key mancante. Configura VITE_GOOGLE_API_KEY nel file .env");
  return new GoogleGenAI({ apiKey: key });
};

const SYSTEM_INSTRUCTION = `
Sei l'Analista Senior del GAUF (Gruppo Analisi e Utilizzo del Fuoco) del CFVA Sardegna. 
Stai operando in modalità "Antigravity", il che significa precisione assoluta e profondità analitica.

TERMINOLOGIA OBBLIGATORIA (Italiano Tecnico):
- ROS (Velocità di avanzamento in m/min)
- Lunghezza di fiamma (metri)
- Intensità lineare (kW/m)
- CPS (Campbell Prediction System): Analisi critica della variazione di flammabilità.

LOGICA CPS: 
Identifica i "Turning Points" (punti di svolta). Valuta come la radiazione solare colpisca i versanti in base all'esposizione (Aspect). 
Distingui tra "Fuel Flammability" (influenzata dall'ombra/sole) e "Alignment" (Vento, Pendenza, Combustibile).

MODELLO BOSCO: Per il modello 'Bosco', considera l'umidità della lettiera e il rischio di passaggio a fuoco di chioma in caso di pendenze elevate (>30%).

Rispondi sempre in ITALIANO.
`;

// Helper per gestire Retry con Exponential Backoff
// Helper per gestire Retry con Exponential Backoff
const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('429') || error.status === 429)) {
      // Aggiungi jitter per evitare retry simultanei perfetti (+/- 500ms)
      const jitter = Math.floor(Math.random() * 1000) - 500;
      const actualDelay = Math.max(1000, delay + jitter);

      console.warn(`Quota 429 (Rate Limit). Riprovo in ${actualDelay}ms... (Tentativi rimasti: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, actualDelay));
      return retryWithBackoff(fn, retries - 1, delay * 2); // Crescita esponenziale
    }
    throw error;
  }
};


export const analyzeBurnConditions = async (params: BurnParameters): Promise<SimulationResult> => {
  const ai = getAiClient();

  const prompt = `
    SIMULAZIONE TATTICA AVANZATA GAUF:
    Input Operatore: ${JSON.stringify(params)}
    
    Esegui un'analisi profonda CPS considerando l'esposizione ${params.exposure}. 
    Se il vento(${params.windSpeed} km / h) è allineato con la pendenza(${params.slope} %), evidenzia il rischio di accelerazione esponenziale.
    
    RESTITUISCI SOLO JSON.NIENTE MARKDOWN.
    Assicurati di fare l'escape delle virgolette doppie all'interno delle stringhe(es.\"testo\").
    Struttura:
  {
    "ros": "valore stimato",
    "flameLength": "valore stimato",
    "intensity": "valore stimato",
    "riskAssessment": "Low/Moderate/High/Extreme",
    "tacticalAdvice": "consiglio operativo dettagliato",
    "trainingTip": "pillola formativa",
    "reasoningPath": "spiegazione logica"
  }
    `;

  let text = "{}";
  try {
    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // responseMimeType: "application/json", // RIMOSSO PER EVITARE CONFLITTO CON TOOLS
        // thinkingConfig: { thinkingBudget: 32768 },
        tools: [{ googleSearch: {} }]
      }
    }));

    text = response.text || "{}";
    // Clean up markdown code blocks if present
    text = text.replace(/```json\n ?|\n ? ```/g, '');
    // Extract JSON object if surrounded by text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Analisi GAUF fallita. Text received:", text);
    console.error(error);
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error("Quota AI superata. Riprova tra qualche secondo.");
    }
    throw error;
  }
};

export const analyzeBurnImage = async (base64Data: string): Promise<Partial<BurnParameters>> => {
  const ai = getAiClient();
  const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const response = await retryWithBackoff(() => ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: 'image/jpeg' } },
        { text: "Rilevamento parametri forestali AI per GAUF Sardegna. Estrai Temp, UR, Slope, FuelType (incluso Bosco se presente) e Aspect (N/S/E/W) dalle ombre. JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          temperature: { type: Type.NUMBER },
          humidity: { type: Type.NUMBER },
          fuelMoisture: { type: Type.NUMBER },
          windSpeed: { type: Type.NUMBER },
          slope: { type: Type.NUMBER },
          fuelType: { type: Type.STRING },
          exposure: { type: Type.STRING }
        }
      }
    }
  }));

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {};
  }
};

export const getWeatherFromLocation = async (lat: number, lng: number): Promise<Partial<BurnParameters>> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`
    );

    if (!response.ok) throw new Error("Meteo Service Unavailable");

    const data = await response.json();
    const current = data.current;

    // Conversione Direzione Vento (Gradi -> Aspect)
    const deg = current.wind_direction_10m;
    let aspect = Aspect.N;
    if (deg >= 22.5 && deg < 67.5) aspect = Aspect.NE;
    else if (deg >= 67.5 && deg < 112.5) aspect = Aspect.E;
    else if (deg >= 112.5 && deg < 157.5) aspect = Aspect.SE;
    else if (deg >= 157.5 && deg < 202.5) aspect = Aspect.S;
    else if (deg >= 202.5 && deg < 247.5) aspect = Aspect.SW;
    else if (deg >= 247.5 && deg < 292.5) aspect = Aspect.W;
    else if (deg >= 292.5 && deg < 337.5) aspect = Aspect.NW;

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: aspect
    };

  } catch (e) {
    console.warn("OpenMeteo failed, falling back to AI...", e);
    // Fallback alla vecchia logica AI se OpenMeteo fallisce (ridondanza)
    const ai = getAiClient();
    try {
      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Meteo corrente a ${lat}, ${lng}. JSON: temperature, humidity, windSpeed.`,
      }));
      let text = response.text || "{}";
      text = text.replace(/```json\n ?|\n ? ```/g, '').trim();
      return JSON.parse(text);
    } catch (aiError) {
      return {};
    }
  }
};

export const chatWithMentor = async (history: ChatMessage[], message: string): Promise<string> => {
  const ai = getAiClient();
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const response = await retryWithBackoff(() => ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + " Sei un mentore tattico. Rispondi con tono autorevole ma educativo.",
      tools: [{ googleSearch: {} }]
    }
  }));

  return response.text || "Comunicazione interrotta.";
};

export const analyzeTerrainGrounding = async (lat: number, lng: number): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Analisi geospaziale avanzata per GAUF Sardegna: Lat ${lat}, Lng ${lng}.Descrivi topografia, esposizione prevalente e vulnerabilità incendi.`;

  try {
    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    }));
    return response.text || "Dati non pervenuti.";
  } catch (e) {
    return "Errore connessione satellitare.";
  }
};

export const generateTrainingVideo = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video non disponibile.");

  const response = await fetch(`${downloadLink}&key=${(import.meta.env && import.meta.env.VITE_GOOGLE_API_KEY) || (process.env as any).VITE_GOOGLE_API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
