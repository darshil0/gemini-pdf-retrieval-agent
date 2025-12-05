import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import * as geminiService from './services/geminiService';

vi.mock('./services/geminiService');

test('handleReset revokes object URLs', async () => {
  const revokeObjectURL = vi.fn();
  global.URL.revokeObjectURL = revokeObjectURL;

  const mockSearchResponse = {
    summary: 'Found 1 result.',
    results: [
      {
        docIndex: 0,
        pageNumber: 1,
        contextSnippet: 'Hello world',
        matchedTerm: 'Hello',
        relevanceExplanation: 'Exact match',
      },
    ],
  };

  vi.spyOn(geminiService, 'searchInDocuments').mockResolvedValue(mockSearchResponse);

  render(<App />);

  // Simulate file upload
  const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' });
  const fileInput = screen.getByTestId('file-upload');
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Simulate typing a keyword
  const keywordInput = screen.getByLabelText('Target Keyword or Phrase');
  fireEvent.change(keywordInput, { target: { value: 'test' } });

  // Simulate clicking the search button
  const searchButton = screen.getByText('Find Occurrences');
  fireEvent.click(searchButton);

  // Wait for the search to complete
  await waitFor(() => {
    expect(screen.getByText('Clear Results')).toBeInTheDocument();
  });

  // Simulate clicking the reset button
  const resetButton = screen.getByText('Clear Results');
  fireEvent.click(resetButton);

  // Expect revokeObjectURL to have been called
  expect(revokeObjectURL).toHaveBeenCalled();
});
