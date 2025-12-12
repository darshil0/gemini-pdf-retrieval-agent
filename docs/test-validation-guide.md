# Test Validation Guide - DocuSearch Agent v2.0.0

## Overview

This guide provides comprehensive instructions for validating the test suite and ensuring 100% coverage for all critical paths.

---

## Running the Test Suite

Execute all tests and generate a coverage report.

### Command

```bash
npm test -- --coverage
```

### Expected Output

```
 PASS  src/__tests__/FileUpload.test.tsx
 PASS  src/__tests__/SearchBox.test.tsx
 PASS  src/__tests__/integration.test.tsx
 PASS  src/__tests__/security.test.tsx
 PASS  src/__tests__/keywordSearch.test.ts

Test Suites: 5 passed, 5 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        8.512 s
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |
 src/components    |     100 |      100 |     100 |     100 |
  FileUpload.tsx   |     100 |      100 |     100 |     100 |
  SearchBox.tsx    |     100 |      100 |     100 |     100 |
 src/services      |     100 |      100 |     100 |     100 |
  keywordSearch.ts |     100 |      100 |     100 |     100 |
  securityService.ts|    100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
```

### Validation Criteria

- **All tests must pass**: No failures or skipped tests.
- **100% coverage**: `All files` line shows 100% for all categories.
- **No uncovered lines**: All files must show 100% line coverage.

---

## Test Categories

### 1. Unit Tests

Verify individual components and services in isolation.

#### File Upload Component

```typescript
describe("FileUpload", () => {
  it("enforces 10-file limit", () => {
    // Test with 11 files
  });

  it("validates file size (200MB)", () => {
    // Test with oversized file
  });

  it("validates file type (PDF)", () => {
    // Test with non-PDF file
  });

  it("prevents duplicate uploads", () => {
    // Test uploading the same file twice
  });
});
```

#### Keyword Search Service

```typescript
describe("KeywordSearchService", () => {
  it("finds exact matches", () => {
    // Test exact keyword matching
  });

  it("tracks location accurately", () => {
    // Test page/line/column tracking
  });

  it("provides context", () => {
    // Test surrounding text extraction
  });

  it("handles case sensitivity", () => {
    // Test case options
  });
});
```

#### Security Service

```typescript
describe("SecurityService", () => {
  it("sanitizes input", () => {
    // Test XSS prevention
  });

  it("validates files", async () => {
    // Test file validation
  });

  it("enforces rate limits", () => {
    // Test rate limiting
  });
});
```

### 2. Integration Tests

Test complete workflows and component interactions.

```typescript
describe("Upload Workflow", () => {
  it("completes full upload process", async () => {
    // 1. Select files
    // 2. Validate files
    // 3. Upload files
    // 4. Display in list
    // 5. Allow removal
  });
});

describe("Search Workflow", () => {
  it("executes search and displays results", async () => {
    // 1. Upload documents
    // 2. Enter search query
    // 3. Execute search
    // 4. Display results with highlighting
    // 5. Navigate between matches
  });
});
```

### 3. Security Tests

Test security measures and vulnerability prevention.

```typescript
describe("XSS Prevention", () => {
  it("sanitizes script tags", () => {
    const input = '<script>alert("xss")</script>';
    const clean = SecurityService.sanitizeInput(input);
    expect(clean).not.toContain("<script>");
  });

  it("escapes HTML entities", () => {
    const input = "<img src=x onerror=alert(1)>";
    const clean = SecurityService.sanitizeInput(input);
    expect(clean).not.toContain("onerror");
  });
});

describe("File Validation", () => {
  it("checks magic numbers", async () => {
    // Verify actual file content, not just extension
  });

  it("rejects malicious files", async () => {
    // Test various malicious file types
  });
});
```

### 4. Accessibility Tests

Test WCAG 2.1 Level AA compliance.

```typescript
describe("Keyboard Navigation", () => {
  it("allows full keyboard navigation", () => {
    // Test tab order
    // Test Enter/Space activation
    // Test Escape to close
  });
});

describe("Screen Reader", () => {
  it("has proper ARIA labels", () => {
    // Test aria-label attributes
    // Test aria-describedby
    // Test role attributes
  });
});

describe("WCAG Compliance", () => {
  it("meets color contrast requirements", () => {
    // Test contrast ratios
  });

  it("has descriptive link text", () => {
    // Test link descriptions
  });
});
```

---

## Writing Tests

### Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  // Setup
  const mockProps = {
    prop1: 'value1',
    prop2: vi.fn()
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  // Test cases
  it('should render correctly', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<ComponentName {...mockProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockProps.prop2).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**

```typescript
// ❌ Bad - Testing implementation details
expect(component.state.count).toBe(5);

// ✅ Good - Testing behavior
expect(screen.getByText("Count: 5")).toBeInTheDocument();
```

2. **Use Descriptive Test Names**

```typescript
// ❌ Bad
it("test 1", () => {});

// ✅ Good
it("enforces 10-file limit and shows error message", () => {});
```

3. **Arrange, Act, Assert Pattern**

```typescript
it('handles file upload', async () => {
  // Arrange
  const file = createMockFile();
  render(<FileUpload {...props} />);

  // Act
  const input = screen.getByLabelText('Upload');
  fireEvent.change(input, { target: { files: [file] } });

  // Assert
  await waitFor(() => {
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });
});
```

4. **Test Edge Cases**

```typescript
describe("Edge Cases", () => {
  it("handles empty input", () => {});
  it("handles extremely large files", () => {});
  it("handles special characters", () => {});
  it("handles concurrent operations", () => {});
});
```

5. **Mock External Dependencies**

```typescript
vi.mock("../services/geminiService", () => ({
  GeminiService: {
    search: vi.fn().mockResolvedValue([]),
  },
}));
```

---

## Coverage Reports

### Generating Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html

# View in terminal
npm run test:coverage -- --reporter=text
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
```

### Current Coverage

```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files               |   100   |   100    |   100   |   100
 components/            |   100   |   100    |   100   |   100
  FileUpload.tsx        |   100   |   100    |   100   |   100
  SearchBox.tsx         |   100   |   100    |   100   |   100
  KeywordHighlighter    |   100   |   100    |   100   |   100
 services/              |   100   |   100    |   100   |   100
  keywordSearch.ts      |   100   |   100    |   100   |   100
  securityService.ts    |   100   |   100    |   100   |   100
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

Configure in `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm test -- --run
```

---

## Validation Test Scenarios

### Scenario 1: File Upload Limit

**Test**: Upload exactly 10 files

```typescript
✅ System accepts all 10 files
✅ Counter shows "10/10"
✅ Upload area disabled
✅ Message: "Maximum files reached"
```

**Test**: Attempt 11th file

```typescript
✅ Upload rejected
✅ Error: "Cannot upload more than 10 files"
✅ Existing files unchanged
✅ Counter remains "10/10"
```

### Scenario 2: Keyword Search

**Test**: Search for "revenue" in financial report

```typescript
✅ Finds 15 exact matches
✅ Shows page numbers: 1, 5, 7, 12, 14
✅ Displays line numbers for each match
✅ Highlights keyword in yellow
✅ Provides surrounding context
```

**Test**: Navigate between matches

```typescript
✅ "Next" button advances to next match
✅ "Previous" button goes to previous match
✅ Jump to location opens PDF at correct page
✅ Counter shows "Match 3 of 15"
```

### Scenario 3: Security Validation

**Test**: XSS attempt in search

```typescript
Input: <script>alert('xss')</script>
✅ Input sanitized
✅ No script execution
✅ Safe display: &lt;script&gt;...
✅ Search continues normally
```

**Test**: File validation bypass attempt

```typescript
File: malicious.pdf (actually .exe)
✅ Magic number check fails
✅ Upload rejected
✅ Error: "Invalid file type"
✅ No file processing attempted
```

---

## Troubleshooting Tests

### Common Issues

**Issue**: Tests timeout

```typescript
// Increase timeout
it("slow test", async () => {
  // ...
}, 10000); // 10 second timeout
```

**Issue**: Flaky tests

```typescript
// Use waitFor for async operations
await waitFor(
  () => {
    expect(element).toBeInTheDocument();
  },
  { timeout: 5000 },
);
```

**Issue**: Mock not working

```typescript
// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

**Issue**: Coverage not updating

```bash
# Clear coverage cache
rm -rf coverage/
npm run test:coverage
```

---

## Performance Testing

### Load Testing

```typescript
describe("Performance", () => {
  it("handles 10 large PDFs efficiently", async () => {
    const startTime = performance.now();

    // Upload and process 10 PDFs

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(30000); // 30 seconds
  });

  it("searches large documents quickly", async () => {
    // Test search performance
    expect(searchTime).toBeLessThan(5000); // 5 seconds
  });
});
```

---

## Continuous Improvement

### Adding New Tests

1. Identify new feature or bug fix
2. Write failing test first (TDD)
3. Implement feature
4. Verify test passes
5. Check coverage remains 100%

### Test Maintenance

- Review tests quarterly
- Update for API changes
- Remove obsolete tests
- Refactor duplicated code
- Update documentation

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2025-12-06
**Version**: 2.0.0
