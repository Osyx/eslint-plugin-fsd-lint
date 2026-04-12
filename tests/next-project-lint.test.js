import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";
import tsParser from "@typescript-eslint/parser";

import fsdPlugin from "../src/index.js";

const standardFsdOptions = {};

const nextFsdOptions = {
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

const renamedLayerOptions = {
  rootPath: "/renamed/src/",
  alias: {
    value: "~",
    withSlash: true,
  },
  layers: {
    app: {
      pattern: "shell",
    },
    processes: {
      pattern: "flows",
    },
    pages: {
      pattern: "screens",
    },
    widgets: {
      pattern: "blocks",
    },
    features: {
      pattern: "actions",
    },
    entities: {
      pattern: "domain",
    },
    shared: {
      pattern: "common",
    },
  },
  ignoreImportPatterns: ["\\.css$"],
};

function createEslint(ruleOptions = nextFsdOptions) {
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
          "fsd/forbidden-imports": ["error", ruleOptions],
          "fsd/no-relative-imports": [
            "error",
            {
              ...ruleOptions,
              allowSameSlice: true,
            },
          ],
          "fsd/no-public-api-sidestep": ["error", ruleOptions],
          "fsd/no-cross-slice-dependency": ["error", ruleOptions],
          "fsd/no-ui-in-business-logic": ["error", ruleOptions],
          "fsd/no-global-store-imports": "error",
          "fsd/ordered-imports": ["error", ruleOptions],
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

async function lintText(code, filePath, options = renamedLayerOptions) {
  const eslint = createEslint(options);
  const [result] = await eslint.lintText(code, { filePath });

  return result.messages.map((message) => message.ruleId);
}

describe("Next.js App Router FSD fixtures", () => {
  it("uses standard FSD folder names by default without a layers override", async () => {
    await expect(
      lintText(
        `
          import { Header } from "@widgets/header";
          import { Button } from "@shared/ui/Button";
        `,
        "standard/src/pages/dashboard/ui/DashboardPage.tsx",
        standardFsdOptions,
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { DashboardPage } from "@pages/dashboard";',
        "standard/src/entities/user/model/user.ts",
        standardFsdOptions,
      ),
    ).resolves.toContain("fsd/forbidden-imports");

    const screenMessages = await lintText(
      'import { DashboardScreen } from "@screens/dashboard";',
      "standard/src/entities/user/model/user.ts",
      standardFsdOptions,
    );

    expect(screenMessages).not.toContain("fsd/forbidden-imports");
  });

  it("keeps valid App Router and screens-layer files free of FSD lint errors", async () => {
    const results = await lintFiles([
      "test-project-next/src/app/layout.tsx",
      "test-project-next/src/app/page.tsx",
      "test-project-next/src/app/api/health/route.ts",
      "test-project-next/src/screens/dashboard/ui/DashboardScreen.tsx",
      "test-project-next/src/screens/dashboard/ui/DashboardTitle.tsx",
      "test-project-next/src/screens/profile/ui/ProfileScreen.tsx",
      "test-project-next/src/widgets/header/ui/Header.tsx",
      "test-project-next/src/features/auth/model/session.ts",
      "test-project-next/src/entities/user/ui/UserCard.tsx",
    ]);

    expect(getRuleIds(results)).toEqual([]);
  });

  it("treats screens as the pages layer for FSD violations", async () => {
    const results = await lintFiles([
      "test-project-next/src/entities/user/model/bad-screen-import.ts",
      "test-project-next/src/screens/dashboard/model/bad-cross-screen.ts",
      "test-project-next/src/screens/dashboard/ui/bad-public-api.tsx",
      "test-project-next/src/screens/dashboard/ui/bad-relative.tsx",
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

  it("supports project-specific folder names for every default FSD layer", async () => {
    await expect(
      lintText(
        `
          import { Header } from "~/blocks/header";
          import { LoginButton } from "~/actions/auth";
          import { UserCard } from "~/domain/user";
          import { Button } from "~/common/ui/Button";
        `,
        "renamed/src/screens/dashboard/ui/DashboardScreen.tsx",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { selectDashboardTitle } from "../model/selectors";',
        "renamed/src/screens/dashboard/ui/DashboardTitle.tsx",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { Header } from "~/blocks/header";',
        "renamed/src/shell/providers/AppProvider.tsx",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { DashboardScreen } from "~/screens/dashboard";',
        "renamed/src/flows/onboarding/ui/Onboarding.tsx",
      ),
    ).resolves.toEqual([]);
  });

  it("reports violations through project-specific folder names", async () => {
    await expect(
      lintText(
        'import { DashboardScreen } from "~/screens/dashboard";',
        "renamed/src/domain/user/model/user.ts",
      ),
    ).resolves.toContain("fsd/forbidden-imports");

    await expect(
      lintText(
        'import { selectProfileTitle } from "~/screens/profile/model/selectors";',
        "renamed/src/screens/dashboard/model/selectors.ts",
      ),
    ).resolves.toEqual(
      expect.arrayContaining([
        "fsd/forbidden-imports",
        "fsd/no-cross-slice-dependency",
      ]),
    );

    await expect(
      lintText(
        'import { startSession } from "~/actions/auth/model/session";',
        "renamed/src/screens/dashboard/ui/DashboardScreen.tsx",
      ),
    ).resolves.toContain("fsd/no-public-api-sidestep");

    await expect(
      lintText(
        'import { selectProfileTitle } from "../../profile/model/selectors";',
        "renamed/src/screens/dashboard/ui/DashboardScreen.tsx",
      ),
    ).resolves.toEqual(
      expect.arrayContaining([
        "fsd/no-cross-slice-dependency",
        "fsd/no-relative-imports",
      ]),
    );

    await expect(
      lintText(
        `
          import { Button } from "~/common/ui/Button";
          import { UserCard } from "~/domain/user";
        `,
        "renamed/src/screens/dashboard/ui/DashboardScreen.tsx",
      ),
    ).resolves.toContain("fsd/ordered-imports");

    await expect(
      lintText(
        'import { UserCard } from "~/domain/user";',
        "renamed/src/common/ui/Button.tsx",
      ),
    ).resolves.toContain("fsd/forbidden-imports");
  });
});
