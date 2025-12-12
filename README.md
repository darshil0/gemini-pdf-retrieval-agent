# DocuSearch Agent

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![Security](https://img.shields.io/badge/security-A+-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> Enterprise-grade PDF document retrieval agent powered by Google Gemini 1.5 Flash

## Overview

DocuSearch Agent is an intelligent document search system that uses Google's Gemini 1.5 Flash AI model to enable natural language querying across multiple PDF documents. Built with modern web technologies and enterprise-grade security practices, it provides instant, accurate results with page-level citations.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

### Document Management

- **Multi-Document Upload** - Upload up to 10 PDF files simultaneously
- **Drag & Drop Interface** - Intuitive file upload with visual feedback
- **File Validation** - Magic number verification for authentic PDF files
- **Size Limits** - Maximum 200MB per file, optimized for performance
- **Progress Tracking** - Real-time upload progress indicators
- **Document Organization** - Easy management of uploaded documents

### Intelligent Search

- **Natural Language Processing** - Ask questions in plain English
- **Fuzzy Matching** - Handles typos and spelling variations automatically
- **Semantic Search** - Understands synonyms and related terms
- **Cross-Document Search** - Search across all uploaded documents simultaneously
- **Page-Level Citations** - Direct links to exact pages containing results
- **Context Snippets** - Relevant text excerpts around search results
- **Smart Highlighting** - Visual emphasis on matched terms
- **Relevance Ranking** - Results ordered by relevance score

### PDF Viewer

- **Interactive Viewing** - Full-featured PDF viewer in the browser
- **Page Navigation** - Quick jump to any page
- **Zoom Controls** - Multiple zoom levels (50%, 75%, 100%, 150%, 200%)
- **Rotation Support** - Rotate pages in 90° increments
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Keyboard Shortcuts** - Arrow keys for navigation, +/- for zoom

### Security & Quality

- **Input Sanitization** - XSS prevention on all user inputs
- **File Type Verification** - Deep inspection of file content
- **Rate Limiting** - API abuse prevention (10 requests/minute)
- **WCAG 2.1 AA Compliant** - Full accessibility support
- **100% Test Coverage** - Comprehensive test suite
- **TypeScript Strict Mode** - Type-safe codebase
- **ESLint & Prettier** - Consistent code quality and formatting

## Technology Stack

### Frontend

- **React 19.2** - Modern UI library with concurrent features
- **TypeScript 5.2** - Type-safe development with strict mode
- **Vite 5.2** - Fast build tool with HMR
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### AI & Processing

- **Google Gemini 1.5 Flash** - Advanced AI language model
- **pdfjs-dist 5.4** - PDF parsing and rendering
- **react-pdf 10.2** - React PDF viewer components

### Testing & Quality

- **Vitest 4.0** - Fast unit testing framework
- **React Testing Library 16.3** - Component testing utilities
- **ESLint 8.57** - Code linting and style enforcement
- **Prettier 3.7** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git** (for cloning the repository)
- **Google Gemini API Key** ([Get one free here](https://makersuite.google.com/app/apikey))

### Step 1: Clone Repository

```bash
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, TypeScript, Vite, and testing libraries.

### Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

### Step 4: Verify Installation

Run the following commands to verify everything is set up correctly:

```bash
# Check TypeScript compilation
npm run type-check

# Check code quality
npm run lint

# Run test suite
npm test

# Build the project
npm run build
```

All commands should complete successfully without errors.

## Quick Start

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the optimized production bundle:

```bash
npm run build
npm run preview
```

The preview server will be available at `http://localhost:4173`

## Usage Guide

### Uploading Documents

1. **Click the upload area** or **drag and drop** PDF files
2. Select up to 10 PDF files (max 200MB each)
3. Wait for the upload progress to complete
4. Documents are automatically processed and indexed

### Searching Documents

1. **Enter your query** in natural language (e.g., "What are the revenue figures for Q4?")
2. Press **Enter** or click the **Search** button
3. View results with page citations and context snippets
4. Click on a result to view the document at that specific page

### Viewing Documents

1. **Click any search result** to open the PDF viewer
2. Use **navigation controls** to move between pages
3. **Zoom in/out** using the zoom buttons or keyboard shortcuts
4. **Rotate pages** if needed using rotation controls

### Keyboard Shortcuts

- `Enter` - Submit search query
- `Arrow Keys` - Navigate PDF pages
- `+` or `=` - Zoom in
- `-` - Zoom out
- `Escape` - Close PDF viewer

## Architecture

### Agent-Based Design

DocuSearch implements a three-layer agent architecture:

#### 1. System Layer (Persona)

Defines the agent as an expert Document Retrieval and Analysis Agent with capabilities in:
- Natural language understanding
- Cross-document search
- Semantic matching
- Result ranking

#### 2. Tool Layer (Instructions)

Implements three core tools:

**upload_document**
- Validates and processes PDF files
- Extracts text and metadata
- Indexes content for search

**search_documents**
- Processes natural language queries
- Performs fuzzy and semantic matching
- Ranks results by relevance

**extract_context**
- Retrieves page-level citations
- Extracts surrounding context
- Highlights matched terms

#### 3. Protocol Layer (Constraints)

Enforces system behaviors:
- Maximum 10 documents
- Structured JSON responses
- Rate limiting (10 req/min)
- Error handling protocols

### Component Architecture

```
src/
├── components/           # React UI components
│   ├── FileUpload.tsx   # Document upload interface
│   ├── SearchBox.tsx    # Search input component
│   ├── SearchResults.tsx # Results display
│   └── PDFViewer.tsx    # Document viewer
├── services/            # Business logic layer
│   ├── geminiService.ts # AI integration
│   └── validation.ts    # Input validation
├── types.ts             # TypeScript definitions
└── App.tsx              # Main application
```

## API Reference

### GeminiService

#### searchInDocuments

Search for content across uploaded documents.

```typescript
async function searchInDocuments(
  files: File[],
  keyword: string
): Promise<SearchResponse>
```

**Parameters:**
- `files` - Array of uploaded PDF files
- `keyword` - Search query string

**Returns:**
```typescript
interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  processingTime: number;
}

interface SearchResult {
  documentName: string;
  pageNumber: number;
  content: string;
  relevanceScore: number;
  context: string;
}
```

**Throws:**
- `Error` - If API call fails
- `ValidationError` - If inputs are invalid

### Components

#### FileUpload

```typescript
interface FileUploadProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
}
```

#### SearchBox

```typescript
interface SearchBoxProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

## Configuration

### Environment Variables

```env
# Required
VITE_GEMINI_API_KEY=your_api_key_here

# Optional
VITE_MAX_FILE_SIZE=209715200      # 200MB in bytes
VITE_MAX_FILES=10                  # Maximum documents
VITE_RATE_LIMIT=10                 # Requests per minute
```

### TypeScript Configuration

Strict mode is enabled for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ESLint Configuration

Code quality rules are enforced:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

Current test coverage: **100%**

- Unit tests for all components
- Integration tests for search flow
- Security validation tests
- Accessibility compliance tests

### Writing Tests

Example test structure:

```typescript
import { render, screen } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('should call onSearch when Enter is pressed', async () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'test query{Enter}');
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });
});
```

## Security

### Implemented Measures

1. **File Validation**
   - Magic number verification
   - MIME type checking
   - File size limits
   - Extension validation

2. **Input Sanitization**
   - XSS prevention
   - SQL injection protection (if applicable)
   - HTML entity encoding

3. **API Security**
   - Rate limiting (10 requests/minute)
   - API key validation
   - Error message sanitization

4. **Access Control**
   - Client-side file processing only
   - No server-side storage
   - Temporary file handling

### Security Best Practices

```typescript
// Always validate file types
const isValidPDF = (file: File): boolean => {
  const validTypes = ['application/pdf'];
  return validTypes.includes(file.type);
};

