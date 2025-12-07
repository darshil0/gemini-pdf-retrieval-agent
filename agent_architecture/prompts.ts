/**
 * Agent Architecture Definitions
 *
 * This file implements the 3-step agent architecture:
 * 1. System Prompt (Persona)
 * 2. Tool Prompts (Instructions)
 * 3. Protocols (Constraints & Logic)
 */

export const SYSTEM_PERSONA = `You are an expert Document Retrieval and Analysis Agent.`;

export const SEARCH_TOOL_INSTRUCTIONS = `
YOUR TASK:
Search for the specific keyword, phrase, or concept provided below.

REQUIREMENTS:
1. Scan all pages of all provided documents.
2. Identify every occurrence of the keyword.
3. Return a structured JSON response listing every match found.
`;

export const SEARCH_PROTOCOL = `
PROTOCOL & CONSTRAINTS:

1. FUZZY MATCHING:
   - You MUST include matches for slight misspellings or typos.
   - You MUST include Plural/Singular variations.
   - You MUST include very close synonyms or semantic matches (e.g., "Revenue" -> "Sales").

2. OUTPUT FORMAT:
   - For each match, you MUST provide:
     - 'docIndex': Index of the document (integer).
     - 'pageNumber': Specific page number (integer).
     - 'contextSnippet': Text excerpt (20-40 words) surrounding the match.
     - 'matchedTerm': The EXACT word/phrase found in the text.
     - 'relevanceExplanation': Brief note on why it matched (e.g., "Exact", "Fuzzy", "Synonym").
   - Include a 'summary' string overview.

3. ERROR HANDLING:
   - If no matches are found, return an empty array for 'results' and a summary stating that.
`;

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
