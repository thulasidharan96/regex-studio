/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, RangeItem } from '@thulasidharan96/regex-core';

/**
 * Returns a random character within a specified character range.
 */
function getRandomCharFromRange(start: string, end: string): string {
  const codeStart = start.charCodeAt(0);
  const codeEnd = end.charCodeAt(0);
  const randomCode = Math.floor(Math.random() * (codeEnd - codeStart + 1)) + codeStart;
  return String.fromCharCode(randomCode);
}

/**
 * Returns a random character that is NOT in the specified ranges.
 */
function getRandomCharOutsideRanges(ranges: RangeItem[]): string {
  const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
  const rangeCheck = (char: string) => {
    return ranges.some(r => {
      const start = r.start.charCodeAt(0);
      const end = r.end.charCodeAt(0);
      const code = char.charCodeAt(0);
      return code >= start && code <= end;
    });
  };

  for (const char of allowed) {
    if (!rangeCheck(char)) {
      return char;
    }
  }
  return '#'; // Fallback
}

/**
 * Recursively generates a valid matching string for a single ASTNode.
 */
export function generateNodeSample(node: ASTNode): string {
  const props = node.properties || {};
  const type = node.type;
  const value = props.value !== undefined ? props.value : node.value;
  const charType = props.charType !== undefined ? props.charType : node.charType;
  const lookaroundType = props.lookaroundType !== undefined ? props.lookaroundType : node.lookaroundType;
  const groupType = props.groupType !== undefined ? props.groupType : node.groupType;
  const name = props.name !== undefined ? props.name : node.name;
  const quantifier = props.quantifier !== undefined ? props.quantifier : node.quantifier;
  const ranges = props.ranges !== undefined ? props.ranges : node.ranges;
  const negated = props.negated !== undefined ? props.negated : node.negated;

  let baseStr = '';

  switch (type) {
    case 'literal':
      baseStr = value || '';
      break;

    case 'dot':
      baseStr = getRandomCharFromRange('a', 'z');
      break;

    case 'digit':
      baseStr = getRandomCharFromRange('0', '9');
      break;

    case 'word': {
      const pools = ['a', 'z', 'A', 'Z', '0', '9'];
      const poolIdx = Math.floor(Math.random() * 3);
      baseStr = getRandomCharFromRange(pools[poolIdx * 2], pools[poolIdx * 2 + 1]);
      break;
    }

    case 'space':
      baseStr = ' ';
      break;

    case 'character':
      if (charType === 'digit') {
        baseStr = getRandomCharFromRange('0', '9');
      } else if (charType === 'space') {
        baseStr = ' ';
      } else if (charType === 'word') {
        const pools = ['a', 'z', 'A', 'Z', '0', '9'];
        const poolIdx = Math.floor(Math.random() * 3);
        baseStr = getRandomCharFromRange(pools[poolIdx * 2], pools[poolIdx * 2 + 1]);
      } else {
        baseStr = getRandomCharFromRange('a', 'z');
      }
      break;

    case 'charset': {
      if (ranges && ranges.length > 0) {
        if (negated) {
          baseStr = getRandomCharOutsideRanges(ranges);
        } else {
          const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
          baseStr = getRandomCharFromRange(randomRange.start, randomRange.end);
        }
      } else {
        baseStr = 'x';
      }
      break;
    }

    case 'alternation': {
      const children = node.children || [];
      if (children.length > 0) {
        const randomBranch = children[Math.floor(Math.random() * children.length)];
        baseStr = generateNodeSample(randomBranch);
      }
      break;
    }

    case 'alternative':
    case 'captureGroup':
    case 'namedGroup':
    case 'nonCaptureGroup':
    case 'group': {
      const children = node.children || [];
      baseStr = children.map(generateNodeSample).join('');
      break;
    }

    case 'lookaround':
    case 'lookahead':
    case 'lookbehind': {
      // Lookarounds are zero-width assertions, but for sample generation we include their match content
      const children = node.children || [];
      baseStr = children.map(generateNodeSample).join('');
      break;
    }

    case 'backreference':
      // Backreferences match already captured groups; for simplicity, we simulate a standard fallback match
      baseStr = 'abc';
      break;

    case 'anchor':
    case 'startAnchor':
    case 'endAnchor':
    case 'wordBoundary':
      baseStr = ''; // zero-width
      break;
  }

  // Handle quantifiers
  if (quantifier && quantifier.type !== 'none') {
    let repeatCount = 1;
    switch (quantifier.type) {
      case '*':
        repeatCount = Math.floor(Math.random() * 3); // 0 to 2 times
        break;
      case '+':
        repeatCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 times
        break;
      case '?':
        repeatCount = Math.random() > 0.5 ? 1 : 0;
        break;
      case 'custom': {
        const min = quantifier.min || 0;
        const max = quantifier.max === null ? min + 2 : quantifier.max;
        repeatCount = Math.floor(Math.random() * (max - min + 1)) + min;
        break;
      }
    }

    let repeatedStr = '';
    for (let i = 0; i < repeatCount; i++) {
      if (type === 'alternation') {
        // regenerate random branch for each repetition
        repeatedStr += generateNodeSample(node);
      } else {
        repeatedStr += baseStr;
      }
    }
    return repeatedStr;
  }

  return baseStr;
}

/**
 * Generates an array of valid strings that match the given AST layout.
 */
export function generateSample(ast: ASTNode[], count = 5): string[] {
  const samples = new Set<string>();
  // Safeguard looping in case it produces identical outputs
  for (let i = 0; i < count * 4 && samples.size < count; i++) {
    const s = ast.map(generateNodeSample).join('');
    samples.add(s);
  }
  return Array.from(samples);
}

/**
 * PURPOSELY corrupts or mutates a valid sample string to violate regex rules.
 */
export function generateInvalidSample(ast: ASTNode[], count = 3): string[] {
  const valids = generateSample(ast, count);
  return valids.map(valid => {
    if (valid.length === 0) {
      return 'mismatch_str';
    }

    // Mutation strategies:
    const rand = Math.random();
    if (rand < 0.3) {
      // Strategy 1: Replace numbers with alphabetical characters (violates \d)
      return valid.replace(/[0-9]/g, 'X');
    } else if (rand < 0.6) {
      // Strategy 2: Duplicate letters or add special symbols that are rarely allowed
      return valid + '!@#_mismatch';
    } else {
      // Strategy 3: Truncate half of the characters (violates minimum quantifiers/lengths)
      return valid.substring(0, Math.ceil(valid.length / 2));
    }
  });
}
