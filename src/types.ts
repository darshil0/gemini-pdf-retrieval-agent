export interface SearchResult {
  docIndex: number;
  pageNumber: number;
  contextSnippet: string;
  relevanceExplanation: string;
  matchedTerm?: string; // The specific variation found (e.g. 'color' vs 'colour')
}

export interface SearchResponse {
  results: SearchResult[];
  summary: string;
}

export interface UploadedFile {
  file: File;
  id: string;
  previewUrl?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}