
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

/**
 * Exponential backoff retry utility for API calls.
 * Handles rate limits and transient errors to ensure a smooth user experience.
 * Using <T,> syntax to avoid ambiguity in TSX environments.
 */
const withRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error.message?.toLowerCase() || "";
    const isRateLimit = 
      error.status === 429 || 
      errorMessage.includes('429') || 
      errorMessage.includes('quota') || 
      errorMessage.includes('exhausted');

    if (retries > 0 && isRateLimit) {
      console.warn(`[API] Limit reached. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Analyzes an image for color analysis using Gemini 3 Flash.
 */
export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  return withRetry(async () => {
    // Create a new instance right before the call to ensure up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Perform a professional color analysis on this portrait.
      Determine: Skin tone, Hair color, Eye color (HEX, name, brief desc).
      Identify: Seasonal Color Palette (e.g., Warm Autumn).
      
      Suggest Pure Silk Crepe Saree colors in 4 categories. Use accurate HEX codes.
      Categories: "Single Colour" (12), "Two Colour Contrast" (10), "Three Colour Contrast" (8), "Ombre" (8).
      
      Format response strictly as JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skinTone: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['hex', 'name', 'description']
            },
            hairColor: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['hex', 'name', 'description']
            },
            eyeColor: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['hex', 'name', 'description']
            },
            seasonalPalette: { type: Type.STRING },
            description: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  why: { type: Type.STRING },
                  colors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        hex: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        isGradient: { type: Type.BOOLEAN },
                        gradientEndHex: { type: Type.STRING },
                        secondaryHex: { type: Type.STRING },
                        tertiaryHex: { type: Type.STRING }
                      },
                      required: ['hex', 'name', 'description']
                    }
                  }
                },
                required: ['category', 'why', 'colors']
              }
            }
          },
          required: ['skinTone', 'hairColor', 'eyeColor', 'seasonalPalette', 'description', 'recommendations']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI Analysis.");
    return JSON.parse(resultText) as AnalysisResult;
  });
};

/**
 * Visualizes a specific saree color/style on the original portrait using Gemini 2.5 Flash Image.
 */
export const visualizeOutfit = async (originalImage: string, colorDetails: string): Promise<string> => {
  return withRetry(async () => {
    // Create a new instance right before the call to ensure up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Re-render the person in this image wearing a Premium Pure Silk Crepe Saree: ${colorDetails}.
      Must feature realistic grainy silk crepe texture and fluid, elegant drape.
      Keep face features, hair, and original background unchanged.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: originalImage.split(',')[1] || originalImage
            }
          },
          { text: prompt }
        ]
      }
    });

    // Iterate through candidates and parts to find the image data as per guidelines
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Saree visualization failed. No image returned.");
  });
};
