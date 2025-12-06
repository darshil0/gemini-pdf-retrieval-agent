// src/__tests__/FileUpload.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../components/FileUpload';

describe('FileUpload Component', () => {
  const mockOnFilesSelected = vi.fn();
  const mockOnRemoveFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces 10-file limit', async () => {
    const { rerender } = render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        uploadedFiles={[]}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    // Create 11 files
    const files = Array.from({ length: 11 }, (_, i) =>
      new File(['content'], `test${i}.pdf`, { type: 'application/pdf' })
    );

    const input = screen.getByLabelText('Upload PDF files');
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));

    fireEvent.change(input, { target: { files: dataTransfer.files } });

    await waitFor(() => {
      expect(screen.getByText(/cannot upload more than 10 files/i)).toBeInTheDocument();
    });
  });

  it('displays remaining slots', () => {
    const uploadedFiles = Array.from({ length: 7 }, (_, i) =>
      new File(['content'], `test${i}.pdf`, { type: 'application/pdf' })
    );

    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        uploadedFiles={uploadedFiles}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    expect(screen.getByText('3 slot(s) remaining')).toBeInTheDocument();
  });

  it('validates file types', async () => {
    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        uploadedFiles={[]}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload PDF files');
    
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Only PDF files are allowed')).toBeInTheDocument();
    });
  });

  it('validates file size', async () => {
    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        uploadedFiles={[]}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    // Create file > 200MB
    const largeFile = new File([new ArrayBuffer(201 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf'
    });
    
    const input = screen.getByLabelText('Upload PDF files');
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file size exceeds 200MB limit/i)).toBeInTheDocument();
    });
  });

  it('prevents duplicate files', async () => {
    const existingFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    
    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        uploadedFiles={[existingFile]}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    const duplicateFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Upload PDF files');
    
    fireEvent.change(input, { target: { files: [duplicateFile] } });

    await waitFor(() => {
      expect(screen.getByText('File already uploaded')).toBeInTheDocument();
    });
  });

  it('allows removing files', () => {
    const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];
    
    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        uploadedFiles={files}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    const removeButton = screen.getByLabelText('Remove test.pdf');
    fireEvent.click(removeButton);

    expect(mockOnRemoveFile).toHaveBeenCalledWith(0);
  });
});

// src/__tests__/keywordSearch.test.ts
import { describe, it, expect } from 'vitest';
import { KeywordSearchService } from '../services/keywordSearch';

describe('KeywordSearchService', () => {
  const mockDocuments = [
    {
      documentName: 'test.pdf',
      pages: [
        {
          pageNumber: 1,
          text: 'This is a test document with keyword matches.',
          lines: ['This is a test document with keyword matches.']
        },
        {
          pageNumber: 2,
          text: 'Another page with more test content.',
          lines: ['Another page with more test content.']
        }
      ]
    }
  ];

  it('finds exact keyword matches', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments);
    
    expect(matches.length).toBe(2);
    expect(matches[0].matchedText).toBe('test');
    expect(matches[0].pageNumber).toBe(1);
    expect(matches[1].pageNumber).toBe(2);
  });

  it('is case insensitive by default', () => {
    const matches = KeywordSearchService.searchKeyword('TEST', mockDocuments);
    expect(matches.length).toBe(2);
  });

  it('supports case sensitive search', () => {
    const matches = KeywordSearchService.searchKeyword('TEST', mockDocuments, {
      caseSensitive: true
    });
    expect(matches.length).toBe(0);
  });

  it('supports whole word matching', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments, {
      wholeWord: true
    });
    expect(matches.every(m => /\btest\b/.test(m.fullLine))).toBe(true);
  });

  it('includes context before and after', () => {
    const matches = KeywordSearchService.searchKeyword('keyword', mockDocuments);
    
    expect(matches[0].contextBefore).toContain('with');
    expect(matches[0].contextAfter).toContain('matches');
  });

  it('tracks column positions', () => {
    const matches = KeywordSearchService.searchKeyword('keyword', mockDocuments);
    
    expect(matches[0].columnStart).toBeGreaterThan(0);
    expect(matches[0].columnEnd).toBeGreaterThan(matches[0].columnStart);
  });

  it('handles empty keyword', () => {
    expect(() => {
      KeywordSearchService.searchKeyword('', mockDocuments);
    }).toThrow('Keyword cannot be empty');
  });

  it('returns sorted results', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments);
    
    for (let i = 1; i < matches.length; i++) {
      const prev = matches[i - 1];
      const curr = matches[i];
      
      expect(
        prev.documentName <= curr.documentName &&
        (prev.documentName !== curr.documentName || prev.pageNumber <= curr.pageNumber)
      ).toBe(true);
    }
  });

  it('generates correct statistics', () => {
    const matches = KeywordSearchService.searchKeyword('test', mockDocuments);
    const stats = KeywordSearchService.getMatchStatistics(matches);
    
    expect(stats.totalMatches).toBe(2);
    expect(stats.documentsWithMatches).toBe(1);
    expect(stats.pagesWithMatches).toBe(2);
  });
});

