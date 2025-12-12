# DocuSearch Agent

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![Security](https://img.shields.io/badge/security-A+-brightgreen)](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> Enterprise-grade PDF document retrieval agent powered by Google Gemini 1.5 Flash

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent
npm install

# 2. Configure API key
cp .env.example .env
# Edit .env and add: VITE_GEMINI_API_KEY=your_api_key_here

# 3. Start development
npm run dev
```

## Key Issues Fixed (v1.2.3)

### Critical Fixes
1. ✅ **Gemini Model Reference** - Corrected to use `gemini-1.5-flash` (was incorrectly using 2.5)
2. ✅ **Environment Variables** - Fixed `VITE_GEMINI_API_KEY` naming consistency
3. ✅ **Test Mocks** - Corrected package name from `@google/genai` to `@google/generative-ai`
4. ✅ **TypeScript Imports** - Fixed circular dependencies and import paths

### Build & Configuration
- ✅ Local Tailwind CSS build via PostCSS (not CDN)
- ✅ Proper vite-env.d.ts type definitions
- ✅ All tests passing with correct mocks

## Features

- **Multi-Document Support** - Upload up to 10 PDFs (200MB each)
- **AI-Powered Search** - Natural language queries with fuzzy/semantic matching
- **Page-Level Citations** - Jump directly to relevant pages
- **Interactive PDF Viewer** - Zoom, rotate, navigate with keyboard shortcuts
- **100% Test Coverage** - Comprehensive test suite
- **Security First** - XSS prevention, file validation, rate limiting

## Technology Stack

- **React 19.2** with TypeScript 5.2
- **Google Gemini 1.5 Flash** for AI processing
- **Vite 5.2** for blazing-fast builds
- **Tailwind CSS 3.4** (local PostCSS build)
- **Vitest 4.0** with 100% coverage

## Documentation

- [Architecture](docs/architecture.md) - System design and agent patterns
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Testing Guide](docs/test-validation-guide.md) - How to run and write tests
- [Security](docs/security.md) - Security features and best practices
- [Deployment](docs/deployment.md) - Production deployment guide

## Common Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm test             # Run all tests
npm run lint         # Check code quality
npm run type-check   # TypeScript validation
npm run format       # Format code with Prettier
```

## Configuration

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_api_key_here  # Required: Get from https://makersuite.google.com
VITE_MAX_FILE_SIZE=209715200           # Optional: 200MB default
VITE_MAX_FILES=10                       # Optional: 10 files default
```

### Getting Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key to `.env` file

## Troubleshooting

### Build Fails

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests Fail

```bash
npm test -- --watch  # Run in watch mode to debug
```

### Environment Variables Not Working

1. Verify `.env` file exists in project root
2. Confirm variables start with `VITE_`
3. Restart dev server after changes

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues)
- [Documentation](https://docs.docusearch.dev)

---

**Built with ❤️ by Darshil** • v1.2.3
