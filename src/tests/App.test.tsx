import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { vi, expect, it, describe, beforeEach } from 'vitest';
import * as geminiService from '@api/gemini';
import { SearchResponse } from '@core/types/index';

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
}));

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-document">{children}</div>
  ),
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
  });

  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText('DocuSearch Agent')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(<App />);
    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    const input = screen.getByLabelText(/upload pdf files/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
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
    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
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
    // Check for unique parts of the snippet
    expect(screen.getByText(/snippet/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('allows filtering and sorting results', async () => {
    const mockResults: SearchResponse = {
      summary: 'AI Analysis Summary',
      results: [
        {
          docIndex: 0,
          pageNumber: 2,
          contextSnippet: 'Higher relevance snippet',
          matchedTerm: 'higher',
          relevanceExplanation: 'Strong lexical match',
          relevanceScore: 0.95,
        },
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: 'Lower relevance snippet',
          matchedTerm: 'lower',
          relevanceExplanation: 'Weaker match',
          relevanceScore: 0.72,
        },
      ],
    };

    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      {
        target: { value: 'test' },
      },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/minimum relevance/i), {
      target: { value: '0.9' },
    });
    fireEvent.change(screen.getByLabelText(/sort results by/i), {
      target: { value: 'page' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Weaker match')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Strong lexical match')).toBeInTheDocument();
  });

  it('handles search errors', async () => {
    vi.mocked(geminiService.searchInDocuments).mockRejectedValue(
      new Error('Search failed'),
    );

    render(<App />);

    // Upload file
    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Search
    const searchInput = screen.getByPlaceholderText(
      /e.g., 'Financial Q3 results'/i,
    );
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
  });

  it('clears results on reset', async () => {
    const mockResults: SearchResponse = {
      summary: 'Test summary',
      results: [
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: 'Test snippet',
          matchedTerm: 'test',
          relevanceExplanation: 'High relevance',
          relevanceScore: 0.8,
        },
      ],
    };

    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    // Upload and search
    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      {
        target: { value: 'test' },
      },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Clear Results')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear Results'));

    await waitFor(() => {
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('handles recent searches', async () => {
    render(<App />);

    // Mock search
    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(screen.getByLabelText(/upload pdf files/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/e.g., 'Financial Q3 results'/i),
      {
        target: { value: 'recent search' },
      },
    );
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('recent search')).toBeInTheDocument();
    });
  });
});
