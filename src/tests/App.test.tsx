import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { vi, expect, it, describe, beforeEach } from 'vitest';
import * as geminiService from '@api/gemini';
import { SearchResponse } from '@core/types/index';

const makePdfFile = (name: string, contentStr: string = 'content') =>
  new File(
    [
      new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      new TextEncoder().encode(contentStr),
    ],
    name,
    {
      type: 'application/pdf',
    },
  );

vi.mock('@core/services/securityService', () => ({
  SecurityService: {
    validateFileType: vi.fn().mockResolvedValue(true),
    validateFileSize: vi.fn().mockReturnValue(true),
    sanitizeInput: vi.fn((input: string) => input),
    validateSearchQuery: vi.fn().mockReturnValue({ valid: true }),
    checkRateLimit: vi.fn().mockReturnValue(true),
  },
}));

// Mock the gemini service
vi.mock('@api/gemini', () => ({
  searchInDocuments: vi.fn(),
  GEMINI_MODEL_NAME: 'gemini-1.5-flash',
  isApiKeyConfigured: vi.fn().mockReturnValue(true),
  getGeminiApiKey: vi.fn().mockReturnValue('AIzaTestKey_12345'),
}));

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: ({
    children,
    onLoadSuccess,
  }: {
    children: React.ReactNode;
    onLoadSuccess?: (pdf: { numPages: number }) => void;
  }) => {
    if (onLoadSuccess) {
      setTimeout(() => onLoadSuccess({ numPages: 5 }), 10);
    }
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber }: { pageNumber: number }) => (
    <div data-testid={`pdf-page-${pageNumber}`}>Page {pageNumber}</div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(geminiService.isApiKeyConfigured).mockReturnValue(true);
  });

  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText('DocuSearch Agent')).toBeInTheDocument();
  });

  it('displays warning banner when API key is missing', () => {
    vi.mocked(geminiService.isApiKeyConfigured).mockReturnValue(false);
    render(<App />);
    expect(screen.getByText('Gemini API Key Required')).toBeInTheDocument();
  });

  it('toggles theme between light and dark', () => {
    render(<App />);
    const toggleButton = screen.getByLabelText('Toggle dark mode');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('handles file selection', async () => {
    render(<App />);
    const file = makePdfFile('test.pdf');
    const input = screen.getByLabelText(/upload pdf files/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('clears search results when a file is removed', async () => {
    const mockResults: SearchResponse = {
      summary: 'Summary text',
      results: [
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: 'Test content snippet',
          matchedTerm: 'test',
          relevanceExplanation: 'Match',
          relevanceScore: 0.9,
        },
      ],
    };
    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    const file = makePdfFile('test.pdf');
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      { target: { value: 'test' } },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Summary text')).toBeInTheDocument();
    });

    // Remove file
    fireEvent.click(screen.getByLabelText('Remove test.pdf'));

    await waitFor(() => {
      expect(screen.queryByText('Summary text')).not.toBeInTheDocument();
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('executes search and displays results', async () => {
    const mockResults: SearchResponse = {
      summary: 'AI Analysis Summary',
      results: [
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: 'Test snippet content',
          matchedTerm: 'test',
          relevanceExplanation: 'High relevance',
          relevanceScore: 0.9,
        },
      ],
    };

    vi.mocked(geminiService.searchInDocuments).mockImplementation(
      async (_files: File[], _keyword: string) => {
        return await Promise.resolve(mockResults);
      },
    );

    render(<App />);

    // Upload a file first
    const file = makePdfFile('test.pdf');
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText(
      /e.g., 'Financial Q3 results'/i,
    );
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Click search button
    const searchButton = screen.getByText('Find Occurrences');
    expect(searchButton).not.toBeDisabled();
    fireEvent.click(searchButton);

    // Wait for the status to change and results to appear
    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByText('AI Analysis Summary')).toBeInTheDocument();
    expect(screen.getByText(/snippet/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('sorts multi-document results by docIndex first then pageNumber', async () => {
    const mockResults: SearchResponse = {
      summary: 'Multi-doc summary',
      results: [
        {
          docIndex: 1,
          pageNumber: 1,
          contextSnippet: 'Doc 1 Page 1',
          matchedTerm: 'test',
          relevanceExplanation: 'High',
          relevanceScore: 0.8,
        },
        {
          docIndex: 0,
          pageNumber: 5,
          contextSnippet: 'Doc 0 Page 5',
          matchedTerm: 'test',
          relevanceExplanation: 'Medium',
          relevanceScore: 0.9,
        },
      ],
    };

    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    const file1 = makePdfFile('doc0.pdf');
    const file2 = makePdfFile('doc1.pdf');

    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file1, file2] },
    });

    await waitFor(() => {
      expect(screen.getByText('doc0.pdf')).toBeInTheDocument();
      expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      { target: { value: 'test' } },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/sort results by/i), {
      target: { value: 'page' },
    });

    // In page sort mode, docIndex 0 should precede docIndex 1 even though page 5 > page 1
    const cards = screen.getAllByText(/doc\d\.pdf/i);
    expect(cards[0]?.textContent).toContain('doc0.pdf');
    expect(cards[1]?.textContent).toContain('doc1.pdf');
  });

  it('handles PDF viewer modal controls (zoom, rotate, page change, download, close)', async () => {
    const mockResults: SearchResponse = {
      summary: 'Summary text',
      results: [
        {
          docIndex: 0,
          pageNumber: 2,
          contextSnippet: 'Snippet to view',
          matchedTerm: 'test',
          relevanceExplanation: 'Match',
          relevanceScore: 0.9,
        },
      ],
    };
    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    const file = makePdfFile('sample.pdf');
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('sample.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      { target: { value: 'test' } },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('View Page 2')).toBeInTheDocument();
    });

    // Open viewer
    fireEvent.click(screen.getByText('View Page 2'));

    await waitFor(() => {
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    });

    // Zoom controls
    fireEvent.click(screen.getByLabelText('Zoom in'));
    expect(screen.getByText('120%')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Zoom out'));
    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Reset zoom'));
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Rotate controls
    fireEvent.click(screen.getByLabelText('Rotate clockwise'));
    fireEvent.click(screen.getByLabelText('Rotate counter-clockwise'));

    // Download link exists
    expect(screen.getByLabelText('Download sample.pdf')).toBeInTheDocument();

    // Close via Close button
    const closeButtons = screen.getAllByLabelText('Close viewer');
    const lastCloseButton = closeButtons[closeButtons.length - 1];
    expect(lastCloseButton).toBeDefined();
    if (lastCloseButton) {
      fireEvent.click(lastCloseButton);
    }

    await waitFor(() => {
      expect(screen.queryByLabelText('Close viewer')).not.toBeInTheDocument();
    });

    // Re-open and close via Escape key
    fireEvent.click(screen.getByText('View Page 2'));
    await waitFor(() => {
      expect(screen.getAllByLabelText('Close viewer').length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByLabelText('Close viewer')).not.toBeInTheDocument();
    });
  });

  it('exports search results to CSV', async () => {
    const mockResults: SearchResponse = {
      summary: 'Export Summary',
      results: [
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: 'Exportable content',
          matchedTerm: 'export',
          relevanceExplanation: 'Match',
          relevanceScore: 0.95,
        },
      ],
    };
    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    const file = makePdfFile('export.pdf');
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('export.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      { target: { value: 'export' } },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Export Results')).toBeInTheDocument();
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    fireEvent.click(screen.getByText('Export Results'));
    expect(appendSpy).toHaveBeenCalled();
  });

  it('clears recent searches history', async () => {
    const mockResults: SearchResponse = {
      summary: 'History test',
      results: [],
    };
    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    const file = makePdfFile('history.pdf');
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('history.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      { target: { value: 'term1' } },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('Clear History')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear History'));

    await waitFor(() => {
      expect(screen.queryByText('Recent Searches')).not.toBeInTheDocument();
    });
  });
});
