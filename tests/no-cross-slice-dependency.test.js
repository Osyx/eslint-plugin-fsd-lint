import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import fsdPlugin from "../src/index.js";

function createEslint(ruleOptions = {}) {
  return new ESLint({
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
          parser: tsParser,
          ecmaVersion: 2022,
          sourceType: "module",
        },
        plugins: {
          fsd: fsdPlugin,
        },
        rules: {
          "fsd/no-cross-slice-dependency": ["error", ruleOptions],
        },
      },
    ],
  });
}

async function lintText(code, filePath, ruleOptions) {
  const eslint = createEslint(ruleOptions);
  const [result] = await eslint.lintText(code, { filePath });

  return result.messages;
}

describe("no-cross-slice-dependency", () => {
  it("reports dynamic import expressions", async () => {
    const messages = await lintText(
      'const { authService } = await import("@features/auth/model/service");',
      "src/features/profile/model/profileService.ts",
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      "noFeatureDependency",
    ]);
  });

  it("supports slash-suffixed alias strings", async () => {
    const messages = await lintText(
      'import { authService } from "@/features/auth/model/service";',
      "src/features/profile/model/profileService.ts",
      { alias: "@/" },
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      "noFeatureDependency",
    ]);
  });

  it("deduplicates repeated absolute imports for the same slice pair", async () => {
    const messages = await lintText(
      `
        import { authService } from "@features/auth/model/service";
        import { LoginForm } from "@features/auth/ui/LoginForm";
        const authModule = await import("@features/auth/model/session");
      `,
      "src/features/profile/model/profileService.ts",
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      "noFeatureDependency",
    ]);
  });

  it("deduplicates repeated relative imports for the same slice pair", async () => {
    const messages = await lintText(
      `
        import { authService } from "../../auth/model/service";
        import { LoginForm } from "../../auth/ui/LoginForm";
      `,
      "src/features/profile/ui/ProfilePage.tsx",
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      "noFeatureDependency",
    ]);
  });

  it("ignores nonliteral dynamic import expressions", async () => {
    const messages = await lintText(
      "const authModule = await import(modulePath);",
      "src/features/profile/model/profileService.ts",
    );

    expect(messages).toEqual([]);
  });
});
