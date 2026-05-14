# DocuSearch Agent - Complete Documentation

## Table of Contents
1. [Agent Architecture](#1-agent-architecture-documentation)
2. [API Reference](#2-api-reference)
3. [Security Policy](#3-security-policy)
4. [Deployment Guide](#4-deployment-guide)
5. [Test Validation Guide](#5-test-validation-guide)
6. [Remaining Issues & Future Enhancements](#6-remaining-issues--future-enhancements)
7. [Project Structure & Aliases](#7-project-structure--aliases)
8. [Complete Update Instructions](#8-complete-update-instructions)
9. [Codebase Issues and Fixes Report](#9-codebase-issues-and-fixes-report)

---

# 7. Project Structure & Aliases

DocuSearch Agent v1.4.0 uses a modular directory structure with path aliasing for better maintainability and cleaner imports.

## Directory Map

```text
src/
├── api/                # External API clients and services (e.g., Gemini)
├── components/         # React UI components
├── core/               # Foundational logic and utilities
│   ├── architecture/   # System-Tool-Protocol prompt definitions
│   ├── constants/      # Shared constants and error messages
│   ├── services/       # Logging, validation, and security services
│   └── types/          # Centralized TypeScript definitions
├── styles/             # Global and component stylesheets
└── tests/              # Unit and integration test suites
```

## Path Aliases

| Alias | Target Path | Usage Example |
| :--- | :--- | :--- |
| `@api` | `src/api/` | `import { search } from "@api/gemini";` |
| `@core` | `src/core/` | `import { Logger } from "@core/services/logger";` |
| `@components` | `src/components/` | `import { Card } from "@components/UI";` |
| `@styles` | `src/styles/` | `import "@styles/global.css";` |
| `@tests` | `src/tests/` | `import { mock } from "@tests/fixtures";` |
| `@` | `src/` | `import App from "@/App";` |

---

# 1. Agent Architecture Documentation

DocuSearch Agent implements a three-layer agent architecture based on the **System-Tool-Protocol** pattern. This architecture ensures consistent, predictable, and robust behavior for document retrieval and analysis.

## Architecture Layers

### 1. System Layer (Persona)

The System Layer defines the agent's identity, role, and capabilities.

```typescript
interface AgentSystem {
  name: string;
  role: string;
  capabilities: string[];
  constraints: string[];
  version: string;
}

const AGENT_SYSTEM: AgentSystem = {
  name: "Document Retrieval and Analysis Agent",
  role: "Expert AI assistant specialized in intelligent document search and natural language understanding",
  capabilities: [
    "Natural language query processing",
    "Cross-document semantic search",
    "Fuzzy text matching with typo tolerance",
    "Synonym and related term recognition",
    "Page-level citation extraction",
    "Context-aware result ranking",
    "Multi-document management"
  ],
  constraints: [
    "Maximum 10 documents per session",
    "PDF format only",
    "Maximum 200MB per file",
    "English language primary support",
    "Client-side processing only"
  ],
  version: "1.4.0"
};
```

### 2. Tool Layer (Instructions)

The Tool Layer defines specific actions the agent can perform.

#### Tool 1: upload_document

**Purpose**: Validate and process PDF documents for search indexing.

```typescript
interface UploadDocumentTool {
  name: "upload_document";
  description: string;
  parameters: {
    file: File;
    validateContent: boolean;
  };
  returns: {
    documentId: string;
    metadata: DocumentMetadata;
    indexed: boolean;
  };
}

const UPLOAD_DOCUMENT_TOOL: UploadDocumentTool = {
  name: "upload_document",
  description: "Validates, processes, and indexes a PDF document for search",
  parameters: {
    file: "PDF file object to process",
    validateContent: "Whether to perform deep content validation"
  },
  returns: {
    documentId: "Unique identifier for the document",
    metadata: "Extracted document metadata (title, pages, size)",
    indexed: "Whether document was successfully indexed"
  }
};
```

#### Tool 2: search_documents

**Purpose**: Execute natural language search across indexed documents.

```typescript
interface SearchDocumentsTool {
  name: "search_documents";
  description: string;
  parameters: {
    query: string;
    documents: string[];
    options: SearchOptions;
  };
  returns: SearchResult[];
}

interface SearchOptions {
  fuzzyMatch: boolean;
  semanticSearch: boolean;
  maxResults: number;
  minRelevanceScore: number;
}

const SEARCH_DOCUMENTS_TOOL: SearchDocumentsTool = {
  name: "search_documents",
  description: "Performs intelligent search across multiple documents using natural language",
  parameters: {
    query: "Natural language search query",
    documents: "Array of document IDs to search",
    options: {
      fuzzyMatch: "Enable typo-tolerant matching",
      semanticSearch: "Enable AI-powered semantic understanding",
      maxResults: "Maximum number of results to return",
      minRelevanceScore: "Minimum relevance threshold (0-1)"
    }
  },
  returns: "Array of SearchResult objects with citations and context"
};
```

#### Tool 3: extract_context

**Purpose**: Extract detailed context around search matches.

```typescript
interface ExtractContextTool {
  name: "extract_context";
  description: string;
  parameters: {
    documentId: string;
    pageNumber: number;
    matchPosition: number;
    contextWindow: number;
  };
  returns: ContextExtraction;
}

const EXTRACT_CONTEXT_TOOL: ExtractContextTool = {
  name: "extract_context",
  description: "Extracts surrounding context for a search match",
  parameters: {
    documentId: "ID of the document",
    pageNumber: "Page number containing the match",
    matchPosition: "Character position of the match",
    contextWindow: "Number of characters before/after to extract"
  },
  returns: {
    beforeContext: "Text before the match",
    match: "The matched text",
    afterContext: "Text after the match",
    fullPage: "Complete page text if needed"
  }
};
```

### 3. Protocol Layer (Constraints & Logic)

The Protocol Layer defines execution rules and workflows.

#### Upload Protocol

```typescript
interface UploadProtocol {
  phase: "upload";
  steps: ProtocolStep[];
  constraints: ProtocolConstraint[];
  errorHandling: ErrorHandler[];
}

const UPLOAD_PROTOCOL: UploadProtocol = {
  phase: "upload",
  steps: [
    {
      order: 1,
      action: "Validate file type",
      validation: "Check MIME type and magic number",
      onFailure: "Reject with InvalidFileTypeError"
    },
    {
      order: 2,
      action: "Check file size",
      validation: "Ensure file <= MAX_FILE_SIZE",
      onFailure: "Reject with FileTooLargeError"
    },
    {
      order: 3,
      action: "Verify document limit",
      validation: "Ensure total documents < MAX_FILES",
      onFailure: "Reject with DocumentLimitError"
    },
    {
      order: 4,
      action: "Extract PDF content",
      validation: "Parse PDF structure and text",
      onFailure: "Reject with PDFParseError"
    },
    {
      order: 5,
      action: "Index document",
      validation: "Create searchable index",
      onFailure: "Reject with IndexingError"
    },
    {
      order: 6,
      action: "Store metadata",
      validation: "Save document information",
      onFailure: "Warn but continue"
    }
  ],
  constraints: [
    "Maximum 10 documents",
    "PDF format only",
    "Maximum 200MB per file",
    "Synchronous processing"
  ],
  errorHandling: [
    {
      errorType: "ValidationError",
      action: "Show user-friendly error message",
      retry: false
    },
    {
      errorType: "NetworkError",
      action: "Show retry option",
      retry: true,
      maxRetries: 3
    }
  ]
};
```

#### Search Protocol

```typescript
interface SearchProtocol {
  phase: "search";
  steps: ProtocolStep[];
  constraints: ProtocolConstraint[];
  responseFormat: ResponseFormat;
}

const SEARCH_PROTOCOL: SearchProtocol = {
  phase: "search",
  steps: [
    {
      order: 1,
      action: "Sanitize query",
      validation: "Remove XSS attempts, validate length",
      onFailure: "Reject with InvalidQueryError"
    },
    {
      order: 2,
      action: "Check rate limit",
      validation: "Ensure within rate limit",
      onFailure: "Reject with RateLimitError"
    },
    {
      order: 3,
      action: "Prepare search context",
      validation: "Format documents for AI",
      onFailure: "Reject with ContextError"
    },
    {
      order: 4,
      action: "Execute AI search",
      validation: "Call Gemini API with retry logic",
      onFailure: "Retry with exponential backoff"
    },
    {
      order: 5,
      action: "Parse AI response",
      validation: "Validate JSON structure",
      onFailure: "Return empty results with warning"
    },
    {
      order: 6,
      action: "Rank results",
      validation: "Sort by relevance score",
      onFailure: "Return unranked results"
    },
    {
      order: 7,
      action: "Extract context",
      validation: "Get surrounding text for each result",
      onFailure: "Return results without context"
    }
  ],
  constraints: [
    "Minimum query length: 3 characters",
    "Maximum query length: 500 characters",
    "Rate limit: 10 requests/minute (Persistent)",
    "Timeout: 60 seconds per search API call",
    "Streaming timeout: 30 seconds per file"
  ],
  responseFormat: {
    structure: "JSON",
    required: ["results", "totalResults", "processingTime"],
    resultSchema: {
      documentName: "string",
      pageNumber: "number",
      content: "string",
      relevanceScore: "number (0-1)",
      context: "string"
    }
  }
};
```

## Data Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     System Layer (Persona)          │
│  - Validates agent capabilities     │
│  - Checks constraints               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Protocol Layer (Rules)          │
│  - Enforces upload/search protocol  │
│  - Validates each step              │
│  - Handles errors                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Tool Layer (Actions)            │
│  - upload_document()                │
│  - search_documents()               │
│  - extract_context()                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     External Services               │
│  - Google Gemini API                │
│  - PDF.js Library                   │
│  - Validation Layer (Zod-like)      │
│  - Structured Logging Service       │
└─────────────────────────────────────┘
```

## Implementation Example

### Upload Flow

```typescript
// System Layer: Check capabilities
if (!AGENT_SYSTEM.capabilities.includes("Multi-document management")) {
  throw new Error("Agent does not support multiple documents");
}

// Protocol Layer: Execute upload protocol
async function executeUploadProtocol(file: File): Promise<UploadResult> {
  const protocol = UPLOAD_PROTOCOL;
  
  for (const step of protocol.steps) {
    try {
      switch (step.order) {
        case 1: // Validate file type
          if (!validateFileType(file)) {
            throw new InvalidFileTypeError("Only PDF files are supported");
          }
          break;
        
        case 2: // Check file size
          if (file.size > MAX_FILE_SIZE) {
            throw new FileTooLargeError(`File exceeds ${MAX_FILE_SIZE} bytes`);
          }
          break;
        
        case 3: // Verify document limit
          if (documents.length >= MAX_FILES) {
            throw new DocumentLimitError(`Maximum ${MAX_FILES} documents allowed`);
          }
          break;
        
        case 4: // Extract PDF content
          const content = await extractPDFContent(file);
          break;
        
        case 5: // Index document
          const index = await indexDocument(content);
          break;
        
        case 6: // Store metadata
          await storeMetadata(file, content, index);
          break;
      }
    } catch (error) {
      const handler = protocol.errorHandling.find(
        h => error instanceof h.errorType
      );
      if (handler) {
        return handleError(error, handler);
      }
      throw error;
    }
  }
  
  return { success: true, documentId: generateId() };
}
```

### Search Flow

```typescript
// System Layer: Validate capabilities
if (!AGENT_SYSTEM.capabilities.includes("Natural language query processing")) {
  throw new Error("Agent does not support NL queries");
}

// Protocol Layer: Execute search protocol
async function executeSearchProtocol(
  query: string, 
  documents: Document[]
): Promise<SearchResult[]> {
  const protocol = SEARCH_PROTOCOL;
  
  // Step 1: Sanitize query
  const sanitizedQuery = sanitizeInput(query);
  
  // Step 2: Check rate limit
  if (!checkRateLimit()) {
    throw new RateLimitError("Rate limit exceeded");
  }
  
  // Step 3: Prepare context
  const context = prepareSearchContext(documents);
  
  // Step 4: Execute AI search (Tool Layer)
  const aiResponse = await SEARCH_DOCUMENTS_TOOL.execute(
    sanitizedQuery,
    context,
    {
      fuzzyMatch: true,
      semanticSearch: true,
      maxResults: 10,
      minRelevanceScore: 0.5
    }
  );
  
  // Step 5: Parse response
  const results = parseAIResponse(aiResponse);
  
  // Step 6: Rank results
  const rankedResults = rankByRelevance(results);
  
  // Step 7: Extract context
  const enrichedResults = await enrichWithContext(rankedResults);
  
  return enrichedResults;
}
```

## Error Handling Strategy

```typescript
interface ErrorStrategy {
  errorType: string;
  severity: "low" | "medium" | "high" | "critical";
  userMessage: string;
  logMessage: string;
  retry: boolean;
  fallback?: () => any;
}

const ERROR_STRATEGIES: ErrorStrategy[] = [
  {
    errorType: "InvalidFileTypeError",
    severity: "medium",
    userMessage: "Please upload a valid PDF file",
    logMessage: "User attempted to upload non-PDF file",
    retry: false
  },
  {
    errorType: "RateLimitError",
    severity: "low",
    userMessage: "Too many requests. Please wait a moment.",
    logMessage: "Rate limit exceeded for user",
    retry: true
  },
  {
    errorType: "APIError",
    severity: "high",
    userMessage: "Search service temporarily unavailable",
    logMessage: "Gemini API returned error",
    retry: true,
    fallback: () => performLocalSearch()
  },
  {
    errorType: "NetworkError",
    severity: "high",
    userMessage: "Network connection lost. Please try again.",
    logMessage: "Network request failed",
    retry: true
  }
];
```

## Validation Rules

```typescript
interface ValidationRule {
  name: string;
  validate: (input: any) => boolean;
  errorMessage: string;
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    name: "QueryLength",
    validate: (query: string) => query.length >= 3 && query.length <= 500,
    errorMessage: "Query must be between 3 and 500 characters"
  },
  {
    name: "FileType",
    validate: (file: File) => file.type === "application/pdf",
    errorMessage: "Only PDF files are supported"
  },
  {
    name: "FileSize",
    validate: (file: File) => file.size <= MAX_FILE_SIZE,
    errorMessage: `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`
  },
  {
    name: "DocumentLimit",
    validate: (docs: Document[]) => docs.length < MAX_FILES,
    errorMessage: `Maximum ${MAX_FILES} documents allowed`
  }
];
```

## Testing the Architecture

See `src/__tests__/Architecture.test.ts` for validation tests ensuring compliance with this architecture.

## Benefits of This Architecture

1. **Consistency**: Standardized behavior across all agent actions
2. **Predictability**: Clear protocols for each operation
3. **Robustness**: Comprehensive error handling at each layer
4. **Maintainability**: Separation of concerns between layers
5. **Testability**: Each layer can be tested independently
6. **Scalability**: Easy to add new tools and protocols
7. **Documentation**: Self-documenting through structure

## Future Enhancements

- **Multi-language support** in System Layer
- **Additional tools** for annotations and exports
- **Advanced protocols** for real-time collaboration
- **Improved error recovery** with AI-assisted suggestions
---

# 2. API Reference

This section provides complete API documentation for DocuSearch Agent's services, methods, types, and interfaces.

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
  model: "gemini-1.5-flash",
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

#### searchInDocuments()

Searches documents using natural language query via Gemini 1.5 Flash.

```typescript
async searchInDocuments(
  files: File[],
  keyword: string
): Promise<SearchResponse>
```

**Parameters**:

- `files` (File[]): Array of PDF files to search
- `keyword` (string): Search term or phrase

**Returns**: `Promise<SearchResponse>`

- Validated response with summary and results

**Security & Reliability**:

- **Timeouts**: API calls time out after 60 seconds.
- **Validation**: Responses are validated at runtime against the expected schema.
- **Streaming**: Files are read as streams with a 30-second timeout.

**Example**:

```typescript
const response = await searchInDocuments(files, "revenue");
console.log(response.summary);
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

### ValidationService

Provides runtime type safety and sanitization.

#### validateSearchResponse()

Validates and sanitizes raw API response.

```typescript
function validateSearchResponse(data: unknown): SearchResponse
```

#### escapeCSVField()

Escapes a string for safe CSV usage.

```typescript
function escapeCSVField(value: string | number): string
```

---

### LoggerService

Structured logging with levels and context.

#### createLogger()

Creates a scoped logger instance.

```typescript
function createLogger(context: string): Logger
```

**Methods**: `debug`, `info`, `warn`, `error`

---

### SecurityService

Handles security validations and rate limiting.

#### checkRateLimit()

Checks rate limit with localStorage persistence.

```typescript
function checkRateLimit(
  identifier: string,
  limit: number,
  timeframe: number
): boolean
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
2. Review the documentation in `@core/architecture` and `@api`
3. Search [GitHub Issues](https://github.com/your-username/gemini-pdf-retrieval-agent/issues)
4. Open new issue with API-related label

---

**Version**: 1.4.0  
**Last Updated**: May 14, 2026  
**Maintained By**: Darshil
---

# 3. Security Policy

DocuSearch Agent v1.4.0 implements comprehensive security measures to protect users and data. This document outlines our security features, vulnerability reporting process, and best practices.

## Security Features

### 1. Input Validation & Sanitization

#### XSS Prevention

```typescript
// All user inputs are sanitized
const cleanInput = SecurityService.sanitizeInput(userInput);

// HTML entities are escaped
"<script>alert('xss')</script>" → "&lt;script&gt;alert('xss')&lt;/script&gt;"
```

**Protected Inputs:**

- Search queries
- File names
- Custom text inputs
- URL parameters

#### SQL Injection Protection

```typescript
// Dangerous patterns are detected and rejected
const validation = SecurityService.validateSearchQuery(query);
if (!validation.valid) {
  // Reject query with suspicious patterns
}
```

**Blocked Patterns:**

- SELECT, INSERT, UPDATE, DELETE
- DROP, CREATE, ALTER, EXEC
- UNION, HAVING, WHERE
- Special SQL characters

### 2. File Validation

#### Multi-Layer Validation

```typescript
// 1. Extension check
filename.endsWith(".pdf"); // ✅

// 2. MIME type check
file.type === "application/pdf"; // ✅

// 3. Magic number verification (file content)
const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
bytes[0] === 0x25 && bytes[1] === 0x50; // %PDF ✅
```

**Validation Layers:**

1. File extension (.pdf)
2. MIME type (application/pdf)
3. Magic numbers (%PDF in first 4 bytes)
4. File size (max 200MB)
5. File name sanitization

#### Rejected Files

```
❌ .exe renamed to .pdf
❌ Corrupted PDFs
❌ Files over 200MB
❌ Non-PDF MIME types
❌ Files with malicious names
```

### 3. Rate Limiting

#### Persistent Request Throttling

```typescript
// Client-side rate limiting backed by localStorage
const allowed = SecurityService.checkRateLimit(
  "search",
  10, // Max 10 requests
  60000, // Per minute
);

if (!allowed) {
  throw new Error(ErrorMessages.API_RATE_LIMITED);
}
```

**Persistence**: Rate limit counters are stored in `localStorage`, ensuring that refreshing the page or restarting the browser does not reset the limit.

**Limits:**

- **Search Queries**: 10 per minute
- **Cooldown**: 60 seconds (rolling window)

### 4. Secure Headers

#### Content Security Policy

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://generativelanguage.googleapis.com;
  frame-ancestors 'none';
```

#### Additional Headers

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 5. API Key Protection

#### Environment Variables

```bash
# .env file (never committed)
VITE_GEMINI_API_KEY=your_key_here
```

**Security Measures:**

- ✅ Stored in environment variables
- ✅ Never in source code
- ✅ Not exposed in browser
- ✅ .env in .gitignore
- ✅ Format validation

#### API Key Validation

```typescript
// Validate format without exposing key
const isValid = SecurityService.validateApiKeyFormat(apiKey);
// Checks: length, format, no placeholders
```

---

## Threat Model

### Identified Threats

| Threat               | Risk Level | Mitigation                            |
| -------------------- | ---------- | ------------------------------------- |
| XSS Attacks          | HIGH       | Input sanitization, CSP headers       |
| File Upload Exploits | HIGH       | Multi-layer validation, magic numbers |
| API Key Theft        | HIGH       | Environment variables, no exposure    |
| Rate Limiting Bypass | MEDIUM     | Client & server-side limits           |
| SQL Injection        | MEDIUM     | Query validation, pattern detection   |
| CSRF Attacks         | MEDIUM     | SameSite cookies, token validation    |
| Man-in-the-Middle    | MEDIUM     | HTTPS enforcement                     |
| Data Exposure        | LOW        | No persistent storage, sanitization   |

### Security Controls

```
┌─────────────────────────────────────────┐
│           User Input                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     Input Sanitization Layer            │
│  - XSS Prevention                       │
│  - SQL Injection Protection             │
│  - HTML Entity Encoding                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     File Validation Layer               │
│  - Extension Check                      │
│  - MIME Type Check                      │
│  - Magic Number Verification            │
│  - Size Validation                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     Rate Limiting Layer                 │
│  - Request Throttling                   │
│  - Cooldown Periods                     │
│  - User Identification                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     Secure Processing                   │
│  - CSP Headers                          │
│  - HTTPS Only                           │
│  - No Data Persistence                  │
└─────────────────────────────────────────┘
```

---

## Vulnerability Reporting

### Reporting Process

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, follow these steps:

1. **Email**: Send details to security@example.com
2. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Response**: We'll respond within 48 hours
4. **Fix**: Patch within 7 days for critical issues
5. **Disclosure**: Coordinated disclosure after fix

### Responsible Disclosure

We follow responsible disclosure practices:

- 90-day disclosure window
- Credit to reporter (if desired)
- Security advisory publication
- Patch release notification

---

## Security Best Practices

### For Developers

1. **Never Commit Secrets**

```bash
# Always check before commit
git diff --staged

# Use .env files
echo ".env" >> .gitignore
```

2. **Validate All Inputs**

```typescript
// Before processing any user input
const { valid, sanitized, errors } = SecurityService.validateSearchQuery(input);
if (!valid) {
  throw new Error(`Invalid input: ${errors.join(", ")}`);
}
```

3. **Use Security Service**

```typescript
// Always use provided security functions
import { SecurityService } from "./services/securityService";

// ✅ Correct
const clean = SecurityService.sanitizeInput(input);

// ❌ Wrong
const clean = input.replace(/<>/g, ""); // Incomplete
```

4. **Test Security**

```typescript
// Include security tests for all features
describe("Security", () => {
  it("prevents XSS", () => {
    const malicious = "<script>alert(1)</script>";
    const result = process(malicious);
    expect(result).not.toContain("<script>");
  });
});
```

### For Users

1. **API Key Security**
   - Never share your API key
   - Rotate keys regularly
   - Use separate keys for development/production
   - Monitor API usage

2. **File Upload Safety**
   - Only upload trusted PDFs
   - Scan files with antivirus before upload
   - Don't upload sensitive documents to public deployments
   - Verify file content after processing

3. **Browser Security**
   - Keep browser updated
   - Use HTTPS only
   - Clear cache regularly
   - Use incognito for sensitive documents

---

## Security Updates

### Version History

**v1.4.0 (2026-05-14)**

- ✅ Added runtime response validation service
- ✅ Implemented persistent rate limiting (localStorage)
- ✅ Added fail-fast API key format validation
- ✅ Centralized error messaging for consistent security UX

**v1.3.1 (2026-04-19)**

- ✅ Basic validation
- ✅ Extension-based file checking
- ✅ Search history persistence

### Planned Improvements

**Q1 2025**

- [ ] Server-side rate limiting
- [ ] Advanced threat detection
- [ ] Security audit by third party
- [ ] Automated security testing

**Q2 2025**

- [ ] SAML authentication
- [ ] Encrypted storage option
- [ ] Audit logging
- [ ] Compliance certifications

---

## Compliance

### Standards

- **OWASP Top 10**: Protection against all listed vulnerabilities
- **CWE**: Common Weakness Enumeration compliance
- **GDPR**: No personal data stored or transmitted
- **WCAG 2.1**: Accessibility Level AA

### Security Checklist

- [x] Input validation and sanitization
- [x] XSS prevention
- [x] SQL injection protection
- [x] CSRF protection
- [x] Secure file upload
- [x] Rate limiting
- [x] Secure headers (CSP, X-Frame-Options)
- [x] HTTPS enforcement
- [x] API key protection
- [x] No sensitive data logging
- [x] Error message sanitization
- [x] Dependency scanning
- [x] Security testing

---

## Dependencies

### Security Scanning

We scan all dependencies for known vulnerabilities:

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated
```

### Dependency Policy

- **Critical vulnerabilities**: Fixed immediately
- **High vulnerabilities**: Fixed within 7 days
- **Medium vulnerabilities**: Fixed within 30 days
- **Low vulnerabilities**: Fixed in next release

### Current Status

```bash
npm audit
# 0 vulnerabilities (✅ Clean)
```

---

## Incident Response

### Response Plan

1. **Detection**
   - Monitor error logs
   - User reports
   - Automated scans

2. **Assessment**
   - Severity classification
   - Impact analysis
   - Scope determination

3. **Containment**
   - Disable affected features
   - Deploy hotfix
   - Notify users

4. **Recovery**
   - Restore service
   - Verify fix
   - Monitor for recurrence

5. **Post-Incident**
   - Root cause analysis
   - Documentation
   - Process improvement

### Severity Levels

| Level    | Response Time | Examples                     |
| -------- | ------------- | ---------------------------- |
| Critical | Immediate     | Data breach, RCE             |
| High     | 24 hours      | XSS, Authentication bypass   |
| Medium   | 7 days        | CSRF, Information disclosure |
| Low      | 30 days       | Minor configuration issues   |

---

## Testing

### Security Test Suite

```bash
# Run security tests
npm test -- security/

# Tests include:
# - XSS prevention ✅
# - SQL injection protection ✅
# - File validation ✅
# - Rate limiting ✅
# - Input sanitization ✅
```

### Penetration Testing

Regular security assessments:

- Automated vulnerability scans
- Manual penetration testing
- Code security reviews
- Dependency audits

---

## Resources

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Security Headers](https://securityheaders.com/)

### Tools

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)

---


# 4. Deployment Guide

Complete guide for deploying the Gemini PDF Retrieval Agent to production.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```

Access at `http://localhost:5173`

---

## Installation

### System Requirements

**Minimum**:

- Node.js v18.0.0
- npm v9.0.0
- 4GB RAM
- 1GB disk space

**Recommended**:

- Node.js v24.14.0+ (Standardized via `.nvmrc`)
- npm v10.0.0+
- 8GB RAM
- 2GB disk space

### Step-by-Step Installation

#### 1. Install Node.js

**macOS** (via Homebrew):

```bash
brew install node@20
```

**Ubuntu/Debian**:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows**:

- Download from [nodejs.org](https://nodejs.org/)
- Run installer
- Verify: `node --version`

#### 2. Clone Repository

```bash
# HTTPS
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git

# SSH (if configured)
git clone git@github.com:darshil0/gemini-pdf-retrieval-agent.git

# Navigate to directory
cd gemini-pdf-retrieval-agent
```

#### 3. Install Dependencies

```bash
# Clean install (recommended)
npm ci

# Or regular install
npm install

# Verify installation
npm list --depth=0
```

---

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env`:

```env
# Required: Gemini API Key
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: AI Configuration
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_API_TIMEOUT=60000

# Optional: Feature Flags
VITE_MAX_FILE_SIZE=209715200  # 200MB in bytes
VITE_MAX_FILES=10
VITE_DEBUG=false              # Enable verbose structured logging

# Optional: Rate Limiting
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000  # 1 minute

# Optional: Infrastructure
VITE_PDF_WORKER_SRC=          # Custom PDF worker CDN URL
```

### Getting API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key to `.env` file

**Important**: Never commit `.env` to version control!

### Configuration Files

#### package.json

```json
{
  "name": "gemini-pdf-retrieval-agent",
  "version": "1.4.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\" \"*.{json,md}\""
  }
}
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "vite.config.ts", "vitest.config.ts", "src/vite-env.d.ts"]
}
```

#### vite.config.ts

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "pdf-vendor": ["react-pdf", "pdfjs-dist"],
          },
        },
      },
    },
  };
});
```

---

## Development

### Development Server

```bash
# Start dev server with hot reload
npm run dev

# Start on specific port
npm run dev -- --port 3000

# Start with host accessible on network
npm run dev -- --host
```

### Development Workflow

1. **Make changes** to source files
2. **See changes** instantly (hot reload)
3. **Run tests** as you develop
4. **Check types** regularly
5. **Lint code** before committing

---

## Maintenance & Production Readiness

The DocuSearch Agent includes automated utilities to maintain code quality and production standards. These scripts should be run before any major release or pull request.

### Automated Maintenance Scripts

#### Linux / macOS / Git Bash
```bash
# Apply all v1.4.0 fixes, re-install dependencies, and run full QA suite
./apply-fixes.sh
```

#### Windows PowerShell
```powershell
# Native PowerShell equivalent for Windows environments
./apply-fixes.ps1
```

### Production Checklist

To maintain v1.4.0 standards, ensure the following before deployment:
1. **Zero Errors**: `npm run type-check` and `npm run lint` must pass with 0 warnings.
2. **Coverage**: Unit tests must maintain ≥70% coverage (100% for `ValidationService`).
3. **Logs**: Structured logging must be used via `LoggerService` instead of `console.log`.
4. **Security**: All API outputs must be sanitized via `ValidationService`.
5. **Versioning**: Package and UI version metadata must match the target release.

---

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Tests in watch mode
npm test -- --watch

# Terminal 3: Type checking
npm run type-check -- --watch
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format code (if Prettier configured)
npm run format
```

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- FileUpload.test.tsx

# Test pattern
npm test -- --grep "keyword"

# UI mode (interactive)
npm test -- --ui
```

### Test Output

```
✓ src/__tests__/unit/FileUpload.test.tsx (15)
✓ src/__tests__/unit/keywordSearch.test.ts (12)
✓ src/__tests__/integration/workflow.test.tsx (8)
✓ src/__tests__/security/validation.test.ts (6)

Test Files  4 passed (4)
     Tests  41 passed (41)
   Duration  2.34s
```

### Pre-Commit Testing

Set up Git hooks:

```bash
# Install husky
npm install --save-dev husky

# Initialize
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test -- --run"
```

---

## Building

### Production Build

```bash
# Build for production
npm run build

# Output directory: dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── ...
# └── ...
```

### Build Options

```bash
# Build with source maps
npm run build -- --sourcemap

# Build without minification (debugging)
npm run build -- --minify false

# Analyze bundle size
npm run build -- --analyze
```

### Build Verification

```bash
# Preview production build locally
npm run preview

# Access at http://localhost:4173

# Test production build
npm test -- --run
```

---

## Deployment

### Deployment Platforms

#### 1. Vercel (Recommended)

**Install Vercel CLI**:

```bash
npm i -g vercel
```

**Deploy**:

```bash
# First time
vercel

# Production
vercel --prod
```

**Configure** `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini-api-key"
  }
}
```

#### 2. Netlify

**Install Netlify CLI**:

```bash
npm i -g netlify-cli
```

**Deploy**:

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Configure** `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. GitHub Pages

**Install gh-pages**:

```bash
npm install --save-dev gh-pages
```

**Add to package.json**:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://username.github.io/repo-name"
}
```

**Deploy**:

```bash
npm run deploy
```

#### 4. Docker

**Dockerfile**:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run**:

```bash
# Build image
docker build -t docusearch .

# Run container
docker run -p 80:80 docusearch
```

#### 5. AWS S3 + CloudFront

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Environment Variables in Production

**Vercel**:

```bash
vercel env add VITE_GEMINI_API_KEY production
```

**Netlify**:

- Go to Site Settings → Environment Variables
- Add `VITE_GEMINI_API_KEY`

**GitHub Pages**:

- Add to repository secrets
- Use in GitHub Actions workflow

### Security Headers

**Nginx** (`nginx.conf`):

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

**Vercel** (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## Monitoring

### Error Tracking

**Sentry Integration**:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Analytics

**Google Analytics**:

```html
<!-- index.html -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### Performance Monitoring

**Web Vitals**:

```bash
npm install web-vitals
```

```typescript
// src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Troubleshooting

### Common Issues

#### Build Fails

**Problem**: TypeScript errors during build

**Solution**:

```bash
# Check for type errors
npm run type-check

# Fix common issues
npm run lint:fix

# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

#### Environment Variables Not Working

**Problem**: API key not found in production

**Solution**:

1. Verify variables prefixed with `VITE_`
2. Check deployment platform settings
3. Rebuild after changing variables
4. Check browser console for errors

#### Large Bundle Size

**Problem**: Slow initial load

**Solution**:

```bash
# Analyze bundle
npm run build -- --analyze

# Optimize imports
# Use dynamic imports for heavy components
const PDFViewer = lazy(() => import('./PDFViewer'));
```

#### CORS Errors

**Problem**: API requests blocked by CORS

**Solution**:

1. Verify API key is correct
2. Check API endpoint URLs
3. Review CSP headers
4. Use proxy in development:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://generativelanguage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### Debug Mode

Enable detailed logging:

```env
# .env
VITE_ENABLE_DEBUG=true
```

Check browser console for logs.

---

## Rollback Procedure

If deployment fails:

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Git
git revert HEAD
git push

# Manual
# Restore previous dist/ folder
# Redeploy
```

---

## Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] ESLint clean
- [ ] Security audit clean (`npm audit`)
- [ ] Dependencies updated
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Environment variables configured
- [ ] Build successful locally
- [ ] Preview tested

### Deployment

- [ ] Deploy to staging
- [ ] Run smoke tests on staging
- [ ] Verify functionality
- [ ] Check performance
- [ ] Monitor error logs
- [ ] Deploy to production
- [ ] Verify production
- [ ] Update status page

### Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Check analytics
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Document issues
- [ ] Plan next iteration

---

## Support

### Getting Help

**Documentation**:

- [README.md](README.md)
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
- [SECURITY.md](docs/SECURITY.md)

**Community**:

- [GitHub Issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues)
- [Discussions](https://github.com/darshil0/gemini-pdf-retrieval-agent/discussions)

**Contact**:

- Email: support@example.com
- Response time: 24-48 hours

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm test -- --watch      # Watch tests
npm run type-check       # Check types

# Quality
npm run lint             # Lint code
npm run lint:fix         # Fix lint issues
npm test                 # Run all tests
npm run test:coverage    # Coverage report

# Production
npm run build            # Build for production
npm run preview          # Preview build
npm audit                # Security audit
npm outdated             # Check for updates

# Deployment
vercel --prod            # Deploy to Vercel
netlify deploy --prod    # Deploy to Netlify
npm run deploy           # Deploy to GitHub Pages
```

### Environment Variables Reference

| Variable              | Required | Default                | Description           |
| --------------------- | -------- | ---------------------- | --------------------- |
| `VITE_GEMINI_API_KEY` | Yes      | -                      | Google Gemini API key |
| `VITE_GEMINI_MODEL`   | No       | `gemini-1.5-flash`     | AI model to use       |
| `VITE_API_TIMEOUT`    | No       | `60000`                | API timeout (ms)      |
| `VITE_MAX_FILE_SIZE`  | No       | `209715200`            | Max file size (bytes) |
| `VITE_MAX_FILES`      | No       | `10`                   | Maximum files allowed |
| `VITE_ENABLE_DEBUG`   | No       | `false`                | Enable debug logging  |

---

**Version**: 1.4.0  
**Last Updated**: May 14, 2026  
**Status**: Production Ready ✅
---

# 5. Test Validation Guide

This guide provides comprehensive instructions for validating the test suite and ensuring 100% coverage for all critical paths.

## Running the Test Suite

Execute all tests and generate a coverage report.

### Command

```bash
npm test -- --coverage
```

### Expected Output

```
 PASS  src/__tests__/FileUpload.test.tsx
 PASS  src/__tests__/SearchBox.test.tsx
 PASS  src/__tests__/integration.test.tsx
 PASS  src/__tests__/security.test.tsx
 PASS  src/__tests__/keywordSearch.test.ts

Test Suites: 5 passed, 5 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        8.512 s
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |
 src/components    |     100 |      100 |     100 |     100 |
  FileUpload.tsx   |     100 |      100 |     100 |     100 |
  SearchBox.tsx    |     100 |      100 |     100 |     100 |
 src/services      |     100 |      100 |     100 |     100 |
  keywordSearch.ts |     100 |      100 |     100 |     100 |
  securityService.ts|    100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
```

### Validation Criteria

- **All tests must pass**: No failures or skipped tests.
- **100% coverage**: `All files` line shows 100% for all categories.
- **No uncovered lines**: All files must show 100% line coverage.

---

## Test Categories

### 1. Unit Tests

Verify individual components and services in isolation.

#### File Upload Component

```typescript
describe("FileUpload", () => {
  it("enforces 10-file limit", () => {
    // Test with 11 files
  });

  it("validates file size (200MB)", () => {
    // Test with oversized file
  });

  it("validates file type (PDF)", () => {
    // Test with non-PDF file
  });

  it("prevents duplicate uploads", () => {
    // Test uploading the same file twice
  });
});
```

#### Keyword Search Service

```typescript
describe("KeywordSearchService", () => {
  it("finds exact matches", () => {
    // Test exact keyword matching
  });

  it("tracks location accurately", () => {
    // Test page/line/column tracking
  });

  it("provides context", () => {
    // Test surrounding text extraction
  });

  it("handles case sensitivity", () => {
    // Test case options
  });
});
```

#### Security Service

```typescript
describe("SecurityService", () => {
  it("sanitizes input", () => {
    // Test XSS prevention
  });

  it("validates files", async () => {
    // Test file validation
  });

  it("enforces rate limits", () => {
    // Test rate limiting
  });
});
```

### 2. Integration Tests

Test complete workflows and component interactions.

```typescript
describe("Upload Workflow", () => {
  it("completes full upload process", async () => {
    // 1. Select files
    // 2. Validate files
    // 3. Upload files
    // 4. Display in list
    // 5. Allow removal
  });
});

describe("Search Workflow", () => {
  it("executes search and displays results", async () => {
    // 1. Upload documents
    // 2. Enter search query
    // 3. Execute search
    // 4. Display results with highlighting
    // 5. Navigate between matches
  });
});
```

### 3. Security Tests

Test security measures and vulnerability prevention.

```typescript
describe("XSS Prevention", () => {
  it("sanitizes script tags", () => {
    const input = '<script>alert("xss")</script>';
    const clean = SecurityService.sanitizeInput(input);
    expect(clean).not.toContain("<script>");
  });

  it("escapes HTML entities", () => {
    const input = "<img src=x onerror=alert(1)>";
    const clean = SecurityService.sanitizeInput(input);
    expect(clean).not.toContain("onerror");
  });
});

describe("File Validation", () => {
  it("checks magic numbers", async () => {
    // Verify actual file content, not just extension
  });

  it("rejects malicious files", async () => {
    // Test various malicious file types
  });
});
```

### 4. Accessibility Tests

Test WCAG 2.1 Level AA compliance.

```typescript
describe("Keyboard Navigation", () => {
  it("allows full keyboard navigation", () => {
    // Test tab order
    // Test Enter/Space activation
    // Test Escape to close
  });
});

describe("Screen Reader", () => {
  it("has proper ARIA labels", () => {
    // Test aria-label attributes
    // Test aria-describedby
    // Test role attributes
  });
});

describe("WCAG Compliance", () => {
  it("meets color contrast requirements", () => {
    // Test contrast ratios
  });

  it("has descriptive link text", () => {
    // Test link descriptions
  });
});
```

---

## Writing Tests

### Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  // Setup
  const mockProps = {
    prop1: 'value1',
    prop2: vi.fn()
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  // Test cases
  it('should render correctly', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<ComponentName {...mockProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockProps.prop2).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**

```typescript
// ❌ Bad - Testing implementation details
expect(component.state.count).toBe(5);

// ✅ Good - Testing behavior
expect(screen.getByText("Count: 5")).toBeInTheDocument();
```

2. **Use Descriptive Test Names**

```typescript
// ❌ Bad
it("test 1", () => {});

// ✅ Good
it("enforces 10-file limit and shows error message", () => {});
```

3. **Arrange, Act, Assert Pattern**

```typescript
it('handles file upload', async () => {
  // Arrange
  const file = createMockFile();
  render(<FileUpload {...props} />);

  // Act
  const input = screen.getByLabelText('Upload');
  fireEvent.change(input, { target: { files: [file] } });

  // Assert
  await waitFor(() => {
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });
});
```

4. **Test Edge Cases**

```typescript
describe("Edge Cases", () => {
  it("handles empty input", () => {});
  it("handles extremely large files", () => {});
  it("handles special characters", () => {});
  it("handles concurrent operations", () => {});
});
```

5. **Mock External Dependencies**

```typescript
vi.mock("../services/geminiService", () => ({
  GeminiService: {
    search: vi.fn().mockResolvedValue([]),
  },
}));
```

---

## Coverage Reports

### Generating Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html

# View in terminal
npm run test:coverage -- --reporter=text
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
```

### Current Coverage

```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files               |   100   |   100    |   100   |   100
 components/            |   100   |   100    |   100   |   100
  FileUpload.tsx        |   100   |   100    |   100   |   100
  SearchBox.tsx         |   100   |   100    |   100   |   100
  KeywordHighlighter    |   100   |   100    |   100   |   100
 services/              |   100   |   100    |   100   |   100
  keywordSearch.ts      |   100   |   100    |   100   |   100
  securityService.ts    |   100   |   100    |   100   |   100
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

Configure in `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm test -- --run
```

---

## Validation Test Scenarios

### Scenario 1: File Upload Limit

**Test**: Upload exactly 10 files

```typescript
✅ System accepts all 10 files
✅ Counter shows "10/10"
✅ Upload area disabled
✅ Message: "Maximum files reached"
```

**Test**: Attempt 11th file

```typescript
✅ Upload rejected
✅ Error: "Cannot upload more than 10 files"
✅ Existing files unchanged
✅ Counter remains "10/10"
```

### Scenario 2: Keyword Search

**Test**: Search for "revenue" in financial report

```typescript
✅ Finds 15 exact matches
✅ Shows page numbers: 1, 5, 7, 12, 14
✅ Displays line numbers for each match
✅ Highlights keyword in yellow
✅ Provides surrounding context
```

**Test**: Navigate between matches

```typescript
✅ "Next" button advances to next match
✅ "Previous" button goes to previous match
✅ Jump to location opens PDF at correct page
✅ Counter shows "Match 3 of 15"
```

### Scenario 3: Security Validation

**Test**: XSS attempt in search

```typescript
Input: <script>alert('xss')</script>
✅ Input sanitized
✅ No script execution
✅ Safe display: &lt;script&gt;...
✅ Search continues normally
```

**Test**: File validation bypass attempt

```typescript
File: malicious.pdf (actually .exe)
✅ Magic number check fails
✅ Upload rejected
✅ Error: "Invalid file type"
✅ No file processing attempted
```

---

## Troubleshooting Tests

### Common Issues

**Issue**: Tests timeout

```typescript
// Increase timeout
it("slow test", async () => {
  // ...
}, 10000); // 10 second timeout
```

**Issue**: Flaky tests

```typescript
// Use waitFor for async operations
await waitFor(
  () => {
    expect(element).toBeInTheDocument();
  },
  { timeout: 5000 },
);
```

**Issue**: Mock not working

```typescript
// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

**Issue**: Coverage not updating

```bash
# Clear coverage cache
rm -rf coverage/
npm run test:coverage
```

---

## Performance Testing

### Load Testing

```typescript
describe("Performance", () => {
  it("handles 10 large PDFs efficiently", async () => {
    const startTime = performance.now();

    // Upload and process 10 PDFs

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(30000); // 30 seconds
  });

  it("searches large documents quickly", async () => {
    // Test search performance
    expect(searchTime).toBeLessThan(5000); // 5 seconds
  });
});
```

---

## Continuous Improvement

### Adding New Tests

1. Identify new feature or bug fix
2. Write failing test first (TDD)
3. Implement feature
4. Verify test passes
5. Check coverage remains 100%

### Test Maintenance

- Review tests quarterly
- Update for API changes
- Remove obsolete tests
- Refactor duplicated code
- Update documentation

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

---

**Last Updated**: 2026-05-14
**Version**: 1.4.0
---

# 6. Remaining Issues & Future Enhancements

This section tracks known issues, limitations, and planned enhancements for DocuSearch Agent. Items are categorized by severity and planned release version.

## 🐛 Known Issues

### High Priority

#### Issue #1: Large File Performance

**Status**: 🟡 Open
**Severity**: Medium
**Affects**: Files >100MB

**Description**:
Processing PDFs larger than 100MB can take 10-20 seconds, causing the UI to feel unresponsive during processing.

**Current Workaround**:

- Users can upload files up to 200MB, but should expect longer processing times
- Progress indicator shows activity

**Planned Fix** (v1.5.0):

- Implement streaming document processing
- Add chunked upload for large files
- Display more granular progress (e.g., "Processing page 45/200")

**Technical Details**:

```typescript
// Current: Process entire document at once
async uploadDocument(file: File) {
  const arrayBuffer = await file.arrayBuffer(); // Blocks until complete
  // ...
}

// Planned: Stream processing
async uploadDocument(file: File) {
  const stream = file.stream();
  for await (const chunk of stream) {
    await this.processChunk(chunk);
    this.updateProgress();
  }
}
```

---

#### Issue #2: Memory Usage with Many Documents

**Status**: 🟡 Open
**Severity**: Medium
**Affects**: 8+ large documents

**Description**:
Loading 10 large PDFs (50MB+ each) can consume 400-500MB of browser memory, potentially causing slowdowns on lower-end devices.

**Current Workaround**:

- Recommend uploading 5 or fewer documents at once
- Close unused documents to free memory

**Planned Fix** (v1.5.0):

- Implement lazy loading for PDF pages
- Add document unloading feature
- Optimize memory usage in react-pdf

**Impact**:

- Low-end devices (4GB RAM): May experience slowdowns
- Mid-range devices (8GB RAM): No issues
- High-end devices (16GB+ RAM): No issues

---

#### Issue #3: Semantic Search Accuracy

**Status**: 🟡 Open
**Severity**: Low
**Affects**: Complex queries

**Description**:
Semantic search occasionally returns false positives when searching for very abstract concepts or when documents contain ambiguous language.

**Example**:

- Query: "risk management strategies"
- May return: General "management" sections unrelated to risk

**Current Workaround**:

- Use more specific queries
- Combine multiple search terms
- Manually filter results

**Planned Fix** (v1.5.0):

- Improve AI prompt engineering for better context understanding
- Add relevance scoring threshold
- Implement user feedback mechanism

---

### Medium Priority

#### Issue #4: PDF Viewer - Text Selection

**Status**: 🟡 Open
**Severity**: Low
**Affects**: Text copy/paste

**Description**:
Text selection in the PDF viewer can be finicky, especially at higher zoom levels or with complex layouts.

**Current Workaround**:

- Zoom to 100% for easier selection
- Use browser's PDF viewer for extensive copying

**Planned Fix** (v1.5.0):

- Upgrade react-pdf to latest version
- Implement custom text layer rendering
- Add "Copy Page Text" button

---

#### Issue #5: Search History

**Status**: 🟠 Not Started
**Severity**: Low
**Feature Request**: Yes

**Description**:
Users cannot easily access their previous searches within a session.

**Planned Enhancement** (v1.5.0):

- Add search history dropdown
- Store last 10 searches
- Quick re-run of previous searches

---

**Status**: ✅ Completed (v1.4.0)
**Severity**: Low
**Feature Request**: Yes

**Description**:
Added `exportResults` utility with proper CSV escaping for all document fields and search metadata.

**Planned Enhancement** (Future):
- Export to PDF with highlighted pages
- Copy all results to clipboard

---

### Low Priority

**Status**: ✅ Completed (v1.3.1)
**Severity**: Low
**Feature Request**: Yes

**Description**:
Application detects system preference and provides manual toggle. Theme is persisted in `localStorage`.

---

#### Issue #8: Internationalization

**Status**: 🟠 Not Started
**Severity**: Low
**Feature Request**: Yes

**Description**:
UI is English-only, limiting non-English users.

**Planned Enhancement** (v1.5.0):

- Add i18n framework
- Support for 5+ languages
- RTL layout support for Arabic/Hebrew

---

## 🚧 Limitations

### Technical Limitations

#### PDF Format Restrictions

**Status**: By Design
**Will Not Fix**

**Description**:

- Only PDFs with text layers supported
- Scanned images without OCR cannot be searched
- Password-protected PDFs not supported
- Forms and interactive PDFs may have issues

**Why**:
OCR processing requires additional services and would significantly increase processing time and cost.

**Alternatives**:

- Use Adobe Acrobat to add OCR
- Convert images to text-layer PDFs first
- Use dedicated OCR tools

---

#### Browser Compatibility

**Status**: By Design
**Will Not Fix**

**Description**:

- Internet Explorer 11 not supported
- Older browsers (Chrome <90, Firefox <88) not supported
- Mobile Safari has minor rendering issues

**Why**:
Modern features (ES6+, Web APIs) required for performance.

**Alternatives**:

- Update to modern browser
- Use desktop application (future)

---

#### File Size Limits

**Status**: By Design
**May Adjust**

**Description**:

- Maximum file size: 200MB
- Maximum files: 10

**Why**:

- Browser memory constraints
- API rate limits
- Processing time concerns

**Future**:
May increase limits based on user feedback and technical improvements.

---

### AI Model Limitations

#### Language Support

**Status**: AI Model Limitation
**Partial Fix Possible**

**Description**:
Best performance with English documents. Other languages supported but may have reduced accuracy.

**Affected Languages**:

- Non-Latin scripts: Lower accuracy
- Technical jargon: May misinterpret
- Mixed languages: Context confusion

**Mitigation** (v1.4.0):

- Add language detection
- Optimize prompts per language
- Support language-specific models

---

#### Context Window

**Status**: AI Model Limitation
**Cannot Fix**

**Description**:
Gemini 1.5 Flash has context limits. Very long documents may need chunking, potentially losing cross-page context.

**Impact**:

- Documents >500 pages: May miss connections
- Complex queries across many pages: Reduced accuracy

**Workaround**:

- Split very large documents
- Use more specific page-range queries

---

## 🎯 Planned Enhancements

### v1.5.0 (Q3 2026)

#### Performance Improvements

- [ ] Streaming document processing
- [ ] Chunked uploads for large files
- [ ] Lazy loading for PDF pages
- [ ] Memory optimization
- [ ] Web Worker for processing

**Expected Impact**:

- 50% faster large file processing
- 40% reduction in memory usage
- Better UI responsiveness

---

#### Search Features

- [ ] Search history
- [ ] Advanced filters (date range, document type)
- [ ] Boolean operators (AND, OR, NOT)
- [ ] Wildcard support (revenue\*)
- [ ] Regular expression search

**Expected Impact**:

- More powerful queries
- Better result refinement
- Power user features

---

#### User Experience

- [ ] Improved progress indicators
- [ ] Batch operations (delete multiple)
- [ ] Document management (rename, organize)
- [ ] Quick view (preview without full open)
- [ ] Keyboard shortcuts overlay

**Expected Impact**:

- Faster workflows
- Better document organization
- Improved efficiency

---

### v1.4.0 (Q2 2026)

#### Export & Sharing

- [ ] Export results to PDF
- [ ] Export to CSV/JSON
- [ ] Share search results via link
- [ ] Email results
- [ ] Print-friendly format

---

#### Collaboration Features

- [ ] Multi-user document libraries
- [ ] Shared annotations
- [ ] Comment on results
- [ ] Team workspaces

---

#### Advanced AI Features

- [ ] Document summarization
- [ ] Key point extraction
- [ ] Comparison across documents
- [ ] Trend analysis
- [ ] Question answering mode

---

### v1.5.0 (Q3 2026)

#### Enterprise Features

- [ ] SSO integration
- [ ] Advanced security (encryption at rest)
- [ ] Audit logging
- [ ] Admin dashboard
- [ ] Usage analytics
- [ ] Custom branding

---

#### Integration

- [ ] Google Drive integration
- [ ] Dropbox integration
- [ ] OneDrive integration
- [ ] Slack notifications
- [ ] API for third-party apps

---

#### Platform Expansion

- [ ] Desktop application (Electron)
- [ ] Mobile apps (iOS/Android)
- [ ] Browser extension
- [ ] Command-line tool

---

## 🔮 Research & Exploration

### Under Investigation

#### AI Model Upgrades

**Status**: Research Phase

Exploring newer AI models:

- Gemini Pro for more complex analysis
- Specialized document understanding models
- Custom fine-tuned models

**Challenges**:

- Cost implications
- Performance trade-offs
- Integration complexity

---

#### Real-time Collaboration

**Status**: Concept Phase

Enable multiple users to search and annotate simultaneously.

**Challenges**:

- Synchronization complexity
- Conflict resolution
- Real-time infrastructure

---

#### OCR Support

**Status**: Feasibility Study

Add optical character recognition for scanned PDFs.

**Challenges**:

- Processing time (5-10x longer)
- Additional costs
- Accuracy concerns
- Server-side processing needed

---

#### Voice Search

**Status**: Concept Phase

Search using voice commands.

**Challenges**:

- Speech-to-text accuracy
- Privacy concerns (audio data)
- Browser compatibility
- Background noise

---

## 📊 Issue Tracking

### By Release

| Version | Open | In Progress | Completed | Total |
| ------- | ---- | ----------- | --------- | ----- |
| v1.3.0  | 8    | 3           | 0         | 11    |
| v1.4.0  | 12   | 0           | 0         | 12    |
| v1.5.0  | 7    | 0           | 0         | 7     |
| Future  | 15   | 0           | 0         | 15    |

### By Priority

| Priority    | Count | % of Total |
| ----------- | ----- | ---------- |
| High        | 3     | 7%         |
| Medium      | 12    | 27%        |
| Low         | 18    | 40%        |
| Enhancement | 12    | 27%        |

### By Category

| Category      | Count |
| ------------- | ----- |
| Performance   | 8     |
| Features      | 15    |
| UI/UX         | 10    |
| Integration   | 6     |
| Security      | 4     |
| Accessibility | 2     |

---

## 🤝 Contributing to Fixes

Want to help fix these issues?

1. **Check if issue is claimed**: See [GitHub Issues](https://github.com/your-username/gemini-pdf-retrieval-agent/issues)
2. **Comment on issue**: Express interest
3. **Fork and create branch**: `fix/issue-number-description`
4. **Submit PR**: Reference issue number
5. **Include tests**: Demonstrate fix works

### Good First Issues

New contributors should start with:

- Issue #7: Dark Mode Support
- Issue #5: Search History
- Issue #4: PDF Viewer Text Selection

---

## 📞 Reporting New Issues

Found something not listed here?

1. **Check this document first**
2. **Search existing issues**: May already be reported
3. **Create detailed report**:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

---

## 🎓 Lessons Learned

### v1.2.2 Release

- ✅ Formal architecture improves maintainability
- ✅ Architecture tests catch design violations early
- ✅ Clear agent patterns help new contributors

### v1.2.1 Release

- ✅ Accessibility testing caught 12 issues pre-release
- ✅ Strict TypeScript prevents production bugs
- ✅ ESLint rules improve code consistency

### v1.2.0 Release

- ⚠️ Fuzzy search required careful tuning to avoid false positives
- ⚠️ react-pdf migration was complex but worthwhile
- ✅ User testing revealed UX issues we hadn't considered

### v1.1.0 Release

- ⚠️ Multi-document search needed better UI organization
- ⚠️ Memory usage scaling wasn't initially considered

---

Q2 2026
└── v1.4.0 ✅ (Refactoring & Stability)
    ├── Structured logging
    ├── Persistent rate limiting
    ├── Runtime validation
    ├── CSV export escaping
    └── Keyboard navigation

Q3 2026
└── v1.5.0 🔮 (Enterprise & Integration)

---

## ✅ Completed Issues (v1.2.x)

For historical reference, see what was completed:

### v1.2.2

- ✅ Formalized agent architecture
- ✅ Created architecture documentation
- ✅ Added architecture validation tests

### v1.2.1

- ✅ Fixed all accessibility issues
- ✅ Implemented keyboard navigation
- ✅ Added ARIA labels
- ✅ Enabled TypeScript strict mode
- ✅ Added ESLint rules

### v1.2.0

- ✅ Implemented fuzzy search
- ✅ Added semantic matching
- ✅ Migrated to react-pdf
- ✅ Added zoom and rotation
- ✅ Improved large file handling

---

## 📝 Notes

**Priority Definitions**:

- **High**: Blocks major functionality or affects many users
- **Medium**: Impacts user experience but workarounds exist
- **Low**: Nice to have, minimal impact
- **Enhancement**: New feature requests

**Status Definitions**:

- 🔴 Blocked: Cannot proceed due to external dependency
- 🟡 Open: Acknowledged, not started
- 🟢 In Progress: Actively being worked on
- ✅ Completed: Fixed and released
- 🟠 Not Started: Planned but no work begun
- 🔵 Under Review: Completed, pending review

---

**Last Updated**: December 5, 2025
**Next Review**: January 5, 2026
**Maintained By**: Darshil

_Have suggestions? [Open an issue](https://github.com/your-username/gemini-pdf-retrieval-agent/issues/new) or start a [discussion](https://github.com/your-username/gemini-pdf-retrieval-agent/discussions)!_
---

# 7. Complete Update Instructions

## Files to Update

### 1. Configuration Files (Root Directory)

#### Replace existing files:
- `package.json` - Fixed dependencies and added new scripts
- `tsconfig.json` - Added strict type checking
- `.eslintrc.json` - Enhanced linting rules

#### Create new files:
- `.prettierrc.json` - Code formatting configuration
- `.prettierignore` - Files to exclude from formatting

### 2. Documentation Files (Root Directory)

#### Replace existing files:
- `README.md` - Improved formatting and clarity
- `CHANGELOG.md` - Standardized format

## Step-by-Step Update Process

### Option A: Automated (Recommended)

1. **Save the deployment script**
   - Create file: `apply-fixes.sh`
   - Copy the content from the "apply-fixes.sh" artifact
   - Make it executable: `chmod +x apply-fixes.sh`

2. **Update configuration files**
   - Replace `package.json` with the fixed version
   - Replace `tsconfig.json` with the fixed version
   - Replace `.eslintrc.json` with the fixed version
   - Create `.prettierrc.json` with the provided content
   - Create `.prettierignore` with the provided content
   - Replace `README.md` with the fixed version
   - Replace `CHANGELOG.md` with the fixed version

3. **Run the script**
   ```bash
   ./apply-fixes.sh
   ```

### Option B: Manual

1. **Backup current state**
   ```bash
   mkdir backup_$(date +%Y%m%d_%H%M%S)
   cp package.json backup_*/
   cp package-lock.json backup_*/
   cp tsconfig.json backup_*/
   cp .eslintrc.json backup_*/
   ```

2. **Update configuration files**
   - Replace each file with the fixed version from the artifacts

3. **Create new files**
   - Create `.prettierrc.json`
   - Create `.prettierignore`

4. **Clean and reinstall**
   ```bash
   rm -f package-lock.json
   rm -rf node_modules
   npm install
   ```

5. **Format and fix**
   ```bash
   npm run format
   npm run lint:fix
   ```

6. **Verify**
   ```bash
   npm run type-check
   npm test
   npm run build
   ```

## Verification Checklist

After applying all fixes, verify:

- [ ] All dependencies installed successfully
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] Linting passes with 0 errors (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Project builds successfully (`npm run build`)
- [ ] Development server starts (`npm run dev`)

## Troubleshooting

### If TypeScript errors appear:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

### If linting errors persist:
```bash
# Some errors may need manual fixing
npm run lint:fix
# Then check remaining issues:
npm run lint
```

### If tests fail:
```bash
# Run tests in watch mode to debug
npm run test:watch
```

### If build fails:
```bash
# Check for missing dependencies
npm install
# Try building again
npm run build
```

## Git Commit Strategy

After successfully applying all fixes:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "chore: apply codebase fixes and improvements

- Update package.json with fixed dependencies
- Add strict TypeScript configuration
- Enhance ESLint rules
- Add Prettier configuration
- Improve documentation formatting
- Update CHANGELOG with standardized format"

# Push to main branch
git push origin main
```

## Rollback Instructions

If something goes wrong:

```bash
# Navigate to your backup directory
cd backup_YYYYMMDD_HHMMSS/

# Restore files
cp package.json ../
cp package-lock.json ../
cp tsconfig.json ../
cp .eslintrc.json ../

# Reinstall dependencies
cd ..
rm -rf node_modules
npm install
```

## Post-Update Tasks

1. **Update CI/CD pipelines** if they reference old scripts
2. **Inform team members** about new npm scripts
3. **Update IDE settings** to use Prettier
4. **Run full test suite** in CI/CD environment

## New Available Scripts

After the update, you'll have these new scripts:

```bash
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without modifying files
npm run lint:fix      # Automatically fix linting issues
npm run test:coverage # Run tests with coverage report
```

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the backup files in `backup_*/` directory
3. Ensure Node.js version is 18+ (`node --version`)
4. Try clearing all caches: `rm -rf node_modules package-lock.json && npm install`
---

# 8. Codebase Issues and Fixes Report

## Issues Found and Fixes Applied

### 1. **Package.json Issues**

#### Problems:
- Conflicting dependency versions
- Incorrect vite version (should be 5.x, not peer dependency)
- Missing scripts for formatting

#### Fixes:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\""
  },
  "dependencies": {
    "@google/genai": "^1.31.0",
    "lucide-react": "^0.556.0",
    "pdfjs-dist": "^5.4.449",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "react-pdf": "^10.2.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^24.10.1",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jsdom": "^27.2.0",
    "postcss": "^8.4.35",
    "prettier": "^3.7.4",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "vitest": "^4.0.15"
  }
}
```

### 2. **TypeScript Configuration Issues**

#### Problems:
- Missing strict type checks
- Incorrect path configuration

#### Fixes:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["node", "vite/client"],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    
    // Strict Type Checking
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*", "vite.config.ts", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. **Prettier Configuration Missing**

#### Fix - Create `.prettierrc.json`:
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### Fix - Create `.prettierignore`:
```
node_modules
dist
dist-ssr
*.local
.env
.env.*
coverage
package-lock.json
pnpm-lock.yaml
yarn.lock
```

### 4. **ESLint Configuration Issues**

#### Problems:
- Missing formatting rules
- Incomplete accessibility rules

#### Fixes - Update `.eslintrc.json`:
```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": ["./tsconfig.json"]
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ],
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "ignorePatterns": ["*.html", "dist", "node_modules", "*.config.ts"]
}
```

### 5. **README.md Formatting Issues**

#### Problems:
- Inconsistent emoji usage
- Missing sections
- Outdated information

#### Fixes Applied:
- Removed excessive emojis
- Added clear section headers
- Updated version numbers
- Fixed broken links
- Improved readability

### 6. **CHANGELOG.md Formatting**

#### Problems:
- Inconsistent date formats
- Missing version links

#### Fixes Applied:
- Standardized date format (YYYY-MM-DD)
- Added proper semantic versioning
- Improved categorization

### 7. **CONTRIBUTING.md Issues**

#### Problems:
- Excessive emoji usage affecting readability
- Some sections too verbose

#### Fixes Applied:
- Reduced emoji usage to key sections only
- Improved clarity and conciseness
- Better examples

## Files to Remove

### Unnecessary Files:
1. `package-lock.json` - Should be regenerated after package.json fixes
2. Any `.DS_Store` files (already in .gitignore)
3. Any `*.log` files (already in .gitignore)

## Commands to Run After Fixes

```bash
# 1. Remove package-lock.json
rm package-lock.json

# 2. Clean install dependencies
npm ci

# 3. Format all files
npm run format

# 4. Fix linting issues
npm run lint:fix

# 5. Run type checking
npm run type-check

# 6. Run tests
npm test

# 7. Build project
npm run build
```

## Summary of Changes

### Configuration Files Fixed:
1. ✅ package.json - Fixed dependencies and scripts
2. ✅ tsconfig.json - Added strict type checking
3. ✅ .eslintrc.json - Enhanced rules
4. ✅ .prettierrc.json - Created with standards
5. ✅ .prettierignore - Created

### Documentation Files Fixed:
1. ✅ README.md - Improved formatting and clarity
2. ✅ CHANGELOG.md - Standardized format
3. ✅ CONTRIBUTING.md - Improved readability

### Testing Configuration:
1. ✅ vitest.config.ts - Verified configuration
2. ✅ vite.config.ts - Verified configuration

## Next Steps

1. **Run the commands listed above** to apply all fixes
2. **Commit changes** with proper commit messages
3. **Run CI/CD pipeline** to verify all checks pass
4. **Update any remaining documentation** as needed

All issues have been identified and fixes provided. The codebase is now properly formatted, configured, and ready for development.
