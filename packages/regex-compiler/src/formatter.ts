/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, Quantifier } from '@regex-studio/regex-core';

export function getIndent(level: number): string {
  return '  '.repeat(level);
}

export function getQuantifierDescription(q?: Quantifier): string {
  if (!q) return '';
  let repeats = '';
  switch (q.type) {
    case '*': repeats = 'zero or more times'; break;
    case '+': repeats = 'one or more times'; break;
    case '?': repeats = 'zero or one time (optional)'; break;
    case 'custom':
      if (q.min === q.max) {
        repeats = `exactly ${q.min} times`;
      } else if (q.max === null) {
        repeats = `${q.min} or more times`;
      } else {
        repeats = `between ${q.min} and ${q.max} times`;
      }
      break;
  }
  if (q.lazy) {
    repeats += ' (lazy)';
  }
  return repeats;
}

export function compilePrettyNode(node: ASTNode, level: number): string {
  const indent = getIndent(level);
  const props = node.properties || {};
  const type = node.type;
  const value = props.value !== undefined ? props.value : node.value;
  const name = props.name !== undefined ? props.name : node.name;
  const quantifier = props.quantifier !== undefined ? props.quantifier : node.quantifier;
  const negated = props.negated !== undefined ? props.negated : node.negated;

  let desc = '';

  switch (type) {
    case 'literal':
      desc = `${indent}Literal "${value || ''}"`;
      break;
    case 'dot':
      desc = `${indent}Any character (except newline)`;
      break;
    case 'digit':
      desc = `${indent}Digit (0-9)`;
      break;
    case 'word':
      desc = `${indent}Word character (a-z, A-Z, 0-9, _)`;
      break;
    case 'space':
      desc = `${indent}Whitespace character`;
      break;
    case 'startAnchor':
      desc = `${indent}Start of line/string`;
      break;
    case 'endAnchor':
      desc = `${indent}End of line/string`;
      break;
    case 'wordBoundary':
      desc = `${indent}Word boundary`;
      break;
    case 'range': {
      const start = props.start || '';
      const end = props.end || '';
      desc = `${indent}Range [${start} to ${end}]`;
      break;
    }
    case 'charset': {
      const content = (node.children || [])
        .map(c => {
          if (c.type === 'range') return `${c.properties?.start}-${c.properties?.end}`;
          return c.properties?.value || c.value || '';
        })
        .join(', ');
      desc = `${indent}${negated ? 'None of these characters' : 'One of these characters'}: [${content}]`;
      break;
    }
    case 'captureGroup': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Capture Group\n${childrenDesc}`;
      break;
    }
    case 'namedGroup': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Named Group: "${name || 'unnamed'}"\n${childrenDesc}`;
      break;
    }
    case 'nonCaptureGroup': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Non-capturing Group\n${childrenDesc}`;
      break;
    }
    case 'lookahead': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Lookahead Assertion\n${childrenDesc}`;
      break;
    }
    case 'negativeLookahead': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Negative Lookahead Assertion\n${childrenDesc}`;
      break;
    }
    case 'lookbehind': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Lookbehind Assertion\n${childrenDesc}`;
      break;
    }
    case 'negativeLookbehind': {
      const childrenDesc = (node.children || []).map(c => compilePrettyNode(c, level + 1)).join('\n');
      desc = `${indent}Negative Lookbehind Assertion\n${childrenDesc}`;
      break;
    }
    case 'alternation': {
      const childrenDesc = (node.children || [])
        .map((alt, idx) => {
          const innerDesc = (alt.children || []).map(c => compilePrettyNode(c, level + 2)).join('\n');
          return `${getIndent(level + 1)}Option ${idx + 1}:\n${innerDesc}`;
        })
        .join('\n');
      desc = `${indent}Alternation (Or)\n${childrenDesc}`;
      break;
    }
    case 'backreference':
      desc = `${indent}Backreference to Group #${value || '1'}`;
      break;
    case 'quantifier':
    case 'lazyQuantifier': {
      const childDesc = (node.children || []).map(c => compilePrettyNode(c, level)).join('\n');
      const qDesc = getQuantifierDescription(quantifier);
      desc = `${childDesc}\n${indent}  repeat ${qDesc}`;
      break;
    }
    default:
      desc = `${indent}Node [${type}]`;
  }

  if (type !== 'quantifier' && type !== 'lazyQuantifier' && quantifier && quantifier.type !== 'none') {
    const qDesc = getQuantifierDescription(quantifier);
    desc += `\n${indent}  repeat ${qDesc}`;
  }

  return desc;
}
