// Polyfill for DOMMatrix
if (typeof DOMMatrix === "undefined") {
  global.DOMMatrix = class DOMMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;

    constructor(init?: string | number[]) {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.e = 0;
      this.f = 0;

      if (typeof init === "string") {
        const translateMatch = init.match(/translate\(([^,]+),([^)]+)\)/);
        if (translateMatch) {
          this.e = parseFloat(translateMatch[1]);
          this.f = parseFloat(translateMatch[2]);
        }
      } else if (Array.isArray(init)) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      }
    }

    translate(tx: number, ty: number) {
      this.e += tx;
      this.f += ty;
      return this;
    }

    scale(sx: number, sy: number) {
      this.a *= sx;
      this.b *= sx;
      this.c *= sy;
      this.d *= sy;
      return this;
    }
  };
}

/**
 * Vitest Setup File
 *
 * Global test configuration and setup
 */

import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock("import.meta.env", () => ({
  VITE_GEMINI_API_KEY: "test-api-key",
  VITE_MAX_FILE_SIZE: 209715200,
  VITE_MAX_FILES: 10,
  VITE_RATE_LIMIT: 10,
}));

// Mock Google Gemini API
vi.mock("@google/genai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              results: [],
              totalResults: 0,
              processingTime: 0,
            }),
          ),
        },
      }),
    }),
  })),
}));

// Mock PDF.js
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 10,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: "Test content" }],
        }),
      }),
    }),
  }),
  GlobalWorkerOptions: {
    workerSrc: "",
  },
}));

// Mock IntersectionObserver
class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

// Mock File API for tests
const originalBlob = global.Blob;

class MockBlob extends originalBlob {
  constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
    super(blobParts || [], options);
  }
}

global.File = class MockFile extends MockBlob {
  name: string;
  lastModified: number;

  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    super(bits, options);
    this.name = name;
    this.lastModified = options?.lastModified || Date.now();
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(this);
    });
  }

  // We can't easily implement stream(), so we'll leave it as a method
  // that returns a new ReadableStream. For most tests, this is fine.
  stream(): ReadableStream<Uint8Array> {
    const parts = (this as { _parts: BlobPart[] })._parts;
    let position = 0;
    return new ReadableStream({
      pull(controller) {
        if (position >= parts.length) {
          controller.close();
          return;
        }
        controller.enqueue(parts[position++]);
      },
    });
  }
} as typeof File;

// Custom matchers
expect.extend({
  toBeValidPDF(file: File) {
    const pass =
      file.type === "application/pdf" &&
      file.name.toLowerCase().endsWith(".pdf");

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${file.name} not to be a valid PDF`
          : `Expected ${file.name} to be a valid PDF`,
    };
  },

  toBeWithinSizeLimit(file: File, maxSize: number) {
    const pass = file.size <= maxSize;

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${file.name} (${file.size} bytes) to exceed ${maxSize} bytes`
          : `Expected ${file.name} (${file.size} bytes) to be within ${maxSize} bytes`,
    };
  },
});

// Extend vitest matchers
declare module "vitest" {
  interface Assertion {
    toBeValidPDF(): void;
    toBeWithinSizeLimit(maxSize: number): void;
  }
}

// Console error handler for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: Parameters<typeof console.error>) => {
    // Suppress expected React warnings in tests
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Not implemented: HTMLFormElement.prototype.submit") ||
        args[0].includes("Warning: ReactDOM.render"))
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
  name: string = "test.pdf",
  size: number = 1000,
  type: string = "application/pdf",
): File => {
  return new File(["x".repeat(size)], name, { type });
};

global.createMockSearchResult = (overrides = {}) => ({
  documentName: "test.pdf",
  pageNumber: 1,
  content: "Test content",
  relevanceScore: 0.9,
  context: "Test context",
  ...overrides,
});

global.createMockDocument = (overrides = {}) => ({
  id: "doc-1",
  name: "test.pdf",
  content: "Document content",
  pageCount: 10,
  ...overrides,
});

// Type declarations for global utilities
declare global {
  function createMockFile(name?: string, size?: number, type?: string): File;

  function createMockSearchResult(
    overrides?: Partial<{
      documentName: string;
      pageNumber: number;
      content: string;
      relevanceScore: number;
      context: string;
    }>,
  ): {
    documentName: string;
    pageNumber: number;
    content: string;
    relevanceScore: number;
    context: string;
  };

  function createMockDocument(
    overrides?: Partial<{
      id: string;
      name: string;
      content: string;
      pageCount: number;
    }>,
  ): {
    id: string;
    name: string;
    content: string;
    pageCount: number;
  };

  const beforeAll: (fn: () => void) => void;
  const afterAll: (fn: () => void) => void;
}

export {};
