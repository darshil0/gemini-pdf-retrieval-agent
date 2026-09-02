/**
 * Service Layer Tests (Refactored)
 *
 * Comprehensive tests for business logic and service functions
 * using actual service implementations and mocks only where necessary.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityService } from '@core/services/securityService';
import { searchInDocuments } from '@api/gemini';

vi.unmock('@core/services/securityService');

// Mock the Gemini API but keep the service logic
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function () {
      return {
        getGenerativeModel: vi.fn().mockImplementation(() => ({
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () =>
                JSON.stringify({
                  summary: 'Mocked Summary',
                  results: [
                    {
                      docIndex: 0,
                      pageNumber: 1,
                      contextSnippet: 'Found in document',
                      matchedTerm: 'search',
                      relevanceExplanation: 'Direct match',
                      relevanceScore: 1.0,
                    },
                  ],
                }),
            },
          }),
        })),
      };
    }),
    SchemaType: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
      NUMBER: 'NUMBER',
    },
  };
});

describe('Service Layer Integration Tests', () => {
  describe('SecurityService', () => {
    it('should validate file types by magic bytes', async () => {
      // Valid PDF magic bytes: %PDF
      const validPdf = new File(
        [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x31, 0x2e, 0x37])],
        'test.pdf',
        { type: 'application/pdf' },
      );
      const invalidPdf = new File(
        [new Uint8Array([0x00, 0x00, 0x00, 0x00])],
        'test.txt',
        { type: 'text/plain' },
      );
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });

      expect(await SecurityService.validateFileType(validPdf)).toBe(true);
      expect(await SecurityService.validateFileType(invalidPdf)).toBe(false);
      expect(await SecurityService.validateFileType(emptyFile)).toBe(false);
    });

    it('should enforce file size limits', () => {
      const smallFile = { size: 100 * 1024 * 1024 } as File; // 100MB
      const largeFile = { size: 300 * 1024 * 1024 } as File; // 300MB

      expect(SecurityService.validateFileSize(smallFile)).toBe(true);
      expect(SecurityService.validateFileSize(largeFile)).toBe(false);
    });

    it('should sanitize input safely by trimming and removing control chars', () => {
      const input = '  Sales < 5000\x00  ';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).toBe('Sales < 5000');
    });

    it('should validate search queries correctly', () => {
      expect(SecurityService.validateSearchQuery('valid query').valid).toBe(
        true,
      );
      expect(SecurityService.validateSearchQuery('report from Q3').valid).toBe(
        true,
      );
      expect(SecurityService.validateSearchQuery('status update').valid).toBe(
        true,
      );
      expect(
        SecurityService.validateSearchQuery('SELECT * FROM users').valid,
      ).toBe(true);
      expect(SecurityService.validateSearchQuery(' a ').valid).toBe(false); // Too short
    });

    it('should persist rate limits across calls', () => {
      const identifier = 'test-rate-limit-' + Date.now();

      // First 5 should be fine
      for (let i = 0; i < 5; i++) {
        expect(SecurityService.checkRateLimit(identifier, 5, 60000)).toBe(true);
      }

      // 6th should fail
      expect(SecurityService.checkRateLimit(identifier, 5, 60000)).toBe(false);
    });

    it('should prune expired rate limit records on checkRateLimit', () => {
      const staleIdentifier = 'stale-rate-limit-' + Date.now();
      const freshIdentifier = 'fresh-rate-limit-' + Date.now();

      // Set stale entry with timeframe 10ms
      SecurityService.checkRateLimit(staleIdentifier, 1, 10);

      // Wait 20ms so staleIdentifier is expired
      const start = Date.now();
      while (Date.now() - start < 20) {
        // busy wait
      }

      // Checking freshIdentifier should trigger pruning of staleIdentifier
      expect(SecurityService.checkRateLimit(freshIdentifier, 1, 60000)).toBe(true);
      // Stale identifier should be reset because it was pruned / expired
      expect(SecurityService.checkRateLimit(staleIdentifier, 1, 60000)).toBe(true);
    });
  });

  describe('GeminiService', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should execute a search and return validated results', async () => {
      const file = new File(['dummy content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const result = await searchInDocuments([file], 'test');

      expect(result.summary).toBe('Mocked Summary');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]?.docIndex).toBe(0);
    });

    it('should throw error if API key is missing or invalid', async () => {
      const file = new File(['dummy content'], 'test.pdf', {
        type: 'application/pdf',
      });

      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      await expect(searchInDocuments([file], 'test')).rejects.toThrow(
        'Gemini API key is not configured',
      );

      vi.stubEnv('VITE_GEMINI_API_KEY', 'short_invalid_key');
      await expect(searchInDocuments([file], 'test')).rejects.toThrow(
        'Gemini API key is invalid',
      );

      vi.unstubAllEnvs();
    });
  });
});
