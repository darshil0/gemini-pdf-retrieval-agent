# DocuSearch Agent - Complete Documentation

**Version**: 1.4.2 | **Last Updated**: May 16, 2026 | **Status**: Production Ready ✅

## Table of Contents
1. [Agent Architecture](#1-agent-architecture)
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

DocuSearch Agent v1.4.2 uses a modular directory structure with path aliasing for better maintainability and cleaner imports.

## Directory Map

```
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

# 1. Agent Architecture

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
  version: "1.4.2"
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
const UPLOAD_PROTOCOL: UploadProtocol = {
  phase: "upload",
  steps: [
    { order: 1, action: "Validate file type",      validation: "Check MIME type and magic number",      onFailure: "Reject with InvalidFileTypeError" },
    { order: 2, action: "Check file size",         validation: "Ensure file <= MAX_FILE_SIZE",          onFailure: "Reject with FileTooLargeError" },
    { order: 3, action: "Verify document limit",   validation: "Ensure total documents < MAX_FILES",    onFailure: "Reject with DocumentLimitError" },
    { order: 4, action: "Extract PDF content",     validation: "Parse PDF structure and text",          onFailure: "Reject with PDFParseError" },
    { order: 5, action: "Index document",          validation: "Create searchable index",               onFailure: "Reject with IndexingError" },
    { order: 6, action: "Store metadata",          validation: "Save document information",             onFailure: "Warn but continue" }
  ],
  constraints: [
    "Maximum 10 documents",
    "PDF format only",
    "Maximum 200MB per file",
    "Synchronous processing"
  ],
  errorHandling: [
    { errorType: "ValidationError", action: "Show user-friendly error message", retry: false },
    { errorType: "NetworkError",    action: "Show retry option",                retry: true, maxRetries: 3 }
  ]
};
```

#### Search Protocol

```typescript
const SEARCH_PROTOCOL: SearchProtocol = {
  phase: "search",
  steps: [
    { order: 1, action: "Sanitize query",         validation: "Remove XSS attempts, validate length",  onFailure: "Reject with InvalidQueryError" },
    { order: 2, action: "Check rate limit",       validation: "Ensure within rate limit",              onFailure: "Reject with RateLimitError" },
    { order: 3, action: "Prepare search context", validation: "Format documents for AI",               onFailure: "Reject with ContextError" },
    { order: 4, action: "Execute AI search",      validation: "Call Gemini API with retry logic",      onFailure: "Retry with exponential backoff" },
    { order: 5, action: "Parse AI response",      validation: "Validate JSON structure",               onFailure: "Return empty results with warning" },
    { order: 6, action: "Rank results",           validation: "Sort by relevance score",               onFailure: "Return unranked results" },
    { order: 7, action: "Extract context",        validation: "Get surrounding text for each result",  onFailure: "Return results without context" }
  ],
  constraints: [
    "Minimum query length: 2 characters",
    "Maximum query length: 500 characters",
    "Rate limit: 10 requests/minute (persistent)",
    "Timeout: configurable (default 60s)",
    "Streaming timeout: 30 seconds per file"
  ],
  responseFormat: {
    structure: "JSON",
    required: ["results", "summary"],
    resultSchema: {
      docIndex: "number",
      pageNumber: "number",
      contextSnippet: "string",
      matchedTerm: "string",
      relevanceExplanation: "string",
      relevanceScore: "number (0.75-1.0)"
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
┌──────────────────────────────────────┐
│  System Layer (Persona)              │
│  - Validates agent capabilities      │
│  - Checks constraints                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Protocol Layer (Rules)              │
│  - Enforces upload/search protocol   │
│  - Validates each step               │
│  - Handles errors                    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Tool Layer (Actions)                │
│  - upload_document()                 │
│  - search_documents()                │
│  - extract_context()                 │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  External Services                   │
│  - Google Gemini API                 │
│  - PDF.js Library                    │
│  - Validation Layer                  │
│  - Structured Logging Service        │
└──────────────────────────────────────┘
```

## Error Handling Strategy

```typescript
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

---

# 2. API Reference

## Gemini Service API

### searchInDocuments()

Searches documents using a natural language query via Gemini 1.5 Flash.

```typescript
async searchInDocuments(
  files: File[],
  keyword: string
): Promise<SearchResponse>
```

**Parameters**: `files` — Array of PDF files to search (max 10). `keyword` — Search term or phrase.

**Returns**: `Promise<SearchResponse>` — Validated response with summary and results.

**Security & Reliability**: API calls time out after 60 seconds (configurable via `VITE_API_TIMEOUT_MS`). Responses are validated at runtime using `validateSearchResponse`. Files are read as streams with a 30-second timeout.

```typescript
interface SearchResponse {
  summary: string;
  results: SearchResult[];
}

interface SearchResult {
  docIndex: number;
  pageNumber: number;
  contextSnippet: string;
  matchedTerm: string;
  relevanceExplanation: string;
  relevanceScore: number;
}
```

---

## Core Services

### ValidationService

Provides runtime type safety and sanitization.

#### validateSearchResponse()

Validates and sanitizes a raw API response.

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

### DocumentService

#### getAll()

```typescript
getAll(): Document[]
```

#### findById()

```typescript
findById(id: string): Document | undefined
```

---

### SearchService

#### fuzzySearch()

```typescript
fuzzySearch(
  query: string,
  documents: Document[],
  options?: FuzzyOptions
): FuzzyResult[]
```

```typescript
interface FuzzyOptions {
  threshold?: number;      // 0-1, lower is stricter (default: 0.3)
  distance?: number;       // Max distance to search (default: 100)
  ignoreLocation?: boolean;// Ignore location (default: true)
  keys?: string[];         // Fields to search (default: ['content'])
}
```

#### highlightText()

```typescript
highlightText(
  text: string,
  terms: string[],
  options?: HighlightOptions
): HighlightedText
```

```typescript
interface HighlightedText {
  text: string;          // Original text
  html: string;          // HTML with <mark> tags
  highlights: Highlight[];
}
```

---

## Custom Hooks

### useDocuments()

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

### useSearch()

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

### usePDFViewer()

```typescript
function usePDFViewer(document: Document | null): UsePDFViewerReturn;

interface UsePDFViewerReturn {
  numPages: number;
  currentPage: number;
  zoom: number;
  rotation: number;
  isLoading: boolean;
  error: Error | null;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  rotate: () => void;
  resetView: () => void;
}
```

---

## Core Types

```typescript
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
  IDLE      = "IDLE",
  ANALYZING = "ANALYZING",
  COMPLETE  = "COMPLETE",
  ERROR     = "ERROR",
}
```

---

## Authentication

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

Obtain a key at [Google AI Studio](https://aistudio.google.com/app/apikey). Never commit `.env` to version control.

---

## Rate Limits

**Free Tier**: 60 requests/minute, 1,500 requests/day. See [Google AI pricing](https://ai.google.dev/pricing) for paid tiers.

```typescript
async function callAPIWithRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof RateLimitError) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
```

---

# 3. Security Policy

## Security Features

### Input Validation & Sanitization

All user inputs (search queries, file names, URL parameters) are sanitized against XSS and common SQL injection patterns before processing.

```typescript
const cleanInput = SecurityService.sanitizeInput(userInput);
```

Blocked SQL patterns include: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `EXEC`, `UNION`, `HAVING`, `WHERE`, and special SQL characters.

### File Validation

Three-layer check:

```typescript
// 1. Extension
filename.endsWith(".pdf");

