import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";
import tsParser from "@typescript-eslint/parser";

import fsdPlugin from "../src/index.js";

function createEslint() {
  return new ESLint({
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.ts", "**/*.tsx"],
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
    ],
  });
}

async function lintFiles(filePaths) {
  const eslint = createEslint();
  return eslint.lintFiles(filePaths);
}

function getRuleIds(results) {
  return results.flatMap((result) =>
    result.messages.map((message) => message.ruleId),
  );
}

describe("test-project lint fixtures", () => {
  it("keeps representative valid files free of FSD lint errors", async () => {
    const results = await lintFiles([
      "test-project/src/app/index.tsx",
      "test-project/src/pages/dashboard/ui/DashboardPage.tsx",
      "test-project/src/widgets/header/ui/Header.tsx",
      "test-project/src/shared/ui/Button/Button.tsx",
    ]);

    expect(getRuleIds(results)).toEqual([]);
  });

  it("reports expected FSD violations from intentional invalid fixtures", async () => {
    const results = await lintFiles([
      "test-project/src/examples/rule-violations.ts",
      "test-project/src/features/auth/model/authService.ts",
      "test-project/src/features/auth/ui/LoginFormContainer.tsx",
      "test-project/src/features/profile/model/profileService.ts",
    ]);

    expect(getRuleIds(results)).toEqual(
      expect.arrayContaining([
        "fsd/forbidden-imports",
        "fsd/no-cross-slice-dependency",
        "fsd/no-public-api-sidestep",
        "fsd/no-relative-imports",
      ]),
    );
  });
});
