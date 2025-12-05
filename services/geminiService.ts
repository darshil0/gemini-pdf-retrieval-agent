import { GoogleGenAI, Type } from "@google/genai";
import { SearchResponse } from "../types";

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
      mimeType: file.type,
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

  const prompt = `
    You are an expert Document Retrieval and Analysis Agent. 
    I have provided ${files.length} PDF document(s).
    
    YOUR TASK:
    Search for the specific keyword or phrase: "${keyword}".
    
    REQUIREMENTS:
    1. Scan all pages of all provided documents.
    2. Identify every occurrence of the keyword (or very close semantic matches if exact match isn't found, but prefer exact).
    3. Return a structured JSON response listing every match found.
    4. For each match, you MUST provide:
       - 'docIndex': The index of the document (0 to ${files.length - 1}) based on the order provided.
       - 'pageNumber': The specific page number where the keyword is found (integer).
       - 'contextSnippet': A specific excerpt of text (approx. 20-40 words) surrounding the keyword from the document.
       - 'relevanceExplanation': A very brief note on why this was selected (e.g., "Exact match", "Related concept").
    5. Also provide a 'summary' string giving a high-level overview of how often the keyword appears across the docs.
    
    If no matches are found, return an empty array for results and a summary stating that.
  `;

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
            relevanceExplanation: { type: Type.STRING, description: "Why this match was included" }
          },
          required: ["docIndex", "pageNumber", "contextSnippet", "relevanceExplanation"]
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

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as SearchResponse;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};
