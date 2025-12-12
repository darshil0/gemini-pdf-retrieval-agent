# API Reference - DocuSearch Agent

## Overview

This document provides complete API documentation for DocuSearch Agent's services, methods, types, and interfaces.

**Version**: 1.2.2  
**Last Updated**: December 5, 2025

---

## 📦 Core Services

### GeminiService

Main service for AI-powered document processing and search.

#### Constructor

```typescript
constructor(apiKey: string, options?: GeminiServiceOptions)
```

**Parameters**:

- `apiKey` (string, required): Google Gemini API key
- `options` (GeminiServiceOptions, optional): Configuration options

**Example**:

```typescript
const service = new GeminiService("AIzaSyB...", {
  model: "gemini-2.5-flash",
  timeout: 30000,
  maxRetries: 3,
});
```

---

#### uploadDocument()

Processes and indexes a PDF document for search.

```typescript
async uploadDocument(file: File): Promise<Document>
```

**Parameters**:

- `file` (File): PDF file to process (max 200MB)

**Returns**: `Promise<Document>`

- Processed document with metadata and index

**Throws**:

- `InvalidFileError`: File type not supported or too large
- `ProcessingError`: AI processing failed
- `APIError`: Gemini API request failed

**Example**:

```typescript
try {
  const file = new File([pdfBuffer], "report.pdf", { type: "application/pdf" });
  const document = await service.uploadDocument(file);

  console.log(`Processed ${document.pageCount} pages`);
  console.log(`Document ID: ${document.id}`);
} catch (error) {
  if (error instanceof InvalidFileError) {
    console.error("Invalid file:", error.message);
  }
}
```

**Response Structure**:

```typescript
interface Document {
  id: string; // Unique identifier
  name: string; // Original filename
  pageCount: number; // Total pages
  size: number; // File size in bytes
  uploadedAt: Date; // Upload timestamp
  processedAt: Date; // Processing completion time
  metadata: {
    title?: string; // PDF title metadata
    author?: string; // PDF author
    subject?: string; // PDF subject
    keywords?: string[]; // PDF keywords
    createdDate?: Date; // PDF creation date
  };
  index: DocumentIndex; // Internal search index
}
```

---

#### search()

Searches documents using natural language query.

```typescript
async search(
  query: string,
  documents: Document[],
  options?: SearchOptions
): Promise<SearchResult[]>
```

**Parameters**:

- `query` (string, required): Natural language search query (min 3 characters)
- `documents` (Document[], required): Array of uploaded documents to search
- `options` (SearchOptions, optional): Search configuration

**Returns**: `Promise<SearchResult[]>`

- Array of search results ranked by relevance

**Throws**:

- `InvalidQueryError`: Query too short or invalid
- `SearchError`: Search execution failed
- `APIError`: Gemini API request failed

**Example**:

```typescript
const results = await service.search(
  "What were the Q4 revenue figures?",
  uploadedDocuments,
  {
    maxResults: 10,
    fuzzyMatch: true,
    semanticSearch: true,
    minConfidence: 0.7,
  },
);

results.forEach((result) => {
  console.log(`${result.document.name} - Page ${result.pageNumber}`);
  console.log(`Snippet: ${result.snippet}`);
  console.log(`Confidence: ${result.confidence}`);
});
```

**SearchOptions**:

```typescript
interface SearchOptions {
  maxResults?: number; // Max results per document (default: 5)
  fuzzyMatch?: boolean; // Enable fuzzy matching (default: true)
  semanticSearch?: boolean; // Enable semantic search (default: true)
  minConfidence?: number; // Minimum confidence score (0-1, default: 0.5)
  includeContext?: boolean; // Include surrounding text (default: true)
  contextRange?: number; // Sentences around match (default: 2)
}
```

**Response Structure**:

```typescript
interface SearchResult {
  id: string; // Unique result ID
  document: Document; // Source document
  pageNumber: number; // Page where found (1-indexed)
  snippet: string; // Text excerpt with match
  highlightedSnippet: string; // HTML with highlights
  confidence: number; // Relevance score (0-1)
  context: string; // Surrounding text
  matches: Match[]; // Individual term matches
  semanticScore: number; // Semantic relevance (0-1)
  fuzzyScore: number; // Fuzzy match score (0-1)
}

interface Match {
  term: string; // Matched term
  found: string; // Actual text found
  start: number; // Character offset
  end: number; // Character offset
  type: "exact" | "fuzzy" | "semantic";
}
```

