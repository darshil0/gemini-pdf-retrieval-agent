import { GoogleGenAI, Type } from "@google/genai";
import { SearchResponse } from "../types";
import { buildSearchPrompt } from "./agentPrompts";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type || 'application/pdf',
    },
  };
};

export const searchInDocuments = async (
  files: File[],
  keyword: string
): Promise<SearchResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare file parts
  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  // Construct the prompt using the formalized agent architecture
  const prompt = buildSearchPrompt(files.length, keyword);

  // Define schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      results: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            docIndex: { type: Type.INTEGER, description: "Index of the document in the provided list" },
            pageNumber: { type: Type.INTEGER, description: "The page number where the match was found" },
            contextSnippet: { type: Type.STRING, description: "The text context surrounding the keyword" },
            matchedTerm: { type: Type.STRING, description: "The exact substring found in the document corresponding to the match" },
            relevanceExplanation: { type: Type.STRING, description: "Why this match was included" }
          },
          required: ["docIndex", "pageNumber", "contextSnippet", "matchedTerm", "relevanceExplanation"]
        }
      },
      summary: {
        type: Type.STRING,
        description: "A summary of the search findings across all documents."
      }
    },
    required: ["results", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [...fileParts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for factual retrieval
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Robust JSON extraction
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      text = codeBlockMatch[1];
    } else {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
    }

    return JSON.parse(text) as SearchResponse;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while searching documents");
  }
};