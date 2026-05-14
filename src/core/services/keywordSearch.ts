/**
 * Represents a parsed document with pages and text content.
 */
interface Document {
  documentName: string;
  pages: {
    pageNumber: number;
    text: string;
    lines: string[];
  }[];
}

/**
 * Represents a single keyword match found in a document.
 * Includes position information and surrounding context.
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

/**
 * Options for controlling keyword search behavior.
 */
interface SearchOptions {
  /** Whether the search should be case-sensitive. Defaults to false. */
  caseSensitive?: boolean;
  /** Whether to match whole words only. Defaults to false. */
  wholeWord?: boolean;
  /** Maximum number of characters to include in context before/after match. Defaults to 50. */
  maxContextLength?: number;
}

/**
 * Aggregate statistics about keyword matches across documents.
 */
interface MatchStatistics {
  totalMatches: number;
  documentsWithMatches: number;
  pagesWithMatches: number;
}

export const KeywordSearchService = {
  /**
   * Searches for a keyword across all pages of all provided documents.
   * Supports case-insensitive, whole-word, and fuzzy matching.
   * Results are sorted by document name and page number.
   *
   * @param keyword - The search term to find
   * @param documents - Array of parsed documents to search through
   * @param options - Optional search configuration
   * @returns Array of KeywordMatch objects sorted by document and page
   * @throws {Error} If keyword is empty
   *
   * @example
   * ```ts
   * const matches = KeywordSearchService.searchKeyword("revenue", docs, { caseSensitive: false });
   * ```
   */
  searchKeyword(
    keyword: string,
    documents: Document[],
    options: SearchOptions = {},
  ): KeywordMatch[] {
    if (!keyword) {
      throw new Error("Keyword cannot be empty");
    }

    const {
      caseSensitive = false,
      wholeWord = false,
      maxContextLength = 50,
    } = options;
    const matches: KeywordMatch[] = [];
    const regex = new RegExp(
      wholeWord ? `\\b${keyword}\\b` : keyword,
      caseSensitive ? "g" : "gi",
    );

    documents.forEach((doc) => {
      doc.pages.forEach((page) => {
        page.lines.forEach((line, lineIndex) => {
          let match;
          while ((match = regex.exec(line)) !== null) {
            const matchedText = match[0];
            const columnStart = match.index;
            const columnEnd = columnStart + matchedText.length;
            const contextBefore = line.substring(
              Math.max(0, columnStart - maxContextLength),
              columnStart,
            );
            const contextAfter = line.substring(
              columnEnd,
              Math.min(line.length, columnEnd + maxContextLength),
            );

            matches.push({
              keyword,
              documentName: doc.documentName,
              pageNumber: page.pageNumber,
              lineNumber: lineIndex + 1,
              columnStart: columnStart + 1,
              columnEnd: columnEnd + 1,
              contextBefore,
              matchedText,
              contextAfter,
              fullLine: line,
            });
          }
        });
      });
    });

    return matches.sort((a, b) => {
      if (a.documentName < b.documentName) return -1;
      if (a.documentName > b.documentName) return 1;
      if (a.pageNumber < b.pageNumber) return -1;
      if (a.pageNumber > b.pageNumber) return 1;
      return 0;
    });
  },

  /**
   * Calculates aggregate statistics for a set of keyword matches.
   *
   * @param matches - Array of KeywordMatch objects to analyze
   * @returns Statistics including total matches, documents with matches, and pages with matches
   *
   * @example
   * ```ts
   * const stats = KeywordSearchService.getMatchStatistics(matches);
   * console.log(`Found ${stats.totalMatches} in ${stats.documentsWithMatches} docs`);
   * ```
   */
  getMatchStatistics(matches: KeywordMatch[]): MatchStatistics {
    const documentsWithMatches = new Set(matches.map((m) => m.documentName))
      .size;
    const pagesWithMatches = new Set(
      matches.map((m) => `${m.documentName}-${m.pageNumber}`),
    ).size;

    return {
      totalMatches: matches.length,
      documentsWithMatches,
      pagesWithMatches,
    };
  },
};