// src/__tests__/security.test.ts
import { describe, it, expect } from 'vitest';
import { SecurityService } from '../services/securityService';

describe('SecurityService', () => {
  it('validates PDF file type', async () => {
    const pdfFile = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
      'test.pdf',
      { type: 'application/pdf' }
    );
    
    const isValid = await SecurityService.validateFileType(pdfFile);
    expect(isValid).toBe(true);
  });

  it('rejects non-PDF files', async () => {
    const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    const isValid = await SecurityService.validateFileType(textFile);
    expect(isValid).toBe(false);
  });

  it('validates file size', () => {
    const validFile = new File([new ArrayBuffer(100 * 1024 * 1024)], 'test.pdf');
    const oversizedFile = new File([new ArrayBuffer(201 * 1024 * 1024)], 'large.pdf');
    
    expect(SecurityService.validateFileSize(validFile)).toBe(true);
    expect(SecurityService.validateFileSize(oversizedFile)).toBe(false);
  });

  it('sanitizes user input', () => {
    const dangerous = '<script>alert("xss")</script>';
    const sanitized = SecurityService.sanitizeInput(dangerous);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('validates search queries', () => {
    const valid = SecurityService.validateSearchQuery('normal search');
    expect(valid.valid).toBe(true);
    
    const tooShort = SecurityService.validateSearchQuery('a');
    expect(tooShort.valid).toBe(false);
    
    const suspicious = SecurityService.validateSearchQuery('SELECT * FROM users');
    expect(suspicious.valid).toBe(false);
  });

  it('enforces rate limiting', () => {
    const identifier = 'test-user';
    
    // First 10 requests should pass
    for (let i = 0; i < 10; i++) {
      expect(SecurityService.checkRateLimit(identifier, 10, 60000)).toBe(true);
    }
    
    // 11th request should fail
    expect(SecurityService.checkRateLimit(identifier, 10, 60000)).toBe(false);
  });
});

// src/__tests__/integration.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Integration Tests', () => {
  it('complete workflow: upload, search, highlight', async () => {
    render(<App />);
    
    // 1. Upload file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    // 2. Enter search query
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // 3. Execute search
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    // 4. Verify results displayed
    await waitFor(() => {
      expect(screen.getByText(/match/i)).toBeInTheDocument();
    });
  });

  it('prevents exceeding 10-file limit', async () => {
    render(<App />);
    
    const files = Array.from({ length: 11 }, (_, i) =>
      new File(['content'], `test${i}.pdf`, { type: 'application/pdf' })
    );
    
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files } });
    
    await waitFor(() => {
      expect(screen.getByText(/cannot upload more than 10 files/i)).toBeInTheDocument();
    });
  });
});
