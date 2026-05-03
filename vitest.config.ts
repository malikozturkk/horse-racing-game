import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@tests": fileURLToPath(new URL("./tests", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/domain/**/*.ts",
        "src/infrastructure/**/*.ts",
        "src/stores/**/*.ts",
        "src/composables/**/*.ts",
        "src/components/**/*.vue",
      ],
      exclude: [
        "src/components/horse/HorseWithJockey.vue",
        "src/components/horse/HorseProfile.vue",
        "src/components/barn/BarnDoorsIntro.vue",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
