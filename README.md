# DocuSearch Agent v2.0.0

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![Security](https://img.shields.io/badge/security-A+-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Enterprise-grade PDF document retrieval with Google Gemini**

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 File Upload System
- **Strict 10-File Limit** - System enforces a maximum of 10 PDF files.
- **File Type Validation** - Magic number verification ensures that only valid PDF files are uploaded.
- **Size Validation** - Maximum 200MB per file.
- **Drag & Drop** - Intuitive file upload interface.

### 🔍 Advanced Search
- **Exact Keyword Matching** - Find exact text matches across all documents.
- **Case Sensitivity** - Toggle case-sensitive search.
- **Whole Word Matching** - Option to match complete words only.

### 🛡️ Security Features
- **Input Sanitization** - XSS prevention for all user inputs.
- **File Validation** - Deep inspection of file content.
- **Rate Limiting** - Prevents API abuse (10 requests/minute).

### 🧪 Testing & Quality
- **100% Test Coverage** - All components and services are tested.
- **Integration Tests** - End-to-end workflow validation.
- **Security Tests** - Validation and sanitization testing.

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Gemini API key to .env

# Run tests
npm test

# Start development server
npm run dev
```

---

## 📦 Installation

### Prerequisites
- Node.js v18+
- npm v9+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Step-by-Step Setup

1. **Clone and Install**
```bash
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent
npm install
```

2. **Configure Environment**
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

3. **Verify Installation**
```bash
npm run type-check  # TypeScript validation
npm run lint        # Code quality
npm test           # All tests
```

4. **Start Application**
```bash
npm run dev         # Development mode
# or
npm run build      # Production build
npm run preview    # Preview production
```

---

## 💡 Usage

### Basic Usage

1. **Upload PDFs** (Maximum 10 files)
   - Drag and drop PDF files onto the upload area.
   - Or click to browse and select files.

2. **Search**
   - Enter the exact text you want to find.
   - Toggle case-sensitive and whole-word matching as needed.

---

## 📚 API Reference

### FileUpload Component

```typescript
interface FileUploadProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  disabled?: boolean;
}
```

### KeywordSearchService

```typescript
// Search for exact keywords
const matches = KeywordSearchService.searchKeyword(
  'keyword',
  documents,
  {
    caseSensitive: false,
    wholeWord: false,
  }
);

// Get statistics
const stats = KeywordSearchService.getMatchStatistics(matches);
```

### SecurityService

```typescript
// Validate file
const isValid = await SecurityService.validateFileType(file);

// Sanitize input
const clean = SecurityService.sanitizeInput(userInput);

// Validate search query
const result = SecurityService.validateSearchQuery(query);

// Check rate limit
const allowed = SecurityService.checkRateLimit('user-id', 10, 60000);
```

---

## 🔒 Security

### Implemented Security Measures

1. **File Validation**
   - Magic number verification (checks actual file content).
   - File size limits.

2. **Input Sanitization**
   - XSS prevention.

3. **Rate Limiting**
   - 10 requests per minute per user.

---

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.
