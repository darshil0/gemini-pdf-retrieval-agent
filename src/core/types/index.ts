/**
 * Core Type Definitions
 *
 * Defines the core domain interfaces and status enumerations used
 * throughout the DocuSearch Agent application.
 *
 * @module types
 * @since v1.0.0
 */

/**
 * Represents an individual search match within a PDF document.
 */
export interface SearchResult {
  /** Zero-based index of the document in the list of uploaded files. */
  docIndex: number;
  /** 1-based page number where the match was located. */
  pageNumber: number;
  /** Text excerpt surrounding the matched term. */
  contextSnippet: string;
  /** AI-generated explanation detailing why the text matched the query. */
  relevanceExplanation: string;
  /** Confidence score between 0.0 and 1.0 indicating relevance. */
  relevanceScore: number;
  /** Exact term or phrase identified in the document text. */
  matchedTerm: string;
}

/**
 * Structured response payload returned by the Gemini search service.
 */
export interface SearchResponse {
  /** Array of ranked search result items. */
  results: SearchResult[];
  /** Overview summary synthesized by the AI model. */
  summary: string;
}

/**
 * Represents an uploaded file with associated metadata and ObjectURL preview.
 */
export interface UploadedFile {
  /** The underlying browser File object. */
  file: File;
  /** Unique identifier generated for file tracking. */
  id: string;
  /** ObjectURL string used for rendering PDF previews. */
  previewUrl: string;
}

/**
 * Application state enum tracking current search execution status.
 */
export enum AppStatus {
  /** Idle state, ready for input or uploads. */
  IDLE = 'IDLE',
  /** Currently sending files/query to Gemini and processing response. */
  ANALYZING = 'ANALYZING',
  /** Search successfully completed with results. */
  COMPLETE = 'COMPLETE',
  /** Search or validation encountered an error. */
  ERROR = 'ERROR',
}
