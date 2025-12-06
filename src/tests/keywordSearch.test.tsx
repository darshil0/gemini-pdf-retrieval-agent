// src/__tests__/keywordSearch.test.ts
import { describe, it, expect } from 'vitest';
import { KeywordSearchService } from '../services/keywordSearch';

describe('KeywordSearchService', () => {
  const mockDocuments = [
    {
      documentName: 'test.pdf',
      pages: [
        {
          pageNumber: 1,
          text: 'This is a test document with keyword matches.',
          lines: ['This is a test document with keyword matches.']
        },
        {
          pageNumber: 2,
          text: 'Another page with more test content.',
          lines: ['Another page with more test content.']
        }
      ]
    }
  ];

  it('finds exact keyword matches', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments);

    expect(matches.length).toBe(2);
    expect(matches[0].matchedText).toBe('test');
    expect(matches[0].pageNumber).toBe(1);
    expect(matches[1].pageNumber).toBe(2);
  });

  it('is case insensitive by default', () => {
    const matches = KeywordSearchService.searchKeyword('TEST', mockDocuments);
    expect(matches.length).toBe(2);
  });

  it('supports case sensitive search', () => {
    const matches = KeywordSearchService.searchKeyword('TEST', mockDocuments, {
      caseSensitive: true
    });
    expect(matches.length).toBe(0);
  });

  it('supports whole word matching', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments, {
      wholeWord: true
    });
    expect(matches.every(m => /\btest\b/.test(m.fullLine))).toBe(true);
  });

  it('includes context before and after', () => {
    const matches = KeywordSearchService.searchKeyword('keyword', mockDocuments);

    expect(matches[0].contextBefore).toContain('with');
    expect(matches[0].contextAfter).toContain('matches');
  });

  it('tracks column positions', () => {
    const matches = KeywordSearchService.searchKeyword('keyword', mockDocuments);

    expect(matches[0].columnStart).toBeGreaterThan(0);
    expect(matches[0].columnEnd).toBeGreaterThan(matches[0].columnStart);
  });

  it('handles empty keyword', () => {
    expect(() => {
      KeywordSearchService.searchKeyword('', mockDocuments);
    }).toThrow('Keyword cannot be empty');
  });

  it('returns sorted results', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments);

    for (let i = 1; i < matches.length; i++) {
      const prev = matches[i - 1];
      const curr = matches[i];

      expect(
        prev.documentName <= curr.documentName &&
        (prev.documentName !== curr.documentName || prev.pageNumber <= curr.pageNumber)
      ).toBe(true);
    }
  });

  it('generates correct statistics', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments);
    const stats = KeywordSearchService.getMatchStatistics(matches);

    expect(stats.totalMatches).toBe(2);
    expect(stats.documentsWithMatches).toBe(1);
    expect(stats.pagesWithMatches).toBe(2);
  });
});
