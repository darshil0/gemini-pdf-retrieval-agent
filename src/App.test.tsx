import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "./App";
import * as geminiService from "./services/geminiService";

// Imports removed
vi.mock("./services/geminiService");

// Mock react-pdf to avoid canvas/loading issues in jsdom
vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: { workerSrc: "" } },
  Document: ({
    children,
    onLoadSuccess,
  }: {
    children: React.ReactNode;
    onLoadSuccess?: (pdf: { numPages: number }) => void;
  }) => {
    // Simulate successful load immediately
    React.useEffect(() => {
      onLoadSuccess?.({ numPages: 5 });
    }, [onLoadSuccess]);
    return (
      <div data-testid="pdf-document" role="document">
        {children}
      </div>
    );
  },
  Page: () => <div data-testid="pdf-page">Page Content</div>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

test("handleReset revokes object URLs", async () => {
  const revokeObjectURL = vi.fn();
  // Ensure we mock correctly on window.URL
  Object.defineProperty(window, "URL", {
    writable: true,
    value: {
      ...window.URL,
      revokeObjectURL: revokeObjectURL,
      createObjectURL: vi.fn(() => "mock-url"),
    },
  });

  const mockSearchResponse = {
    summary: "Found 1 result.",
    results: [
      {
        docIndex: 0,
        pageNumber: 1,
        contextSnippet: "Hello world",
        matchedTerm: "Hello",
        relevanceExplanation: "Exact match",
      },
    ],
  };

  vi.spyOn(geminiService, "searchInDocuments").mockResolvedValue(
    mockSearchResponse,
  );

  render(<App />);

  // Simulate file upload
  const file = new File(["hello"], "hello.pdf", { type: "application/pdf" });
  const fileInput = screen.getByLabelText("Upload PDF files");
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Verify file is uploaded (files state updated)
  await waitFor(() => {
    expect(screen.getByText("hello.pdf")).toBeInTheDocument();
  });

  // Simulate typing a keyword
  const keywordInput = screen.getByLabelText("Target Keyword or Phrase");
  fireEvent.change(keywordInput, { target: { value: "test" } });

  // Simulate clicking the search button
  const searchButton = screen.getByText("Find Occurrences");
  fireEvent.click(searchButton);

  // Wait for the search to complete
  await waitFor(() => {
    expect(screen.getByText("Clear Results")).toBeInTheDocument();
  });

  // Simulate clicking the reset button
  const resetButton = screen.getByText("Clear Results");
  fireEvent.click(resetButton);

  // Expect revokeObjectURL to have been called
  // It might be called multiple times if cleanup runs, but at least once for the manual reset
  expect(revokeObjectURL).toHaveBeenCalled();
});

test("modal closes with Escape key", async () => {
  const mockSearchResponse = {
    summary: "Found 1 result.",
    results: [
      {
        docIndex: 0,
        pageNumber: 1,
        contextSnippet: "Hello world",
        matchedTerm: "Hello",
        relevanceExplanation: "Exact match",
      },
    ],
  };

  vi.spyOn(geminiService, "searchInDocuments").mockResolvedValue(
    mockSearchResponse,
  );

  render(<App />);

  // Upload file
  const file = new File(["hello"], "hello.pdf", { type: "application/pdf" });
  const fileInput = screen.getByLabelText("Upload PDF files");
  fireEvent.change(fileInput, { target: { files: [file] } });
  await waitFor(() => {
    expect(screen.getByText("hello.pdf")).toBeInTheDocument();
  });

  // Search
  const keywordInput = screen.getByLabelText("Target Keyword or Phrase");
  fireEvent.change(keywordInput, { target: { value: "test" } });
  const searchButton = screen.getByText("Find Occurrences");
  fireEvent.click(searchButton);

  // Open modal
  const viewPageButton = await screen.findByRole("button", {
    name: /view page/i,
  });
  fireEvent.click(viewPageButton);

  // Check modal
  const modal = await screen.findByRole("dialog");
  expect(modal).toBeInTheDocument();

  // Press Escape on window or document
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

  // Wait for close
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

test("recent searches have correct semantic structure", async () => {
  render(<App />);

  // Upload
  const file = new File(["hello"], "hello.pdf", { type: "application/pdf" });
  const fileInput = screen.getByLabelText("Upload PDF files");
  fireEvent.change(fileInput, { target: { files: [file] } });
  await waitFor(() => {
    expect(screen.getByText("hello.pdf")).toBeInTheDocument();
  });

  // Search
  const keywordInput = screen.getByLabelText("Target Keyword or Phrase");
  fireEvent.change(keywordInput, { target: { value: "test search" } });
  const searchButton = screen.getByText("Find Occurrences");
  fireEvent.click(searchButton);

  // Find recent search button
  const recentSearchButton = await screen.findByText("test search");
  expect(recentSearchButton).toBeInTheDocument();

  // Check structure: span -> button -> li -> ul
  // findByText might return the span or text node
  // traverse up to li
  const listItem = recentSearchButton.closest("li");
  expect(listItem).toBeInTheDocument();
  const list = listItem?.parentElement;
  expect(list?.tagName).toBe("UL");
});
