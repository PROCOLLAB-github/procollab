/** @format */

import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import globals from "globals";

export default ts.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/.angular/**", "**/*.scss"],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.jasmine,
      },
    },
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/dependency-nodes": ["import"],
      "boundaries/include": ["projects/**/*.ts"],
      "boundaries/elements": [
        {
          type: "domain",
          pattern: "projects/social_platform/src/app/domain/**",
          mode: "full",
        },
        {
          type: "infrastructure",
          pattern: "projects/social_platform/src/app/infrastructure/**",
          mode: "full",
        },
        {
          type: "api",
          pattern: "projects/social_platform/src/app/api/**",
          mode: "full",
        },
        {
          type: "ui",
          pattern: "projects/social_platform/src/app/ui/**",
          mode: "full",
        },
        {
          type: "utils",
          pattern: "projects/social_platform/src/app/utils/**",
          mode: "full",
        },
        {
          type: "testing",
          pattern: "projects/social_platform/src/app/testing/**",
          mode: "full",
        },
        {
          type: "core-lib",
          pattern: "projects/core/src/**",
          mode: "full",
        },
        {
          type: "ui-lib",
          pattern: "projects/ui/src/**",
          mode: "full",
        },
        {
          type: "env",
          pattern: "projects/social_platform/src/environments/**",
          mode: "full",
        },
        {
          type: "root",
          pattern: [
            "projects/social_platform/src/app/app.component.ts",
            "projects/social_platform/src/app/app.component.spec.ts",
            "projects/social_platform/src/app/app.config.ts",
            "projects/social_platform/src/app/app.routes.ts",
            "projects/social_platform/src/app/sentry.config.ts",
            "projects/social_platform/src/main.ts",
            "projects/social_platform/src/test.ts",
          ],
          mode: "full",
        },
      ],
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.json"],
        },
      },
    },
    rules: {
      "no-useless-constructor": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-empty": "off",
      "dot-notation": "off",
      "lines-between-class-members": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",

      "boundaries/no-unknown": ["error"],
      "boundaries/no-unknown-files": ["error"],
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: { type: "domain" }, allow: { to: { type: ["domain", "core-lib"] } } },
            {
              from: { type: "infrastructure" },
              allow: { to: { type: ["domain", "infrastructure", "core-lib", "utils"] } },
            },
            {
              from: { type: "api" },
              allow: {
                to: { type: ["domain", "infrastructure", "api", "core-lib", "utils", "env"] },
              },
            },
            {
              from: { type: "ui" },
              allow: {
                to: {
                  type: ["domain", "infrastructure", "api", "ui", "core-lib", "ui-lib", "utils"],
                },
              },
            },
            { from: { type: "utils" }, allow: { to: { type: ["domain", "core-lib", "utils"] } } },
            {
              from: { type: "core-lib" },
              allow: { to: { type: ["core-lib", "domain", "utils", "env"] } },
            },
            { from: { type: "ui-lib" }, allow: { to: { type: ["core-lib", "domain", "ui-lib"] } } },
            {
              from: { type: "root" },
              allow: {
                to: {
                  type: [
                    "domain",
                    "infrastructure",
                    "api",
                    "ui",
                    "core-lib",
                    "ui-lib",
                    "utils",
                    "env",
                    "root",
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "boundaries/dependencies": "off",
    },
  },
);
