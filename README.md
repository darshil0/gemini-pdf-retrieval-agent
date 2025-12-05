# DocuSearch Agent

## Overview

**DocuSearch Agent** is an intelligent document retrieval system powered by Google's Gemini 2.5 Flash. It allows users to upload up to 10 PDF documents, search for specific keywords or phrases, and instantly retrieve exact citations. 

The application scans all uploaded documents, highlights the context where keywords are found, and provides a direct link to view the specific page within the browser.

## Key Features

-   **Multi-Document Analysis**: Upload and analyze up to 10 PDF files simultaneously.
-   **Context-Aware Search**: Uses Gemini 2.5 Flash to understand context and find relevant matches, even with slight variations.
-   **Exact Page Citations**: Returns the exact page number for every match.
-   **Keyword Highlighting**: Visually highlights keywords within the search result snippets (case-insensitive).
-   **Integrated PDF Viewer**: Click "View Page" to open the PDF directly to the cited page without leaving the app.
-   **Secure & Private**: Processing happens via the Gemini API with strict schema enforcement.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (`@google/genai` SDK)
-   **Icons**: Lucide React
-   **Build Tooling**: Parcel (via Index.html entry)

## Setup & Installation

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
    Ensure you have a valid Google Gemini API Key. This application expects the key to be available in the environment as `API_KEY`.

4.  **Run the Application**
    ```bash
    npm start
    ```

## Usage

1.  **Upload**: Drag and drop PDF files into the upload zone.
2.  **Search**: Enter a keyword (e.g., "Revenue", "Safety Compliance") in the search bar.
3.  **Analyze**: Click "Find Occurrences". The AI will scan the documents.
4.  **Review**: Browse the result cards.
5.  **View**: Click "View Page" on any card to open the document viewer at the exact location.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
