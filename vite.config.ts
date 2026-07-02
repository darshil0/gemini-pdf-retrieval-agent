import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@api": path.resolve(__dirname, "src/api"),
        "@core": path.resolve(__dirname, "src/core"),
        "@components": path.resolve(__dirname, "src/components"),
        "@styles": path.resolve(__dirname, "src/styles"),
        "@tests": path.resolve(__dirname, "src/tests"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || "5173"),
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("react-pdf") || id.includes("pdfjs-dist")) {
              return "pdf-vendor";
            }
            return undefined;
          },
        },
      },
    },
  };
});
