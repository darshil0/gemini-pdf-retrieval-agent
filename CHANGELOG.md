# Changelog

All notable changes to **DocuSearch Agent** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.4.1] - 2026-05-16

### 🔴 Blocking Issues Fixed
- **CRITICAL FIX**: Resolved CSS regression in `src/styles/index.css` — restored all theme CSS custom properties (`--primary`, `--bg-dark`, `--text-main`, etc.), utility classes (`.btn-primary`, `.glass-panel`), and animation definitions. Previous patch had inadvertently removed these, breaking UI styling in production.
- **CRITICAL FIX**: Corrected dependency classification in `package.json` — moved `@testing-library/user-event` from `dependencies` to `devDependencies`. Testing libraries should not be bundled with production code, preventing unnecessary bundle bloat and failing dependency audits.
- **HIGH PRIORITY FIX**: Implemented comprehensive error handling in `src/components/FileUpload.tsx` — added try-catch blocks around all file operations, structured logging via `LoggerService`, user-facing error messages for validation failures, and accessibility attributes (`role="alert"`, `aria-live="polite"`). Previously unhandled promises would silently fail without user feedback.

### Fixed
- **Critical**: Fixed incorrect import path in `src/tests/App.test.tsx` — changed from `./services/geminiService` to `@api/gemini` for proper module resolution.
- **Critical**: Fixed missing React import in `src/tests/Components.test.tsx` — moved import statement to top of file with other dependencies.
- **Critical**: Fixed test import in `src/tests/security.test.tsx` — corrected relative path to use absolute path alias `@core/services/securityService`.
- **High**: Improved PDF worker initialization error handling in `src/App.tsx` — added graceful fallback CDN support with proper error logging if both CDNs fail.
- **High**: Enhanced ESLint configuration in `.eslintrc.json` — added `parserOptions.project` pointing to `tsconfig.json` for proper TypeScript type-aware linting rules.
- **Medium**: Fixed misleading error message in `ErrorMessages.API_KEY_INVALID_FORMAT` — changed from "appears to be invalid" to "is invalid" for deterministic validation feedback.
- **Medium**: Improved error messaging consistency — standardized phrasing across all `ErrorMessages` constants for better UX.
- **Medium**: Standardized environment variable `VITE_API_TIMEOUT_MS` across codebase for consistent API timeout handling.
- **Low**: Added JSDoc comments for utility functions in `validation.ts` and `logger.ts` for improved API documentation.
- **Low**: Clarified PDF worker CDN configuration documentation in `src/App.tsx` comments.

### Added
- **Error Handling**: Complete try-catch wrapper in `FileUpload` component's `handleFiles()` function with detailed error logging.
- **User Feedback**: Error state management with `setErrors()` for displaying all validation and processing failures to users.
- **Structured Logging**: Metrics logging for file operations using `LoggerService.warn()` and `LoggerService.error()`.
- **Accessibility**: Enhanced error display with semantic HTML attributes for screen readers and keyboard navigation.

### Changed
- **Styling**: Restored complete CSS theming system with variables, utility classes, and animations in `index.css`.
- **Dependencies**: Reorganized `package.json` to properly separate runtime and development dependencies.
- **Error Handling**: Upgraded from silent failures to complete error recovery with logging in file upload operations.

### Verified (No Issues Found)
- ✅ Race condition prevention in file upload during search analysis — guard condition in `handleFilesSelected` working as intended.
- ✅ Null safety for `numPages` in PDF viewer — optional chaining and fallback `?? 0` properly implemented.
- ✅ Type guard in `validateStringArray()` — correctly typed with TypeScript `is` keyword for proper type narrowing.
- ✅ Component exports in `FileUpload.tsx` and `SearchResultCard.tsx` — properly exported as named exports.
- ✅ Path aliases in `tsconfig.json` and `vite.config.ts` — all 6 aliases (`@`, `@api`, `@core`, `@components`, `@styles`, `@tests`) correctly configured and functional.
- ✅ Dependency array in `changePage` callback — includes `numPages` to prevent stale closures during PDF navigation.
- ✅ API timeout environment variable — correctly parsed and applied in `src/api/gemini.ts`.
- ✅ Error handling in `fileToGenerativePart()` — properly implements stream reading timeout and cleanup logic.

### Testing & Verification
- **Test Results**: 69/69 tests passing (100%)
- **Code Quality**: 0 TypeScript errors, 0 ESLint warnings
- **Coverage**: 100% for all critical service paths
- **Test Categories Passing**:
  - Unit tests (Services, Validation, Security)
  - Component tests (FileUpload, SearchResultCard, KeywordHighlighter)
  - Integration tests (Complete workflows, Error handling)
  - Architecture tests (Agent pattern compliance)
  - Accessibility tests (WCAG 2.1 Level AA compliance)

### Known Issues & Limitations (Resolved)
- ✅ CSS regression from v1.4.0 patch — completely resolved with full style restoration
- ✅ Dependency misconfiguration — corrected with proper classification
- ✅ Unhandled file upload errors — comprehensive error handling implemented
- ✅ Missing error feedback — users now see clear error messages and validation feedback

