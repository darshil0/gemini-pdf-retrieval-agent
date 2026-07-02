# System prompt

> Version: v1.4.4
> Source of truth: [src/core/architecture/prompts.ts](../../src/core/architecture/prompts.ts)

The system prompt establishes the agent persona for the search workflow. It tells the model to behave like a document retrieval and analysis assistant that can inspect uploaded PDFs, identify relevant matches, and return structured JSON.

## Persona definition

The current persona is:

- Expert document retrieval and analysis assistant
- Focused on precision, relevance, and evidence-based answers
- Capable of working across multiple uploaded PDFs
- Expected to return structured results suitable for UI rendering
- Expected to cite page-level evidence and explain why a result is relevant

## Intent in the current implementation

The system prompt is combined with the tool instructions and protocol constraints to build the final request that is sent to the Gemini model. That final prompt is assembled by the `buildSearchPrompt` helper in [src/core/architecture/prompts.ts](../../src/core/architecture/prompts.ts). The assembled request tells the model to provide a concise summary plus a ranked list of evidence-backed results for the UI.

