# Tool prompts

> Version: v1.4.3
> Source of truth: [src/core/architecture/prompts.ts](../../src/core/architecture/prompts.ts)

The tool prompt defines the task the model should perform during a search. In the current implementation, it instructs the model to scan all uploaded documents, find relevant matches, and return them in a structured JSON object.

## Search task instructions

The current instructions require the model to:

1. Scan all uploaded PDF documents.
2. Identify occurrences of the supplied keyword or phrase.
3. Capture context snippets around each match.
4. Assign the document index and page number.
5. Produce an explanation and relevance score for each hit.
6. Prefer precise evidence over broad guesses and avoid low-quality matches.

## How it fits the app

These instructions are part of the prompt assembled in [src/core/architecture/prompts.ts](../../src/core/architecture/prompts.ts) and are sent to the Gemini service in [src/api/gemini.ts](../../src/api/gemini.ts). The results are then filtered and sorted in the UI before being displayed to the user.