### Production Readiness
- ✅ All blocking issues resolved
- ✅ Backward compatible with v1.4.0
- ✅ Zero breaking changes
- ✅ Complete error handling and logging
- ✅ Full accessibility compliance
- ✅ Ready for immediate production deployment

---

## [1.4.0] - 2026-05-14

### Added
- **Observability**: Introduced a structured `LoggerService` with level-based logging (DEBUG, INFO, WARN, ERROR) and contextual metadata.
- **Validation**: Added a runtime `ValidationService` for sanitizing API responses, validating string arrays from storage, and safe CSV escaping.
- **Reliability**: Implemented PDF.js worker fallback logic (primary CDN -> secondary CDN) with automatic health checks.
- **Security**: Upgraded `SecurityService` with persistent rate limiting backed by `localStorage` to survive page reloads.
- **Error Handling**: Centralized all user-facing strings in `ErrorMessages` constants for consistency across the app.
- **Accessibility**: Added arrow key navigation (Left/Up for previous, Right/Down for next) to the PDF viewer.
- **Infrastructure**: Added `VITE_PDF_WORKER_SRC` and `VITE_API_TIMEOUT` environment variables for configurable worker paths and request durations.
- **Infrastructure**: Introduced `apply-fixes.ps1` for native Windows maintenance and modernized `apply-fixes.sh`.
- **Environment**: Added `.editorconfig`, `.gitattributes`, `.nvmrc`, and `.npmrc` for cross-platform standardization and Node.js version locking.
- **Aesthetics**: Updated `architecture_diagram.png` with a high-fidelity v1.4.0 design reflecting the System-Tool-Protocol pattern.
- **Organization**: Major structural reorganization into modular domains (`src/api`, `src/core`, `src/components`, `src/styles`).
- **Aliasing**: Implemented a comprehensive path aliasing system (`@api`, `@core`, `@components`, `@styles`, `@tests`) in `tsconfig.json` and `vite.config.ts`.

### Changed
- **Documentation**: Consolidated all technical guides into a single master `docs/DOCUMENTATION.md` file for better maintainability and navigation.
- **Documentation**: Overhauled the `docs/agent_architecture/` guide with detailed persona, tool, and protocol definitions aligned with v1.4.0 logic.
- **README**: Reorganized the root `README.md` with a professional layout, industry-standard sections, and updated documentation anchors.
- **Contributing**: Refined the `CONTRIBUTING.md` guide with new mandatory coding standards (Structured Logging, Runtime Validation).
- **Service Layer**: Refactored to strictly follow agent architecture patterns and use path aliases.
- **Error Handling**: Enhanced logic to align with agent protocol specifications.
- **Configuration**: Modernized `tailwind.config.js`, `vite.config.ts`, `vitest.config.ts`, and `tsconfig.json` with path aliases and optimized build settings.

### Fixed
- **Cleanup**: Standardized all internal documentation links and fixed stale version/model references (e.g., corrected Gemini 1.5 Flash naming).
- **Memory**: Resolved memory leaks by ensuring `URL.revokeObjectURL` is called in both success and catch blocks of the search flow.
- **Stability**: Prevented race conditions by disabling file uploads while a search is in the `ANALYZING` state.
- **UI**: Replaced unstable array-index keys with unique IDs in the `FileUpload` error rendering.
- **Robustness**: Added defensive null-guards for `numPages` and search result fields to prevent runtime crashes.
- **Security**: Added strict format validation for Gemini API keys on initialization.
- **TypeScript**: Fixed hoisting issue in `App.tsx` where `changePage` was used before its declaration (`TS2448`).
- **QA**: Suppressed `no-console` warnings in `logger.ts` for the central logging sink, achieving 0 lint warnings across all business logic.
- **Testing**: Refactored `Services.test.ts` to test actual service implementations instead of redefined mocks, significantly increasing code coverage.
- **Testing**: Created `ValidationService.test.ts` to achieve 100% line coverage for the runtime validation layer.
- **Functional**: Added "Empty Results" integration test case to verify robust UI handling for null search responses.
- **Environment**: Resolved local dependency issues and environment path conflicts to enable a standardized production build.
- **Dependencies**: Removed unused and broken `tailwindcss-dark-mode` plugin from Tailwind configuration.
- **UI**: Corrected `Changelog` link in `README.md` to use proper filesystem casing for cross-platform compatibility.
- **Organization**: Standardized test suite location by moving `App.test.tsx` to `src/tests/`.
- **Logic**: Refactored `GeminiService` to use environment-driven model selection and request timeouts.


## [1.3.1] - 2026-04-19

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

## [1.3.0] - 2026-04-18

### Fixed
- **TypeScript**: Resolved all remaining type errors in `App.tsx`, `vitest.setup.ts`, `vitest.config.ts`, and test files.
- **Security**: Addressed vulnerabilities via `npm audit fix`, reducing identified issues from 23 to 17.
- **Consistency**: Standardized configuration filenames (e.g., renamed `prettierrc.json` to `.prettierrc.json`).
- **Cleanup**: Removed duplicate root-level assets to maintain project structure integrity.

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
