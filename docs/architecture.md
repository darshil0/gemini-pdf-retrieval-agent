# Architecture Documentation - DocuSearch Agent

## Overview

DocuSearch Agent is built using a modern, scalable architecture that separates concerns cleanly and leverages AI capabilities through the Google Gemini API. This document provides a comprehensive overview of the system design, patterns, and implementation details.

**Architecture Version**: 2.0  
**Last Updated**: December 5, 2025  
**Status**: Production

---

## 🏗️ High-Level Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  SearchBox   │  │ FileUpload   │  │  PDFViewer   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │SearchResults │  │DocumentList  │  │ErrorBoundary │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ State Mgmt   │  │   Router     │  │  Event Bus   │          │
│  │  (Zustand)   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Service Layer                             │
│  ┌────────────────────────────────────────────────────┐         │
│  │               GeminiService (Core AI)              │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  • Document processing      • Search execution     │         │
│  │  • Text extraction          • Result ranking       │         │
│  │  • Semantic analysis        • Error handling       │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │DocumentService│  │SearchService │  │ CacheService │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Gemini API   │  │  Browser API │  │ PDF.js Lib   │          │
│  │  (External)  │  │   (File,     │  │              │          │
│  │              │  │   Storage)   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Presentation Layer

#### Component Structure

```
components/
├── SearchBox/              # Search input and controls
│   ├── SearchBox.tsx
│   ├── SearchBox.test.tsx
│   ├── SearchBox.stories.tsx
│   └── index.ts
├── FileUpload/             # Drag-and-drop file upload
│   ├── FileUpload.tsx
│   ├── UploadArea.tsx
│   ├── ProgressBar.tsx
│   └── index.ts
├── SearchResults/          # Display search results
│   ├── SearchResults.tsx
│   ├── ResultItem.tsx
│   ├── ResultSkeleton.tsx
│   └── index.ts
├── PDFViewer/              # PDF rendering and controls
│   ├── PDFViewer.tsx
│   ├── ViewerControls.tsx
│   ├── PageNavigator.tsx
│   └── index.ts
└── shared/                 # Shared/reusable components
    ├── Button/
    ├── Modal/
    ├── Loading/
    └── ErrorMessage/
```

#### Component Responsibilities

**SearchBox**

- Input validation (min 3 characters)
- Query submission
- Character count display
- Keyboard shortcuts (Enter)

**FileUpload**

- Drag-and-drop zone
- Click-to-upload
- File validation
- Progress tracking
- Error display

**SearchResults**

- Results list rendering
- Pagination
- Result item interaction
- Empty state
- Loading state

**PDFViewer**

- PDF document rendering
- Page navigation
- Zoom controls
- Rotation
- Highlight overlays

#### Component Communication

```typescript
// Props drilling for simple cases
<SearchBox onSearch={handleSearch} />

// Context for shared state
const { documents } = useDocuments();

// Event emitter for complex flows
eventBus.emit('document:uploaded', document);

// Zustand store for global state
const results = useStore(state => state.searchResults);
```

---

## 🔧 Service Layer

### GeminiService (Core AI Service)

The primary service for AI-powered functionality.

```typescript
class GeminiService {
  private apiKey: string;
  private model: string;
  private cache: Map<string, CachedResult>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.model = "gemini-2.5-flash";
    this.cache = new Map();
  }

  // Upload and process PDF
  async uploadDocument(file: File): Promise<Document> {
    // 1. Validate file
    this.validateFile(file);

    // 2. Extract text using PDF.js
    const text = await this.extractText(file);

    // 3. Send to Gemini for processing
    const processedDoc = await this.processWithAI(text);

    // 4. Create document metadata
    return this.createDocument(file, processedDoc);
  }

  // Execute natural language search
  async search(query: string, documents: Document[]): Promise<SearchResult[]> {
    // 1. Check cache
    const cacheKey = this.getCacheKey(query, documents);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. Build AI prompt
    const prompt = this.buildSearchPrompt(query, documents);

    // 3. Send to Gemini API
    const response = await this.callGeminiAPI(prompt);

    // 4. Parse and rank results
    const results = this.parseResults(response);

    // 5. Cache results
    this.cache.set(cacheKey, results);

    return results;
  }

  // Private methods
  private async callGeminiAPI(prompt: string): Promise<GeminiResponse> {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new APIError(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### DocumentService

Handles document management and metadata.

```typescript
class DocumentService {
  private documents: Map<string, Document> = new Map();

