# Agent Architecture Documentation

## Overview

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
  version: "1.2.2"
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
    "Rate limit: 10 requests/minute",
    "Timeout: 30 seconds per search"
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