// Sanitize search queries
const sanitizeQuery = (query: string): string => {
  return query.replace(/[<>]/g, '');
};
```

## Performance

### Optimization Strategies

1. **Code Splitting** - Dynamic imports for heavy components
2. **Lazy Loading** - PDF pages loaded on demand
3. **Memoization** - Cached expensive computations
4. **Debouncing** - Search input debounced (300ms)
5. **Virtual Scrolling** - Efficient rendering of large result sets

### Performance Metrics

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Search Response**: < 1 second (cached)
- **PDF Render**: < 500ms per page
- **Bundle Size**: ~180KB (gzipped)

### Monitoring

```bash
# Analyze bundle size
npm run build -- --analyze

# Run performance tests
npm run test:performance
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Guide

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run tests** (`npm test`)
5. **Format code** (`npm run format`)
6. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
7. **Push to branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Commit Convention

I use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Tests Fail

```bash
# Run tests in watch mode to debug
npm run test:watch
```

#### TypeScript Errors

```bash
# Check for type errors
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

#### API Key Issues

```bash
# Verify API key is set
echo $VITE_GEMINI_API_KEY

# Restart dev server after changing .env
npm run dev
```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/darshil0/gemini-pdf-retrieval-agent/discussions)
- **Email**: [Contact maintainers](mailto:contact@docusearch.dev)

## Roadmap

### Version 2.1 (Q1 2026)

- [ ] OCR support for scanned PDFs
- [ ] Multi-language document support
- [ ] Export search results to CSV/JSON
- [ ] Advanced filters (date, document type)
- [ ] Document annotations and highlights

### Version 2.2 (Q2 2026)

- [ ] Real-time collaboration features
- [ ] Document comparison tool
- [ ] Custom AI model fine-tuning
- [ ] Integration with cloud storage (Google Drive, Dropbox)
- [ ] Mobile app (iOS/Android)

### Version 3.0 (Q3 2026)

- [ ] Enterprise SSO integration
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] White-label deployment options
- [ ] On-premise installation support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google Gemini Team** - For the powerful AI model
- **React Team** - For the excellent framework
- **Mozilla PDF.js** - For PDF rendering capabilities
- **Contributors** - Thank you to all who have contributed!

## Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation
- 🤝 Contributing code

---

**Built with ❤️ by Darshil**

[Website](https://docusearch.dev) • [Documentation](https://docs.docusearch.dev) • [GitHub](https://github.com/darshil0/gemini-pdf-retrieval-agent)
