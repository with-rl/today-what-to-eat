import { defineConfig } from "vitest/config";
import tsconfig from "./tsconfig.json";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});


