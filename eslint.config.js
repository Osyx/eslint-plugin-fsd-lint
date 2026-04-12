import eslint from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["**/node_modules/**", "html/**"],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
    },
  },
];
