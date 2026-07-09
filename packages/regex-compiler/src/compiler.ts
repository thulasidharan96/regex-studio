/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, Quantifier } from '@regex-studio/regex-core';
import { escapeLiteral } from './escape';
import { compilePrettyNode } from './formatter';

export interface CompilerOptions {
  minify?: boolean;
  engine?: 'javascript' | 'python' | 'java' | 'rust' | 'pcre' | 'typescript' | 'go';
  mode?: 'compact' | 'pretty';
}

export function compileQuantifier(q?: Quantifier, engine: CompilerOptions['engine'] = 'javascript'): string {
  if (!q || q.type === 'none') return '';
  
  let result = '';
  switch (q.type) {
    case '*':
      result = '*';
      break;
    case '+':
      result = '+';
      break;
    case '?':
      result = '?';
      break;
    case 'custom':
      if (q.min === q.max) {
        result = `{${q.min}}`;
      } else if (q.max === null) {
        result = `{${q.min},}`;
      } else {
        result = `{${q.min},${q.max}}`;
      }
      break;
  }
  
  if (q.lazy) {
    result += '?';
  }
  
  return result;
}

export function compileASTNode(
  node: ASTNode,
  options: CompilerOptions = {}
): string {
  const engine = options.engine || 'javascript';
  const mode = options.mode || 'compact';

  if (mode === 'pretty') {
    return compilePrettyNode(node, 0);
  }

  let inner = '';
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

  switch (type) {
    case 'literal':
      inner = escapeLiteral(value || '');
      break;
      
    case 'dot':
      inner = '.';
      break;
      
    case 'digit':
      inner = '\\d';
      break;

    case 'word':
      inner = '\\w';
      break;

    case 'space':
      inner = '\\s';
      break;

    case 'character':
      switch (charType) {
        case 'any': inner = '.'; break;
        case 'digit': inner = '\\d'; break;
        case 'non-digit': inner = '\\D'; break;
        case 'word': inner = '\\w'; break;
        case 'non-word': inner = '\\W'; break;
        case 'space': inner = '\\s'; break;
        case 'non-space': inner = '\\S'; break;
        case 'tab': inner = '\\t'; break;
        case 'newline': inner = '\\n'; break;
        default: inner = '';
      }
      break;
      
    case 'startAnchor':
      inner = '^';
      break;

    case 'endAnchor':
      inner = '$';
      break;

    case 'wordBoundary':
      inner = '\\b';
      break;

    case 'anchor':
    case 'boundary':
      switch (boundaryType) {
        case 'start': inner = '^'; break;
        case 'end': inner = '$'; break;
        case 'word': inner = '\\b'; break;
        case 'non-word': inner = '\\B'; break;
      }
      break;
      
    case 'range':
      {
        const rangeList = ranges || [];
        const rangeStr = rangeList
          .map(r => {
            if (r.start === r.end) return escapeLiteral(r.start);
            return `${escapeLiteral(r.start)}-${escapeLiteral(r.end)}`;
          })
          .join('');
        inner = `[${negated ? '^' : ''}${rangeStr || ' '}]`;
      }
      break;

    case 'charset': {
      const childrenCompiled = (node.children || [])
        .map(c => {
          if (c.type === 'range') {
            const start = c.properties?.start || '';
            const end = c.properties?.end || '';
            if (start === end) return escapeLiteral(start);
            return `${escapeLiteral(start)}-${escapeLiteral(end)}`;
          }
          const val = c.properties?.value || c.value || '';
          return escapeLiteral(val);
        })
        .join('');
      inner = `[${negated ? '^' : ''}${childrenCompiled || ' '}]`;
      break;
    }
      
    case 'group': {
      const groupInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      switch (groupType) {
        case 'capture':
          inner = `(${groupInner})`;
          break;
        case 'named':
          if (engine === 'python' || engine === 'pcre') {
            inner = `(?P<${name || 'group'}>${groupInner})`;
          } else {
            inner = `(?<${name || 'group'}>${groupInner})`;
          }
          break;
        case 'non-capture':
          inner = `(?:${groupInner})`;
          break;
        default:
          inner = `(${groupInner})`;
      }
      break;
    }

    case 'captureGroup': {
      const groupInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      inner = `(${groupInner})`;
      break;
    }

    case 'namedGroup': {
      const groupInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      if (engine === 'python' || engine === 'pcre') {
        inner = `(?P<${name || 'group'}>${groupInner})`;
      } else {
        inner = `(?<${name || 'group'}>${groupInner})`;
      }
      break;
    }

    case 'nonCaptureGroup': {
      const groupInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      inner = `(?:${groupInner})`;
      break;
    }
      
    case 'lookaround': {
      const lookInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      switch (lookaroundType) {
        case 'lookahead': inner = `(?=${lookInner})`; break;
        case 'neg-lookahead': inner = `(?!${lookInner})`; break;
        case 'lookbehind': inner = `(?<=${lookInner})`; break;
        case 'neg-lookbehind': inner = `(?<!${lookInner})`; break;
        default: inner = `(?=${lookInner})`;
      }
      break;
    }

    case 'lookahead': {
      const lookInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      inner = `(?=${lookInner})`;
      break;
    }

    case 'negativeLookahead': {
      const lookInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      inner = `(?!${lookInner})`;
      break;
    }

    case 'lookbehind': {
      const lookInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      inner = `(?<=${lookInner})`;
      break;
    }

    case 'negativeLookbehind': {
      const lookInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      inner = `(?<!${lookInner})`;
      break;
    }
      
    case 'alternation':
    case 'alternative': {
      const altInners = (node.children || []).map(c => compileASTNode(c, options));
      if (altInners.length === 0) {
        inner = '';
      } else if (altInners.length === 1) {
        inner = altInners[0];
      } else {
        inner = `(?:${altInners.join('|')})`;
      }
      break;
    }
      
    case 'backreference':
      inner = `\\${value || '1'}`;
      break;

    case 'quantifier':
    case 'lazyQuantifier': {
      const childInner = (node.children || []).map(c => compileASTNode(c, options)).join('');
      const qStr = compileQuantifier(quantifier, engine);
      return `${childInner}${qStr}`;
    }
  }
  
  const qStr = compileQuantifier(quantifier, engine);
  
  if (qStr && type === 'literal' && (value || '').length > 1) {
    return `(?:${inner})${qStr}`;
  }
  
  return `${inner}${qStr}`;
}

export function compileAST(nodes: ASTNode[], options: CompilerOptions = {}): string {
  if (options.mode === 'pretty') {
    return nodes.map(n => compilePrettyNode(n, 0)).join('\n');
  }
  return nodes.map(n => compileASTNode(n, options)).join('');
}

export function compileFlags(flags: {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}): string {
  let result = '';
  if (flags.global) result += 'g';
  if (flags.ignoreCase) result += 'i';
  if (flags.multiline) result += 'm';
  if (flags.dotAll) result += 's';
  if (flags.unicode) result += 'u';
  if (flags.sticky) result += 'y';
  return result;
}
