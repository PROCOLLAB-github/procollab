/** @format */

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
    // Windows TestBed без inline падает с NG0401 ещё в setup (Node 20/24).
    // В Linux этот workaround вызывает OOM в vmThreads и не должен применяться.
    ...(process.platform === "win32"
      ? {
          server: {
            deps: {
              inline: [/@angular\//, /@analogjs\//, /ngx-/, /ng-click-outside/, /@sentry\/angular/],
            },
          },
        }
      : {}),
    globals: true,
    environment: "jsdom",
    testTimeout: 10000,
    setupFiles: ["./test-setup.ts"],
    include: [
      "projects/core/**/*.spec.ts",
      "projects/ui/**/*.spec.ts",
      "projects/social_platform/**/*.spec.ts",
    ],
    exclude: [
      "projects/social_platform/src/app/ui/pages/projects/projects.component.spec.ts",
      "projects/social_platform/src/app/ui/pages/program/program.component.spec.ts",
      "projects/social_platform/src/app/ui/pages/profile/edit/editor-submit-button.directive.spec.ts",
    ],
  },
});