---

#### extractContext()

Extracts context around a specific location in document.

```typescript
async extractContext(
  document: Document,
  pageNumber: number,
  options?: ContextOptions
): Promise<string>
```

**Parameters**:

- `document` (Document): Source document
- `pageNumber` (number): Page number (1-indexed)
- `options` (ContextOptions, optional): Extraction options

**Returns**: `Promise<string>`

- Contextual text from specified page

**Example**:

```typescript
const context = await service.extractContext(document, 15, {
  sentencesAround: 3,
  includePageNumbers: true,
});
```

---

### DocumentService

Manages document lifecycle and metadata.

#### validateFile()

Validates file before upload.

```typescript
validateFile(file: File): ValidationResult
```

**Parameters**:

- `file` (File): File to validate

**Returns**: `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
```

**Example**:

```typescript
const result = documentService.validateFile(file);

if (!result.valid) {
  console.error("Validation failed:", result.errors);
}

if (result.warnings) {
  console.warn("Warnings:", result.warnings);
}
```

---

#### add()

Adds document to managed collection.

```typescript
add(document: Document): void
```

**Parameters**:

- `document` (Document): Document to add

**Example**:

```typescript
documentService.add(processedDocument);
```

---

#### remove()

Removes document from collection.

```typescript
remove(id: string): boolean
```

**Parameters**:

- `id` (string): Document ID

**Returns**: `boolean`

- `true` if removed, `false` if not found

**Example**:

```typescript
const removed = documentService.remove("doc-123");
if (removed) {
  console.log("Document removed successfully");
}
```

---

#### getAll()

Retrieves all managed documents.

```typescript
getAll(): Document[]
```

**Returns**: `Document[]`

- Array of all documents

**Example**:

```typescript
const allDocs = documentService.getAll();
console.log(`Managing ${allDocs.length} documents`);
```

---

#### findById()

Finds document by ID.

```typescript
findById(id: string): Document | undefined
```

**Parameters**:

- `id` (string): Document ID

**Returns**: `Document | undefined`

- Document if found, undefined otherwise

**Example**:

```typescript
const doc = documentService.findById("doc-123");
if (doc) {
  console.log(`Found: ${doc.name}`);
}
```

---

### SearchService

Implements fuzzy and semantic search algorithms.

#### fuzzySearch()

Performs fuzzy matching on text.

```typescript
fuzzySearch(
  query: string,
  documents: Document[],
  options?: FuzzyOptions
): FuzzyResult[]
```

**Parameters**:

- `query` (string): Search query
- `documents` (Document[]): Documents to search
- `options` (FuzzyOptions, optional): Fuzzy search configuration

**Returns**: `FuzzyResult[]`

```typescript
interface FuzzyResult {
  item: Document;
  score: number; // 0-1, higher is better
  matches: FuzzyMatch[];
}

interface FuzzyMatch {
  indices: [number, number][];
  value: string;
  key: string;
}
```

**FuzzyOptions**:

```typescript
interface FuzzyOptions {
  threshold?: number; // 0-1, lower is stricter (default: 0.3)
  distance?: number; // Max distance to search (default: 100)
  ignoreLocation?: boolean; // Ignore location (default: true)
  keys?: string[]; // Fields to search (default: ['content'])
}
```

**Example**:

```typescript
const results = searchService.fuzzySearch(
  "behavoir", // Typo
  documents,
  {
    threshold: 0.3,
    keys: ["content", "metadata.title"],
  },
);

// Finds "behavior", "behavioral", etc.
```

---

#### highlightText()

Highlights search terms in text.

```typescript
highlightText(
  text: string,
  terms: string[],
  options?: HighlightOptions
): HighlightedText
```

**Parameters**:

- `text` (string): Original text
- `terms` (string[]): Terms to highlight
- `options` (HighlightOptions, optional): Highlighting options

**Returns**: `HighlightedText`

