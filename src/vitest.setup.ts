import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

vi.mock("@google/genai", () => {
  const GoogleGenerativeAI = vi.fn();
  GoogleGenerativeAI.prototype.getGenerativeModel = vi.fn(() => ({
    generateContent: vi.fn(() =>
      Promise.resolve({
        response: {
          text: () => JSON.stringify({ results: [] }),
        },
      })
    ),
  }));
  return { GoogleGenerativeAI };
});

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: { workerSrc: "" } },
  Document: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pdf-document" }, children),
  Page: () => React.createElement("div", { "data-testid": "pdf-page" }),
}));

// Polyfill Blob.arrayBuffer for jsdom
if (typeof Blob.prototype.arrayBuffer === "undefined") {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result as ArrayBuffer);
      };
      fr.readAsArrayBuffer(this);
    });
  };
}
