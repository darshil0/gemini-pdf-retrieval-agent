// src/services/keywordSearch.ts

/**
 * Keyword Search Service
 * Provides exact keyword matching with location tracking and highlighting
 */

export interface KeywordMatch {
  keyword: string;
  documentName: string;
  pageNumber: number;
  lineNumber: number;
  columnStart: number;
  columnEnd: number;
  contextBefore: string;
  matchedText: string;
  contextAfter: string;
  fullLine: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  maxContextLength?: number;
}

export interface PDFTextContent {
  documentName: string;
  pages: PageContent[];
}

export interface PageContent {
  pageNumber: number;
  text: string;
  lines: string[];
}

export class KeywordSearchService {
  private static readonly DEFAULT_CONTEXT_LENGTH = 50;

  /**
   * Search for exact keyword matches across all documents
   */
  static searchKeyword(
    keyword: string,
    documents: PDFTextContent[],
    options: SearchOptions = {}
  ): KeywordMatch[] {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('Keyword cannot be empty');
    }

    const {
      caseSensitive = false,
      wholeWord = false,
      maxContextLength = this.DEFAULT_CONTEXT_LENGTH
    } = options;

    const matches: KeywordMatch[] = [];
    const searchTerm = caseSensitive ? keyword : keyword.toLowerCase();

    for (const doc of documents) {
      for (const page of doc.pages) {
        const pageMatches = this.searchInPage(
          searchTerm,
          page,
          doc.documentName,
          caseSensitive,
          wholeWord,
          maxContextLength
        );
        matches.push(...pageMatches);
      }
    }

    return matches.sort((a, b) => {
      if (a.documentName !== b.documentName) {
        return a.documentName.localeCompare(b.documentName);
      }
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
      return a.lineNumber - b.lineNumber;
    });
  }

  /**
   * Search within a single page
   */
  private static searchInPage(
    searchTerm: string,
    page: PageContent,
    documentName: string,
    caseSensitive: boolean,
    wholeWord: boolean,
    maxContextLength: number
  ): KeywordMatch[] {
    const matches: KeywordMatch[] = [];

    page.lines.forEach((line, lineIndex) => {
      const searchLine = caseSensitive ? line : line.toLowerCase();
      const lineMatches = this.findMatchesInLine(
        searchTerm,
        line,
        searchLine,
        wholeWord
      );

      lineMatches.forEach(match => {
        const contextBefore = line
          .substring(Math.max(0, match.start - maxContextLength), match.start)
          .trim();
        const contextAfter = line
          .substring(match.end, Math.min(line.length, match.end + maxContextLength))
          .trim();

        matches.push({
          keyword: searchTerm,
          documentName,
          pageNumber: page.pageNumber,
          lineNumber: lineIndex + 1,
          columnStart: match.start,
          columnEnd: match.end,
          contextBefore,
          matchedText: line.substring(match.start, match.end),
          contextAfter,
          fullLine: line
        });
      });
    });

    return matches;
  }

  /**
   * Find all matches of the search term in a line
   */
  private static findMatchesInLine(
    searchTerm: string,
    originalLine: string,
    searchLine: string,
    wholeWord: boolean
  ): Array<{ start: number; end: number }> {
    const matches: Array<{ start: number; end: number }> = [];

    let index = searchLine.indexOf(searchTerm);
    while (index !== -1) {
      const isValid = !wholeWord || this.isWholeWordMatch(
        searchLine,
        index,
        index + searchTerm.length
      );

      if (isValid) {
        matches.push({
          start: index,
          end: index + searchTerm.length
        });
      }

      index = searchLine.indexOf(searchTerm, index + 1);
    }

    return matches;
  }

  /**
   * Check if match is a whole word
   */
  private static isWholeWordMatch(
    text: string,
    start: number,
    end: number
  ): boolean {
    const wordBoundary = /\b/;
    const beforeChar = start > 0 ? text[start - 1] : ' ';
    const afterChar = end < text.length ? text[end] : ' ';

    return wordBoundary.test(beforeChar) && wordBoundary.test(afterChar);
  }

  /**
   * Extract text content from PDF with page and line information
   */
  static async extractPDFTextContent(file: File): Promise<PDFTextContent> {
    // This requires pdf.js or similar library
    // For now, returning structure - implementation depends on pdf.js setup
    const pdfjsLib = (window as { pdfjsLib?: { getDocument: (config: { data: ArrayBuffer }) => { promise: { numPages: number; getPage: (pageNumber: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> } } } }).pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: PageContent[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: { str: string }) => item.str).join(' ');
      const lines = text.split(/\n/).filter(line => line.trim().length > 0);

      pages.push({
        pageNumber: i,
        text,
        lines
      });
    }

    return {
      documentName: file.name,
      pages
    };
  }

  /**
   * Generate highlighted HTML for a match
   */
  static generateHighlightedHTML(match: KeywordMatch): string {
    return `
      <div class="keyword-match">
        <span class="context-before">${this.escapeHtml(match.contextBefore)}</span>
        <mark class="keyword-highlight">${this.escapeHtml(match.matchedText)}</mark>
        <span class="context-after">${this.escapeHtml(match.contextAfter)}</span>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get match statistics
   */
  static getMatchStatistics(matches: KeywordMatch[]): {
    totalMatches: number;
    documentsWithMatches: number;
    pagesWithMatches: number;
    matchesByDocument: Map<string, number>;
    matchesByPage: Map<string, number>;
  } {
    const matchesByDocument = new Map<string, number>();
    const matchesByPage = new Map<string, number>();
    const uniqueDocuments = new Set<string>();
    const uniquePages = new Set<string>();

    matches.forEach(match => {
      uniqueDocuments.add(match.documentName);
      const pageKey = `${match.documentName}:${match.pageNumber}`;
      uniquePages.add(pageKey);

      matchesByDocument.set(
        match.documentName,
        (matchesByDocument.get(match.documentName) || 0) + 1
      );
      matchesByPage.set(pageKey, (matchesByPage.get(pageKey) || 0) + 1);
    });

    return {
      totalMatches: matches.length,
      documentsWithMatches: uniqueDocuments.size,
      pagesWithMatches: uniquePages.size,
      matchesByDocument,
      matchesByPage
    };
  }
}

export default KeywordSearchService;
