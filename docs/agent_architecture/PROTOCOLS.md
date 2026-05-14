# Protocols (Constraints & Logic)

> **Version**: v1.4.0

## 📜 Search Protocol (SEARCH_PROTOCOL)

### 1. Matching Logic
- **Fuzzy Matching**: MUST include matches for typos and minor spelling variations.
- **Linguistic Variation**: MUST include singular/plural and tense variations.
- **Semantic Mapping**: MUST include close synonyms (e.g., "Revenue" matches "Sales").

### 2. Relevance Scoring
- **Threshold**: Only include results with a `relevanceScore` between **0.75 and 1.0**.
- **Explanation**: Every match MUST include a `relevanceExplanation` (e.g., "Exact", "Fuzzy", "Semantic").

### 3. Output Requirements
- **Format**: Valid JSON object only.
- **No Hallucination**: If no matches meet the 0.75 threshold, return an empty `results` array `[]`.
- **Citations**: All `pageNumber` values must be accurate to the source document.

### 4. Error Handling
- Do NOT provide conversational filler if no results are found.
- Ensure the `summary` string accurately reflects the findings or lack thereof.

