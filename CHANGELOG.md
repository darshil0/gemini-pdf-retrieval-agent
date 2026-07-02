# Changelog

All notable changes to DocuSearch Agent are documented in this file. The project follows semantic versioning and maintains backward compatibility except where explicitly noted.

---
## [1.4.4] - 2026-07-02

### Added
- Enhanced PDF viewer with zoom controls (In/Out/Reset).
- Added ability to clear recent search history.

### Changed
- Integrated SecurityService for deep PDF magic bytes validation in `FileUpload`.
- Integrated SecurityService for search rate limiting, query validation, and input sanitization in `App`.
- Bumped project version to 1.4.4 and updated documentation.

---

## [1.4.3] - 2026-07-01

### Changed

- Bumped the project release metadata to 1.4.3 and synchronized the version references across the package manifest, UI banner, tests, and documentation.
- Refreshed the release notes so the documented version matches the current toolchain and workflow updates.

---

## [1.4.2] - 2026-07-01

### Changed

- Comprehensive documentation overhaul and synchronization.
- Updated `README.md`, `DOCUMENTATION.md`, and `CONTRIBUTING.md` to reflect current architectural patterns (v1.4.2).
- Standardized environment variable naming convention to `VITE_API_TIMEOUT_MS` across all documentation and type definitions.
- Synchronized version displays in the UI (`src/App.tsx`) and Agent Architecture specifications (`docs/agent_architecture/`).
- Refined API Reference in `DOCUMENTATION.md` to match the functional implementation in `src/api/gemini.ts`.
- Modernized project configuration and dependencies (Vite 8.1.2, Vitest 4.1.9).

### Fixed

- Resolved linting and type-checking issues across the codebase.
- Repaired the test suite by mocking missing browser APIs (`URL`, `IntersectionObserver`) and fixing the `File` mock implementation.
- Standardized and sanitized API outputs through improved `ValidationService` and `SecurityService`.
- Verified the full test and build pipeline with 49 passing tests and a successful production build.

**Impact:** This release improves development reliability and keeps the documentation aligned with the implemented search experience. All 49 test cases pass successfully.

---

## [1.4.1] - 2026-05-16

### Fixed

Addressed multiple production-critical issues affecting UI rendering and error handling. The stylesheet now includes complete theme variable definitions that were inadvertently removed during refactoring. Error handling in the file upload component received comprehensive improvements with structured logging, user-facing validation messages, and proper accessibility attributes for screen readers.

Development dependencies were correctly classified in the package manifest. Import paths across the test suite were corrected to use the project's alias system. The PDF rendering worker now includes graceful CDN fallback handling with enhanced error logging.

Configuration updates include TypeScript-aware linting rules and standardized environment variable usage for API timeouts. Error message constants were refined for consistency across the application.

### Added

File upload operations now log structured error metrics and provide accessible error messaging with ARIA live regions. Upload failures are recoverable with clear user feedback rather than silent failures.

**Production status:** All blocking issues resolved with full backward compatibility to version 1.4.0. No breaking changes introduced.

---

## [1.4.0] - 2026-05-14

### Added

This release introduces significant architectural improvements focused on observability, validation, and accessibility. A new structured logging service provides contextual metadata across four severity levels for improved debugging and monitoring. Runtime validation ensures API responses and user inputs meet type safety requirements before processing.

The PDF viewer received keyboard navigation support using standard arrow key controls. Worker initialization includes automatic CDN failover with health checks to prevent rendering failures. Security enhancements include persistent rate limiting backed by browser storage.

New environment variables provide configuration control for PDF worker sources and API timeout thresholds. The project structure was reorganized into logical module boundaries with comprehensive path alias support for cleaner imports.

Cross-platform development support was standardized through editor configuration, Git attributes, Node version management, and package manager settings. Architecture documentation was updated to reflect the enhanced service layer design.

### Changed

Documentation was consolidated into a single comprehensive guide with expanded agent architecture specifications. The service layer underwent complete refactoring to align with documented architectural patterns. Configuration files were modernized across the build toolchain including Vite, Vitest, TypeScript, and Tailwind.

