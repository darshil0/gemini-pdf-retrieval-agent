# Contributing to DocuSearch Agent

Thank you for considering contributing! We follow strict engineering standards to ensure DocuSearch remains a high-performance, enterprise-grade AI agent.

## 📚 Documentation Reference

Before contributing, please familiarize yourself with our consolidated documentation:
- [**Master Documentation**](docs/DOCUMENTATION.md): System architecture, API reference, security, and deployment.
- [**Agent Architecture Guide**](README.md#🧱-architecture): Detailed logic for persona, tools, and protocols.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v24.14.0 (Recommended, see `.nvmrc`) or v18.0.0+
- **npm**: v9.0.0+
- **API Key**: Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Development Setup

```bash
# 1. Fork and Clone
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# 2. Install Dependencies
npm install

# 3. Environment Configuration
cp .env.example .env
# Required: VITE_GEMINI_API_KEY=...
# Optional: VITE_DEBUG=true (for structured logs)

# 4. Verify Local Environment
npm run type-check
npm test
npm run dev
```

---

## 🛠 Coding Standards

### 1. Structured Logging
We use a centralized `LoggerService` for observability. DO NOT use `console.log` directly.

```typescript
import { createLogger } from "@core/services/logger";
const logger = createLogger('FeatureName');

logger.info('Action started', { metadata: 'data' });
logger.error('Action failed', error);
```

### 2. Runtime Validation
All API responses and external data MUST be validated using `ValidationService` to prevent runtime crashes.

### 3. TypeScript Strictness
- 100% `tsc --noEmit` compliance.
- No `any` types. Use proper interfaces defined in `@core/types` or local feature types.

### 4. Component Architecture
- Use functional components with standard React 19 patterns.
- Prefer Tailwind utility classes for styling.
- All interactive elements MUST have unique IDs for testing.

---

## 🧪 Testing Requirements

We maintain a **100% coverage policy** for critical service logic.

- **Unit Tests**: For services and utility functions.
- **Component Tests**: For UI interaction and accessibility.
- **Integration Tests**: For the full System-Tool-Protocol flow.

```bash
npm test                # Run tests
npm run test:coverage   # Check coverage report
```

---

## 📤 Submitting Changes

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(scope): ...`
- `fix(scope): ...`
- `docs(scope): ...`
- `refactor(scope): ...`

### Pull Request Process
1.  Ensure all tests and linting pass.
2.  Update relevant sections in `docs/DOCUMENTATION.md` if your change affects the API or architecture.
3.  Add entries to `CHANGELOG.md` under the `1.4.2` section.
4.  Submit PR and wait for maintainer review (2-5 days).

---

**Built with ❤️ by Darshil**

