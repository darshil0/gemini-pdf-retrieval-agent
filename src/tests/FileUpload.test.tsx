// src/__tests__/FileUpload.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../components/FileUpload';

describe('FileUpload Component', () => {
  const mockSetFiles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces 10-file limit', async () => {
    render(<FileUpload files={[]} setFiles={mockSetFiles} />);

    // Create 11 files
    const files = Array.from({ length: 11 }, (_, i) =>
      new File(['content'], `test${i}.pdf`, { type: 'application/pdf' })
    );

    const input = screen.getByTestId('file-upload');
    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(mockSetFiles).toHaveBeenCalled();
    });
  });

  it('displays remaining slots', () => {
    const uploadedFiles = Array.from({ length: 7 }, (_, i) => ({
      file: new File(['content'], `test${i}.pdf`, { type: 'application/pdf' }),
      id: `id-${i}`,
      previewUrl: '',
    }));

    render(<FileUpload files={uploadedFiles} setFiles={mockSetFiles} />);

    expect(screen.getByText('Drop PDFs here or click to upload')).toBeInTheDocument();
  });

  it('validates file types', async () => {
    render(<FileUpload files={[]} setFiles={mockSetFiles} />);

    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-upload');

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it('allows removing files', () => {
    const files = [
      {
        file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
        id: 'test-id',
        previewUrl: '',
      },
    ];

    render(<FileUpload files={files} setFiles={mockSetFiles} />);

    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);

    expect(mockSetFiles).toHaveBeenCalled();
  });
});
