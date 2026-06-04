/// <reference types="vitest" />
import { fileURLToPath } from "node:url";
import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), angular({ tsconfig: "./tsconfig.vitest.json" })],
  resolve: {
    alias: [
      // ng-click-outside.main = битый CJS (import-синтаксис в .js). Резолвим на ESM-сборку.
      {
        find: /^ng-click-outside$/,
        replacement: fileURLToPath(
          new URL("node_modules/ng-click-outside/lib_esmodule/index.js", import.meta.url),
        ),
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    include: ["projects/core/**/*.spec.ts", "projects/ui/**/*.spec.ts"],
  },
});
