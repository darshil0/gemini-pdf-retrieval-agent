# Changelog

All notable changes to **DocuSearch Agent** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2026-04-18

### Fixed
- **TypeScript**: Resolved all remaining type errors in `App.tsx`, `vitest.setup.ts`, `vitest.config.ts`, and test files.
- **Security**: Addressed vulnerabilities via `npm audit fix`, reducing identified issues from 23 to 17.
- **Consistency**: Standardized configuration filenames (e.g., renamed `prettierrc.json` to `.prettierrc.json`).
- **Cleanup**: Removed duplicate root-level assets to maintain project structure integrity.

## [1.3.0] - 2025-12-13

### Added
- **Performance**: Implemented streaming for large file uploads to reduce memory overhead.
- **Performance**: Added lazy-loading for PDF pages to optimize browser memory usage.
- **Search**: Enhanced the search prompt with relevance scoring for higher precision.
- **UI/UX**: Enabled the text layer in the PDF viewer to allow for text selection and copying.
- **UI/UX**: Added a search history feature to track previous queries.
- **UI/UX**: Implemented search results export to CSV.
- **UI/UX**: Added a dark mode toggle to the main interface.

### Fixed
- **Critical**: Fixed a bug in the PDF viewer that caused rendering failures when lazy loading was enabled.
- **Tests**: Polyfilled `DOMMatrix` and improved the `File` mock in the test environment for better CI/CD stability.

## [1.2.3] - 2025-12-12

### Fixed
- **Critical**: Restored working **Gemini 1.5 Flash** model reference (previously incorrectly set to 2.5).
- **Environment**: Fixed `VITE_GEMINI_API_KEY` variable name mismatch in the config loader.
- **Build**: Corrected TypeScript compiled imports by moving `agent_architecture` to `src/`.
- **UI/UX**: Fixed dark mode styling inconsistencies in the `FileUpload` component.
- **Styling**: Replaced unstable CDN-linked Tailwind with a local PostCSS build pipeline.
- **Dependencies**: Migrated from `@google/genai` (preview) to `@google/generative-ai` (stable).
- **QA**: Achieved 0 TypeScript errors and 0 lint warnings across the codebase.

## [1.2.2] - 2025-12-05

### Added
- **Documentation**: Formalized system, tool, and protocol definitions in the `agent_architecture/` directory.
- **Architecture Validation**: New test suite (`Architecture.test.ts`) to verify compliance with agent patterns.
- **Tool Definitions**: Added formal specifications for `upload_document`, `search_documents`, and `extract_context` tools.

### Changed
- **Service Layer**: Refactored to strictly follow agent architecture patterns.
- **Error Handling**: Enhanced logic to align with agent protocol specifications.
- **Internal**: Extracted prompts to dedicated files and standardized tool parameter validation.

## [1.2.1] - 2025-12-05

### Added
- **Linting**: Integrated ESLint with TypeScript-specific rules and React accessibility checks.
- **Strict Typing**: Enabled all TypeScript strict mode flags (e.g., `strictNullChecks`, `noImplicitAny`).
- **Accessibility**: Added full keyboard navigation support, ARIA labels, and focus management for modals.
- **Testing**: Added accessibility test suite (WCAG 2.1 Level AA compliance).

### Fixed
- **Accessibility**: Resolved missing ARIA labels, incorrect tab orders, and low color contrast issues.
- **TypeScript**: Fixed all implicit `any` types and unsafe type assertions.
- **Code Quality**: Cleaned up unused variables, inconsistent styles, and unhandled promise rejections.

## [1.2.0] - 2025-12-04

### Added
- **Fuzzy Search**: Integrated `Fuse.js` to handle typos and spelling variations.
- **Semantic Search**: AI-powered understanding to find related terms (e.g., "revenue" matching "income").
- **Smart Highlighting**: Implementation of context-aware highlights using HTML `<mark>` tags.
- **PDF Viewer**: Added rotation controls and zoom presets (50% to 200%).

### Changed
- **PDF Rendering**: Migrated from raw `pdf.js` to `react-pdf` for better stability and browser compatibility.
- **Performance**: Reduced initial bundle size by 15% and optimized re-renders using memoization.

## [1.1.0] - 2025-12-04

### Added
- **Multi-Document Support**: Ability to upload and search across up to 10 documents simultaneously.
- **Management UI**: Added document list management with status indicators and metadata views.
- **Cross-Document Search**: Results are now grouped and ranked across the entire document set.

### Fixed
- **Upload**: Resolved race conditions during simultaneous multi-file uploads.
- **Search**: Fixed incorrect document attribution in search result snippets.

## [1.0.0] - 2025-12-04

### Added
- **Core Functionality**: PDF upload with drag-and-drop and validation.
- **AI Integration**: Integration with Google Gemini 1.5 Flash for text extraction and indexing.
- **Search**: Natural language query processing with page-level citations.
- **UI**: Initial responsive layout built with React 18, Vite, and Tailwind CSS.

---

**Built with ❤️ by Darshil**