// 2. MIME type
file.type === "application/pdf";

// 3. Magic number (first 4 bytes)
const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
bytes[0] === 0x25 && bytes[1] === 0x50; // %PDF
```

Files rejected: executables renamed to `.pdf`, corrupted PDFs, files over 200MB, non-PDF MIME types, files with malicious names.

### Rate Limiting

Client-side rate limiting backed by `localStorage` (survives page refresh):

- **Search Queries**: 10 per minute
- **Window**: Rolling 60-second window

```typescript
const allowed = SecurityService.checkRateLimit("search", 10, 60000);
if (!allowed) throw new Error(ErrorMessages.API_RATE_LIMITED);
```

### Secure Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Threat Model

| Threat | Risk | Mitigation |
| --- | --- | --- |
| XSS Attacks | HIGH | Input sanitization, CSP headers |
| File Upload Exploits | HIGH | Multi-layer validation, magic numbers |
| API Key Theft | HIGH | Environment variables, no client exposure |
| Rate Limiting Bypass | MEDIUM | Client-side persistent rate limiting |
| SQL Injection | MEDIUM | Query validation, pattern detection |
| CSRF Attacks | MEDIUM | SameSite cookies, token validation |
| Man-in-the-Middle | MEDIUM | HTTPS enforcement |
| Data Exposure | LOW | No persistent storage, sanitization |

---

## Vulnerability Reporting

Do **not** create public GitHub issues for security vulnerabilities. Email details to security@example.com with a description, reproduction steps, potential impact, and suggested fix. We respond within 48 hours and patch critical issues within 7 days. We follow a 90-day coordinated disclosure window.

---

## Version History

**v1.4.2 (2026-05-16)** — Added runtime response validation, persistent rate limiting, fail-fast API key format validation, centralized error messaging, restored critical application files, standardized aliases.

**v1.3.1 (2026-04-19)** — Basic validation, extension-based file checking, search history persistence.

---

# 4. Deployment Guide

## Quick Start

```bash
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent
npm install
cp .env.example .env   # add your Gemini API key
npm test
npm run dev
```

Access at `http://localhost:5173`.

