I've cleaned up the README to ensure it meets "enterprise-grade" standards. Key improvements include removing hidden non-breaking space characters (which cause CLI errors), re-organizing the hierarchy for better flow, and polishing the Markdown syntax for better rendering across GitHub and GitLab.

-----

# DocuSearch Agent

[](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[](https://github.com/darshil0/gemini-pdf-retrieval-agent)
[](https://www.typescriptlang.org/)
[](https://react.dev/)
[](https://www.google.com/search?q=LICENSE)

> **Enterprise-grade PDF document retrieval agent** powered by Google Gemini 1.5 Flash. Seamlessly search through complex documents using natural language.

-----

## 🚀 Quick Start

Get your environment up and running in less than two minutes.

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

-----

## ✨ Features

  * **Multi-Document Support**: Upload up to 10 PDFs (200MB each) simultaneously.
  * **AI-Powered Search**: Natural language queries with fuzzy and semantic matching.
  * **Page-Level Citations**: Interactive links that jump directly to the relevant page in the viewer.
  * **Advanced PDF Viewer**: Support for zooming, rotation, and keyboard navigation.
  * **Performance Optimized**: Lazy-loading and streaming document processing for large files.
  * **Security First**: Built-in XSS prevention, strict file validation, and rate limiting.
  * **Developer Friendly**: 100% test coverage and full TypeScript support.

-----

## 🛠 Technology Stack

  * **Frontend**: React 19.2 & TypeScript 5.2
  * **AI Engine**: Google Gemini 1.5 Flash
  * **Build Tool**: Vite 5.2
  * **Styling**: Tailwind CSS 3.4 (Local PostCSS build)
  * **Testing**: Vitest 4.0

-----

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_api_key_here  # Required: Get from https://aistudio.google.com
VITE_MAX_FILE_SIZE=209715200            # Optional: 200MB default
VITE_MAX_FILES=10                       # Optional: 10 files default
```

### Getting a Gemini API Key

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Sign in with your Google account.
3.  Click **"Create API Key"**.
4.  Copy the key into your `.env` file.

-----

## 📂 Documentation

Detailed guides are available in the `/docs` folder:

  * [Architecture](https://www.google.com/search?q=docs/architecture.md) – System design and agent patterns.
  * [API Reference](https://www.google.com/search?q=docs/api-reference.md) – Complete interface documentation.
  * [Testing Guide](https://www.google.com/search?q=docs/test-validation-guide.md) – Instructions for running/writing tests.
  * [Security](https://www.google.com/search?q=docs/security.md) – Security protocols and best practices.
  * [Deployment](https://www.google.com/search?q=docs/deployment.md) – Production deployment strategies.

-----

## 💻 Common Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start development server (Port 5173) |
| `npm run build` | Generate production-ready build |
| `npm test` | Run the full Vitest suite |
| `npm run lint` | Check code quality and style |
| `npm run type-check` | Run TypeScript validation |
| `npm run format` | Auto-format code with Prettier |

-----

## 🔧 Troubleshooting

### Build Failures

If you encounter build errors, try clearing the local cache:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Issues

1.  Verify the `.env` file is in the project root (not `/src`).
2.  Ensure all variables are prefixed with `VITE_`.
3.  **Restart the dev server** after making changes to environment variables.

-----

## 📈 Recent Updates (v1.3.1)

  * ✅ **TypeScript Resolution**: Resolved all type-casting issues in the retrieval engine.
  * ✅ **Security Hardening**: Upgraded core dependencies to patch high-severity vulnerabilities.
  * ✅ **UI/UX**: Added Dark Mode support and CSV export functionality for search results.
  * ✅ **Memory Management**: Implemented lazy-loading for PDF pages to prevent browser crashes on large files.

-----

**Built with ❤️ by [Darshil](https://www.google.com/search?q=https://github.com/darshil0)** • v1.3.1