  // Add document
  add(document: Document): void {
    this.documents.set(document.id, document);
    this.notifyListeners("document:added", document);
  }

  // Remove document
  remove(id: string): void {
    this.documents.delete(id);
    this.notifyListeners("document:removed", id);
  }

  // Get all documents
  getAll(): Document[] {
    return Array.from(this.documents.values());
  }

  // Validate file before processing
  validateFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check type
    if (file.type !== "application/pdf") {
      errors.push("File must be a PDF");
    }

    // Check size
    if (file.size > 200 * 1024 * 1024) {
      errors.push("File must be under 200MB");
    }

    // Check if not corrupted
    if (file.size === 0) {
      errors.push("File appears to be empty");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

### SearchService

Implements fuzzy and semantic search.

```typescript
class SearchService {
  private fuse: Fuse<Document>;

  // Fuzzy search using Fuse.js
  fuzzySearch(query: string, documents: Document[]): FuzzyResult[] {
    const fuse = new Fuse(documents, {
      keys: ["content", "metadata.title"],
      threshold: 0.3, // 0 = exact, 1 = match anything
      distance: 100,
      ignoreLocation: true,
      findAllMatches: true,
    });

    return fuse.search(query);
  }

  // Highlight matching terms
  highlightText(text: string, terms: string[]): HighlightedText {
    const highlights: Highlight[] = [];

    terms.forEach((term) => {
      const regex = new RegExp(term, "gi");
      let match;

      while ((match = regex.exec(text)) !== null) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          term: match[0],
        });
      }
    });

    return {
      text,
      highlights: this.mergeOverlappingHighlights(highlights),
    };
  }
}
```

---

## 🗄️ State Management

### Zustand Store Structure

```typescript
interface AppState {
  // Documents
  documents: Document[];
  uploadProgress: Map<string, number>;

  // Search
  query: string;
  searchResults: SearchResult[];
  isSearching: boolean;

  // UI
  selectedDocument: Document | null;
  viewerPage: number;
  viewerZoom: number;

  // Actions
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  selectDocument: (doc: Document | null) => void;
}

const useStore = create<AppState>((set, get) => ({
  // Initial state
  documents: [],
  uploadProgress: new Map(),
  query: "",
  searchResults: [],
  isSearching: false,
  selectedDocument: null,
  viewerPage: 1,
  viewerZoom: 1.0,

  // Actions
  addDocument: (doc) =>
    set((state) => ({
      documents: [...state.documents, doc],
    })),

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  setQuery: (query) => set({ query }),

  search: async (query) => {
    set({ isSearching: true, query });
    try {
      const service = new GeminiService(API_KEY);
      const results = await service.search(query, get().documents);
      set({ searchResults: results, isSearching: false });
    } catch (error) {
      set({ isSearching: false });
      throw error;
    }
  },

  selectDocument: (doc) =>
    set({
      selectedDocument: doc,
      viewerPage: 1,
    }),
}));
```

### State Flow

```
User Action → Component → Store Action → Service → API → Store Update → Component Re-render
```

Example flow:

1. User clicks "Search" button
2. SearchBox calls `store.search(query)`
3. Store sets `isSearching: true`
4. Store calls `GeminiService.search()`
5. Service calls Gemini API
6. Service returns results
7. Store sets `searchResults: results, isSearching: false`
8. SearchResults component re-renders with results

---

## 🔌 Agent Architecture Pattern

DocuSearch implements a formal agent architecture with defined systems, tools, and protocols.

### System Definition

```typescript
const AGENT_SYSTEM = {
  name: "DocuSearch Agent",
  version: "1.2.2",
  role: "Multi-document PDF retrieval specialist",

  capabilities: [
    "Natural language document search",
    "Fuzzy matching with typo tolerance",
    "Semantic understanding of queries",
    "Multi-document search and ranking",
    "Exact page-level citations",
  ],

  constraints: [
    "PDF files only (max 200MB)",
    "Text-layer required (no OCR)",
    "Maximum 10 documents simultaneously",
    "English language optimized",
  ],
};
```

### Tool Definitions

```typescript
const AGENT_TOOLS = {
  upload_document: {
    name: "upload_document",
    description: "Process and index a PDF document for search",
    parameters: {
      file: {
        type: "File",
        description: "PDF file to process",
        required: true,
      },
    },
    returns: {
      type: "Document",
      description: "Processed document with metadata and index",
    },
  },

  search_documents: {
    name: "search_documents",
    description: "Search documents using natural language query",
    parameters: {
      query: {
        type: "string",
        description: "Natural language search query",
        required: true,
        minLength: 3,
      },
      documents: {
        type: "Document[]",
        description: "Documents to search",
        required: true,
      },
    },
    returns: {
      type: "SearchResult[]",
      description: "Ranked search results with page citations",
    },
  },

  extract_context: {
    name: "extract_context",
    description: "Get surrounding context for a search result",
    parameters: {
      document: {
        type: "Document",
        description: "Source document",
        required: true,
      },
      page: {
        type: "number",
        description: "Page number",
        required: true,
      },
      range: {
        type: "number",
        description: "Number of surrounding sentences",
        default: 3,
      },
    },
    returns: {
      type: "string",
      description: "Contextual text snippet",
    },
  },
};
```

### Protocol Flow

```
1. UPLOAD PHASE
   User → Tool(upload_document) → AI Processing → Document Index → Success

2. SEARCH PHASE
   User → Tool(search_documents) → AI Query Analysis →
   → Semantic Matching → Result Ranking → Formatted Results

3. VIEW PHASE
   User → Tool(extract_context) → Context Retrieval →
   → PDF Rendering → Highlighted Display
```

### Implementation

```typescript
// Agent-compliant service layer
class AgentCompliantGeminiService {
  async executeTool(toolName: string, params: any): Promise<any> {
    // Validate tool exists
    if (!AGENT_TOOLS[toolName]) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate parameters
    this.validateParams(AGENT_TOOLS[toolName].parameters, params);

    // Execute tool
    switch (toolName) {
      case "upload_document":
        return this.uploadDocument(params.file);
      case "search_documents":
        return this.search(params.query, params.documents);
      case "extract_context":
        return this.extractContext(params.document, params.page, params.range);
      default:
        throw new Error(`Tool not implemented: ${toolName}`);
    }
  }

  private validateParams(schema: any, params: any): void {
    // Parameter validation logic
  }
}
```

---

## 🔐 Security Architecture

### API Key Protection

```typescript
// ✅ Correct: Environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ Wrong: Hardcoded
const apiKey = "AIzaSyB..."; // Never do this!
```

### Input Validation

```typescript
class InputValidator {
  static sanitizeQuery(query: string): string {
    // Remove potential injection attempts
    return query
      .replace(/<script>/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  static validateFileType(file: File): boolean {
    // Check MIME type
    if (file.type !== "application/pdf") {
      return false;
    }

    // Check magic bytes (PDF header)
    return this.checkMagicBytes(file);
  }

  private static async checkMagicBytes(file: File): Promise<boolean> {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF files start with %PDF
    return (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    );
  }
}
```

### XSS Prevention

React automatically escapes content, but additional measures:

```typescript
// Sanitize user-generated content
import DOMPurify from 'dompurify';

function DisplayResult({ result }: { result: SearchResult }) {
  const safeHTML = DOMPurify.sanitize(result.snippet);

  return (
    <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
  );
}
```

---

## 📊 Data Flow

### Document Upload Flow

```
1. User selects file
   ↓
2. FileUpload validates file
   ↓
3. DocumentService checks constraints
   ↓
4. GeminiService extracts text (PDF.js)
   ↓
5. GeminiService sends to API for processing
   ↓
6. API returns structured data
   ↓
7. Document created with metadata
   ↓
8. Store updated
   ↓
9. UI shows success + document in list
```

### Search Flow

```
1. User enters query
   ↓
2. SearchBox validates (min 3 chars)
   ↓
3. Store.search() called
   ↓
4. GeminiService checks cache
   ├─→ Cache hit: Return cached results
   └─→ Cache miss:
       ↓
       5. Build AI prompt with query + docs
       ↓
       6. Call Gemini API
       ↓
       7. Parse API response
       ↓
       8. Rank and format results
       ↓
       9. Cache results
       ↓
10. Store updated with results
    ↓
11. SearchResults renders
```

---

## 🚀 Performance Optimizations

### Code Splitting

```typescript
// Lazy load heavy components
const PDFViewer = lazy(() => import('./components/PDFViewer'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      {showViewer && <PDFViewer />}
    </Suspense>
  );
}
```

### Memoization

```typescript
// Memo heavy calculations
const results = useMemo(() => {
  return searchService.fuzzySearch(query, documents);
}, [query, documents]);

// Memo components
const MemoizedResultItem = memo(ResultItem, (prev, next) => {
  return prev.result.id === next.result.id;
});
```

### Debouncing

```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      store.search(query);
    }, 300),
  [],
);
```

### Caching Strategy

```typescript
class CacheService {
  private cache: Map<string, CachedItem> = new Map();
  private maxSize = 100;
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: any): void {
    // Evict old entries if cache full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }
}
```

---

## 🧪 Testing Architecture

### Test Pyramid

```
         ┌─────────────┐
         │   E2E (5%)  │  Playwright, full user flows
         ├─────────────┤
         │Integration  │  Multi-component, API mocks
         │   (25%)     │
         ├─────────────┤
         │   Unit      │  Individual functions/components
         │   (70%)     │
         └─────────────┘
```

### Test Structure

```typescript
// Unit test
describe('SearchService', () => {
  describe('fuzzySearch', () => {
    it('finds matches with typos', () => {
      const service = new SearchService();
      const results = service.fuzzySearch('behavoir', documents);

      expect(results).toContainMatch('behavior');
    });
  });
});

// Integration test
describe('Search Flow', () => {
  it('completes full search', async () => {
    const { getByRole, findByText } = render(<App />);

    // Upload document
    const file = createMockPDF();
    await uploadFile(file);

    // Search
    await userEvent.type(getByRole('searchbox'), 'test query');
    await userEvent.click(getByRole('button', { name: /search/i }));

    // Verify results
    expect(await findByText(/results found/i)).toBeInTheDocument();
  });
});
```

---

## 📦 Build Architecture

### Build Pipeline

```
Source Code (src/)
      ↓
TypeScript Compilation
      ↓
ESLint Validation
      ↓
Tree Shaking
      ↓
Minification
      ↓
Bundle Splitting
      ↓
Asset Optimization
      ↓
dist/ (Production Build)
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],

  build: {
    // Target modern browsers
    target: "es2020",

    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "pdf-vendor": ["react-pdf", "pdfjs-dist"],
          "ui-vendor": ["@headlessui/react", "lucide-react"],
        },
      },
    },

    // Compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
  },

  // Optimize deps
  optimizeDeps: {
    include: ["react", "react-dom", "zustand"],
  },
});
```

---

## 🔄 Future Architecture Considerations

### Planned Improvements (v1.3.0+)

1. **Web Workers**
   - Move PDF processing off main thread
   - Prevent UI blocking on large files

2. **Service Worker**
   - Offline functionality
   - Background sync
   - Better caching

3. **Micro-frontends**
   - Separate viewer module
   - Independent deployment
   - Technology flexibility

4. **GraphQL API**
   - Better data fetching
   - Real-time updates
   - Type safety

5. **Event Sourcing**
   - Audit trail
   - Undo/redo
   - Time travel debugging

---

## 📚 References

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Maintained By**: Darshil  
**Last Review**: December 5, 2025  
**Next Review**: January 5, 2026
