/**
 * Gemini AI Service
 *
 * Handles communication with the Google Gemini 1.5 Flash API for
 * document search and analysis. Converts files to base64 inline data
 * parts and sends structured prompts with JSON response schema.
 *
 * @module geminiService
 * @since v1.0.0
 */

import {
  GoogleGenerativeAI,
  SchemaType,
  GenerateContentResult,
} from "@google/generative-ai";
import { SearchResponse } from "@core/types";
import { buildSearchPrompt } from "@core/architecture/prompts";
import { validateSearchResponse } from "@core/services/validation";
import { createLogger } from "@core/services/logger";
import { ErrorMessages } from "@core/constants/errors";

const log = createLogger("GeminiService");

/** Default timeout for API requests in milliseconds. Defaults to 60s if not set in environment. */
const API_TIMEOUT_MS = parseInt(import.meta.env.VITE_API_TIMEOUT_MS || "60000");

/** Default timeout for file stream reading in milliseconds (30 seconds). */
const FILE_STREAM_TIMEOUT_MS = 30_000;

/**
 * Validates that a string looks like a plausible Gemini API key.
 * Checks minimum length and character set (alphanumeric + hyphens + underscores).
 *
 * @param key - The API key string to validate
 * @returns true if the key has a valid format
 */
function isValidApiKeyFormat(key: string): boolean {
  // Gemini API keys are typically 39 characters, alphanumeric with possible hyphens/underscores
  return key.length >= 20 && /^[A-Za-z0-9_-]+$/.test(key);
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(ErrorMessages.API_KEY_MISSING);
}

if (!isValidApiKeyFormat(API_KEY)) {
  log.warn("API key format validation failed", { keyLength: API_KEY.length });
  throw new Error(ErrorMessages.API_KEY_INVALID_FORMAT);
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Converts a File object into a Gemini-compatible inline data part.
 * Reads the file as a stream of chunks, reassembles into a Blob,
 * and base64-encodes the result.
 *
 * @param file - The File object to convert
 * @param signal - Optional AbortSignal for timeout/cancellation
 * @returns An inline data part with base64-encoded file content
 * @throws {Error} If the file cannot be read or times out
 *
 * @example
 * ```ts
 * const part = await fileToGenerativePart(pdfFile);
 * // { inlineData: { data: "base64...", mimeType: "application/pdf" } }
 * ```
 */
const fileToGenerativePart = async (file: File, signal?: AbortSignal) => {
  const reader = file.stream().getReader();
  const chunks: Uint8Array[] = [];

  // Create a timeout for stream reading
  const timeoutId = setTimeout(() => {
    reader.cancel("File stream read timeout").catch(() => {
      // Intentionally swallowed — reader may already be closed
    });
  }, FILE_STREAM_TIMEOUT_MS);

  try {
    let readResult = await reader.read();
    while (!readResult.done) {
      // Check if aborted externally
      if (signal?.aborted) {
        await reader.cancel("Operation aborted");
        throw new Error(ErrorMessages.FILE_STREAM_TIMEOUT);
      }

      if (readResult.value) {
        chunks.push(readResult.value);
      }
      readResult = await reader.read();
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // Use explicit conversion to avoid SharedArrayBuffer issues in strict type checking
  const blob = new Blob(chunks as BlobPart[], { type: file.type });
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      if (typeof fileReader.result === "string") {
        resolve(fileReader.result.split(",")[1] ?? "");
      } else {
        reject(new Error(ErrorMessages.FILE_READ_FAILED));
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

/**
 * Wraps a Promise with a timeout. If the promise does not resolve
 * within the specified duration, it rejects with a timeout error.
 *
 * @param promise - The promise to wrap
 * @param ms - Timeout duration in milliseconds
 * @param timeoutMessage - Custom error message for timeout
 * @returns The resolved value of the original promise
 * @throws {Error} If the promise does not resolve within the timeout
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string = ErrorMessages.SEARCH_TIMEOUT,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), ms),
    ),
  ]);
}

/**
 * Searches uploaded PDF documents for a keyword using the Gemini AI model.
 *
 * Converts each file to a base64 inline data part, constructs a structured
 * prompt with the search keyword, and sends the request to Gemini 1.5 Flash
 * with a JSON response schema. The response is validated at runtime to ensure
 * it conforms to the expected SearchResponse interface.
 *
 * @param files - Array of PDF File objects to search
 * @param keyword - The search term or phrase to find in the documents
 * @returns A validated SearchResponse containing results and AI summary
 * @throws {Error} If the API call fails, times out, or returns malformed data
 *
 * @example
 * ```ts
 * const response = await searchInDocuments([pdfFile1, pdfFile2], "revenue");
 * console.log(response.summary);
 * response.results.forEach(r => console.log(r.contextSnippet));
 * ```
 */
export async function searchInDocuments(
  files: File[],
  keyword: string,
): Promise<SearchResponse> {
  log.info("Search started", { keyword, fileCount: files.length });

  // FIXED: Use environment-configurable Gemini model
  const model = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash",
  });

  const abortController = new AbortController();
  const fileParts = await Promise.all(
    files.map((f) => fileToGenerativePart(f, abortController.signal)),
  );
  const prompt = buildSearchPrompt(files.length, keyword);

  try {
    const result: GenerateContentResult = await withTimeout(
      model.generateContent({
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
      }),
      API_TIMEOUT_MS,
    );

    const text = result.response.text();
    const rawParsed: unknown = JSON.parse(text);

    // Runtime validation: ensure response matches expected shape
    const validatedResponse = validateSearchResponse(rawParsed);

    log.info("Search completed", {
      keyword,
      resultCount: validatedResponse.results.length,
    });

    return validatedResponse;
  } catch (error) {
    log.error(
      "Search failed",
      { keyword, fileCount: files.length },
      error instanceof Error ? error : undefined,
    );

    if (error instanceof SyntaxError) {
      throw new Error(ErrorMessages.SEARCH_PARSE_FAILED);
    }

    // Re-throw timeout errors as-is
    if (error instanceof Error && error.message === ErrorMessages.SEARCH_TIMEOUT) {
      throw error;
    }

    throw new Error(ErrorMessages.API_COMMUNICATION_ERROR);
  }
}
