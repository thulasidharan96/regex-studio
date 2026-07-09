/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompatibilityMap {
  hasNamedCapture: boolean;
  hasLookbehind: boolean;
  namedCaptureSyntax: 'standard' | 'python' | 'none';
}

export const engineCompatibilities: Record<string, CompatibilityMap> = {
  javascript: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'standard' },
  typescript: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'standard' },
  python: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'python' },
  go: { hasNamedCapture: false, hasLookbehind: false, namedCaptureSyntax: 'none' },
  rust: { hasNamedCapture: true, hasLookbehind: false, namedCaptureSyntax: 'standard' },
  java: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'standard' },
  php: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'standard' },
  csharp: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'standard' },
  ruby: { hasNamedCapture: true, hasLookbehind: true, namedCaptureSyntax: 'standard' },
};
