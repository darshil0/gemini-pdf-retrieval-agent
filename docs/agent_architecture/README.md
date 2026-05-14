# Agent Architecture Guide

> **Version**: v1.4.0  
> **Status**: Finalized  
> **Pattern**: System-Tool-Protocol

This directory defines the core intelligence and behavioral guidelines for the DocuSearch Agent. The architecture is modularized into three distinct layers to ensure reliability, predictability, and high-quality AI responses.

## 🧱 Architecture Components

### 1. [System Prompt (Persona)](./SYSTEM_PROMPT.md)
Defines the agent's identity, role, and overarching capabilities. This is the "brain" of the agent.

### 2. [Tool Prompts (Instructions)](./TOOL_PROMPTS.md)
Specific operational instructions for the tools available to the agent (e.g., Search). This is the "skillset".

### 3. [Protocols (Logic & Constraints)](./PROTOCOLS.md)
Strict rules and logical workflows that the agent MUST follow during execution. This is the "governance".

---

## 🛠 Implementation Reference
The live implementation of these prompts can be found in:
`src/core/architecture/prompts.ts`

