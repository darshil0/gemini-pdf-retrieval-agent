/**
 * Component Tests
 *
 * Comprehensive test suite for all real React components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '@components/FileUpload';
import { SearchResultCard } from '@components/SearchResultCard';
import { SearchResult } from '@core/types';

describe('Component Tests', () => {
  describe('FileUpload Component', () => {
    const mockOnFilesSelected = vi.fn();
    const mockOnRemoveFile = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render file upload input', () => {
      render(
        <FileUpload
          uploadedFiles={[]}
          onFilesSelected={mockOnFilesSelected}
          onRemoveFile={mockOnRemoveFile}
        />,
      );
      expect(screen.getByLabelText(/Upload PDF files/i)).toBeInTheDocument();
    });

    it('should accept PDF files only', () => {
      render(
        <FileUpload
          uploadedFiles={[]}
          onFilesSelected={mockOnFilesSelected}
          onRemoveFile={mockOnRemoveFile}
        />,
      );
      const input = screen.getByLabelText(/Upload PDF files/i) as HTMLInputElement;
      expect(input.accept).toBe('.pdf');
    });

    it('should display file count', () => {
      const files = [
        new File(['content'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'doc2.pdf', { type: 'application/pdf' }),
      ];
      render(
        <FileUpload
          uploadedFiles={files}
          onFilesSelected={mockOnFilesSelected}
          onRemoveFile={mockOnRemoveFile}
        />,
      );
      expect(screen.getByText(/Files: 2 \/ 10/i)).toBeInTheDocument();
    });

    it('should be disableable', () => {
      render(
        <FileUpload
          uploadedFiles={[]}
          onFilesSelected={mockOnFilesSelected}
          onRemoveFile={mockOnRemoveFile}
          isProcessing={true}
        />,
      );
      const input = screen.getByLabelText(/Upload PDF files/i) as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('should list uploaded files', () => {
      const files = [
        new File(['content'], 'document1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'document2.pdf', { type: 'application/pdf' }),
      ];
      render(
        <FileUpload
          uploadedFiles={files}
          onFilesSelected={mockOnFilesSelected}
          onRemoveFile={mockOnRemoveFile}
        />,
      );
      expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      expect(screen.getByText('document2.pdf')).toBeInTheDocument();
    });
  });

  describe('SearchResultCard Component', () => {
    const mockResult: SearchResult = {
      docIndex: 0,
      pageNumber: 1,
      contextSnippet: 'This is a test snippet',
      matchedTerm: 'test',
      relevanceExplanation: 'Matches keyword exactly',
      relevanceScore: 0.95,
    };
    const mockOnView = vi.fn();

    it('should render result details', () => {
      render(
        <SearchResultCard
          result={mockResult}
          fileName="test.pdf"
          keyword="test"
          onView={mockOnView}
        />,
      );
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getAllByText(/Page 1/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Matches keyword exactly/i)).toBeInTheDocument();
    });

    it('should call onView when button clicked', () => {
      render(
        <SearchResultCard
          result={mockResult}
          fileName="test.pdf"
          keyword="test"
          onView={mockOnView}
        />,
      );
      const viewButton = screen.getByText(/View Page 1/i);
      fireEvent.click(viewButton);
      expect(mockOnView).toHaveBeenCalled();
    });

    it('should highlight matched term', () => {
      const { container } = render(
        <SearchResultCard
          result={mockResult}
          fileName="test.pdf"
          keyword="test"
          onView={mockOnView}
        />,
      );
      const highlighted = container.querySelector('.bg-yellow-500\\/30');
      expect(highlighted).toHaveTextContent('test');
    });
  });
});
