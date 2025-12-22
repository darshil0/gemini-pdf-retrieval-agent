import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SearchResponse } from "../types";
import { buildSearchPrompt } from "../agent_architecture/prompts";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not defined in the environment.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const fileToGenerativePart = async (file: File) => {
  const reader = file.stream().getReader();
  const chunks: Uint8Array[] = [];
  let readResult = await reader.read();
  while (!readResult.done) {
    chunks.push(readResult.value);
    readResult = await reader.read();
  }

  const blob = new Blob(chunks, { type: file.type });
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      if (typeof fileReader.result === "string") {
        resolve(fileReader.result.split(",")[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsDataURL(blob);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export async function searchInDocuments(
  files: File[],
  keyword: string,
): Promise<SearchResponse> {
  // FIXED: Use correct Gemini 1.5 Flash model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const fileParts = await Promise.all(files.map(fileToGenerativePart));
  const prompt = buildSearchPrompt(files.length, keyword);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [...fileParts, { text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            results: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  docIndex: { type: SchemaType.NUMBER },
                  pageNumber: { type: SchemaType.NUMBER },
                  contextSnippet: { type: SchemaType.STRING },
                  matchedTerm: { type: SchemaType.STRING },
                  relevanceExplanation: { type: SchemaType.STRING },
                  relevanceScore: { type: SchemaType.NUMBER },
                },
                required: [
                  "docIndex",
                  "pageNumber",
                  "contextSnippet",
                  "matchedTerm",
                  "relevanceExplanation",
                  "relevanceScore",
                ],
              },
            },
          },
          required: ["summary", "results"],
        },
      },
    });

    const parsedResponse = JSON.parse(result.response.text());
    return parsedResponse;
  } catch (error) {
    console.error("Error during Gemini API call or parsing:", error);
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse the response from the AI. The response was not valid JSON.",
      );
    }
    throw new Error(
      "An error occurred while communicating with the Gemini API.",
    );
  }
}
