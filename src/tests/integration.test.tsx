import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import { vi, expect, it, describe, beforeEach } from "vitest";
import * as geminiService from "../services/geminiService";
import { SearchResponse } from "../types";

// Mock the gemini service
vi.mock("../services/geminiService", () => ({
  searchInDocuments: vi.fn(),
}));

// Mock react-pdf
vi.mock("react-pdf", () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-document">{children}</div>
  ),
  Page: ({ pageNumber }: { pageNumber: number }) => (
    <div data-testid={`pdf-page-${pageNumber}`}>Page {pageNumber}</div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: "",
    },
  },
}));

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete a full search flow", async () => {
    const mockResults: SearchResponse = {
      summary: "AI Summary",
      results: [
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: "Found in document",
          matchedTerm: "search",
          relevanceExplanation: "Direct match",
          relevanceScore: 1.0,
        },
      ],
    };

    vi.mocked(geminiService.searchInDocuments).mockResolvedValue(mockResults);

    render(<App />);

    // 1. Upload
    const file = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText(/upload pdf files/i);
    fireEvent.change(input, { target: { files: [file] } });

    // 2. Search
    const searchInput = screen.getByPlaceholderText(
      /e.g., 'Financial Q3 results'/i,
    );
    fireEvent.change(searchInput, { target: { value: "search" } });
    fireEvent.click(screen.getByText("Find Occurrences"));

    // 3. Verify results
    await waitFor(() => {
      expect(screen.getByText("AI Summary")).toBeInTheDocument();
      expect(screen.getByText("Found in document")).toBeInTheDocument();
    });

    // 4. Open viewer
    fireEvent.click(screen.getByText("View Page 1"));
    expect(screen.getByText("Page 1 of --")).toBeInTheDocument();
  });
});
