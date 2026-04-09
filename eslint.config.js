import eslint from "@eslint/js";

export default [
  {
    ignores: ["**/node_modules/**", "html/**"],
  },
  eslint.configs.recommended,
];
