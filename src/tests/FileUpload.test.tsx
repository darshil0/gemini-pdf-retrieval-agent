import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUpload } from "../components/FileUpload";

describe("FileUpload Component", () => {
  const mockOnFilesSelected = vi.fn();
  const mockOnRemoveFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces 10-file limit", async () => {
    render(
      <FileUpload
        uploadedFiles={[]}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    // Create 11 files
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

  it("displays remaining slots", () => {
    const uploadedFiles = Array.from(
      { length: 7 },
      (_, i) =>
        new File(["content"], `test${i}.pdf`, { type: "application/pdf" }),
    );

    render(
      <FileUpload
        uploadedFiles={uploadedFiles}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    expect(screen.getByText("3 slot(s) remaining")).toBeInTheDocument();
  });

  it("validates file types", async () => {
    render(
      <FileUpload
        uploadedFiles={[]}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    const invalidFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });
    const input = screen.getByLabelText("Upload PDF files");

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(/Only PDF files are allowed/i),
      ).toBeInTheDocument();
    });
  });

  it("allows removing files", () => {
    const files = [
      new File(["content"], "test.pdf", { type: "application/pdf" }),
    ];

    render(
      <FileUpload
        uploadedFiles={files}
        onFilesSelected={mockOnFilesSelected}
        onRemoveFile={mockOnRemoveFile}
      />,
    );

    const removeButton = screen.getByLabelText("Remove test.pdf");
    fireEvent.click(removeButton);

    expect(mockOnRemoveFile).toHaveBeenCalledWith(0);
  });
});
