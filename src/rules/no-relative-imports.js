/**
 * @fileoverview Prevents relative imports between slices. All imports should use absolute paths with aliases.
 */

import { isRelativePath, isTestFile, normalizePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';
import path from 'path';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevents relative imports between slices. Use absolute paths with aliases instead.',
      recommended: true,
    },
    messages: {
      noRelativeImport: '🚨 Relative imports are not allowed. Use absolute imports with aliases instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          testFilesPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreImportPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          allowTypeImports: {
            type: 'boolean',
            description: 'Allow relative imports for type-only imports',
          },
          allowSameSlice: {
            type: 'boolean',
            description: 'Allow relative imports within the same slice',
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

    // Allow type imports if configured
    const allowTypeImports = options.allowTypeImports || false;

    // Allow same slice imports if configured (default: true)
    const allowSameSlice = options.allowSameSlice !== undefined ? options.allowSameSlice : true;

    // Helper function to check if import is within the same slice
    function isSameSlice(importPath, currentFilePath) {
      if (!allowSameSlice) return false;

      const normalizedCurrentPath = normalizePath(currentFilePath);
      // Get the base directory of the current file
      const currentDir = path.posix.dirname(normalizedCurrentPath);
      // Resolve the import path relative to the current file
      const resolvedImportPath = path.posix.normalize(path.posix.resolve(currentDir, importPath));

      // FSD layers we need to check
      const fsdLayers = ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'];
      
      // Layers that don't have slices (single-layer modules)
      const singleLayerModules = ['app', 'shared'];
      
      // Find layer and slice from current file path
      const currentPathParts = normalizedCurrentPath.split('/');
      let currentLayer = null;
      let currentSlice = null;
      let layerIndex = -1;
      
      for (let i = 0; i < currentPathParts.length; i++) {
        if (fsdLayers.includes(currentPathParts[i])) {
          currentLayer = currentPathParts[i];
          layerIndex = i;
          // The slice is the next part after the layer (if it exists and layer has slices)
          if (i + 1 < currentPathParts.length && !singleLayerModules.includes(currentLayer)) {
            currentSlice = currentPathParts[i + 1];
          }
          break;
        }
      }
      
      // If we couldn't find a layer, we can't determine if it's same slice
      if (!currentLayer || layerIndex === -1) return false;
      
      // For single-layer modules (app, shared), any import within the layer is allowed
      if (singleLayerModules.includes(currentLayer)) {
        // Check if the resolved import is within the same layer
        return resolvedImportPath.includes(`/${currentLayer}/`);
      }
      
      // Find layer and slice from resolved import path
      const resolvedPathParts = resolvedImportPath.split('/');
      let importLayer = null;
      let importSlice = null;
      let importLayerIndex = -1;
      
      for (let i = 0; i < resolvedPathParts.length; i++) {
        if (fsdLayers.includes(resolvedPathParts[i])) {
          importLayer = resolvedPathParts[i];
          importLayerIndex = i;
          // The slice is the next part after the layer (if it exists and layer has slices)
          if (i + 1 < resolvedPathParts.length && !singleLayerModules.includes(importLayer)) {
            importSlice = resolvedPathParts[i + 1];
          }
          break;
        }
      }
      
      // If we couldn't find a layer in the import, it might be within the same slice
      if (!importLayer || importLayerIndex === -1) {
        // Check if the resolved path is still within the current layer/slice structure
        if (currentSlice) {
          return resolvedImportPath.includes(`/${currentLayer}/${currentSlice}/`);
        } else {
          // For single-layer modules without slices
          return resolvedImportPath.includes(`/${currentLayer}/`);
        }
      }
      
      // For single-layer modules, just check if layers match
      if (singleLayerModules.includes(currentLayer) || singleLayerModules.includes(importLayer)) {
        return currentLayer === importLayer;
      }
      
      // Check if both layer and slice match
      return currentLayer === importLayer && currentSlice === importSlice;
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip if not a relative import
        if (!isRelativePath(importPath)) {
          return;
        }

        // Skip test files
        if (isTestFile(context.getFilename(), config.testFilesPatterns)) {
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

        // Skip type-only imports if configured
        if (allowTypeImports && node.importKind === 'type') {
          return;
        }

        // Skip same slice imports if configured
        if (allowSameSlice && isSameSlice(importPath, context.getFilename())) {
          return;
        }

        context.report({
          node,
          messageId: 'noRelativeImport',
        });
      },
      CallExpression(node) {
        // Handle dynamic imports
        if (node.callee.type === 'Import') {
          const importPath = node.arguments[0].value;

          // Skip if not a relative import
          if (!isRelativePath(importPath)) {
            return;
          }

          // Skip test files
          if (isTestFile(context.getFilename(), config.testFilesPatterns)) {
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

          // For dynamic imports, we can't check if it's a type import
          // as that information is not available at parse time

          // Skip same slice imports if configured
          if (allowSameSlice && isSameSlice(importPath, context.getFilename())) {
            return;
          }

          context.report({
            node,
            messageId: 'noRelativeImport',
          });
        }
      },
    };
  },
};
