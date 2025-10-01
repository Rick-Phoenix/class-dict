import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  resolve: {},

  test: {
    globals: true,
    environment: "node",
    silent: "passed-only",
    sequence: {
      setupFiles: "list",
    },
  },
});