## System Requirements

**Minimum**: Node.js v18, npm v9, 4GB RAM. **Recommended**: Node.js v24+, npm v10+, 8GB RAM.

## Configuration

```env
# Required
VITE_GEMINI_API_KEY=your_api_key_here

# Optional
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_API_TIMEOUT_MS=60000
VITE_MAX_FILE_SIZE=209715200
VITE_MAX_FILES=10
VITE_DEBUG=false
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000
```

## Maintenance & Production Readiness

Run before any major release or pull request:

```bash
# Linux / macOS / Git Bash
./apply-fixes.sh

# Windows PowerShell
./apply-fixes.ps1
```

Production checklist before deployment:
1. `npm run type-check` and `npm run lint` pass with 0 warnings
2. Unit test coverage ≥ 70% (100% for `ValidationService`)
3. Structured logging used via `LoggerService`, not `console.log`
4. All API outputs sanitized via `ValidationService`
5. Package and UI version metadata match the target release

## Deployment Platforms

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

`vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": { "VITE_GEMINI_API_KEY": "@gemini-api-key" }
}
```

### Netlify

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Security audit clean (`npm audit`)
- [ ] Environment variables configured in deployment platform
- [ ] Build successful locally (`npm run build`)
- [ ] Preview tested (`npm run preview`)

---

# 5. Test Validation Guide

## Running the Test Suite

```bash
npm test -- --coverage
```

### Validation Criteria

All tests must pass with no failures or skipped tests. `All files` line must show 100% across statements, branches, functions, and lines. This is the minimum bar for `ValidationService`; the project-wide minimum threshold is 90%.

## Test Categories

### Unit Tests

**FileUpload**: 10-file limit, 200MB size cap, PDF-only type check, duplicate prevention.

**KeywordSearchService**: Exact matches, page/line/column tracking, context extraction, case sensitivity.

**SecurityService**: XSS sanitization, file validation, rate limiting.

### Integration Tests

**Upload Workflow**: Select → validate → upload → display → remove.

**Search Workflow**: Upload documents → enter query → execute → display with highlighting → navigate matches.

### Security Tests