```typescript
interface HighlightedText {
  text: string; // Original text
  html: string; // HTML with <mark> tags
  highlights: Highlight[]; // Highlight positions
}

interface Highlight {
  start: number;
  end: number;
  term: string;
  found: string;
}
```

**Example**:

```typescript
const highlighted = searchService.highlightText(
  "The behavior of users...",
  ["behavoir"], // Typo
  {
    caseSensitive: false,
    matchWhole: false,
  },
);

console.log(highlighted.html);
// "The <mark>behavior</mark> of users..."
```

---

## 🎣 Custom Hooks

### useDocuments()

Hook for accessing document state.

```typescript
function useDocuments(): UseDocumentsReturn;
```

**Returns**:

```typescript
interface UseDocumentsReturn {
  documents: Document[];
  isUploading: boolean;
  uploadProgress: Map<string, number>;
  uploadDocument: (file: File) => Promise<void>;
  removeDocument: (id: string) => void;
  error: Error | null;
}
```

**Example**:

```typescript
function DocumentList() {
  const {
    documents,
    isUploading,
    uploadDocument,
    removeDocument
  } = useDocuments();

  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(file);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          {doc.name}
          <button onClick={() => removeDocument(doc.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

---

### useSearch()

Hook for search functionality.

```typescript
function useSearch(): UseSearchReturn;
```

**Returns**:

```typescript
interface UseSearchReturn {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  clearResults: () => void;
  error: Error | null;
}
```

**Example**:

```typescript
function SearchBox() {
  const {
    query,
    results,
    isSearching,
    setQuery,
    search
  } = useSearch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await search();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isSearching}
      />
      <button type="submit" disabled={isSearching || query.length < 3}>
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
```

---

### usePDFViewer()

Hook for PDF viewer state and controls.

```typescript
function usePDFViewer(document: Document | null): UsePDFViewerReturn;
```

**Parameters**:

- `document` (Document | null): Document to view

**Returns**:

```typescript
interface UsePDFViewerReturn {
  numPages: number;
  currentPage: number;
  zoom: number;
  rotation: number;
  isLoading: boolean;
  error: Error | null;

  // Navigation
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;

  // Controls
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  rotate: () => void;
  resetView: () => void;
}
```

**Example**:

```typescript
function PDFViewer({ document }: { document: Document }) {
  const {
    currentPage,
    numPages,
    zoom,
    rotation,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    rotate
  } = usePDFViewer(document);

  return (
    <div>
      <div>Page {currentPage} of {numPages}</div>

      <button onClick={prevPage} disabled={currentPage === 1}>
        Previous
      </button>
      <button onClick={nextPage} disabled={currentPage === numPages}>
        Next
      </button>

      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <button onClick={rotate}>Rotate</button>

      {/* PDF rendering */}
    </div>
  );
}
```

---

## 🔧 Utility Functions

### formatFileSize()

Formats bytes into human-readable string.

```typescript
function formatFileSize(bytes: number): string;
```

**Example**:

```typescript
formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"
formatFileSize(1073741824); // "1 GB"
```

---

### truncateText()

Truncates text to specified length.

```typescript
function truncateText(
  text: string,
  maxLength: number,
  ellipsis?: string,
): string;
```

**Example**:

```typescript
truncateText("This is a long text...", 15); // "This is a lo..."
truncateText("Short", 15); // "Short"
```

---

### debounce()

Creates debounced function.

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void;
```

**Example**:

```typescript
const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);

// Call multiple times rapidly
debouncedSearch("a");
debouncedSearch("ab");
debouncedSearch("abc"); // Only this executes after 300ms
```

---

## 🎨 Type Definitions

### Core Types

```typescript
// Document types
type DocumentId = string;
type DocumentStatus = "uploading" | "processing" | "ready" | "error";

interface Document {
  id: DocumentId;
  name: string;
  pageCount: number;
  size: number;
  status: DocumentStatus;
  uploadedAt: Date;
  processedAt: Date;
  metadata: DocumentMetadata;
  index: DocumentIndex;
}

interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  createdDate?: Date;
  modifiedDate?: Date;
  producer?: string;
  version?: string;
}

// Search types
interface SearchResult {
  id: string;
  document: Document;
  pageNumber: number;
  snippet: string;
  highlightedSnippet: string;
  confidence: number;
  context: string;
  matches: Match[];
  semanticScore: number;
  fuzzyScore: number;
}

interface Match {
  term: string;
  found: string;
  start: number;
  end: number;
  type: MatchType;
}

type MatchType = "exact" | "fuzzy" | "semantic";

// Error types
class InvalidFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileError";
  }
}

class ProcessingError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "ProcessingError";
  }
}

class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: any,
  ) {
    super(message);
    this.name = "APIError";
  }
}
```

