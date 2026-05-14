export interface SearchResult {
  docIndex: number;
  pageNumber: number;
  contextSnippet: string;
  relevanceExplanation: string;
  relevanceScore: number;
  matchedTerm: string;
}

export interface SearchResponse {
  results: SearchResult[];
  summary: string;
}

export interface UploadedFile {
  file: File;
  id: string;
  previewUrl: string;
}

export enum AppStatus {
  IDLE = "IDLE",
  ANALYZING = "ANALYZING",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR",
}
