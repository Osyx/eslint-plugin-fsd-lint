import tsParser from "@typescript-eslint/parser";
import fsdPlugin from "../src/index.js";

const fsdOptions = {
  rootPath: "/test-project-next/src/",
  alias: {
    value: "@",
    withSlash: true,
  },
  layers: {
    pages: {
      pattern: "screens",
    },
  },
  ignoreImportPatterns: ["\\.css$"],
};

export default [
  {
    ignores: [
      "src/entities/user/model/bad-screen-import.ts",
      "src/screens/dashboard/model/bad-cross-screen.ts",
      "src/screens/dashboard/ui/bad-public-api.tsx",
      "src/screens/dashboard/ui/bad-relative.tsx",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      "fsd/forbidden-imports": ["error", fsdOptions],
      "fsd/no-cross-slice-dependency": ["error", fsdOptions],
      "fsd/no-public-api-sidestep": ["error", fsdOptions],
      "fsd/no-relative-imports": [
        "error",
        {
          ...fsdOptions,
          allowSameSlice: true,
        },
      ],
      "fsd/no-global-store-imports": "error",
      "fsd/ordered-imports": ["error", fsdOptions],
    },
  },
];
