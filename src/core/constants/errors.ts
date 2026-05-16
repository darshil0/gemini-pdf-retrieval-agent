/**
 * Centralized Error Message Constants
 *
 * All user-facing error messages are defined here for consistency.
 * Each message follows the format: sentence case, ending with a period.
 *
 * @module errors
 * @since v1.4.0
 */

export const ErrorMessages = {
  // Search errors
  SEARCH_FAILED: "An error occurred while searching. Please try again.",
  SEARCH_TIMEOUT: "The search took too long and was cancelled. Please try with fewer documents or a simpler query.",
  SEARCH_PARSE_FAILED: "Failed to parse the AI response. The response was not valid JSON.",
  SEARCH_QUERY_TOO_SHORT: "Search query must be at least 2 characters.",
  SEARCH_QUERY_SUSPICIOUS: "Search query contains suspicious content.",

  // API errors
  API_KEY_MISSING: "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.",
  API_KEY_INVALID_FORMAT: "Gemini API key is invalid. Please check your .env file.",
  API_COMMUNICATION_ERROR: "An error occurred while communicating with the Gemini API.",
  API_RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",

  // File errors
  FILE_TYPE_INVALID: "Only PDF files are allowed.",
  FILE_SIZE_EXCEEDED: "File size exceeds the maximum limit.",
  FILE_ALREADY_UPLOADED: "This file has already been uploaded.",
  FILE_LIMIT_REACHED: "Cannot upload more than 10 files.",
  FILE_READ_FAILED: "Failed to read file as base64 string.",
  FILE_STREAM_TIMEOUT: "File processing timed out. The file may be too large or corrupted.",

  // PDF viewer errors
  PDF_LOAD_FAILED: "Failed to load the PDF document. The file may be corrupted or in an unsupported format.",
  PDF_WORKER_FAILED: "Failed to initialize PDF rendering engine. Please refresh the page.",

  // General errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;
