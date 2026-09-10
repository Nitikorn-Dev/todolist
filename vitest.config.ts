import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    // pglite (WASM Postgres) boots in several integration suites; under
    // parallel load the default 10s hook timeout can be tight. This has
    // been observed to flake once under load with the default timeout.
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