---

## 🔐 Authentication

### API Key Configuration

DocuSearch uses Google Gemini API keys for authentication.

**Environment Variable**:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

**Getting an API Key**:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Copy and add to `.env` file

**Security Best Practices**:

- Never commit API keys to version control
- Use environment variables for all keys
- Rotate keys regularly
- Use different keys for dev/staging/prod
- Monitor API usage for anomalies

---

## 📊 Rate Limits

### Gemini API Limits

**Free Tier**:

- 60 requests per minute
- 1,500 requests per day

**Paid Tier**:

- Higher rate limits based on plan
- See [Google AI pricing](https://ai.google.dev/pricing)

**Handling Rate Limits**:

```typescript
class RateLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
  }
}

// Automatic retry with exponential backoff
async function callAPIWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof RateLimitError) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
```

---

## 🧪 Testing Utilities

### Mock Data

```typescript
// Create mock document
function createMockDocument(overrides?: Partial<Document>): Document {
  return {
    id: "mock-doc-" + Date.now(),
    name: "test.pdf",
    pageCount: 10,
    size: 1024000,
    status: "ready",
    uploadedAt: new Date(),
    processedAt: new Date(),
    metadata: {},
    index: {} as DocumentIndex,
    ...overrides,
  };
}

// Create mock search result
function createMockResult(overrides?: Partial<SearchResult>): SearchResult {
  return {
    id: "mock-result-" + Date.now(),
    document: createMockDocument(),
    pageNumber: 1,
    snippet: "Test snippet",
    highlightedSnippet: "Test <mark>snippet</mark>",
    confidence: 0.95,
    context: "Full context text",
    matches: [],
    semanticScore: 0.9,
    fuzzyScore: 0.85,
    ...overrides,
  };
}
```

### Test Helpers

```typescript
// Wait for async operations
async function waitFor(callback: () => boolean, timeout = 1000): Promise<void> {
  const startTime = Date.now();
  while (!callback()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Mock file upload
function createMockPDF(sizeInMB = 1): File {
  const buffer = new ArrayBuffer(sizeInMB * 1024 * 1024);
  return new File([buffer], "test.pdf", { type: "application/pdf" });
}
```

---

## 📚 Code Examples

### Complete Integration Example

```typescript
import { GeminiService, DocumentService, SearchService } from "./services";

// Initialize services
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const gemini = new GeminiService(apiKey);
const docService = new DocumentService();
const searchService = new SearchService();

// Upload and search workflow
async function completeWorkflow(file: File, query: string) {
  try {
    // 1. Validate file
    const validation = docService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(", "));
    }

    // 2. Upload document
    console.log("Uploading document...");
    const document = await gemini.uploadDocument(file);
    docService.add(document);
    console.log(`Document uploaded: ${document.name}`);

    // 3. Search
    console.log("Searching...");
    const results = await gemini.search(query, [document]);
    console.log(`Found ${results.length} results`);

    // 4. Process results
    for (const result of results) {
      // Highlight text
      const highlighted = searchService.highlightText(result.snippet, [query]);

      console.log(`Page ${result.pageNumber}:`);
      console.log(highlighted.html);
      console.log(`Confidence: ${result.confidence.toFixed(2)}`);
    }

    return results;
  } catch (error) {
    console.error("Workflow failed:", error);
    throw error;
  }
}

// Usage
const file = await selectPDFFile();
const results = await completeWorkflow(file, "revenue Q4");
```

---

## 📞 Support

For API questions or issues:

1. Check this documentation
2. Review [examples](./examples)
3. Search [GitHub Issues](https://github.com/your-username/gemini-pdf-retrieval-agent/issues)
4. Open new issue with API-related label

---

**Version**: 1.2.2  
**Last Updated**: December 5, 2025  
**Maintained By**: Darshil
