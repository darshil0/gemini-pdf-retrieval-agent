# DocuSearch Agent

## Overview

**DocuSearch Agent** is an intelligent document retrieval system powered by Google's Gemini 2.5 Flash. It allows users to upload up to 10 PDF documents, search for specific keywords or phrases, and instantly retrieve exact citations. 

The application scans all uploaded documents, highlights the context where keywords are found (including fuzzy matches), and provides a direct link to view the specific page within the app using a robust React-based PDF viewer.

## Key Features

-   **Multi-Document Analysis**: Upload and analyze up to 10 PDF files simultaneously.
-   **Fuzzy & Semantic Search**: Powered by Gemini 2.5, the agent finds exact matches, variations, typos, and semantic synonyms (e.g., "Revenue" matches "Sales").
-   **Exact Page Citations**: Returns the exact page number for every match.
-   **Smart Highlighting**: Visually highlights the exact term found in the text, even if it differs slightly from the search query (e.g., searching "color" highlights "colour").
-   **Robust PDF Viewer**: Integrated `react-pdf` viewer for consistent, high-fidelity document rendering across all browsers.
-   **Advanced Controls**: Includes page navigation, zoom, and 90° rotation controls.
-   **Size Warning**: Alerts users when total upload size exceeds 200MB to prevent timeout issues.
-   **Secure & Private**: Processing happens via the Gemini API with strict schema enforcement.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (`@google/genai` SDK)
-   **PDF Engine**: `react-pdf` / `pdfjs-dist`
-   **Icons**: Lucide React
-   **Tooling**: Vite

## Setup & Installation

To validate the test cases and run the application locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/gemini-pdf-retrieval-agent.git
    cd gemini-pdf-retrieval-agent
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_actual_api_key_here
    ```

4.  **Run the Application**
    ```bash
    npm run dev
    ```

5.  **Access the App**
    Open your browser and navigate to:
    `http://localhost:5173`

## Validation

Refer to `TEST_VALIDATION_GUIDE.md` for a step-by-step checklist to verify all features and edge cases reported in the Testing Report.

## Usage

1.  **Upload**: Drag and drop PDF files into the upload zone.
2.  **Search**: Enter a keyword (e.g., "Revenue", "Safety Compliance") in the search bar.
3.  **Analyze**: Click "Find Occurrences". The AI will scan the documents.
4.  **Review**: Browse the result cards. The "Analysis Summary" provides a high-level overview.
5.  **View**: Click "View Page" on any card to open the document viewer at the exact location.

## Version History

**v1.2.0**
-   Added **Fuzzy Search**: Now supports misspellings, plurals, and semantic variations.
-   Migrated PDF viewer to `react-pdf` for better cross-browser compatibility.
-   Added document rotation and page navigation controls.
-   Improved error handling for large file uploads.

**v1.0.0**
-   Initial Release with Gemini 2.5 Flash integration.

## License

[MIT](https://choosealicense.com/licenses/mit/)
