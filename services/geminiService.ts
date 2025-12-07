import { GoogleGenerativeAI, GenerationConfig } from "@google/genai";
import { SearchResponse } from '../types';
import { buildSearchPrompt } from '../agent_architecture/prompts';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY is not defined in the environment.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig: GenerationConfig = {
    responseMimeType: "application/json",
};

async function fileToGenerativePart(file: File) {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as base64 string."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
}

export async function searchInDocuments(files: File[], keyword: string): Promise<SearchResponse> {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const fileParts = await Promise.all(files.map(fileToGenerativePart));
    const prompt = buildSearchPrompt(files.length, keyword);

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [...fileParts, { text: prompt }] }],
            generationConfig,
        });

        const responseText = result.response.text();
        const cleanedResponse = responseText.replace(/^ \`\`\`json\s*|\`\`\` \s*$/g, '');
        const parsedResponse: SearchResponse = JSON.parse(cleanedResponse);
        return parsedResponse;
    } catch (error) {
        console.error("Error during Gemini API call or parsing:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the response from the AI. The response was not valid JSON.");
        }
        throw new Error("An error occurred while communicating with the Gemini API.");
    }
}
