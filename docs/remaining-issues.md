# Security, Architecture, & Remaining Issues

This document tracks security considerations, architectural trade-offs, and follow-up items for DocuSearch Agent.

## Current status

DocuSearch Agent is designed as a client-side React + Vite web application for local development and demonstration workflows. Core client functionality, builds, linting, and automated tests are passing.

## Recently addressed security & architecture fixes

- **Active Model Default**: Updated default Gemini model identifier to `gemini-2.5-flash` across configurations, source code, and test suites.
- **CSV Formula Injection Mitigation**: Hardened `escapeCSVField` in `src/core/services/validation.ts` to neutralize formula injection characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with a leading `'` before double-quoting.
- **Production Sourcemaps Disabled**: Updated `vite.config.ts` to set `sourcemap: mode === 'development'`, preventing production bundles from shipping source maps containing full source code.
- **Gated Test API Key Bypass**: Environment-gated the `AIzaTestKey` format bypass in `src/api/gemini.ts` with `!import.meta.env.PROD` so test bypasses cannot be used in production builds.
- **Search Query Sanitization & Validation**: Removed redundant SQL-injection regex checks (eliminating false positives on natural language terms) and updated `sanitizeInput` to avoid entity-mangling search operators (`Sales < 5000`).
- **Relevance Score Floor Alignment**: Updated `SEARCH_PROTOCOL` in `src/core/architecture/prompts.ts` to allow relevance scores down to `0.50`, matching the UI slider range (`0.50` to `1.00`).
- **Prompt Injection Defense**: Wrapped target search terms in explicit prompt instruction boundaries (`<<<TARGET SEARCH KEYWORD START>>> ... <<<TARGET SEARCH KEYWORD END>>>`) with clear non-execution instructions.

## Security model & architectural trade-offs

When deploying DocuSearch Agent in production, consider the following client-side SPA architectural trade-offs:

1. **Client-side API Key Exposure**:
   - *Current Design*: As a pure client-side SPA, `VITE_GEMINI_API_KEY` is accessed directly by `@google/generative-ai` from the browser.
   - *Recommendation for Public Production Deployment*: Deploy a thin server-side API proxy or edge function (e.g. Cloudflare Worker, Vercel Edge, or Express/Fastify server) that holds the API key server-side, validates client requests, and forwards `generateContent` calls to Google.

2. **Client-side Rate Limiting**:
   - *Current Design*: `SecurityService.checkRateLimit` persists query timestamps in `localStorage`. This protects users from accidental rapid clicks locally, but can be reset by clearing browser storage or using private windows.
   - *Recommendation for Production*: Enforce IP or session rate limits on a server-side proxy.

3. **Inline Memory & Payload Size Constraints**:
   - *Current Design*: Uploaded PDF files are read into browser memory, converted to base64 inline data, and sent in a single `generateContent` payload.
   - *Consideration*: Google Gemini inline data payloads are best suited for smaller document collections (typically < 20MB total). For large document sets, integrating Google's Gemini Files API or chunked client processing is recommended.

## Future enhancements

- Add an optional serverless backend proxy implementation for multi-tenant production hosting.
- Expand export options beyond CSV (e.g. JSON, PDF report).
- Integrate Google Gemini Files API for large PDF collections.
- Explore multi-language UI support.

## Verification notes

Verified checks:

- `npm test` (53 tests, 8 suites)
- `npm run build`
- `npm run lint`
- `npm run type-check`
- `npm audit` (0 vulnerabilities)