```typescript
it("sanitizes script tags", () => {
  const clean = SecurityService.sanitizeInput('<script>alert("xss")</script>');
  expect(clean).not.toContain("<script>");
});

it("checks magic numbers", async () => {
  // Verify actual file bytes, not just extension
});
```

### Accessibility Tests

Keyboard navigation (tab order, Enter/Space, Escape), ARIA labels, WCAG 2.1 AA color contrast.

## Coverage Thresholds (`vitest.config.ts`)

```typescript
coverage: {
  thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }
}
```

## CI/CD

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: "18" }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage --ci
      - uses: codecov/codecov-action@v3
        with: { files: ./coverage/lcov.info }
```

---

# 6. Remaining Issues & Future Enhancements

## Known Issues

### High Priority

**Issue #1: Large File Performance** — Files > 100MB take 10–20 seconds to process. Planned fix (v1.5.0): streaming document processing with chunked uploads and granular progress reporting.

**Issue #2: Memory Usage with Many Documents** — 10 large PDFs can consume 400–500MB of browser memory. Workaround: keep uploads to 5 or fewer. Planned fix (v1.5.0): lazy page loading, document unloading, react-pdf memory optimization.

**Issue #3: Semantic Search Accuracy** — Abstract queries occasionally return false positives. Workaround: use more specific queries or combine multiple terms. Planned fix (v1.5.0): improved prompt engineering, relevance threshold tuning, user feedback mechanism.

### Medium Priority

**Issue #4: PDF Viewer Text Selection** — Text selection is unreliable at higher zoom levels. Workaround: zoom to 100% or use the browser's native PDF viewer for copying. Planned fix (v1.5.0): react-pdf upgrade, custom text layer rendering.

**Issue #5: Search History** — No in-session history of previous queries. Planned for v1.5.0.

### Completed

**Export Results** ✅ (v1.4.2) — `exportResults` utility added with proper CSV escaping.

**Dark Mode** ✅ (v1.3.1) — System preference detection plus manual toggle; persisted in `localStorage`.

## Technical Limitations (By Design)

**PDF Format**: Text-layer PDFs only. Scanned images without OCR, password-protected PDFs, and heavily interactive forms are not supported. Use Adobe Acrobat or a dedicated OCR tool to prepare such files.

**Browser Compatibility**: IE11 and browsers older than Chrome 90 / Firefox 88 are not supported.

**File Size**: 200MB per file, 10 files maximum. May be revisited based on user feedback.

**Language**: Best accuracy with English. Non-Latin scripts and heavily mixed-language documents may show reduced accuracy.

**Context Window**: Gemini 1.5 Flash context limits mean very long documents (500+ pages) may lose cross-page connections. Workaround: split large documents or use page-range queries.

## Roadmap

### v1.5.0 (Q3 2026)

**Performance**: Streaming processing, chunked uploads, lazy PDF page loading, Web Worker offloading.

**Search**: History dropdown, advanced filters (date range, document type), boolean operators (`AND`, `OR`, `NOT`), wildcard support, regex search.

**UX**: Batch delete, document renaming, quick-view preview, keyboard shortcut overlay.

**Internationalization**: i18n framework, 5+ languages, RTL support.

### Future

**Export & Sharing**: PDF export of results, CSV/JSON export, shareable result links.

**Collaboration**: Multi-user document libraries, shared annotations, team workspaces.

**Advanced AI**: Summarization, key-point extraction, cross-document comparison, question-answering mode.

**Enterprise**: SSO, encryption at rest, audit logging, admin dashboard, custom branding.

**Integrations**: Google Drive, Dropbox, OneDrive, Slack notifications, third-party API.

**Platforms**: Desktop app (Electron), mobile apps (iOS/Android), browser extension, CLI tool.

---

# 8. Complete Update Instructions

## Automated (Recommended)

```bash
# Make script executable
chmod +x apply-fixes.sh

# Apply all fixes, reinstall, and run QA
./apply-fixes.sh

