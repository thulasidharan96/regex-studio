/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, Quantifier } from '@thulasidharan96/regex-core';
import { compileAST } from '@thulasidharan96/regex-compiler';

/**
 * Explains a single AST node in plain English.
 */
export function explainNode(node: ASTNode, indentLevel: number = 0): string {
  const props = node.properties || {};
  const type = node.type;
  const value = props.value !== undefined ? props.value : node.value;
  const charType = props.charType !== undefined ? props.charType : node.charType;
  const boundaryType = props.boundaryType !== undefined ? props.boundaryType : node.boundaryType;
  const lookaroundType = props.lookaroundType !== undefined ? props.lookaroundType : node.lookaroundType;
  const groupType = props.groupType !== undefined ? props.groupType : node.groupType;
  const name = props.name !== undefined ? props.name : node.name;
  const quantifier = props.quantifier !== undefined ? props.quantifier : node.quantifier;
  const ranges = props.ranges !== undefined ? props.ranges : node.ranges;
  const negated = props.negated !== undefined ? props.negated : node.negated;

  const indent = '  '.repeat(indentLevel);
  let explanation = '';

  // 1. Core Node Description
  switch (type) {
    case 'literal':
      explanation = `Match the literal text "${value || ''}"`;
      break;
    case 'dot':
      explanation = `Match any single character (except a newline)`;
      break;
    case 'digit':
      explanation = `Match any decimal digit [0-9]`;
      break;
    case 'word':
      explanation = `Match any alphanumeric character or underscore [a-zA-Z0-9_]`;
      break;
    case 'space':
      explanation = `Match any whitespace character (spaces, tabs, line breaks)`;
      break;
    case 'character':
      if (charType === 'digit') {
        explanation = `Match any decimal digit [0-9]`;
      } else if (charType === 'word') {
        explanation = `Match any alphanumeric character or underscore [a-zA-Z0-9_]`;
      } else if (charType === 'space') {
        explanation = `Match any whitespace character (spaces, tabs, line breaks)`;
      } else {
        explanation = `Match a special character class (type: ${charType || 'unknown'})`;
      }
      break;
    case 'charset': {
      const rangeList = (ranges || []).map(r => `${r.start}-${r.end}`).join(', ');
      explanation = `Match any single character ${negated ? 'NOT ' : ''}in the set [${rangeList || 'empty'}]`;
      break;
    }
    case 'captureGroup':
      explanation = `Capture Group: save the enclosed match for backreferencing`;
      break;
    case 'namedGroup':
      explanation = `Named Capture Group "${name || 'unnamed'}": save matches under this name`;
      break;
    case 'nonCaptureGroup':
      explanation = `Non-Capturing Group: group elements together without saving results`;
      break;
    case 'group':
      if (groupType === 'capture') {
        explanation = `Capture Group: save the enclosed match for backreferencing`;
      } else if (groupType === 'named') {
        explanation = `Named Capture Group "${name || 'unnamed'}": save matches under this name`;
      } else if (groupType === 'non-capture') {
        explanation = `Non-Capturing Group: group elements together without saving results`;
      } else {
        explanation = `Group: cluster elements (type: ${groupType || 'standard'})`;
      }
      break;
    case 'alternation':
      explanation = `Alternation (OR operator): match one of the nested choices`;
      break;
    case 'alternative':
      explanation = `Alternative branch`;
      break;
    case 'startAnchor':
      explanation = `Assert position at the start of a line or string (^)`;
      break;
    case 'endAnchor':
      explanation = `Assert position at the end of a line or string ($)`;
      break;
    case 'wordBoundary':
      explanation = `Assert position at a word boundary (\\b)`;
      break;
    case 'anchor':
      if (boundaryType === 'start') {
        explanation = `Assert position at the start of a line or string (^)`;
      } else if (boundaryType === 'end') {
        explanation = `Assert position at the end of a line or string ($)`;
      } else {
        explanation = `Boundary assertion (type: ${boundaryType || 'unknown'})`;
      }
      break;
    case 'boundary':
      if (boundaryType === 'word') {
        explanation = `Assert position at a word boundary (\\b)`;
      } else {
        explanation = `Boundary assertion (type: ${boundaryType || 'unknown'})`;
      }
      break;
    case 'lookaround':
      explanation = `${lookaroundType === 'lookahead' ? 'Lookahead' : lookaroundType === 'neg-lookahead' ? 'Negative Lookahead' : lookaroundType === 'lookbehind' ? 'Lookbehind' : 'Negative Lookbehind'} assertion`;
      break;
    case 'lookahead':
      explanation = `Lookahead assertion: assert the following pattern matches`;
      break;
    case 'negativeLookahead':
      explanation = `Negative Lookahead assertion: assert the following pattern does NOT match`;
      break;
    case 'lookbehind':
      explanation = `Lookbehind assertion: assert the preceding pattern matches`;
      break;
    case 'negativeLookbehind':
      explanation = `Negative Lookbehind assertion: assert the preceding pattern does NOT match`;
      break;
    case 'backreference':
      explanation = `Backreference: match the identical characters captured by group #${value || '1'}`;
      break;
    default:
      explanation = `Evaluate regular expression component (${type})`;
  }

  // 2. Append Quantifier detail if present
  if (quantifier && quantifier.type !== 'none') {
    let qDetails = '';
    switch (quantifier.type) {
      case '*':
        qDetails = 'zero or more times';
        break;
      case '+':
        qDetails = 'one or more times';
        break;
      case '?':
        qDetails = 'zero or one time (optional)';
        break;
      case 'custom':
        if (quantifier.min === quantifier.max) {
          qDetails = `exactly ${quantifier.min} times`;
        } else if (quantifier.max === null) {
          qDetails = `${quantifier.min} or more times`;
        } else {
          qDetails = `between ${quantifier.min} and ${quantifier.max} times`;
        }
        break;
    }
    if (quantifier.lazy) {
      qDetails += ' (non-greedy / lazy)';
    }
    explanation += `, repeated ${qDetails}`;
  }

  return `${indent}${explanation}`;
}

