# DocuSearch Agent

**Intelligent PDF document retrieval powered by Google Gemini 2.5 Flash**

Upload up to 10 PDFs, search with natural language, and get exact page citations with context highlighting. Features fuzzy matching, semantic search, and an integrated PDF viewer.

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your Google Gemini API key

# Run
npm run dev
```

Visit `http://localhost:5173`

---

## ✨ Key Features

- **Multi-Document Analysis** - Upload and search across up to 10 PDFs simultaneously
- **Fuzzy & Semantic Search** - Finds variations, typos, and synonyms (e.g., "Revenue" matches "Sales")
- **Exact Page Citations** - Returns precise page numbers for every match
- **Smart Highlighting** - Highlights the exact term found, even if it differs from your search
- **Integrated PDF Viewer** - Built-in `react-pdf` viewer with navigation and rotation
- **Size Warnings** - Alerts when uploads exceed 200MB
- **Keyboard Accessible** - Full keyboard navigation and ARIA support

---

## 🎯 How It Works

1. **Upload** - Drag and drop PDF files (max 10 files, 200MB recommended)
2. **Search** - Enter keywords or phrases (fuzzy matching supported)
3. **Analyze** - AI scans documents and finds all occurrences
4. **Review** - Browse results with context snippets and relevance explanations
5. **View** - Click any result to open the PDF viewer at the exact page

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash
- **PDF**: react-pdf / pdfjs-dist
- **Build**: Vite
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + TypeScript strict mode

---

## 📋 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code quality
npm run type-check   # Verify TypeScript types
```

---

## 🧪 Testing & Quality

**Test Results**: 51/51 tests passed (100%)

- ✅ Type checking with strict mode
- ✅ ESLint with TypeScript and React rules
- ✅ Automated unit and integration tests
- ✅ WCAG 2.1 Level AA accessibility compliance

See [TESTING_REPORT.md](TESTING_REPORT.md) for detailed results.

---

## 📚 Documentation

- **[TESTING_REPORT.md](TESTING_REPORT.md)** - Comprehensive test results and quality metrics
- **[TEST_VALIDATION_GUIDE.md](TEST_VALIDATION_GUIDE.md)** - Step-by-step validation scenarios
- **[REMAINING_ISSUES.md](REMAINING_ISSUES.md)** - Known issues and future enhancements

---

## 🔧 Troubleshooting

### API Key Issues
- **"API Key is missing"**: Ensure `.env` file exists with `API_KEY` set
- **Invalid API key**: Verify key has access to Gemini 2.5 Flash model

### Build Issues
- **TypeScript errors**: Run `npm run type-check`
- **Dependency issues**: Delete `node_modules` and `package-lock.json`, then `npm install`

### Runtime Issues
- **PDF not loading**: Verify PDF is valid and not corrupted
- **Search timeout**: Large files (>200MB) may timeout - try smaller files
- **No results**: Try broader search terms

---

## 🎨 Features in Detail

### Fuzzy Search
Search for "Behavior" and find "Behaviour", "behavioral", "behaviors", etc. The AI understands context and variations.

### Semantic Matching
Search for "Revenue" and find "Sales", "Income", "Earnings" - the AI understands meaning, not just exact words.

### Smart Highlighting
If you search for "color" but the document contains "colour", the highlight shows "colour" - you see exactly what was found.

### Accessibility
- Full keyboard navigation (Tab, Enter, Escape, Space)
- Screen reader support with ARIA labels
- WCAG 2.1 Level AA color contrast
- Focus management in modals

---

## 📊 Version History

### v1.2.1 (2025-12-05) - Current
**Code Quality & Accessibility**
- Added ESLint + TypeScript strict mode
- Fixed all accessibility issues (keyboard navigation, ARIA attributes)
- Enhanced error handling
- 100% test pass rate (51/51 tests)
- Production-ready ✅

### v1.2.0
**Fuzzy Search & PDF Viewer**
- Fuzzy search with semantic matching
- Migrated to `react-pdf` for better compatibility
- Added rotation and navigation controls
- Improved large file handling

### v1.0.0
**Initial Release**
- Gemini 2.5 Flash integration
- Multi-document search
- Basic PDF viewing

---

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

---

## 🤝 Contributing

Contributions welcome! Please ensure:
- All tests pass (`npm test`)
- Code passes linting (`npm run lint`)
- TypeScript compiles (`npm run type-check`)
- Accessibility standards maintained

---

**Built with ❤️ using Google Gemini 2.5 Flash**
