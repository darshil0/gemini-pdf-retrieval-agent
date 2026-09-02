/**
 * Agent Architecture Prompt Definitions
 *
 * This file implements the 3-layer agent architecture:
 * 1. System Persona (`SYSTEM_PERSONA`)
 * 2. Tool Instructions (`SEARCH_TOOL_INSTRUCTIONS`)
 * 3. Protocols & Constraints (`SEARCH_PROTOCOL`)
 *
 * @module agentPrompts
 * @since v1.0.0
 */

/** System prompt defining the AI assistant's persona. */
export const SYSTEM_PERSONA = `You are an expert Document Retrieval and Analysis Agent.`;

/** Tool instructions dictating document scanning and result structure requirements. */
export const SEARCH_TOOL_INSTRUCTIONS = `
YOUR TASK:
Search for the specific keyword, phrase, or concept provided below.

REQUIREMENTS:
1. Scan all pages of all provided documents.
2. Identify every occurrence of the keyword.
3. Return a structured JSON response listing every match found.
`;

/** Protocol guidelines covering fuzzy matching, scoring, output format, and fallback logic. */
export const SEARCH_PROTOCOL = `
PROTOCOL & CONSTRAINTS:

1. FUZZY MATCHING & RELEVANCE SCORING:
   - You MUST include matches for slight misspellings or typos.
   - You MUST include Plural/Singular variations.
   - You MUST include very close synonyms or semantic matches (e.g., "Revenue" -> "Sales").
   - For each match, you MUST provide a 'relevanceScore' from 0.0 to 1.0, where 1.0 is a perfect match.
   - You MUST NOT include any results with a relevance score below 0.75.

2. OUTPUT FORMAT:
   - For each match, you MUST provide:
     - 'docIndex': Index of the document (integer).
     - 'pageNumber': Specific page number (integer).
     - 'contextSnippet': Text excerpt (20-40 words) surrounding the match.
     - 'matchedTerm': The EXACT word/phrase found in the text.
     - 'relevanceExplanation': Brief note on why it matched (e.g., "Exact", "Fuzzy", "Synonym").
     - 'relevanceScore': A number between 0.75 and 1.0.
   - Include a 'summary' string overview.

3. ERROR HANDLING:
   - If no matches are found, return an empty array for 'results' and a summary stating that.
`;

/**
 * Constructs the combined search prompt sent to Gemini.
 *
 * @param fileCount - Total number of uploaded PDF files attached to the request
 * @param keyword - Search term or phrase requested by the user
 * @returns Combined string prompt containing persona, instructions, search keyword, and protocol constraints
 */
export const buildSearchPrompt = (
  fileCount: number,
  keyword: string,
): string => {
  return `
    ${SYSTEM_PERSONA}
    I have provided ${fileCount} PDF document(s).
    
    ${SEARCH_TOOL_INSTRUCTIONS}
    TARGET KEYWORD: "${keyword}"
    
    ${SEARCH_PROTOCOL}
    
    Specific Document Index Range: 0 to ${fileCount - 1}
  `;
};
