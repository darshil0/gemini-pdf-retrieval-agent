# Contributing to DocuSearch Agent

Thank you for considering contributing to DocuSearch Agent! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone. We expect all participants to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Personal or political attacks
- Publishing others' private information without permission
- Any conduct that would be inappropriate in a professional setting

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Ways to Contribute

- **Report bugs** - Help identify issues
- **Suggest features** - Share ideas for improvements
- **Write documentation** - Improve guides and examples
- **Submit code** - Fix bugs or implement features
- **Review pull requests** - Help maintain quality
- **Answer questions** - Help other users
- **Share the project** - Spread the word

### Before You Start

1. Check existing [issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues) and [pull requests](https://github.com/darshil0/gemini-pdf-retrieval-agent/pulls)
2. Read the [README](README.md) to understand the project
3. Review the [architecture documentation](docs/ARCHITECTURE.md)
4. Join our [discussions](https://github.com/darshil0/gemini-pdf-retrieval-agent/discussions)

## Development Setup

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git
- Google Gemini API Key
- Code editor (VS Code recommended)

### Initial Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# 3. Add upstream remote
git remote add upstream https://github.com/darshil0/gemini-pdf-retrieval-agent.git

# 4. Install dependencies
npm install

# 5. Create environment file
cp .env.example .env

# 6. Add your API key to .env
# Edit .env and add: VITE_GEMINI_API_KEY=your_key_here

# 7. Verify installation
npm run type-check
npm run lint
npm test
npm run build

# 8. Start development server
npm run dev
```

### Recommended VS Code Extensions

- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitLens

## How to Contribute

### Reporting Bugs

Before creating a bug report:

1. Check if the issue already exists
2. Verify it's actually a bug (not expected behavior)
3. Collect relevant information (OS, browser, versions)

**Bug Report Template:**

```markdown
**Title**: Clear, descriptive title

**Description**:
Detailed description of the issue

**Steps to Reproduce**:

1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Environment**:

- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node version: [e.g., v18.0.0]
- App version: [e.g., v1.2.2]

**Screenshots/Logs**:
Add any relevant screenshots or console logs

**Additional Context**:
Any other relevant information
```

### Suggesting Features

Before suggesting a feature:

1. Check if it already exists or is planned
2. Consider if it fits the project scope
3. Think about implementation complexity

**Feature Request Template:**

```markdown
**Title**: Clear feature description

**Problem Statement**:
What problem does this solve?

**Proposed Solution**:
How should it work?

**Alternatives Considered**:
Other approaches you've thought about

**Use Cases**:
When would this be useful?

**Implementation Notes** (optional):
Technical considerations or suggestions

**Mockups** (optional):
Visual designs if applicable
```

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types, descriptive names
interface SearchOptions {
  maxResults: number;
  includeContext: boolean;
}

function searchDocuments(
  query: string,
  options: SearchOptions,
): Promise<SearchResult[]> {
  // Implementation
}

// ❌ Bad: Using 'any', unclear names
function search(q: any, opts: any): any {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}

// ❌ Bad: Missing types, poor structure
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Styling with Tailwind

```typescript
// ✅ Good: Utility classes, clear structure
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
  Search
</button>

// ❌ Bad: Inline styles
<button style={{ padding: '8px 16px', background: '#2563eb' }}>
  Search
</button>
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── FileUpload.tsx   # Feature components
│   └── SearchBox.tsx
├── services/
│   ├── geminiService.ts
│   └── validation.ts
├── hooks/               # Custom React hooks
│   └── useDebounce.ts
├── utils/               # Utility functions
│   └── formatters.ts
├── types/               # Type definitions
│   └── index.ts
└── App.tsx
```

### Naming Conventions

- **Components**: PascalCase (`SearchBox.tsx`)
- **Functions**: camelCase (`searchDocuments`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces**: PascalCase with 'I' prefix or descriptive name (`SearchResult`)
- **Types**: PascalCase (`DocumentType`)
- **Files**: Match component/function name

### Code Quality

```typescript
// ✅ Good: Clear, documented, error handling
/**
 * Searches documents using natural language query
 * @param query - The search query string
 * @param documents - Array of documents to search
 * @returns Promise resolving to search results
 * @throws {ValidationError} If query is invalid
 */
export async function searchDocuments(
  query: string,
  documents: Document[],
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 3) {
    throw new ValidationError("Query must be at least 3 characters");
  }

  try {
    const results = await performSearch(query, documents);
    return results.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error("Search failed:", error);
    throw new Error("Failed to search documents");
  }
}

// ❌ Bad: No docs, poor error handling
export async function search(q, docs) {
  const results = await performSearch(q, docs);
  return results;
}
```

## Testing Requirements

### Minimum Coverage

- **Overall**: 80% coverage required
- **New features**: 90% coverage required
- **Critical paths**: 100% coverage required

### Writing Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('should render search input', () => {
    render(<SearchBox onSearch={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('should call onSearch when Enter is pressed', async () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'test query{Enter}');

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should disable search for short queries', async () => {
    render(<SearchBox onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button', { name: /search/i });

    await userEvent.type(input, 'ab');
    expect(button).toBeDisabled();
  });

  it('should show error for invalid input', async () => {
    render(<SearchBox onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    await userEvent.type(input, '<script>alert("xss")</script>');

    await waitFor(() => {
      expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific file
npm test -- SearchBox.test.tsx
```

### Test Types

1. **Unit Tests** - Individual functions/components
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full user workflows
4. **Accessibility Tests** - WCAG compliance
5. **Performance Tests** - Load and speed

## Submitting Changes

### Branch Strategy

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-123-description
```

### Branch Naming

- **Features**: `feature/short-description`
- **Bug fixes**: `fix/issue-number-description`
- **Documentation**: `docs/what-changed`
- **Refactoring**: `refactor/what-changed`
- **Tests**: `test/what-tested`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style (formatting, no logic change)
refactor: # Code refactoring
perf:     # Performance improvements
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples
feat(search): add fuzzy matching support
fix(pdf-viewer): resolve memory leak on large files
docs(readme): update installation instructions
style(components): format with prettier
refactor(services): extract validation logic
test(search): add integration tests for multi-doc search
```

### Pre-Submit Checklist

Before creating a pull request:

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### Creating Pull Request

```bash
# Push to your fork
git push origin your-branch-name

# Go to GitHub and create PR
# Use the PR template
# Link related issues
# Add screenshots for UI changes
```

**PR Template:**

```markdown
## Description

Brief description of changes

## Related Issues

Fixes #123
Relates to #456

## Type of Change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots or videos

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Added tests for new features

## Additional Notes

Any other context about the PR
```

### Review Process

1. **Automated checks run** (CI/CD)
2. **Code review** by maintainers
3. **Address feedback** if needed
4. **Approval** from maintainer
5. **Merge** into main branch

Average review time: 2-5 business days

## Community

### Getting Help

- **Documentation**: [docs.docusearch.dev](https://docs.docusearch.dev)
- **Discussions**: [GitHub Discussions](https://github.com/darshil0/gemini-pdf-retrieval-agent/discussions)
- **Issues**: [GitHub Issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues)
- **Email**: contact@docusearch.dev

### Communication Channels

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and reviews

### Recognition

Contributors are recognized:

- In `CONTRIBUTORS.md`
- In release notes
- In project README
- With GitHub badges

Top contributors may receive:

- Collaborator access
- Priority support
- Early access to features

## Additional Resources

- [Project README](README.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Changelog](CHANGELOG.md)
- [License](LICENSE)

## Questions?

If you have questions not covered here:

1. Check the [FAQ](docs/FAQ.md)
2. Search [closed issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues?q=is%3Aissue+is%3Aclosed)
3. Ask in [Discussions](https://github.com/darshil0/gemini-pdf-retrieval-agent/discussions)
4. Open a [new issue](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues/new)

---

**Thank you for contributing to DocuSearch Agent!** 🎉

Every contribution, no matter how small, makes a difference.
