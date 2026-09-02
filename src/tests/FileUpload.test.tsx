import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '@components/FileUpload';

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

describe('FileUpload Component', () => {
  const mockOnFilesSelected = vi.fn();
  const mockOnRemoveFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces 10-file limit', async () => {
    render(
      <FileUpload
        uploadedFiles={[]}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    // Create 11 files
    const files = Array.from({ length: 11 }, (_, i) =>
      makePdfFile(`test${i}.pdf`, `content-${i}`),
    );

    const input = screen.getByLabelText('Upload PDF files');
    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(
        screen.getByText(/Cannot upload more than 10 files/i),
      ).toBeInTheDocument();
    });
  });

  it('displays remaining slots', () => {
    const uploadedFiles = Array.from({ length: 7 }, (_, i) =>
      makePdfFile(`test${i}.pdf`, `content-${i}`),
    );

    render(
      <FileUpload
        uploadedFiles={uploadedFiles}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    expect(screen.getByText('3 slot(s) remaining')).toBeInTheDocument();
  });

  it('validates file types', async () => {
    render(
      <FileUpload
        uploadedFiles={[]}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    const invalidFile = new File(['content'], 'test.txt', {
      type: 'text/plain',
    });
    const input = screen.getByLabelText('Upload PDF files');

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(/Only PDF files are allowed/i),
      ).toBeInTheDocument();
    });
  });

  it('detects and rejects duplicate file uploads', async () => {
    const existingFile = makePdfFile('duplicate.pdf');

    render(
      <FileUpload
        uploadedFiles={[existingFile]}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    const duplicateFile = makePdfFile('duplicate.pdf');
    const input = screen.getByLabelText('Upload PDF files');

    fireEvent.change(input, { target: { files: [duplicateFile] } });

    await waitFor(() => {
      expect(screen.getByText('File already uploaded')).toBeInTheDocument();
    });

    // Dismiss error alert
    const dismissButton = screen.getByLabelText('Dismiss error');
    fireEvent.click(dismissButton);
    expect(screen.queryByText('File already uploaded')).not.toBeInTheDocument();
  });

  it('supports drag and drop events', async () => {
    render(
      <FileUpload
        uploadedFiles={[]}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    const file = makePdfFile('dragged.pdf');
    const dropZone = screen.getByText('Drop PDF files here or click to browse');

    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
    });
  });

  it('allows removing files', () => {
    const files = [makePdfFile('test.pdf')];

    render(
      <FileUpload
        uploadedFiles={files}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    const removeButton = screen.getByLabelText('Remove test.pdf');
    fireEvent.click(removeButton);

    expect(mockOnRemoveFile).toHaveBeenCalledWith(0);
  });
});
