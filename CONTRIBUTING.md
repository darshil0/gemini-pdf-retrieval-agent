# Contributing to DocuSearch Agent

First off, thank you for considering contributing to DocuSearch Agent! It's people like you that make this tool better for everyone.

## 🌟 Ways to Contribute

There are many ways to contribute to this project:

- **Report bugs** - Help us identify and fix issues
- **Suggest enhancements** - Share ideas for new features
- **Write documentation** - Improve guides, tutorials, and examples
- **Submit code** - Fix bugs or implement features
- **Review pull requests** - Help maintain code quality
- **Answer questions** - Help other users in discussions
- **Share the project** - Tell others about DocuSearch

---

## 📋 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Harassment, trolling, or insulting comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

---

## 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

### How to Report a Bug

**Use the bug report template and include:**

1. **Clear title** - Concise description of the issue
2. **Steps to reproduce** - Exact steps to trigger the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Screenshots/videos** - Visual evidence if applicable
6. **Environment details**:
   - OS (Windows 10, macOS 14, Ubuntu 22.04)
   - Browser (Chrome 120, Firefox 121)
   - Node version (v18.0.0)
   - Application version (v1.2.2)
7. **Console logs** - Browser console errors
8. **Additional context** - Any other relevant information

### Example Bug Report

```markdown
**Title**: PDF viewer crashes on files >150MB

**Steps to Reproduce**:
1. Upload PDF file larger than 150MB
2. Wait for processing to complete
3. Click on search result to open viewer
4. Application crashes

**Expected**: Viewer opens and displays PDF
**Actual**: Browser tab crashes with "Out of memory" error

**Environment**:
- OS: Windows 11
- Browser: Chrome 120.0.6099.109
- RAM: 8GB
- File size: 175MB

**Console Output**:
```
Uncaught RangeError: Maximum call stack size exceeded
    at PDFViewer.render (PDFViewer.tsx:45)
```

**Additional Context**:
Files under 100MB work fine. Issue only occurs with very large files.
```

---

## 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Before creating a suggestion, please check if it already exists.

### How to Suggest an Enhancement

**Use the feature request template and include:**

1. **Clear title** - Concise feature description
2. **Problem statement** - What problem does this solve?
3. **Proposed solution** - How should it work?
4. **Alternatives considered** - Other approaches you've thought about
5. **Use cases** - When would this be useful?
6. **Mockups** - Visual designs if applicable

### Example Feature Request

```markdown
**Title**: Add search history dropdown

**Problem**:
Users often need to re-run previous searches but must retype them each time, which is tedious and error-prone.

**Proposed Solution**:
Add a dropdown to the search box showing the last 10 searches. Users can click to re-run or use arrow keys to navigate history (like browser address bar).

**Alternatives Considered**:
1. Browser-based localStorage (privacy concerns)
2. Saved searches (more complex UI)

**Use Cases**:
- Researcher comparing multiple queries
- User fixing typo in previous search
- Iterating on search refinements

**Mockup**:
[Attach screenshot or wireframe]
```

---

## 🔧 Development Setup

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git**
- **Google Gemini API Key**
- **Code editor** (VS Code recommended)

### Setup Steps

```bash
# 1. Fork the repository
# Click "Fork" on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# 3. Add upstream remote
git remote add upstream https://github.com/original-owner/gemini-pdf-retrieval-agent.git

# 4. Install dependencies
npm install

# 5. Create environment file
cp .env.example .env

# 6. Add your API key to .env
# Edit .env and add: VITE_GEMINI_API_KEY=your_key_here

# 7. Start development server
npm run dev

# 8. Open http://localhost:5173
```

### Verify Installation

```bash
# Check TypeScript compilation
npm run type-check

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

All commands should complete without errors.

---

## 🌿 Branching Strategy

### Branch Naming Convention

- **Feature**: `feature/short-description` (e.g., `feature/search-history`)
- **Bug fix**: `fix/issue-number-description` (e.g., `fix/123-pdf-crash`)
- **Documentation**: `docs/what-changed` (e.g., `docs/update-readme`)
- **Refactor**: `refactor/what-changed` (e.g., `refactor/search-service`)
- **Test**: `test/what-tested` (e.g., `test/pdf-viewer`)

### Creating a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your changes...

# Push to your fork
git push origin feature/your-feature-name
```

---

## 💻 Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types, no 'any'
function searchDocuments(query: string, docs: Document[]): SearchResult[] {
  // Implementation
}

// ❌ Bad: Using 'any'
function searchDocuments(query: any, docs: any): any {
  // Implementation
}

// ✅ Good: JSDoc for public APIs
/**
 * Searches documents using natural language query
 * @param query - The search query string
 * @param docs - Array of documents to search
 * @returns Array of search results ranked by relevance
 * @throws {InvalidQueryError} If query is too short
 */
