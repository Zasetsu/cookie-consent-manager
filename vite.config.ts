/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {
    environment: "jsdom",
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CookieConsentManager",
      formats: ["umd", "es"],
      fileName: (format) => `cookie-consent-manager.${format === "es" ? "mjs" : "umd.js"}`,
    },
    rollupOptions: {
      output: {
        assetFileNames: "cookie-consent-manager.[ext]",
        globals: {},
      },
    },
    sourcemap: true,
    minify: true,
    cssCodeSplit: false,
  },
});
