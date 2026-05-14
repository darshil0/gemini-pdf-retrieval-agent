/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_MODEL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_MAX_FILES?: string;
  readonly VITE_RATE_LIMIT?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_PDF_WORKER_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