/**
 * Traverses an AST recursively and produces a plain English explanation sequence.
 */
export function explainAST(ast: ASTNode[], indentLevel: number = 0): string[] {
  const result: string[] = [];

  ast.forEach((node, idx) => {
    const header = indentLevel === 0 ? `${idx + 1}. ` : '';
    const desc = explainNode(node, indentLevel);
    result.push(`${header}${desc}`);

    if (node.children && node.children.length > 0) {
      const childExplanations = explainAST(node.children, indentLevel + 1);
      result.push(...childExplanations);
    }
  });

  return result;
}

export interface IntelligenceIssue {
  nodeId?: string;
  message: string;
  recommendation: string;
}

/**
 * Scans AST for potential visual or engine improvements.
 */
export function suggestImprovement(ast: ASTNode[]): IntelligenceIssue[] {
  const issues: IntelligenceIssue[] = [];

  function traverse(nodes: ASTNode[]) {
    nodes.forEach(node => {
      const props = node.properties || {};
      const type = node.type;
      const value = props.value !== undefined ? props.value : node.value;
      const ranges = props.ranges !== undefined ? props.ranges : node.ranges;

      // 1. Check for custom character ranges matching [0-9]
      if (type === 'charset' && ranges && ranges.length === 1) {
        const r = ranges[0];
        if (r.start === '0' && r.end === '9') {
          issues.push({
            nodeId: node.id,
            message: `Found character range [0-9]`,
            recommendation: `Simplify to '\\d' (digit character node) for cleaner, engine-neutral representation.`
          });
        }
        if (r.start === 'a' && r.end === 'z' && ranges.length === 1) {
          // just information
        }
      }

      // 2. Alternations with single character literals (e.g. (a|b|c) -> [abc])
      if (type === 'alternation' || type === 'alternative') {
        const children = node.children || [];
        const allSingleChars = children.length > 1 && children.every(child => {
          if (child.type === 'literal') {
            const v = child.properties?.value || child.value || '';
            return v.length === 1;
          }
          return false;
        });

        if (allSingleChars) {
          const charList = children.map(child => child.properties?.value || child.value || '').join('');
          issues.push({
            nodeId: node.id,
            message: `Found alternations of single literal characters: (${children.map(c => c.properties?.value || c.value).join('|')})`,
            recommendation: `Convert alternation to a character set '[${charList}]'. Sets perform faster and eliminate backtracking overhead.`
          });
        }
      }

      // Recurse
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(ast);
  return issues;
}

/**
 * Clones and simplifies simple syntactic parts of an AST without changing match behavior.
 */
export function simplifyRegex(ast: ASTNode[]): ASTNode[] {
  return ast.map(node => {
    // Clone node
    const clone: ASTNode = {
      ...node,
      properties: node.properties ? { ...node.properties } : undefined
    };

    const props = clone.properties || {};
    const type = clone.type;
    const ranges = props.ranges !== undefined ? props.ranges : clone.ranges;

    // Simplify range [0-9] -> digit
    if (type === 'charset' && ranges && ranges.length === 1) {
      const r = ranges[0];
      if (r.start === '0' && r.end === '9' && !props.negated && !clone.negated) {
        return {
          id: clone.id,
          type: 'digit',
          properties: {
            charType: 'digit',
            quantifier: props.quantifier || clone.quantifier
          }
        };
      }
    }

    // Simplify alternation of single characters to character sets
    if (type === 'alternation' && clone.children && clone.children.length > 1) {
      const allSingleLiterals = clone.children.every(child => {
        if (child.type === 'literal') {
          const v = child.properties?.value || child.value || '';
          return v.length === 1;
        }
        return false;
      });

      if (allSingleLiterals) {
        const characterRanges = clone.children.map(child => {
          const val = child.properties?.value || child.value || '';
          return { id: child.id, start: val, end: val };
        });

        return {
          id: clone.id,
          type: 'charset',
          properties: {
            negated: false,
            ranges: characterRanges,
            quantifier: props.quantifier || clone.quantifier
          }
        };
      }
    }

    // Recurse children
    if (clone.children) {
      clone.children = simplifyRegex(clone.children);
    }

    return clone;
  });
}

/**
 * High-level optimizeRegex function implementing multiple optimization passes over an AST.
 */
export function optimizeRegex(ast: ASTNode[]): ASTNode[] {
  // Pass 1: Simplify ranges and alternations
  let optimized = simplifyRegex(ast);

  // Pass 2: Clean duplicate consecutive nodes or empty branches if any
  optimized = optimized.filter((node, idx) => {
    if (node.type === 'literal' && (node.properties?.value || node.value) === '') {
      return false; // strip empty literals
    }
    return true;
  });

  return optimized;
}

export interface BeforeAfterReport {
  beforeStr: string;
  afterStr: string;
  list: {
    before: string;
    after: string;
    description: string;
  }[];
}

/**
 * Compiles and returns a structural comparison before and after optimization.
 */
export function compareBeforeAfter(beforeAST: ASTNode[], afterAST: ASTNode[]): BeforeAfterReport {
  const beforeStr = compileAST(beforeAST);
  const afterStr = compileAST(afterAST);
  const list: BeforeAfterReport['list'] = [];

  // Generate log of specific improvements
  const improvements = suggestImprovement(beforeAST);
  improvements.forEach(imp => {
    list.push({
      before: imp.message,
      after: imp.recommendation,
      description: 'Optimization Pass Applied'
    });
  });

  if (list.length === 0 && beforeStr !== afterStr) {
    list.push({
      before: beforeStr,
      after: afterStr,
      description: 'Simplified nested structure components'
    });
  }

  return {
    beforeStr,
    afterStr,
    list
  };
}
