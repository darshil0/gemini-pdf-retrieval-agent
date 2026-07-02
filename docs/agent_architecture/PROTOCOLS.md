# Protocols

> Version: v1.4.4
> Source of truth: [src/core/architecture/prompts.ts](../../src/core/architecture/prompts.ts)

The protocol layer defines how the model should behave when generating search results. It is responsible for matching strategy, response shape, and handling of empty results.

## Matching expectations

The model is instructed to support:

- fuzzy matching for minor spelling variations
- singular/plural variation
- close semantic matches when appropriate

## Relevance rules

Each result should include:

- `relevanceScore` between `0.0` and `1.0`
- `relevanceExplanation` describing why the result matched

The UI uses a default minimum relevance threshold of `0.75`, but the filter can be adjusted by the user.

## Output contract

The expected JSON structure is:

```json
{
  "summary": "A short explanation of the findings",
  "results": []
}
```

Each item in `results` must include:

- `docIndex`
- `pageNumber`
- `contextSnippet`
- `matchedTerm`
- `relevanceExplanation`
- `relevanceScore`

## Empty-result handling

When no suitable results are found, the response should contain an empty `results` array and a summary that reflects the absence of matches.

## Runtime validation

The response is checked in [src/core/services/validation.ts](../../src/core/services/validation.ts) before it is rendered by the application. Invalid or partially malformed payloads are filtered out so the UI can continue to render safely.

