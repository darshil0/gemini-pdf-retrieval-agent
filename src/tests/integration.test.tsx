// src/__tests__/integration.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import * as geminiService from "../services/geminiService";

vi.mock("../services/geminiService");

describe("Integration Tests", () => {
  it("complete workflow: upload, search, highlight", async () => {
    const mockSearchResponse = {
      summary: "Found 1 result.",
      results: [
        {
          docIndex: 0,
          pageNumber: 1,
          contextSnippet: "test content",
          matchedTerm: "test",
          relevanceExplanation: "Exact match",
        },
      ],
    };

    vi.spyOn(geminiService, "searchInDocuments").mockResolvedValue(
      mockSearchResponse,
    );

    render(<App />);

    // 1. Upload file
    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText("Upload PDF files");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });

    // 2. Enter search query
    const searchInput = screen.getByLabelText("Target Keyword or Phrase");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // 3. Execute search
    const searchButton = screen.getByText("Find Occurrences");
    fireEvent.click(searchButton);

    // 4. Verify results displayed
    await waitFor(() => {
      expect(screen.getByText("Found 1 result.")).toBeInTheDocument();
    });
  });

  it("prevents exceeding 10-file limit", async () => {
    render(<App />);

    const files = Array.from(
      { length: 11 },
      (_, i) =>
        new File(["content"], `test${i}.pdf`, { type: "application/pdf" }),
    );

    const input = screen.getByLabelText("Upload PDF files");
    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(
        screen.getByText(/Cannot upload more than 10 files/i),
      ).toBeInTheDocument();
    });
  });
});
