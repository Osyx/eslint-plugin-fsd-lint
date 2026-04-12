/**
 * @fileoverview Path processing utility functions
 */

// Path cache
const pathCache = new Map();

/**
 * Normalize file path (compatible with all operating systems)
 * @param {string} filePath - File path to normalize
 * @return {string} - Normalized path
 */
export function normalizePath(filePath) {
  if (pathCache.has(filePath)) {
    return pathCache.get(filePath);
  }

  // Convert Windows backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, "/");

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, "/");

  // Remove trailing slash
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  // Cache result
  pathCache.set(filePath, normalized);
  return normalized;
}

/**
 * Extract path segments
 * @param {string} filePath - Path to analyze
 * @return {string[]} - Array of path segments
 */
export function getPathSegments(filePath) {
  const normalized = normalizePath(filePath);
  return normalized.split("/").filter((segment) => segment.length > 0);
}

/**
 * Check if path is relative
 * @param {string} filePath - Path to check
 * @return {boolean} - Whether the path is relative
 */
export function isRelativePath(filePath) {
  return (
    filePath.startsWith("./") ||
    filePath.startsWith("../") ||
    filePath === "." ||
    filePath === ".."
  );
}

/**
 * Extract relative path from source root
 * @param {string} filePath - File path
 * @param {string} rootPattern - Root directory pattern (default: '/src/')
 * @return {string|null} - Extracted relative path or null
 */
export function getRelativePathFromRoot(filePath, rootPattern = "/src/") {
  const normalizedPath = normalizePath(filePath);
  const rootIndex = normalizedPath.indexOf(rootPattern);

  if (rootIndex === -1) return null;

  return normalizedPath.substring(rootIndex + rootPattern.length);
}

/**
 * Get the configured folder name for a layer.
 * @param {string} layer - Layer key
 * @param {Object} config - Configuration object
 * @return {string} - Configured layer folder pattern
 */
export function getLayerPattern(layer, config) {
  return config.layers[layer]?.pattern || layer;
}

/**
 * Find a configured layer by a path segment.
 * @param {string} segment - Path segment to match
 * @param {Object} config - Configuration object
 * @return {string|null} - Matching layer key or null
 */
export function findLayerBySegment(segment, config) {
  return (
    Object.keys(config.layers).find(
      (layer) =>
        layer === segment || getLayerPattern(layer, config) === segment,
    ) || null
  );
}

/**
 * Remove the configured import alias from an import path.
 * @param {string} importPath - Path from import statement
 * @param {Object} config - Configuration object
 * @return {string|null} - Path after alias or null when alias does not match
 */
export function getImportPathWithoutAlias(importPath, config) {
  if (isRelativePath(importPath)) {
    return null;
  }

  const aliasConfig = config.alias;
  const aliasValue = normalizePath(aliasConfig.value);
  const withSlash = aliasConfig.withSlash;
  const normalizedPath = normalizePath(importPath);

  const aliasPatterns = withSlash
    ? [`${aliasValue}/`]
    : [aliasValue, `${aliasValue}/`];

  const matchingPattern = aliasPatterns.find((pattern) =>
    normalizedPath.startsWith(pattern),
  );

  if (!matchingPattern) {
    return null;
  }

  let pathWithoutAlias = normalizedPath.substring(matchingPattern.length);

  if (pathWithoutAlias.startsWith("/")) {
    pathWithoutAlias = pathWithoutAlias.substring(1);
  }

  return pathWithoutAlias;
}

/**
 * Extract layer from import path considering alias
 * @param {string} importPath - Path from import statement
 * @param {Object} config - Configuration object
 * @return {string|null} - Extracted layer or null
 */
export function extractLayerFromImportPath(importPath, config) {
  const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);
  if (!pathWithoutAlias) return null;

  // First path segment is the layer
  const firstSegment = pathWithoutAlias.split("/")[0];

  // Check if it matches any layer
  return findLayerBySegment(firstSegment, config);
}

/**
 * Extract slice info from an aliased import path.
 * @param {string} importPath - Path from import statement
 * @param {Object} config - Configuration object
 * @return {string|null} - Extracted slice name or null
 */
export function extractSliceFromImportPath(importPath, config) {
  const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);
  if (!pathWithoutAlias) return null;

  const segments = pathWithoutAlias.split("/");
  if (segments.length < 2) return null;

  const layer = findLayerBySegment(segments[0], config);
  if (!layer) return null;

  return segments[1];
}

/**
 * Extract FSD layer info from file path
 * @param {string} filePath - File path to analyze
 * @param {Object} config - Layer configuration and folder pattern options
 * @return {string|null} - Extracted layer name or null
 */
export function extractLayerFromPath(filePath, config) {
  const relativePath = getRelativePathFromRoot(filePath, config.rootPath);
  if (!relativePath) return null;

  const firstDir = relativePath.split("/")[0];

  // Handle folder pattern if enabled
  if (config.folderPattern?.enabled) {
    const regex = new RegExp(config.folderPattern.regex);
    const match = firstDir.match(regex);

    if (match && match[config.folderPattern.extractionGroup]) {
      const extracted = match[config.folderPattern.extractionGroup];

      // Check if extracted name matches any layer
      return Object.keys(config.layers).find(
        (layer) =>
          config.layers[layer].pattern === extracted || layer === extracted,
      );
    }
  }

  // Default layer matching if no folder pattern or no match
  return findLayerBySegment(firstDir, config);
}

/**
 * Extract slice info from file path
 * @param {string} filePath - File path to analyze
 * @param {Object} config - Configuration options
 * @return {string|null} - Extracted slice name or null
 */
export function extractSliceFromPath(filePath, config) {
  const relativePath = getRelativePathFromRoot(filePath, config?.rootPath);
  if (!relativePath) return null;

  const segments = relativePath.split("/");
  if (segments.length < 2) return null;

  // Second segment is typically the slice
  return segments[1];
}

/**
 * Check if file is a test file
 * @param {string} filePath - File path to check
 * @param {string[]} patterns - Array of test file patterns
 * @return {boolean} - Whether it's a test file
 */
export function isTestFile(filePath, patterns) {
  return patterns.some((pattern) => {
    // Support simple wildcard patterns
    const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");

    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  });
}
