# DocuSearch Agent - Application Walkthrough

This guide provides a step-by-step walkthrough of the DocuSearch Agent application, demonstrating the core workflow from document upload to detailed analysis.

## 1. Initial State

Upon loading the application, you are presented with a clean, dual-panel interface.
-   **Left Panel**: Dedicated to file management.
-   **Right Panel**: Dedicated to search configuration.

*The "Find Occurrences" button is initially disabled until files are uploaded and a keyword is entered.*

## 2. Uploading Documents

1.  **Action**: Click on the dashed upload area or drag and drop PDF files.
2.  **Constraint**: You can upload up to 10 files.
3.  **Visual Feedback**:
    -   Uploaded files appear as a list below the upload area.
    -   Each file shows a red PDF icon, the filename, and the file size.
    -   You can remove individual files by clicking the "X" button next to them.
4.  **Warning**: If the total size of files exceeds 200MB, an amber warning banner appears to alert you about potential performance impacts.

## 3. Defining Search Criteria

1.  **Action**: Enter a keyword or phrase in the "Target Keyword or Phrase" input box.
    -   *Example*: "Quarterly Revenue" or "Project Timeline".
2.  **State Change**: Once files are present and a keyword is typed, the "Find Occurrences" button lights up (becomes active), indicating the system is ready.

## 4. Execution & Analysis

1.  **Action**: Click "Find Occurrences".
2.  **Process**:
    -   The application sends the PDF data and the prompt to the Gemini 2.5 Flash model.
    -   The button changes to a "Analyzing Documents..." state with a spinner.
    -   Inputs are temporarily disabled to prevent changes during processing.

## 5. Reviewing Results

Once analysis is complete, the "Search Results" section appears below the main interface.

### The AI Summary
At the top of the results is an **Analysis Summary**. This is a generated natural language overview describing the frequency and context of the keyword across all your documents.

### Result Cards
Below the summary is a grid of result cards. Each card contains:
-   **Document Name**: The source file.
-   **Page Number**: A badge indicating exactly where the match was found.
-   **Context Snippet**: A ~40 word excerpt. The keyword is **highlighted in yellow** (case-insensitive).
-   **Relevance Note**: A brief explanation of why this match was returned.

## 6. Integrated PDF Viewer

1.  **Action**: Click the "View Page [X]" button on any result card.
2.  **Outcome**:
    -   A modal overlay opens.
    -   The PDF is loaded into an embedded viewer.
    -   The viewer automatically scrolls to the specific page cited in the result.
3.  **Controls**:
    -   **Rotate**: Use the clockwise/counter-clockwise buttons in the top header to rotate the view if the document scan is sideways.
4.  **Close**: Click the "X" in the top right or click the backdrop to close the viewer and return to results.

## 7. Resetting

To start over, click the "Trash / Clear Results" icon in the top navigation bar. This removes the search results and clears the uploaded files list, returning the application to its initial state.