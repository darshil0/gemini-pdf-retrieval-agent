/**
 * Runtime Validation Service
 *
 * Provides runtime validation for API responses and data transformation
 * utilities. Ensures type safety beyond compile-time TypeScript checks.
 *
 * @module validation
 * @since v1.4.0
 */

import { SearchResponse, SearchResult } from "../types";

/**
 * Validates that a parsed object conforms to the SearchResult interface.
 * Checks presence and types of all required fields.
 *
 * @param obj - The object to validate
 * @returns true if the object is a valid SearchResult
 */
function isValidSearchResult(obj: unknown): obj is SearchResult {
  if (typeof obj !== "object" || obj === null) return false;

  const r = obj as Record<string, unknown>;

  return (
    typeof r.docIndex === "number" &&
    Number.isFinite(r.docIndex) &&
    r.docIndex >= 0 &&
    typeof r.pageNumber === "number" &&
    Number.isFinite(r.pageNumber) &&
    r.pageNumber >= 1 &&
    typeof r.contextSnippet === "string" &&
    typeof r.matchedTerm === "string" &&
    typeof r.relevanceExplanation === "string" &&
    typeof r.relevanceScore === "number" &&
    Number.isFinite(r.relevanceScore) &&
    r.relevanceScore >= 0 &&
    r.relevanceScore <= 1
  );
}

/**
 * Validates that a parsed object conforms to the SearchResponse interface.
 * Returns a sanitized response with only valid results, or throws on
 * completely invalid input.
 *
 * @param data - The raw parsed JSON data to validate
 * @returns A validated SearchResponse with only conforming results
 * @throws {Error} If the response is fundamentally malformed
 *
 * @example
 * ```ts
 * const raw = JSON.parse(responseText);
 * const validated = validateSearchResponse(raw);
 * ```
 */
export function validateSearchResponse(data: unknown): SearchResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid API response: expected an object.");
  }

  const obj = data as Record<string, unknown>;

  // Validate summary
  const summary = typeof obj.summary === "string" ? obj.summary : "";

  // Validate results array
  if (!Array.isArray(obj.results)) {
    throw new Error("Invalid API response: 'results' must be an array.");
  }

  // Filter to only valid results, gracefully handling partial responses
  const validResults: SearchResult[] = [];
  for (const item of obj.results) {
    if (isValidSearchResult(item)) {
      validResults.push(item);
    }
  }

  return {
    summary,
    results: validResults,
  };
}

/**
 * Escapes a string value for safe inclusion in a CSV cell.
 * Wraps the value in double quotes and escapes internal quotes.
 *
 * @param value - The string to escape
 * @returns A properly escaped CSV cell value
 *
 * @example
 * ```ts
 * escapeCSVField('He said "hello"');
 * // Returns: '"He said ""hello"""'
 * ```
 */
export function escapeCSVField(value: string | number): string {
  const str = String(value);
  // Always wrap in quotes and escape internal quotes
  return '"' + str.replace(/"/g, '""') + '"';
}

/**
 * Validates that a parsed localStorage array contains only strings.
 *
 * @param data - The parsed JSON data to validate
 * @returns A validated string array, or an empty array if invalid
 */
export function validateStringArray(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is string => typeof item === "string");
}