# Windows PowerShell
./apply-fixes.ps1
```

## Manual

```bash
# 1. Backup
mkdir backup_$(date +%Y%m%d_%H%M%S)
cp package.json tsconfig.json .eslintrc.json backup_*/

# 2. Replace config files with fixed versions (see Section 9)

# 3. Create new files
#    - .prettierrc.json
#    - .prettierignore

# 4. Clean install
rm -f package-lock.json
rm -rf node_modules
npm install

# 5. Format and lint
npm run format
npm run lint:fix

# 6. Verify
npm run type-check
npm test
npm run build
```

## Rollback

```bash
cp backup_YYYYMMDD_HHMMSS/package.json .
cp backup_YYYYMMDD_HHMMSS/tsconfig.json .
cp backup_YYYYMMDD_HHMMSS/.eslintrc.json .
rm -rf node_modules && npm install
```

---

# 9. Codebase Issues and Fixes Report

## Issues Fixed

### 1. package.json

**Problems**: Conflicting dependency versions; `vite` listed as peer dependency instead of devDependency; missing `format`, `format:check`, and `test:watch` scripts.

**Fix**: See `package.json` in this release. Key changes: `vite` moved to devDependencies at `^5.2.0`; `@google/genai` replaces deprecated SDK; all scripts standardized.

### 2. tsconfig.json

**Problems**: Missing strict type checks; path aliases defined in vite config but not reflected in `tsconfig.json`.

**Fix**: Added full strict mode (`strict`, `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`, `noUncheckedIndexedAccess`, etc.); added all six `@`-prefixed path aliases to `paths`.

### 3. .prettierrc.json (new file)

**Problem**: File did not exist; formatter configuration was absent.

**Fix**: Created with project-standard settings: single quotes, trailing commas, 80-char print width, LF line endings.

### 4. .prettierignore (new file)

**Problem**: File did not exist; formatter would attempt to process lock files and build artifacts.

**Fix**: Created covering `node_modules`, `dist`, `.env*`, lock files, and `coverage`.

### 5. .eslintrc.json

**Problems**: Missing `jsx-a11y` accessibility rules; incomplete TypeScript rules; no `no-console` enforcement.

**Fix**: Added `plugin:jsx-a11y/recommended` to `extends`; added `jsx-a11y/click-events-have-key-events`, `jsx-a11y/no-static-element-interactions`, `jsx-a11y/no-noninteractive-element-interactions` to `rules`; added `no-console` warn (allowing `warn` and `error`); set `@typescript-eslint/no-explicit-any` to `"error"`.

### 6. API Reference (Section 2)

**Problem**: `ValidationService` section was duplicated verbatim — appeared twice in succession.

**Fix**: Removed the duplicate block; consolidated into a single `ValidationService` entry covering both `validateSearchResponse()` and `escapeCSVField()`.

### 7. Documentation Inconsistencies

**Problems**: Section 6 "Last Updated" date said December 2025 while all other sections said May 2026; placeholder GitHub URLs (`your-username`) mixed with real URL (`darshil0`).

**Fix**: Unified "Last Updated" to May 16, 2026 across all sections; placeholder `your-username` links updated to `darshil0`.

## Post-Fix Commands

```bash
rm package-lock.json
npm ci
npm run format
npm run lint:fix
npm run type-check
npm test
npm run build
```

## Summary

| File | Status | Change Type |
| --- | --- | --- |
| `package.json` | ✅ Fixed | Dependencies, scripts |
| `tsconfig.json` | ✅ Fixed | Strict checks, path aliases |
| `.eslintrc.json` | ✅ Fixed | a11y rules, TS rules |
| `.prettierrc.json` | ✅ Created | New file |
| `.prettierignore` | ✅ Created | New file |
| `docs/API_REFERENCE.md` | ✅ Fixed | Removed duplicate section |
| Documentation (global) | ✅ Fixed | Date/URL consistency |
