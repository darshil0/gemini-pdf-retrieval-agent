import { expect, afterEach, vi, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Polyfill for DOMMatrix
if (typeof DOMMatrix === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).DOMMatrix = class DOMMatrix {
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
        if (
          translateMatch &&
          translateMatch[1] !== undefined &&
          translateMatch[2] !== undefined
        ) {
          this.e = parseFloat(translateMatch[1]);
          this.f = parseFloat(translateMatch[2]);
        }
      } else if (Array.isArray(init)) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init as [
          number,
          number,
          number,
          number,
          number,
          number,
        ];
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
vi.mock("@google/generative-ai", () => ({
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
  SchemaType: {
    OBJECT: "OBJECT",
    STRING: "STRING",
    NUMBER: "NUMBER",
    ARRAY: "ARRAY",
  },
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
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: readonly number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.IntersectionObserver = MockIntersectionObserver as any;

// Mock File API for tests
const originalBlob = global.Blob;

class MockBlob extends originalBlob {
  _parts: BlobPart[];
  constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
    super(blobParts || [], options);
    this._parts = blobParts || [];
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
      reader.readAsArrayBuffer(this as unknown as Blob);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream(): any {
    const parts = this._parts;
    let position = 0;
    return new ReadableStream({
      pull(controller) {
        if (position >= parts.length) {
          controller.close();
          return;
        }
        const part = parts[position++];
        if (part instanceof Uint8Array) {
          controller.enqueue(part);
        } else if (typeof part === "string") {
          controller.enqueue(new TextEncoder().encode(part));
        }
        // Handle other types if necessary
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).createMockFile = (
  name: string = "test.pdf",
  size: number = 1000,
  type: string = "application/pdf",
): File => {
  return new File(["x".repeat(size)], name, { type });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).createMockSearchResult = (overrides = {}) => ({
  documentName: "test.pdf",
  pageNumber: 1,
  content: "Test content",
  relevanceScore: 0.9,
  context: "Test context",
  ...overrides,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).createMockDocument = (overrides = {}) => ({
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
}

export {};
