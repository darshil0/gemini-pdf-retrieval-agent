interface Document {
  documentName: string;
  pages: {
    pageNumber: number;
    text: string;
    lines: string[];
  }[];
}

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

interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  maxContextLength?: number;
}

interface MatchStatistics {
  totalMatches: number;
  documentsWithMatches: number;
  pagesWithMatches: number;
}

export const KeywordSearchService = {
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
