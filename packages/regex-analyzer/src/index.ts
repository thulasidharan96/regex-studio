/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';

export interface AnalysisIssue {
  id: string;
  severity: 'high' | 'warning' | 'info';
  message: string;
  explanation: string;
  fix: string;
  location: string; // node ID or path
  title?: string; // legacy support
  description?: string; // legacy support
  nodeId?: string; // legacy support
}

export function performanceScore(nodes: ASTNode[]): number {
  const issues = analyzeAST(nodes);
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === 'high') {
      score -= 30;
    } else if (issue.severity === 'warning') {
      score -= 15;
    } else {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function analyzeAST(nodes: ASTNode[]): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  function hasBackreferences(nodesList: ASTNode[]): boolean {
    for (const node of nodesList) {
      const p = node.properties || {};
      const type = node.type;
      if (type === 'backreference') return true;
      if (node.children && hasBackreferences(node.children)) return true;
    }
    return false;
  }

  const globalHasBackreference = hasBackreferences(nodes);

  function checkNode(node: ASTNode, parentQuantifier?: boolean, ancestorQuantifiers: any[] = []) {
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

    const hasQuantifier = quantifier && quantifier.type !== 'none';
    const isInfiniteQuantifier = quantifier && (quantifier.type === '*' || quantifier.type === '+');

    const currentAncestorQuantifiers = hasQuantifier 
      ? [...ancestorQuantifiers, quantifier]
      : ancestorQuantifiers;

    // 1. CATASTROPHIC BACKTRACKING / NESTED QUANTIFIERS / REDoS / EVIL REGEX
    if (parentQuantifier && hasQuantifier && isInfiniteQuantifier) {
      const msg = 'Catastrophic Backtracking (Evil Regex/ReDoS)';
      const exp = 'Nested repeat quantifiers (e.g. `(a+)+` or `(a*)*`) create an exponential search tree. When matched against nearly-matching input strings, this can easily lock up the browser or server CPU indefinitely.';
      const fix = 'Simplify the nested repetition. Merge them into a single quantifier or use non-overlapping character classes.';
      issues.push({
        id: Math.random().toString(36).substring(2, 9),
        severity: 'high',
        message: msg,
        explanation: exp,
        fix,
        location: node.id,
        title: msg,
        description: exp,
        nodeId: node.id
      });
    }

    // 2. AMBIGUOUS REPETITION & OVERLAPPING TOKENS / ALTERNATIVES
    if (type === 'alternation' || type === 'alternative') {
      const branches = node.children || [];
      if (branches.length > 5) {
        const msg = 'Large Alternation Class';
        const exp = `The alternation contains ${branches.length} branches. Large alternations can degrade match performance.`;
        const fix = 'Consider using character classes [a-z] or splitting matching phases if possible.';
        issues.push({
          id: Math.random().toString(36).substring(2, 9),
          severity: 'info',
          message: msg,
          explanation: exp,
          fix,
          location: node.id,
          title: msg,
          description: exp,
          nodeId: node.id
        });
      }

      // Check if branches overlap (e.g. \d+|\w+ or a|a)
      const compiledBranches = branches.map(b => {
        const bp = b.properties || {};
        return bp.value || b.value || b.type;
      });
      const uniqueBranches = new Set(compiledBranches);
      if (uniqueBranches.size < compiledBranches.length) {
        const msg = 'Ambiguous Overlapping Alternation';
        const exp = 'The alternation contains duplicate or fully overlapping branches. This causes the matching engine to redundantly traverse paths twice, which increases backtracking overhead.';
        const fix = 'Remove duplicate alternative branches or refine them to be mutually exclusive.';
        issues.push({
          id: Math.random().toString(36).substring(2, 9),
          severity: 'warning',
          message: msg,
          explanation: exp,
          fix,
          location: node.id,
          title: msg,
          description: exp,
          nodeId: node.id
        });
      }
    }

    // 3. LEADING GREEDY WILD CARD
    if (node === nodes[0] && (type === 'character' || type === 'charset') && charType === 'any' && hasQuantifier) {
      const msg = 'Leading Broad Wildcard';
      const exp = 'Starting a pattern with a greedy wildcard like `.*` forces the engine to scan the entire string to the end and then backtrack character by character.';
      const fix = 'Use anchors like `^` or a more specific character class if possible.';
      issues.push({
        id: Math.random().toString(36).substring(2, 9),
        severity: 'info',
        message: msg,
        explanation: exp,
        fix,
        location: node.id,
        title: msg,
        description: exp,
        nodeId: node.id
      });
    }

    // 4. UNUSED CAPTURES
    const isCapture = type === 'capture' || (type === 'group' && groupType === 'capture') || type === 'captureGroup';
    if (isCapture && !globalHasBackreference) {
      const msg = 'Unreferenced Capture Group';
      const exp = 'This group is capturing but never referenced by backreferences. If you do not extract this group match in code, change it to a non-capturing group `(?:...)` to save runtime heap and boost execution speed.';
      const fix = 'Convert this to a non-capturing group (?:...) or name it if intended for extraction.';
      issues.push({
        id: Math.random().toString(36).substring(2, 9),
        severity: 'info',
        message: msg,
        explanation: exp,
        fix,
        location: node.id,
        title: msg,
        description: exp,
        nodeId: node.id
      });
    }

    // 5. DUPLICATE RANGES & IMPOSSIBLE RANGE BOUNDARIES [z-a]
    if (type === 'range' && ranges) {
      for (const r of ranges) {
        if (r.start.charCodeAt(0) > r.end.charCodeAt(0)) {
          const msg = 'Impossible Range Boundary';
          const exp = `The character range [${r.start}-${r.end}] is invalid. The start character "${r.start}" (ASCII ${r.start.charCodeAt(0)}) is greater than the end character "${r.end}" (ASCII ${r.end.charCodeAt(0)}), which throws a syntax error in many runtime engines.`;
          const fix = `Swap the range boundary characters to [${r.end}-${r.start}].`;
          issues.push({
            id: Math.random().toString(36).substring(2, 9),
            severity: 'high',
            message: msg,
            explanation: exp,
            fix,
            location: node.id,
            title: msg,
            description: exp,
            nodeId: node.id
          });
        }
      }

      const seenChars = new Set<string>();
      const seenRanges = new Set<string>();
      for (const r of ranges) {
        const key = `${r.start}-${r.end}`;
        if (seenRanges.has(key)) {
          const msg = 'Duplicate Range';
          const exp = `The range [${key}] is specified multiple times inside the character class, which is redundant and slows down state evaluation.`;
          const fix = 'Remove the redundant duplicate range.';
          issues.push({
            id: Math.random().toString(36).substring(2, 9),
            severity: 'warning',
            message: msg,
            explanation: exp,
            fix,
            location: node.id,
            title: msg,
            description: exp,
            nodeId: node.id
          });
        }
        seenRanges.add(key);

        if (r.start === r.end) {
          if (seenChars.has(r.start)) {
            const msg = 'Duplicate Character in Class';
            const exp = `The character "${r.start}" is duplicated inside the character class, which is redundant.`;
            const fix = 'Remove duplicate characters from the character set.';
            issues.push({
              id: Math.random().toString(36).substring(2, 9),
              severity: 'warning',
              message: msg,
              explanation: exp,
              fix,
              location: node.id,
              title: msg,
              description: exp,
              nodeId: node.id
            });
          }
          seenChars.add(r.start);
        }
      }
    }

    // 6. VARIABLE-LENGTH LOOKBEHINDS (safari compatibility)
    const isLookbehind = type === 'lookbehind' || (type === 'lookaround' && (lookaroundType === 'lookbehind' || lookaroundType === 'neg-lookbehind'));
    if (isLookbehind) {
      const containsVariableLength = (children?: ASTNode[]): boolean => {
        if (!children) return false;
        for (const child of children) {
          const cp = child.properties || {};
          const cq = cp.quantifier || child.quantifier;
          if (cq && (cq.type === '*' || cq.type === '+' || cq.type === 'custom')) {
            return true;
          }
          if (child.children && containsVariableLength(child.children)) {
            return true;
          }
        }
        return false;
      };

      if (containsVariableLength(node.children)) {
        const msg = 'Variable-length Lookbehind';
        const exp = 'This lookbehind contains a variable-length quantifier (*, +, etc.). Variable-length lookbehinds are not supported in Safari versions older than 16.4 or older browser versions.';
        const fix = 'Convert to lookahead or use a fixed-length quantifier instead of variable-length repeats.';
        issues.push({
          id: Math.random().toString(36).substring(2, 9),
          severity: 'warning',
          message: msg,
          explanation: exp,
          fix,
          location: node.id,
          title: msg,
          description: exp,
          nodeId: node.id
        });
      }
    }

    // Recurse children
    if (node.children) {
      for (const child of node.children) {
        checkNode(child, parentQuantifier || hasQuantifier, currentAncestorQuantifiers);
      }
    }
  }

  // Check consecutive nodes for ambiguous double repeat (e.g. .*.* or \d+\d+)
  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i + 1];
    const propA = nodeA.properties || {};
    const propB = nodeB.properties || {};

    const hasQA = (propA.quantifier || nodeA.quantifier) && (propA.quantifier || nodeA.quantifier)?.type !== 'none';
    const hasQB = (propB.quantifier || nodeB.quantifier) && (propB.quantifier || nodeB.quantifier)?.type !== 'none';

    if (hasQA && hasQB && nodeA.type === nodeB.type) {
      if (nodeA.type === 'character' && propA.charType === propB.charType) {
        const msg = 'Ambiguous Consecutive Repetition';
        const exp = `Consecutive repeated tokens of the same type (e.g., duplicated matching classes like \\d+\\d+) create intense state backtracking.`;
        const fix = 'Merge them into a single quantifier, e.g., \\d{2,} instead of \\d+\\d+.';
        issues.push({
          id: Math.random().toString(36).substring(2, 9),
          severity: 'warning',
          message: msg,
          explanation: exp,
          fix,
          location: nodeA.id,
          title: msg,
          description: exp,
          nodeId: nodeA.id
        });
      }
    }
  }

  for (const node of nodes) {
    checkNode(node);
  }

  return issues;
}
