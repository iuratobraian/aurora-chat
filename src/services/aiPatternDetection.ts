import { GoogleGenAI, Type } from "@google/genai";
import { TradingPattern } from "../types";
import logger from "../utils/logger";
import { safeJsonParse } from "../utils/safeJson";

// Safely access API key (Vite replaces process.env.GEMINI_API_KEY with the string value at build time)
const apiKey = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const detectPatterns = async (symbol: string, historicalData: any[]): Promise<TradingPattern[]> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza los siguientes datos históricos de precios para ${symbol} e identifica patrones de trading (ej. Hombro-Cabeza-Hombro, Doble Suelo, Bandera Alcista, Bandera Bajista, Triángulo Ascendente, etc.). Devuelve un array JSON de patrones.
      IMPORTANTE: Responde completamente en ESPAÑOL.
      Data: ${JSON.stringify(historicalData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              patternName: { type: Type.STRING, description: "Nombre del patrón en Español" },
              confidence: { type: Type.NUMBER, description: "Nivel de confianza 0-100" },
              type: { type: Type.STRING, description: "Bullish, Bearish, o Neutral" },
              description: { type: Type.STRING, description: "Breve descripción del patrón y razonamiento en Español" },
              targetPrice: { type: Type.NUMBER, description: "Precio objetivo sugerido" },
              stopLoss: { type: Type.NUMBER, description: "Precio stop loss sugerido" }
            },
            required: ["patternName", "confidence", "type", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = safeJsonParse<any[]>(text, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => ({
      id: crypto.randomUUID(),
      symbol,
      patternName: p.patternName,
      confidence: p.confidence,
      type: p.type as any,
      description: p.description,
      timestamp: new Date().toISOString(),
      targetPrice: p.targetPrice,
      stopLoss: p.stopLoss
    }));
  } catch (error) {
    logger.error("Error detecting patterns:", error);
    return [];
  }
};
