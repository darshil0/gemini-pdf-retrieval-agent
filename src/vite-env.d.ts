/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_MAX_FILES?: string;
  readonly VITE_RATE_LIMIT?: string;
  readonly VITE_DEBUG?: string;
  // Add more VITE_ prefixed env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
