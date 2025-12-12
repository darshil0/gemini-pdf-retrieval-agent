/**
 * Architecture Validation Tests
 * 
 * These tests ensure the codebase follows the defined agent architecture:
 * - System Layer (Persona)
 * - Tool Layer (Instructions)
 * - Protocol Layer (Constraints)
 */

import { describe, it, expect } from 'vitest';
import {
  SYSTEM_PROMPT,
  SEARCH_TOOL_PROMPT,
  UPLOAD_PROTOCOL_PROMPT,
  SEARCH_PROTOCOL_PROMPT,
  buildSearchPrompt,
  buildUploadPrompt,
  PROMPT_METADATA
} from '../services/agentPrompts';

describe('Agent Architecture Validation', () => {
  describe('System Layer (Persona)', () => {
    it('should define agent identity', () => {
      expect(SYSTEM_PROMPT).toContain('Document Retrieval and Analysis Agent');
      expect(SYSTEM_PROMPT).toContain('expert');
    });

    it('should list core capabilities', () => {
      const capabilities = [
        'Natural Language Processing',
        'Fuzzy Matching',
        'Semantic Search',
        'Cross-Document Search',
        'Page-Level Citations'
      ];

      capabilities.forEach(capability => {
        expect(SYSTEM_PROMPT).toContain(capability);
      });
    });

    it('should define constraints', () => {
      expect(SYSTEM_PROMPT).toContain('maximum of 10 PDF documents');
      expect(SYSTEM_PROMPT).toContain('PDF format');
      expect(SYSTEM_PROMPT).toContain('page numbers');
    });

    it('should specify behavior expectations', () => {
      expect(SYSTEM_PROMPT).toContain('precise');
      expect(SYSTEM_PROMPT).toContain('context');
      expect(SYSTEM_PROMPT).toContain('structured');
    });

    it('should not exceed reasonable prompt length', () => {
      // System prompt should be concise but comprehensive
      expect(SYSTEM_PROMPT.length).toBeLessThan(2000);
      expect(SYSTEM_PROMPT.length).toBeGreaterThan(500);
    });
  });

  describe('Tool Layer (Instructions)', () => {
    describe('Search Tool', () => {
      it('should provide clear search instructions', () => {
        expect(SEARCH_TOOL_PROMPT).toContain('Execute an intelligent search');
        expect(SEARCH_TOOL_PROMPT).toContain('Instructions');
      });

      it('should define fuzzy matching rules', () => {
        expect(SEARCH_TOOL_PROMPT).toContain('fuzzy matching');
        expect(SEARCH_TOOL_PROMPT).toContain('typo');
        expect(SEARCH_TOOL_PROMPT).toContain('character differences');
      });

      it('should define semantic matching rules', () => {
        expect(SEARCH_TOOL_PROMPT).toContain('semantic');
        expect(SEARCH_TOOL_PROMPT).toContain('synonyms');
        expect(SEARCH_TOOL_PROMPT).toContain('revenue');
      });

      it('should specify response format', () => {
        expect(SEARCH_TOOL_PROMPT).toContain('Response Format');
        expect(SEARCH_TOOL_PROMPT).toContain('JSON');
        expect(SEARCH_TOOL_PROMPT).toContain('results');
        expect(SEARCH_TOOL_PROMPT).toContain('documentName');
        expect(SEARCH_TOOL_PROMPT).toContain('pageNumber');
        expect(SEARCH_TOOL_PROMPT).toContain('relevanceScore');
      });

      it('should include examples', () => {
        expect(SEARCH_TOOL_PROMPT).toContain('Examples');
        expect(SEARCH_TOOL_PROMPT).toContain('color');
        expect(SEARCH_TOOL_PROMPT).toContain('colour');
      });

      it('should emphasize JSON-only output', () => {
        expect(SEARCH_TOOL_PROMPT).toContain('ONLY valid JSON');
        expect(SEARCH_TOOL_PROMPT).toContain('no additional text');
      });
    });

    describe('Upload Protocol', () => {
      it('should define upload phases', () => {
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('Phase 1');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('Phase 2');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('Phase 3');
      });

      it('should specify file validation rules', () => {
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('MIME type');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('application/pdf');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('200MB');
      });

      it('should define document limits', () => {
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('10');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('Maximum');
      });

      it('should specify error messages', () => {
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('InvalidFileType');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('FileTooLarge');
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('DocumentLimit');
      });
    });
  });

  describe('Protocol Layer (Constraints)', () => {
    describe('Search Protocol', () => {
      it('should define execution phases', () => {
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Phase 1');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Query Validation');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Phase 5');
      });

      it('should specify query validation rules', () => {
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Minimum query length: 3');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Maximum query length: 500');
      });

      it('should define error handling', () => {
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Error Handling');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('retry');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('exponential backoff');
      });

      it('should specify constraints', () => {
        expect(SEARCH_PROTOCOL_PROMPT).toContain('Constraints');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('30 seconds');
        expect(SEARCH_PROTOCOL_PROMPT).toContain('20'); // max results
      });

      it('should enforce JSON output', () => {
        expect(SEARCH_PROTOCOL_PROMPT).toContain('valid JSON');
      });
    });

    describe('Constraints Compliance', () => {
      it('should enforce maximum file size', () => {
        const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('200MB');
        
        // Simulate file size check
        const isValidSize = (size: number) => size <= MAX_FILE_SIZE;
        expect(isValidSize(100 * 1024 * 1024)).toBe(true);
        expect(isValidSize(250 * 1024 * 1024)).toBe(false);
      });

      it('should enforce maximum document count', () => {
        const MAX_DOCUMENTS = 10;
        expect(UPLOAD_PROTOCOL_PROMPT).toContain('10');
        
        // Simulate document count check
        const isValidCount = (count: number) => count < MAX_DOCUMENTS;
        expect(isValidCount(5)).toBe(true);
        expect(isValidCount(10)).toBe(false);
      });

      it('should enforce query length limits', () => {
        const MIN_QUERY_LENGTH = 3;
        const MAX_QUERY_LENGTH = 500;
        
        const isValidQuery = (query: string) => 
          query.length >= MIN_QUERY_LENGTH && 
          query.length <= MAX_QUERY_LENGTH;
        
        expect(isValidQuery('ab')).toBe(false);
        expect(isValidQuery('abc')).toBe(true);
        expect(isValidQuery('a'.repeat(600))).toBe(false);
      });
    });
  });

  describe('Prompt Builder Functions', () => {
    describe('buildSearchPrompt', () => {
      it('should combine all necessary prompts', () => {
        const query = 'test query';
        const documents = [
          { name: 'doc1.pdf', content: 'content 1' },
          { name: 'doc2.pdf', content: 'content 2' }
        ];

        const prompt = buildSearchPrompt(query, documents);

        expect(prompt).toContain(SYSTEM_PROMPT);
        expect(prompt).toContain(SEARCH_TOOL_PROMPT);
        expect(prompt).toContain(SEARCH_PROTOCOL_PROMPT);
        expect(prompt).toContain(query);
        expect(prompt).toContain('doc1.pdf');
        expect(prompt).toContain('doc2.pdf');
      });

      it('should format documents correctly', () => {
        const documents = [
          { name: 'test.pdf', content: 'test content' }
        ];

        const prompt = buildSearchPrompt('query', documents);

        expect(prompt).toContain('Document 1:');
        expect(prompt).toContain('test.pdf');
        expect(prompt).toContain('test content');
      });

      it('should emphasize JSON output', () => {
        const prompt = buildSearchPrompt('query', []);
        expect(prompt).toContain('ONLY valid JSON');
      });
    });

    describe('buildUploadPrompt', () => {
      it('should include upload protocol', () => {
        const prompt = buildUploadPrompt('test.pdf', 1000000);
        expect(prompt).toContain(UPLOAD_PROTOCOL_PROMPT);
      });

      it('should include file details', () => {
        const prompt = buildUploadPrompt('document.pdf', 5000000);
        expect(prompt).toContain('document.pdf');
        expect(prompt).toContain('5000000');
      });
    });
  });

  describe('Prompt Metadata', () => {
    it('should have version information', () => {
      expect(PROMPT_METADATA.version).toBeDefined();
      expect(PROMPT_METADATA.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should specify architecture type', () => {
      expect(PROMPT_METADATA.architecture).toBe('System-Tool-Protocol (3-layer)');
    });

    it('should define AI parameters', () => {
      expect(PROMPT_METADATA.temperature).toBeDefined();
      expect(PROMPT_METADATA.temperature).toBeLessThanOrEqual(1.0);
      expect(PROMPT_METADATA.temperature).toBeGreaterThanOrEqual(0.0);
      
      expect(PROMPT_METADATA.topP).toBeDefined();
      expect(PROMPT_METADATA.maxTokens).toBeDefined();
    });

    it('should list supported languages', () => {
      expect(PROMPT_METADATA.supportedLanguages).toContain('English');
    });

    it('should have update tracking', () => {
      expect(PROMPT_METADATA.lastUpdated).toBeDefined();
      expect(PROMPT_METADATA.author).toBeDefined();
    });
  });

  describe('Architecture Consistency', () => {
    it('should maintain consistent terminology', () => {
      const prompts = [
        SYSTEM_PROMPT,
        SEARCH_TOOL_PROMPT,
        SEARCH_PROTOCOL_PROMPT,
        UPLOAD_PROTOCOL_PROMPT
      ];

      // All prompts should use consistent terms
      const consistentTerms = [
        'document',
        'search',
        'PDF',
        'page number'
      ];

      prompts.forEach(prompt => {
        consistentTerms.forEach(term => {
          expect(prompt.toLowerCase()).toContain(term.toLowerCase());
        });
      });
    });

    it('should not contradict constraints', () => {
      // Check that file size constraints are consistent
      const prompts = [UPLOAD_PROTOCOL_PROMPT, SYSTEM_PROMPT];
      prompts.forEach(prompt => {
        if (prompt.includes('MB')) {
          expect(prompt).toContain('200MB');
        }
      });

      // Check that document limits are consistent
      prompts.forEach(prompt => {
        if (prompt.includes('maximum') && prompt.includes('documents')) {
          expect(prompt).toContain('10');
        }
      });
    });

    it('should reference JSON format consistently', () => {
      const toolPrompts = [SEARCH_TOOL_PROMPT];
      
      toolPrompts.forEach(prompt => {
        expect(prompt).toContain('JSON');
        expect(prompt.toLowerCase()).toContain('format');
      });
    });
  });

  describe('Error Handling Completeness', () => {
    it('should define error types', () => {
      const errorTypes = [
        'ValidationError',
        'RateLimitError',
        'APIError',
        'InvalidFileType',
        'FileTooLarge',
        'DocumentLimit'
      ];

      const allPrompts = [
        SEARCH_PROTOCOL_PROMPT,
        UPLOAD_PROTOCOL_PROMPT
      ].join(' ');

      errorTypes.forEach(errorType => {
        expect(allPrompts).toContain(errorType);
      });
    });

    it('should provide user-friendly error messages', () => {
      expect(UPLOAD_PROTOCOL_PROMPT).toContain('Only PDF files are supported');
      expect(UPLOAD_PROTOCOL_PROMPT).toContain('exceeds 200MB limit');
      expect(UPLOAD_PROTOCOL_PROMPT).toContain('Maximum 10 documents allowed');
    });

    it('should specify retry logic', () => {
      expect(SEARCH_PROTOCOL_PROMPT).toContain('retry');
      expect(SEARCH_PROTOCOL_PROMPT).toContain('3 times');
      expect(SEARCH_PROTOCOL_PROMPT).toContain('exponential backoff');
    });
  });

  describe('Response Format Validation', () => {
    it('should define required response fields', () => {
      expect(SEARCH_TOOL_PROMPT).toContain('documentName');
      expect(SEARCH_TOOL_PROMPT).toContain('pageNumber');
      expect(SEARCH_TOOL_PROMPT).toContain('content');
      expect(SEARCH_TOOL_PROMPT).toContain('relevanceScore');
      expect(SEARCH_TOOL_PROMPT).toContain('context');
    });

    it('should specify data types', () => {
      expect(SEARCH_TOOL_PROMPT).toContain('integer');
      expect(SEARCH_TOOL_PROMPT).toContain('float');
      expect(SEARCH_TOOL_PROMPT).toContain('string');
    });

    it('should define relevance score range', () => {
      expect(SEARCH_TOOL_PROMPT).toContain('0');
      expect(SEARCH_TOOL_PROMPT).toContain('1');
      expect(SEARCH_TOOL_PROMPT).toContain('between');
    });
  });
});
