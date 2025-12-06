import { describe, it, expect } from 'vitest';
import { buildSearchPrompt, SEARCH_TOOL_INSTRUCTIONS, SEARCH_PROTOCOL } from '../agent_architecture/prompts';

describe('Agent Architecture (v1.2.2)', () => {
    it('should strictly include the SYSTEM definition in the prompt', () => {
        const prompt = buildSearchPrompt(1, 'test');
        // console.log('DEBUG_PROMPT_SYSTEM:', JSON.stringify(prompt)); 
        // Direct string check to avoid import anomalies during verification
        expect(prompt).toContain('You are an expert Document Retrieval and Analysis Agent');
    });

    it('should strictly include the TOOL instructions', () => {
        const prompt = buildSearchPrompt(1, 'test');
        expect(prompt).toContain(SEARCH_TOOL_INSTRUCTIONS);
        expect(prompt).toContain('Identify every occurrence');
    });

    it('should strictly include the PROTOCOL constraints', () => {
        const prompt = buildSearchPrompt(1, 'test');
        expect(prompt).toContain(SEARCH_PROTOCOL);

        // Critical constraints verification
        expect(prompt).toContain('FUZZY MATCHING');
        expect(prompt).toContain('OUTPUT FORMAT');
        expect(prompt).toContain('ERROR HANDLING');
        expect(prompt).toContain('return an empty array');
    });

    it('should correctly inject runtime variables', () => {
        const prompt = buildSearchPrompt(5, 'SpecificKeyword123');
        expect(prompt).toContain('I have provided 5 PDF document(s)');
        expect(prompt).toContain('TARGET KEYWORD: "SpecificKeyword123"');
        expect(prompt).toContain('Range: 0 to 4');
    });
});
