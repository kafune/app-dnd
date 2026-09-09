import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 3000,
    // Em dev, a API e o SSE vêm do servidor Rust (`bun run dev:server`).
    proxy: { "/api": { target: "http://127.0.0.1:8080", changeOrigin: false } },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    cssMinify: "lightningcss",
    reportCompressedSize: false,
    // O chunk do catálogo de magias (~590 KB) é lazy e intencional.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // React + router num chunk estável (cache imutável entre deploys)
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|scheduler|react-router|zustand)[\\/]/.test(id)) {
            return "vendor";
          }
        },
      },
    },
  },
});
