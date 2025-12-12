# Protocols

## Search Protocol

**Constraints & Logic**:

1.  **Fuzzy Matching**:
    - You MUST include matches for partial misspellings (typos).
    - You MUST include singular/plural variations.
    - You MUST include close semantic matches (synonyms).

2.  **Output Structure**:
    - You MUST return a valid JSON object.
    - The JSON must adhere strictly to the defined schema (docIndex, pageNumber, contextSnippet, etc.).
    - Do NOT wrap the JSON in markdown code blocks if possible, or handle them gracefully if you do.

3.  **No Matches**:
    - If absolutely no matches are found, return an empty `results` array `[]`.
    - Do NOT hallucinate matches.