export function searchDocuments(query: string, docs: Document[]): SearchResult[] {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Functional component with TypeScript
interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchBox({ onSearch, placeholder = 'Search...', disabled = false }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  
  const handleSubmit = useCallback(() => {
    if (query.trim().length >= 3) {
      onSearch(query);
    }
  }, [query, onSearch]);
  
  return (
    <div className="search-box">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Search documents"
      />
      <button onClick={handleSubmit} disabled={disabled || query.length < 3}>
        Search
      </button>
    </div>
  );
}
```

### Styling

```typescript
// ✅ Good: Tailwind utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
  Search
</button>

// ❌ Bad: Inline styles (avoid unless necessary)
<button style={{ padding: '8px 16px', background: '#2563eb' }}>
  Search
</button>
```

### File Organization

```
src/
├── components/          # React components
│   ├── SearchBox/
│   │   ├── SearchBox.tsx
│   │   ├── SearchBox.test.tsx
│   │   └── index.ts
│   └── ...
├── services/           # Business logic
│   ├── GeminiService.ts
│   ├── GeminiService.test.ts
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useSearch.ts
│   └── ...
├── utils/              # Utility functions
│   ├── validation.ts
│   └── ...
├── types/              # TypeScript types
│   └── index.ts
└── config/             # Configuration
    └── constants.ts
```

---

## ✅ Testing Requirements

All code contributions must include tests.

### Test Coverage

- **Minimum**: 80% coverage for new code
- **Target**: 90%+ coverage
- **Critical paths**: 100% coverage required

### Writing Tests

```typescript
// Component test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('calls onSearch when button clicked', async () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    
    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button', { name: /search/i });
    
    await userEvent.type(input, 'test query');
    await userEvent.click(button);
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });
  
  it('disables search for short queries', async () => {
    render(<SearchBox onSearch={vi.fn()} />);
    
    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button');
    
    await userEvent.type(input, 'ab'); // Only 2 characters
    
    expect(button).toBeDisabled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- SearchBox.test.tsx

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

---

## 🎨 Accessibility Guidelines

All UI contributions must meet WCAG 2.1 Level AA standards.

### Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators clearly visible
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Color contrast ≥ 3:1 for large text
- [ ] ARIA labels for screen readers
- [ ] Semantic HTML (button, nav, main, etc.)
- [ ] Error messages announced to screen readers
- [ ] No flashing content >3 times per second
- [ ] Forms have associated labels

### Testing Accessibility

```bash
# Run automated accessibility tests
npm run test:a11y

# Manual testing:
# 1. Navigate with Tab key only
# 2. Test with screen reader (NVDA, JAWS, VoiceOver)
# 3. Test with browser zoom at 200%
# 4. Test with keyboard only (no mouse)
```

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config)

### Examples

```bash
# Feature
git commit -m "feat(search): add search history dropdown"

# Bug fix
git commit -m "fix(pdf-viewer): resolve crash on large files

Implement streaming rendering to handle files >150MB
without running out of memory.

Fixes #123"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple types
git commit -m "feat(search): add fuzzy matching

- Implement Fuse.js integration
- Add configuration options
- Update tests

BREAKING CHANGE: Search API now returns ranked results"
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks**
   ```bash
   npm run type-check
   npm run lint
   npm test
   npm run build
   ```

3. **Update documentation**
   - Update README if adding features
   - Add JSDoc comments for new APIs
   - Update CHANGELOG.md

4. **Self-review**
   - Review your own code first
   - Check for console.logs or debug code
   - Ensure all tests pass

### Creating Pull Request

1. **Push to your fork**
   ```bash
   git push origin your-branch-name
   ```

2. **Open PR on GitHub**
   - Use the PR template
   - Link related issues
   - Add screenshots/videos if UI changes

3. **PR Title Format**
   ```
   feat: Add search history dropdown (#123)
   fix: Resolve PDF viewer crash on large files (#456)
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Added tests for new features

## Screenshots (if applicable)
[Add screenshots or videos]

## Additional Notes
Any other context about the PR
```

### Review Process

1. **Automated checks run** (CI/CD)
2. **Maintainer reviews code**
3. **You address feedback**
4. **Approved and merged**

**Average review time**: 2-5 business days

---

## 🎯 Good First Issues

New to the project? Start with these:

### Beginner Friendly
- Add dark mode toggle
- Improve error messages
- Add keyboard shortcuts overlay
- Write additional tests
- Fix typos in documentation

### Intermediate
- Implement search history
- Add document tagging
- Improve PDF viewer controls
- Add export functionality

### Advanced
- Optimize memory usage
- Implement streaming processing
- Add real-time collaboration
- Create desktop application

**Find issues labeled**: `good first issue`, `help wanted`, `beginner friendly`

---

## 💬 Getting Help

Stuck? Need guidance?

### Resources

- **Documentation**: Read existing docs thoroughly
- **Issues**: Search closed issues for similar problems
- **Discussions**: Ask questions in GitHub Discussions
- **Code**: Review existing code for patterns

### Asking Questions

**Good question format**:
```markdown
**What I'm trying to do**:
[Clear description]

**What I've tried**:
1. [Approach 1]
2. [Approach 2]

**Error/Problem**:
[Specific issue with code/logs]

**Environment**:
- OS: macOS 14
- Node: v18.0.0
- Branch: feature/search-history
```

---

## 🏆 Recognition

Contributors are recognized in:

- `CONTRIBUTORS.md` file
- Release notes
- Project README
- Annual contributor spotlight

**Top contributors may receive**:
- Collaborator access
- Priority support
- Early access to features
- Project swag (if available)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You

Every contribution, no matter how small, makes a difference. Thank you for helping make DocuSearch Agent better!

**Questions?** Open a discussion or reach out to the maintainers.

---

**Last Updated**: December 5, 2025  
**Maintainers**: Darshil  
**Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)
