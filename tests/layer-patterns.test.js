import { describe, expect, it } from "vitest";

import { mergeConfig } from "../src/utils/config-utils.js";
import {
  extractLayerFromImportPath,
  extractLayerFromPath,
  extractSliceFromImportPath,
} from "../src/utils/path-utils.js";

describe("layer folder patterns", () => {
  it("uses built-in FSD folder names by default", () => {
    const config = mergeConfig();

    expect(config.layers.app.pattern).toBe("app");
    expect(config.layers.processes.pattern).toBe("processes");
    expect(config.layers.pages.pattern).toBe("pages");
    expect(config.layers.widgets.pattern).toBe("widgets");
    expect(config.layers.features.pattern).toBe("features");
    expect(config.layers.entities.pattern).toBe("entities");
    expect(config.layers.shared.pattern).toBe("shared");

    expect(
      extractLayerFromPath("/repo/src/pages/dashboard/ui/Page.tsx", config),
    ).toBe("pages");
    expect(extractLayerFromImportPath("@pages/dashboard", config)).toBe(
      "pages",
    );
    expect(extractLayerFromImportPath("@screens/dashboard", config)).toBeNull();
  });

  it("changes only the configured folder patterns and keeps canonical layer keys", () => {
    const config = mergeConfig({
      layers: {
        pages: {
          pattern: "screens",
        },
      },
    });

    expect(config.layers.pages.pattern).toBe("screens");
    expect(config.layers.widgets.pattern).toBe("widgets");
    expect(config.layers.pages.allowedToImport).toEqual([
      "widgets",
      "features",
      "entities",
      "shared",
    ]);

    expect(
      extractLayerFromPath("/repo/src/screens/dashboard/ui/Page.tsx", config),
    ).toBe("pages");
    expect(extractLayerFromImportPath("@screens/dashboard", config)).toBe(
      "pages",
    );
    expect(extractSliceFromImportPath("@screens/dashboard/model", config)).toBe(
      "dashboard",
    );
  });

  it("supports project-specific folder names for every built-in FSD layer", () => {
    const config = mergeConfig({
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
    });

    expect(
      extractLayerFromPath("/repo/src/shell/providers/App.tsx", config),
    ).toBe("app");
    expect(
      extractLayerFromPath("/repo/src/flows/onboarding/index.ts", config),
    ).toBe("processes");
    expect(
      extractLayerFromPath("/repo/src/screens/home/index.ts", config),
    ).toBe("pages");
    expect(
      extractLayerFromPath("/repo/src/blocks/header/index.ts", config),
    ).toBe("widgets");
    expect(
      extractLayerFromPath("/repo/src/actions/auth/index.ts", config),
    ).toBe("features");
    expect(extractLayerFromPath("/repo/src/domain/user/index.ts", config)).toBe(
      "entities",
    );
    expect(extractLayerFromPath("/repo/src/common/ui/Button.tsx", config)).toBe(
      "shared",
    );

    expect(extractLayerFromImportPath("~/screens/home", config)).toBe("pages");
    expect(extractLayerFromImportPath("~/domain/user", config)).toBe(
      "entities",
    );
    expect(extractSliceFromImportPath("~/actions/auth/model", config)).toBe(
      "auth",
    );
  });
});
