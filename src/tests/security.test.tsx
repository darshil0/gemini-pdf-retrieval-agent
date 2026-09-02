import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { vi, expect, it, describe, beforeEach } from 'vitest';
import * as geminiService from '@api/gemini';
import { SecurityService } from '@core/services/securityService';

// Mock the gemini service
vi.mock('@api/gemini', () => ({
  searchInDocuments: vi.fn(),
  GEMINI_MODEL_NAME: 'gemini-1.5-flash',
  isApiKeyConfigured: vi.fn().mockReturnValue(true),
  getGeminiApiKey: vi.fn().mockReturnValue('AIzaTestKey_12345'),
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

describe('Security & Input Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('sanitizes user search query to prevent XSS script injection', async () => {
    const sanitizeSpy = vi.spyOn(SecurityService, 'sanitizeInput');
    vi.mocked(geminiService.searchInDocuments).mockResolvedValue({
      summary: 'Safe Summary',
      results: [],
    });

    render(<App />);

    // Upload file with valid PDF magic bytes
    const file = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
      'test.pdf',
      {
        type: 'application/pdf',
      },
    );
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const xssPayload = '<script>alert("xss")</script>';
    const searchInput = screen.getByPlaceholderText(
      /e.g., 'Financial Q3 results'/i,
    );
    fireEvent.change(searchInput, { target: { value: xssPayload } });
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(sanitizeSpy).toHaveBeenCalledWith(xssPayload);
      expect(geminiService.searchInDocuments).toHaveBeenCalledWith(
        expect.any(Array),
        '&lt;script&gt;alert("xss")&lt;/script&gt;',
      );
    });
  });

  it('rejects queries containing malicious SQL injection patterns', async () => {
    render(<App />);

    const file = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
      'test.pdf',
      {
        type: 'application/pdf',
      },
    );
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const sqliPayload = 'SELECT * FROM users';
    const searchInput = screen.getByPlaceholderText(
      /e.g., 'Financial Q3 results'/i,
    );
    fireEvent.change(searchInput, { target: { value: sqliPayload } });
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(
        screen.getByText('Potential SQL injection detected.'),
      ).toBeInTheDocument();
      expect(geminiService.searchInDocuments).not.toHaveBeenCalled();
    });
  });

  it('enforces search rate limits and displays rate limit error in UI', async () => {
    const rateLimitSpy = vi
      .spyOn(SecurityService, 'checkRateLimit')
      .mockReturnValue(false);

    render(<App />);

    const file = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
      'test.pdf',
      {
        type: 'application/pdf',
      },
    );
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /e.g., 'Financial Q3 results'/i,
    );
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.click(screen.getByText('Find Occurrences'));

    await waitFor(() => {
      expect(
        screen.getByText(/Rate limit exceeded. Please wait/i),
      ).toBeInTheDocument();
      expect(geminiService.searchInDocuments).not.toHaveBeenCalled();
    });

    rateLimitSpy.mockRestore();
  });

  it('handles invalid non-PDF file upload rejection', async () => {
    render(<App />);

    const invalidFile = new File(['invalid content'], 'image.jpg', {
      type: 'image/jpeg',
    });
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(/Only PDF files are allowed/i),
      ).toBeInTheDocument();
      expect(screen.queryByText('Uploaded Files')).not.toBeInTheDocument();
    });
  });
});
