/**
 * Vitest Setup File
 * 
 * Global test configuration and setup
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_GEMINI_API_KEY: 'test-api-key',
  VITE_MAX_FILE_SIZE: 209715200,
  VITE_MAX_FILES: 10,
  VITE_RATE_LIMIT: 10
}));

// Mock Google Gemini API
vi.mock('@google/genai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockResolvedValue(JSON.stringify({
            results: [],
            totalResults: 0,
            processingTime: 0
          }))
        }
      })
    })
  }))
}));

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 10,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Test content' }]
        })
      })
    })
  }),
  GlobalWorkerOptions: {
    workerSrc: ''
  }
}));

// Mock File API for tests
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  
  constructor(
    bits: BlobPart[],
    name: string,
    options?: FilePropertyBag
  ) {
    this.name = name;
    this.size = bits.reduce((acc, bit) => {
      if (typeof bit === 'string') return acc + bit.length;
      if (bit instanceof ArrayBuffer) return acc + bit.byteLength;
      return acc;
    }, 0);
    this.type = options?.type || '';
    this.lastModified = options?.lastModified || Date.now();
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(this.size);
  }

  async text(): Promise<string> {
    return '';
  }

  slice(): Blob {
    return new Blob();
  }

  stream(): ReadableStream {
    return new ReadableStream();
  }
} as any;

// Custom matchers
expect.extend({
  toBeValidPDF(file: File) {
    const pass = file.type === 'application/pdf' && 
                 file.name.toLowerCase().endsWith('.pdf');
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected ${file.name} not to be a valid PDF`
          : `Expected ${file.name} to be a valid PDF`
    };
  },

  toBeWithinSizeLimit(file: File, maxSize: number) {
    const pass = file.size <= maxSize;
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${file.name} (${file.size} bytes) to exceed ${maxSize} bytes`
          : `Expected ${file.name} (${file.size} bytes) to be within ${maxSize} bytes`
    };
  }
});

// Extend vitest matchers
declare module 'vitest' {
  interface Assertion {
    toBeValidPDF(): void;
    toBeWithinSizeLimit(maxSize: number): void;
  }
}

// Console error handler for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress expected React warnings in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
       args[0].includes('Warning: ReactDOM.render'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
global.createMockFile = (
  name: string = 'test.pdf',
  size: number = 1000,
  type: string = 'application/pdf'
): File => {
  return new File(['x'.repeat(size)], name, { type });
};

global.createMockSearchResult = (overrides = {}) => ({
  documentName: 'test.pdf',
  pageNumber: 1,
  content: 'Test content',
  relevanceScore: 0.9,
  context: 'Test context',
  ...overrides
});

global.createMockDocument = (overrides = {}) => ({
  id: 'doc-1',
  name: 'test.pdf',
  content: 'Document content',
  pageCount: 10,
  ...overrides
});

// Type declarations for global utilities
declare global {
  function createMockFile(
    name?: string,
    size?: number,
    type?: string
  ): File;

  function createMockSearchResult(overrides?: Partial<{
    documentName: string;
    pageNumber: number;
    content: string;
    relevanceScore: number;
    context: string;
  }>): any;

  function createMockDocument(overrides?: Partial<{
    id: string;
    name: string;
    content: string;
    pageCount: number;
  }>): any;

  var beforeAll: (fn: () => void) => void;
  var afterAll: (fn: () => void) => void;
}

export {};
