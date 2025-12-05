# DocuSearch Agent v1.2.2

<div align="center">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Test Status](https://img.shields.io/badge/tests-51%2F51-brightgreen) ![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

**Intelligent PDF document retrieval powered by Google Gemini 2.5 Flash**

Upload up to 10 PDFs, search with natural language, and get exact page citations with context highlighting. Features fuzzy matching, semantic search, and an integrated PDF viewer.

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Examples](#-usage-examples)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

DocuSearch Agent is an intelligent document retrieval system that leverages Google's Gemini 2.5 Flash AI model to perform natural language searches across multiple PDF documents. Unlike traditional keyword search, DocuSearch understands context, handles typos, and finds semantically related content.

### Why DocuSearch?

- **Natural Language**: Search like you talk - "What was the revenue in Q4?" instead of "revenue Q4 2024"
- **Fuzzy Matching**: Finds "behavior" even when you search for "behaviour"
- **Semantic Understanding**: Search for "profit" and find "earnings", "revenue", "income"
- **Exact Citations**: Every result shows the exact page and highlights the relevant text
- **Multi-Document**: Search across up to 10 PDFs simultaneously
- **Accessibility First**: Full keyboard navigation and screen reader support

---

## ✨ Key Features

### 🔍 Advanced Search Capabilities

**Fuzzy Search**
- Handles spelling variations (color/colour, organize/organise)
- Tolerates typos (behvior → behavior)
- Understands plurals and verb forms (run/running/ran)

**Semantic Search**
- Contextual understanding (revenue → sales, income, earnings)
- Synonym recognition (happy → joyful, pleased, content)
- Concept matching (climate change → global warming, greenhouse effect)

**Smart Highlighting**
- Shows exact matches in context
- Highlights the AI-found terms, not your search terms
- Preserves original document formatting

### 📄 PDF Viewer

- **Navigation**: Page-by-page or direct jump
- **Zoom**: 50% to 200% with preset levels
- **Rotation**: 90° increments for landscape documents
- **Performance**: Optimized for files up to 200MB
- **Accessibility**: Keyboard shortcuts and screen reader support

### 🎨 User Experience

- **Drag & Drop**: Upload PDFs by dragging onto the interface
- **Batch Upload**: Add up to 10 documents at once
- **Real-time Feedback**: Progress indicators and error messages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Optimized for all color schemes

### ♿ Accessibility

- **WCAG 2.1 Level AA** compliant
- **Keyboard Navigation**: Full functionality without a mouse
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Logical tab order and focus trapping in modals
- **High Contrast**: Meets color contrast requirements

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# Install dependencies
npm install

# Configure your API key
cp .env.example .env
# Edit .env and add your Gemini API key

# Start development server
npm run dev

# Open http://localhost:5173
```

**First Search in 60 Seconds:**
1. Drop a PDF file onto the upload area
2. Wait for "Processing complete" message
3. Type a natural language query (e.g., "What are the main findings?")
4. Click "Search" and view results with exact page citations

---

## 📦 Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Get one at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Detailed Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Add your API key to .env
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# 5. Verify installation
npm run type-check
npm run lint
npm test

# 6. Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting provider
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Required: Your Gemini API key
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: API Configuration
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_API_TIMEOUT=30000

# Optional: Feature Flags
VITE_MAX_FILE_SIZE=209715200  # 200MB in bytes
VITE_MAX_FILES=10
VITE_ENABLE_DEBUG=false
```

### Application Settings

Edit `src/config/constants.ts`:

```typescript
export const CONFIG = {
  // File upload limits
  MAX_FILE_SIZE: 200 * 1024 * 1024, // 200MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ['application/pdf'],
  
  // Search settings
  SEARCH_TIMEOUT: 30000, // 30 seconds
  MIN_QUERY_LENGTH: 3,
  MAX_RESULTS_PER_DOC: 5,
  
  // PDF viewer settings
  DEFAULT_ZOOM: 1.0,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0,
  ZOOM_STEP: 0.25,
};
```

---

## 💡 Usage Examples

### Basic Search

```typescript
// Upload a document
const file = new File([pdfBuffer], 'report.pdf', { type: 'application/pdf' });
await uploadDocument(file);

// Search with natural language
const results = await searchDocuments('What were the Q4 sales figures?');

// Results include:
// - Document name
// - Page number
// - Exact text match
// - Surrounding context
```

### Advanced Search

```typescript
// Search across multiple documents
await uploadDocument(file1);
await uploadDocument(file2);
await uploadDocument(file3);

// Complex query with context
const results = await searchDocuments(
  'Compare the revenue growth between 2023 and 2024'
);

// AI understands:
// - "revenue" includes sales, income, earnings
// - "growth" includes increase, improvement
// - "compare" requires data from multiple sections
```

### Programmatic Usage

```typescript
import { GeminiService } from './services/GeminiService';

const gemini = new GeminiService(apiKey);

// Upload and process
const document = await gemini.uploadDocument(file);

// Search with options
const results = await gemini.search({
  query: 'sustainability initiatives',
  documents: [document],
  options: {
    fuzzyMatch: true,
    semanticSearch: true,
    maxResults: 10,
  }
});

// Access results
results.forEach(result => {
  console.log(`Page ${result.pageNumber}: ${result.snippet}`);
  console.log(`Confidence: ${result.confidence}`);
});
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (React + TypeScript + Tailwind CSS)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Application Layer                         │
│  - State Management (Zustand)                               │
│  - Error Handling                                           │
│  - Event Coordination                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     Service Layer                           │
│  - GeminiService (AI Processing)                           │
│  - DocumentService (File Management)                       │
│  - SearchService (Query Processing)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    External APIs                            │
│  - Google Gemini 2.5 Flash                                 │
│  - Browser File API                                        │
└─────────────────────────────────────────────────────────────┘
```

### Agent Architecture

DocuSearch follows a formal agent architecture pattern:

**System Definition**
- Name: DocuSearch Agent
- Role: Multi-document PDF retrieval specialist
- Capabilities: Natural language search, fuzzy matching, semantic understanding

**Tool Definitions**
- `upload_document`: Process and index PDF files
- `search_documents`: Execute natural language queries
- `extract_context`: Get surrounding text for results

**Protocol Flow**
1. User uploads documents → Tool: `upload_document`
2. AI processes and indexes content
3. User enters query → Tool: `search_documents`
4. AI analyzes query semantically
5. AI returns ranked results with citations

See `docs/agent_architecture/` for detailed specifications.

### Technology Stack

**Frontend**
- React 18.3 with TypeScript 5.5
- Tailwind CSS 3.4 for styling
- Zustand 4.5 for state management
- react-pdf 9.1 for PDF rendering

**AI & Processing**
- Google Gemini 2.5 Flash API
- Fuse.js 7.0 for fuzzy search
- Custom semantic matching algorithms

**Development**
- Vite 5.4 for build tooling
- Vitest 2.1 for testing
- ESLint 9.9 for code quality
- TypeScript strict mode

**Testing**
- Vitest with React Testing Library
- 51 test suites covering:
  - Component functionality
  - Service layer logic
  - Integration scenarios
  - Accessibility compliance
  - Architecture validation

---

## 📚 API Reference

### GeminiService

#### `uploadDocument(file: File): Promise<Document>`

Uploads and processes a PDF document.

**Parameters:**
- `file`: PDF file (max 200MB)

**Returns:**
- `Document` object with metadata and processing status

**Throws:**
- `InvalidFileError`: File type not supported or too large
- `ProcessingError`: AI processing failed

**Example:**
```typescript
const doc = await geminiService.uploadDocument(file);
console.log(`Processed ${doc.pageCount} pages`);
```

#### `search(query: string, documents: Document[]): Promise<SearchResult[]>`

Searches documents with natural language query.

**Parameters:**
- `query`: Natural language search string (min 3 characters)
- `documents`: Array of uploaded documents

**Returns:**
- Array of `SearchResult` objects ranked by relevance

**Example:**
```typescript
const results = await geminiService.search(
  'revenue trends',
  uploadedDocuments
);
```

### DocumentService

#### `validateFile(file: File): ValidationResult`

Validates file before upload.

**Returns:**
```typescript
{
  valid: boolean;
  error?: string;
}
```

#### `extractMetadata(file: File): Promise<Metadata>`

Extracts PDF metadata.

**Returns:**
```typescript
{
  title: string;
  author: string;
  pageCount: number;
  createdDate: Date;
}
```

### SearchService

#### `highlightText(text: string, query: string): HighlightedText`

Generates highlighted version of text.

**Parameters:**
- `text`: Original text content
- `query`: Search query

**Returns:**
```typescript
{
  text: string;
  highlights: Array<{ start: number; end: number; }>;
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- GeminiService.test.ts

# Watch mode for development
npm test -- --watch
```

### Test Coverage

Current coverage (51/51 tests passing):

| Category | Tests | Coverage |
|----------|-------|----------|
| Components | 18 | 100% |
| Services | 15 | 100% |
| Integration | 12 | 100% |
| Accessibility | 6 | 100% |

### Test Structure

```
src/
├── App.test.tsx             # Main app tests
├── Architecture.test.ts     # Architecture validation
├── vitest.setup.ts          # Test environment setup
├── components/              # Component tests co-located
└── services/                # Service tests co-located
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('handles user input correctly', async () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'test query');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });
});
```

See [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md) for detailed results.

---

## 🔧 Troubleshooting

### Common Issues

#### API Key Issues

**Problem:** "API Key is missing" error

**Solutions:**
1. Verify `.env` file exists in root directory
2. Check variable name is `VITE_GEMINI_API_KEY`
3. Restart dev server after adding key
4. Verify no quotes around key value

```bash
# Correct format
VITE_GEMINI_API_KEY=AIzaSyB...

# Incorrect (no quotes needed)
VITE_GEMINI_API_KEY="AIzaSyB..."
```

#### Upload Issues

**Problem:** "File too large" error

**Solutions:**
1. Check file size is under 200MB
2. Compress PDF using tools like Adobe Acrobat
3. Split large PDFs into smaller files
4. Increase limit in `.env` if needed

**Problem:** "Invalid file type" error

**Solutions:**
1. Ensure file extension is `.pdf`
2. Verify file is not corrupted (open in PDF reader)
3. Convert other formats to PDF first

#### Search Issues

**Problem:** No results found

**Solutions:**
1. Try broader search terms
2. Check spelling (though fuzzy search helps)
3. Verify document uploaded successfully
4. Try exact phrases from document

**Problem:** Search timeout

**Solutions:**
1. Reduce number of documents (try 3-5 first)
2. Use more specific queries
3. Check internet connection
4. Increase timeout in configuration

#### Build Issues

**Problem:** TypeScript errors during build

**Solutions:**
```bash
# Check types
npm run type-check

# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

**Problem:** Dependency conflicts

**Solutions:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for updates
npm outdated
npm update
```

### Debug Mode

Enable detailed logging:

```bash
# In .env
VITE_ENABLE_DEBUG=true
```

Then check browser console for detailed logs:
- Document processing steps
- Search query analysis
- API request/response details
- Error stack traces

### Performance Issues

**Slow document upload:**
1. Check file size (under 50MB is optimal)
2. Close other browser tabs
3. Use Chrome or Firefox for best performance
4. Check CPU usage (AI processing is intensive)

**Slow search:**
1. Index fewer documents simultaneously
2. Use more specific queries
3. Close PDF viewer while searching
4. Clear browser cache

### Getting Help

If you're still stuck:

1. **Check Documentation**
   - [docs/TEST_VALIDATION_GUIDE.md](docs/TEST_VALIDATION_GUIDE.md) for validation scenarios
   - [docs/REMAINING_ISSUES.md](docs/REMAINING_ISSUES.md) for known issues
   - [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for API details

2. **Search Existing Issues**
   - [GitHub Issues](https://github.com/your-username/gemini-pdf-retrieval-agent/issues)

3. **Create New Issue**
   - Include error messages
   - Describe steps to reproduce
   - Share browser console logs
   - Mention your environment (OS, Node version, etc.)

4. **Community Support**
   - [Discussions](https://github.com/your-username/gemini-pdf-retrieval-agent/discussions)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Code of Conduct

Be respectful, inclusive, and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

### Development Process

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR_USERNAME/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent
git remote add upstream https://github.com/original-owner/gemini-pdf-retrieval-agent.git
```

2. **Create Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

3. **Make Changes**
- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation

4. **Test Everything**
```bash
npm run type-check  # TypeScript compilation
npm run lint        # Code style
npm test            # All tests
npm run test:a11y   # Accessibility
```

5. **Commit**
```bash
git add .
git commit -m "feat: add semantic search improvements"
```

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `style:` Formatting
- `chore:` Maintenance

6. **Push and PR**
```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

### Code Standards

**TypeScript**
- Enable strict mode
- Use explicit types (no `any`)
- Document public APIs with JSDoc

**React**
- Use functional components with hooks
- Follow React best practices
- Ensure accessibility

**Testing**
- Minimum 80% coverage for new code
- Write meaningful test descriptions
- Test edge cases and errors

**Accessibility**
- WCAG 2.1 Level AA compliance
- Test with keyboard only
- Test with screen reader

### Review Process

1. Automated checks run on PR
2. Maintainer reviews code
3. Address feedback
4. Approval and merge

---

## 📊 Version History

### v1.2.2 (2025-12-05) - Current Release ✨

**Agent Architecture Formalization**
- Extracted System, Tool, and Protocol definitions
- Created `agent_architecture/` documentation
- Implemented Architecture.test.ts verification
- Enforced strict compliance in service layer

**Improvements**
- Clearer separation of concerns
- Better maintainability
- Formal agent pattern documentation

### v1.2.1 (2025-12-05)

**Code Quality & Accessibility**
- Added ESLint with strict rules
- Enabled TypeScript strict mode
- Fixed all accessibility issues
- Enhanced error handling throughout
- 100% test pass rate (51/51 tests)

**Accessibility Improvements**
- Full keyboard navigation
- Proper ARIA labels
- Focus management in modals
- Screen reader optimization

**Quality Metrics**
- ✅ Production ready
- ✅ WCAG 2.1 Level AA compliant
- ✅ 100% test coverage

### v1.2.0 (2025-12-04)

**Fuzzy Search & Enhanced PDF Viewer**
- Implemented fuzzy search with Fuse.js
- Added semantic matching algorithms
- Migrated to react-pdf for reliability
- Added zoom, rotation, and navigation controls
- Improved large file handling (up to 200MB)

**Features**
- Smart highlighting of found terms
- Better error messages
- Performance optimizations

### v1.1.0 (2025-11-28)

**Multi-Document Support**
- Upload up to 10 PDFs
- Search across all documents
- Document-specific results
- Batch processing improvements

### v1.0.0 (2025-11-15)

**Initial Release**
- Google Gemini 2.5 Flash integration
- Single document search
- Basic PDF viewing
- Natural language queries
- Page-level citations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Darshil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Google Gemini Team** for the amazing AI model
- **React Team** for the excellent framework
- **Wojciech Maj** for react-pdf library
- **All Contributors** who helped improve this project

---

## 📞 Contact

- **Author**: Darshil
- **GitHub**: [@your-username](https://github.com/your-username)
- **Issues**: [Report a bug](https://github.com/your-username/gemini-pdf-retrieval-agent/issues)
- **Discussions**: [Ask a question](https://github.com/your-username/gemini-pdf-retrieval-agent/discussions)

---

<div align="center">

**Built with ❤️ using Google Gemini 2.5 Flash** by **Darshil**

[⬆ Back to Top](#docusearch-agent-v122)

</div>
