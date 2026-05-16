import { describe, it, expect } from "vitest";
import { 
  validateSearchResponse, 
  escapeCSVField, 
  validateStringArray 
} from "@/core/services/validation";
import { SearchResponse } from "@/core/types";

describe("ValidationService", () => {
  describe("validateSearchResponse", () => {
    it("should accept a valid response", () => {
      const validData = {
        summary: "Test summary",
        results: [
          {
            docIndex: 0,
            pageNumber: 1,
            contextSnippet: "context",
            matchedTerm: "term",
            relevanceExplanation: "explanation",
            relevanceScore: 0.8
          }
        ]
      };

      const result = validateSearchResponse(validData);
      expect(result.summary).toBe("Test summary");
      expect(result.results).toHaveLength(1);
      expect(result.results[0].relevanceScore).toBe(0.8);
    });

    it("should handle missing summary by providing default", () => {
      const data = {
        results: []
      };
      const result = validateSearchResponse(data);
      expect(result.summary).toBe("");
      expect(result.results).toHaveLength(0);
    });

    it("should filter out invalid results from the array", () => {
      const data = {
        summary: "Summary",
        results: [
          { docIndex: 0, pageNumber: 1, contextSnippet: "ok", matchedTerm: "ok", relevanceExplanation: "ok", relevanceScore: 0.5 },
          { docIndex: "invalid", pageNumber: 1 }, // missing fields and wrong types
          { docIndex: 1, pageNumber: 0, relevanceScore: 1.5 } // invalid values
        ]
      };

      const result = validateSearchResponse(data);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].docIndex).toBe(0);
    });

    it("should throw if results is not an array", () => {
      const invalidData = { summary: "Test", results: "not-an-array" };
      expect(() => validateSearchResponse(invalidData)).toThrow("results' must be an array");
    });

    it("should throw if data is null or not an object", () => {
      expect(() => validateSearchResponse(null)).toThrow("expected an object");
      expect(() => validateSearchResponse("string")).toThrow("expected an object");
    });
  });

  describe("escapeCSVField", () => {
    it("should wrap strings in double quotes", () => {
      expect(escapeCSVField("hello")).toBe('"hello"');
    });

    it("should escape existing double quotes by doubling them", () => {
      expect(escapeCSVField('He said "Hello"')).toBe('"He said ""Hello"""');
    });

    it("should handle numbers by converting to string and wrapping", () => {
      expect(escapeCSVField(123.45)).toBe('"123.45"');
    });
  });

  describe("validateStringArray", () => {
    it("should return empty array for non-array input", () => {
      expect(validateStringArray(null)).toEqual([]);
      expect(validateStringArray({ a: 1 })).toEqual([]);
    });

    it("should filter out non-string elements", () => {
      const input = ["valid", 123, null, "also valid", undefined];
      expect(validateStringArray(input)).toEqual(["valid", "also valid"]);
    });

    it("should return empty array if no strings are present", () => {
      expect(validateStringArray([1, 2, 3])).toEqual([]);
    });
  });
});
