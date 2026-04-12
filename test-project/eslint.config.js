import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import fsdPlugin from "eslint-plugin-fsd-lint";

export default [
  {
    ignores: [
      "src/examples/**",
      "src/**/__tests__/**",
      "src/features/auth/model/authService.ts",
      "src/features/auth/ui/LoginFormContainer.tsx",
      "src/features/profile/model/profileService.ts",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      fsd: fsdPlugin,
    },
    languageOptions: {
      parser: tsparser,
      globals: {
        console: "readonly",
        document: "readonly",
        HTMLButtonElement: "readonly",
        HTMLElement: "readonly",
        setTimeout: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "fsd/forbidden-imports": "error",
      "fsd/no-relative-imports": [
        "error",
        {
          allowSameSlice: true,
        },
      ],
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/no-global-store-imports": "error",
      "fsd/ordered-imports": "error",
    },
  },
];