Error handling now follows consistent patterns throughout the application with centralized message definitions. The README received structural improvements for better navigation while contributing guidelines were enhanced with mandatory logging and validation standards.

### Fixed

Corrected model naming inconsistencies in documentation and API integration. Memory leaks were prevented by ensuring cleanup operations execute in both success and error paths. Upload race conditions were eliminated through proper state management during concurrent search operations.

Null safety guards were added for PDF page counts and search result field access. API key validation now enforces strict format requirements. Array rendering in error displays uses stable keys rather than indices. Service layer tests validate actual implementations instead of mock behavior.

**Migration notes:** Path aliases require configuration in both TypeScript and build tool settings. Existing logging calls should migrate to the structured LoggerService for consistent observability. API key validation is stricter and may reject previously accepted formats.

---

## [1.3.1] - 2026-04-18

### Added

Large file handling was improved through streaming upload support and lazy-loaded PDF page rendering. Search capabilities were enhanced with relevance scoring improvements and query history tracking. The PDF viewer now supports text layer rendering for selection and copying. Results can be exported to CSV format. Interface theming includes a dark mode toggle.

### Fixed

TypeScript compilation errors were resolved across the application and test infrastructure. Security vulnerabilities were reduced from 23 to 17 through dependency updates. Configuration file naming was standardized and duplicate assets were removed. PDF lazy-loading rendering failures were corrected with improved polyfills and test mocks for continuous integration stability.

---

## [1.2.3] - 2025-12-12

### Fixed

Restored correct Gemini model configuration after deployment issues. API key environment variable handling was corrected. TypeScript module resolution was fixed by relocating architecture definitions into the compiled source tree. Dark mode rendering inconsistencies in file upload were resolved. The build pipeline was migrated from CDN-based styling to local PostCSS processing. The Google Generative AI package was updated to the current supported version.

**Quality metrics:** Zero TypeScript compilation errors and zero linting warnings achieved.

---

## [1.2.2] - 2025-12-05

### Added

Formal agent architecture specifications were introduced covering system definitions, tool protocols, and interaction patterns. Architecture compliance testing ensures implementation fidelity to documented specifications. Tool definitions were formalized for document upload, search, and context extraction operations.

### Changed

The service layer was refactored to implement documented architectural patterns consistently. Error handling was standardized according to protocol specifications. Prompt engineering was extracted into dedicated modules with parameter validation.

---

## [1.2.1] - 2025-12-05

### Added

Code quality infrastructure was established with ESLint integration supporting TypeScript and React accessibility rules. TypeScript strict mode was enabled project-wide. Accessibility features were implemented including keyboard navigation, ARIA labeling, and modal focus management. WCAG 2.1 Level AA compliance was verified through automated testing.

### Fixed

Accessibility defects were corrected including missing ARIA labels, tab order issues, and contrast ratio violations. Type safety was improved by removing unsafe assertions and implicit any types. Code quality issues including unused variables and unhandled promises were resolved.

---

## [1.2.0] - 2025-12-04

### Added

Search capabilities were expanded with fuzzy matching through Fuse.js integration and semantic similarity matching powered by AI. Result highlighting uses context-aware HTML mark tags. PDF viewer controls were enhanced with rotation and zoom presets ranging from fifty to two hundred percent.

### Changed

PDF rendering implementation migrated from raw pdf.js to the react-pdf component library. Initial bundle size was reduced by fifteen percent through code splitting. Render performance improved through React memoization patterns.

---

## [1.1.0] - 2025-12-04

### Added

Multi-document workflows now support simultaneous upload of up to ten documents. Document management interface displays processing status and metadata. Search results are grouped and ranked across all uploaded documents.

### Fixed

Concurrent upload race conditions were eliminated through proper state synchronization. Document attribution in search result snippets now displays correct source references.

---

## [1.0.0] - 2025-12-04

### Added

Initial release provides PDF document upload with drag-and-drop validation. Google Gemini integration enables text extraction and semantic indexing. Natural language search returns results with page-level citations. Responsive interface built with React, Vite, and Tailwind CSS.

---

**Project maintained by Darshil Shah**
