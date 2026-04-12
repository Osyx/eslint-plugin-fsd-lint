/**
 * @fileoverview Prevents direct imports from internal files of modules. Use public API (index) instead.
 */

import { mergeConfig } from "../utils/config-utils.js";
import {
  extractLayerFromImportPath,
  isTestFile,
  normalizePath,
} from "../utils/path-utils.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents direct imports from internal files of features, widgets, or entities. All imports must go through index files (public API).",
      recommended: true,
    },
    messages: {
      noDirectImport:
        "🚨 Direct import from '{{ importPath }}' is not allowed. Use the public API (index file) instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  value: { type: "string" },
                  withSlash: { type: "boolean" },
                },
                required: ["value"],
                additionalProperties: false,
              },
            ],
          },
          layers: {
            type: "array",
            items: { type: "string" },
            description:
              "Layers that require using public API (default: ['features', 'entities', 'widgets'])",
          },
          publicApiFiles: {
            type: "array",
            items: { type: "string" },
            description:
              "Files that are considered public API (default: ['index.ts', 'index.tsx', 'index.js', 'index.jsx'])",
          },
          testFilesPatterns: {
            type: "array",
            items: { type: "string" },
          },
          ignoreImportPatterns: {
            type: "array",
            items: { type: "string" },
          },
          allowTypeImports: {
            type: "boolean",
            description: "Allow direct imports of type definitions",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Merge user config with default config
    const options = context.options[0] || {};
    const config = mergeConfig(options);

    // Layers that require public API
    const restrictedLayers = options.layers ||
      config.publicApi?.enforceForLayers || ["features", "entities", "widgets"];

    // Files that are considered public API
    const publicApiFiles = options.publicApiFiles ||
      config.publicApi?.fileNames || [
        "index.ts",
        "index.tsx",
        "index.js",
        "index.jsx",
      ];

    // Allow type imports if configured
    const allowTypeImports = options.allowTypeImports || false;

    return {
      ImportDeclaration(node) {
        const filePath = normalizePath(context.filename);
        const importPath = node.source.value;

        // Skip test files
        if (isTestFile(filePath, config.testFilesPatterns)) {
          return;
        }

        // Check for ignored patterns
        const isIgnored = config.ignoreImportPatterns.some((pattern) => {
          const regex = new RegExp(pattern);
          return regex.test(importPath);
        });

        if (isIgnored) {
          return;
        }

        // Skip relative imports
        if (importPath.startsWith(".")) {
          return;
        }

        // Skip type-only imports if configured
        if (allowTypeImports && node.importKind === "type") {
          return;
        }

        // Get layer from import path
        const importLayer = extractLayerFromImportPath(importPath, config);

        // Skip if not importing from a restricted layer
        if (!importLayer || !restrictedLayers.includes(importLayer)) {
          return;
        }

        // Check if it's importing directly from a public API file
        const normalizedImportPath = normalizePath(importPath);
        const isPublicApiImport = publicApiFiles.some((apiFile) => {
          return (
            normalizedImportPath.endsWith(`/${apiFile}`) ||
            normalizedImportPath.endsWith(`/${apiFile.replace(".ts", "")}`)
          );
        });

        // Also check if it's importing from just the slice (without specific file)
        // Example: @features/auth vs @features/auth/model/slice
        const pathParts = normalizedImportPath.split("/");
        const layerIndex = pathParts.findIndex((part) => {
          const normalizedPart = normalizePath(part);
          // Check if the part contains the layer (e.g., @entities contains entities)
          return (
            normalizedPart === importLayer ||
            normalizedPart.includes(importLayer) ||
            config.layers[importLayer]?.pattern === normalizedPart
          );
        });

        // If import only specifies layer and slice, it's considered a public API import
        const isSliceRootImport =
          layerIndex >= 0 && pathParts.length === layerIndex + 2;

        // Check if it's importing from a segment level (e.g., @entities/user/model, @entities/user/ui, @entities/user/anySegmentName)
        // Any segment name is allowed in FSD architecture
        const isSegmentImport =
          layerIndex >= 0 && pathParts.length === layerIndex + 3;

        // If either a public API file, slice root, or segment root, it's valid
        if (isPublicApiImport || isSliceRootImport || isSegmentImport) {
          return;
        }

        context.report({
          node,
          messageId: "noDirectImport",
          data: {
            importPath,
          },
        });
      },
      CallExpression(node) {
        // Handle dynamic imports
        if (node.callee.type === "Import") {
          const importPath = node.arguments[0].value;

          // Skip relative imports
          if (importPath.startsWith(".")) {
            return;
          }

          // Skip test files
          if (isTestFile(context.filename, config.testFilesPatterns)) {
            return;
          }

          // Check for ignored patterns
          const isIgnored = config.ignoreImportPatterns.some((pattern) => {
            const regex = new RegExp(pattern);
            return regex.test(importPath);
          });

          if (isIgnored) {
            return;
          }

          // Get layer from import path
          const importLayer = extractLayerFromImportPath(importPath, config);

          // Skip if not importing from a restricted layer
          if (!importLayer || !restrictedLayers.includes(importLayer)) {
            return;
          }

          // Check if it's importing directly from a public API file
          const normalizedImportPath = normalizePath(importPath);
          const isPublicApiImport = publicApiFiles.some((apiFile) => {
            return (
              normalizedImportPath.endsWith(`/${apiFile}`) ||
              normalizedImportPath.endsWith(`/${apiFile.replace(".ts", "")}`)
            );
          });

          // Also check if it's importing from just the slice (without specific file)
          const pathParts = normalizedImportPath.split("/");
          const layerIndex = pathParts.findIndex((part) => {
            const normalizedPart = normalizePath(part);
            // Check if the part contains the layer (e.g., @entities contains entities)
            return (
              normalizedPart === importLayer ||
              normalizedPart.includes(importLayer) ||
              config.layers[importLayer]?.pattern === normalizedPart
            );
          });

          // If import only specifies layer and slice, it's considered a public API import
          const isSliceRootImport =
            layerIndex >= 0 && pathParts.length === layerIndex + 2;

          // Check if it's importing from a segment level (e.g., @entities/user/model, @entities/user/ui, @entities/user/anySegmentName)
          // Any segment name is allowed in FSD architecture
          const isSegmentImport =
            layerIndex >= 0 && pathParts.length === layerIndex + 3;

          // If either a public API file, slice root, or segment root, it's valid
          if (isPublicApiImport || isSliceRootImport || isSegmentImport) {
            return;
          }

          context.report({
            node,
            messageId: "noDirectImport",
            data: {
              importPath,
            },
          });
        }
      },
    };
  },
};
