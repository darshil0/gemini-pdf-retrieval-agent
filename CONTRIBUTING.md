# Contributing to DocuSearch Agent

Contributions are welcome. This project is intentionally small and modular, so the easiest way to help is to keep changes focused, test them, and update the relevant documentation.

## Before you start

Please read:

- [README.md](README.md)
- [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)
- [docs/agent_architecture/SYSTEM_PROMPT.md](docs/agent_architecture/SYSTEM_PROMPT.md)

## Development setup

1. Install the required tools:
   - Node.js 20+
   - npm 10+
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a local environment file:
   ```bash
   cp .env.example .env
   ```
4. Add a Gemini API key to the new environment file.
5. Start development mode:
   ```bash
   npm run dev
   ```

## Coding expectations

- Prefer small, focused changes.
- Keep React components functional and readable.
- Use the shared services in [src/core](src/core) whenever possible.
- Avoid direct `console.log` usage; prefer the logger utilities.
- Preserve strict TypeScript behavior and existing path-alias conventions.
- If the change affects the search contract, update the prompt definitions and the architecture docs together.

## Testing

Run the relevant checks before opening a pull request:

```bash
npm test
npm run lint
npm run type-check
npm run build
```

For broader coverage checks, use:

```bash
npm run test:coverage
```

## Documentation expectations

If you change behavior, configuration, or public interfaces, update the relevant docs in:

- [README.md](README.md)
- [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)
- [docs/agent_architecture](docs/agent_architecture)
- [CHANGELOG.md](CHANGELOG.md)

## Release checklist

Before publishing a release, confirm:

- the version is updated in [package.json](package.json) and [README.md](README.md),
- the changelog entry reflects the release summary, and
- the main verification commands still pass.

## Pull request checklist

- The change is covered by or compatible with the existing test suite.
- No new lint or type errors were introduced.
- The docs match the current implementation.
- The summary clearly explains why the change is needed.

## Commit style

A simple Conventional Commits style is preferred:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
