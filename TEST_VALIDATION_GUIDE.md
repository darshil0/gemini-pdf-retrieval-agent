# Test Validation Guide

This guide provides instructions on how to validate the test cases defined in `TESTING_REPORT.md` using your local environment.

**Local Validation URL**: `http://localhost:5173`

## Prerequisites

1.  Ensure dependencies are installed: `npm install`
2.  Ensure you have a `.env` file in the root directory with your API key:
    ```
    API_KEY=your_google_gemini_api_key
    ```
3.  Start the application: `npm run dev`

---

## Validation Scenarios

### 1. Validate SIT-01 & SIT-02: API Integration & Fuzzy Matching
**Action**:
1.  Upload a PDF that contains the word "Behaviour" (UK spelling).
2.  In the search bar, type "Behavior" (US spelling).
3.  Click "Find Occurrences".

**Success Criteria**:
*   [ ] The application enters the "Analyzing" state (Spinner visible).
*   [ ] Results are returned.
*   [ ] The context snippet highlights the word "Behaviour" in yellow.
*   [ ] This confirms the API received the file and returned the `matchedTerm` correctly.

### 2. Validate SIT-03 & SIT-04: React PDF Viewer
**Action**:
1.  Click the "View Page [X]" button on any result card.

**Success Criteria**:
*   [ ] The modal opens.
*   [ ] A spinner appears briefly with text "Rendering page...".
*   [ ] The PDF page renders clearly (not an iframe).
*   [ ] The page number at the top corresponds to the result you clicked.

### 3. Validate E2E-Step-7: Rotation Controls
**Action**:
1.  With the viewer open, click the **Rotate Clockwise** (Right Arrow Circular) icon.

**Success Criteria**:
*   [ ] The document rotates 90 degrees clockwise.
*   [ ] The layout adjusts to fit the new orientation.

### 4. Validate EDGE-03: Large File Warning
**Action**:
1.  Select multiple large PDFs (or one very large PDF > 200MB) via the file input.
    *   *Note: If you don't have a 200MB file, you can modify `MAX_RECOMMENDED_SIZE_MB` in `components/FileUpload.tsx` to `1` temporarily for testing.*

**Success Criteria**:
*   [ ] An amber warning banner appears below the file list: "Large Total Size".

### 5. Validate REG-03: Reset & Cleanup
**Action**:
1.  After a search is complete, click the **Trash Icon / Clear Results** in the top right of the header.

**Success Criteria**:
*   [ ] The results grid disappears.
*   [ ] The uploaded files list is emptied.
*   [ ] The search input is cleared.
*   [ ] (Optional) Check Browser Memory tool: The Object URLs created for previews should be released.

### 6. Validate Persistence (Recent Searches)
**Action**:
1.  Run a search for "Q3 Financials".
2.  Refresh the browser page (`F5`).
3.  Look at the area below the search button.

**Success Criteria**:
*   [ ] A "Recent Searches" section is visible.
*   [ ] A chip labeled "Q3 Financials" is present.
*   [ ] Clicking the chip automatically populates the input and runs the search (if files are re-uploaded).
