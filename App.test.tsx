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

test('modal closes with Escape key', async () => {
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

  // Wait for the search to complete and find the "View Page" button
  const viewPageButton = await screen.findByRole('button', { name: /view page/i });
  fireEvent.click(viewPageButton);

  // Assert that the modal is visible
  const modal = await screen.findByRole('dialog');
  expect(modal).toBeInTheDocument();

  // Simulate pressing the Escape key
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

  // Assert that the modal is no longer visible
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('recent searches have correct semantic structure', async () => {
  render(<App />);

  // Simulate file upload
  const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' });
  const fileInput = screen.getByTestId('file-upload');
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Simulate typing a keyword
  const keywordInput = screen.getByLabelText('Target Keyword or Phrase');
  fireEvent.change(keywordInput, { target: { value: 'test search' } });

  // Simulate clicking the search button
  const searchButton = screen.getByText('Find Occurrences');
  fireEvent.click(searchButton);

  // Wait for the recent search to appear
  const recentSearchButton = await screen.findByText('test search');
  expect(recentSearchButton).toBeInTheDocument();

  // Check that the button is inside an `li` which is inside a `ul`
  const listItem = recentSearchButton.closest('li');
  expect(listItem).toBeInTheDocument();
  const list = listItem?.parentElement;
  expect(list?.tagName).toBe('UL');
});
