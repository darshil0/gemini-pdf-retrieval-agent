# Tool Prompts (Instructions)

> **Version**: v1.4.2

## 🔍 Search Tool (SEARCH_TOOL_INSTRUCTIONS)

**Primary Task**: Identify every occurrence of a specific keyword, phrase, or concept within the provided document corpus.

### 📋 Operational Procedure

1.  **Deep Scan**: Iterate through all text extracted from all provided files within the specified index range.
2.  **Match Identification**: Locate exact, fuzzy, and semantic matches based on the target query.
3.  **Data Capture**: Extract the precise `matchedTerm` and the surrounding `contextSnippet` (20-40 words).
4.  **Metadata Assignment**: Assign accurate `docIndex` and `pageNumber` for each match found.
5.  **Relevance Scoring**: Evaluate every result against the relevance protocol (see [PROTOCOLS.md](./PROTOCOLS.md)).

