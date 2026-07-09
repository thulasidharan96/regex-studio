/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TokenType =
  | 'LITERAL'
  | 'DOT'
  | 'ESCAPE'
  | 'GROUP_START'
  | 'GROUP_END'
  | 'BRACKET_START'
  | 'BRACKET_END'
  | 'ALTERNATION'
  | 'QUANTIFIER'
  | 'ANCHOR'
  | 'BACKREFERENCE';

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  properties?: Record<string, any>;
}

export function tokenize(regexStr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < regexStr.length) {
    const char = regexStr[i];
    const start = i;

    // Escaped sequences
    if (char === '\\') {
      if (i + 1 >= regexStr.length) {
        tokens.push({
          type: 'ESCAPE',
          value: '\\',
          start,
          end: i + 1,
          properties: { value: '\\', isTrailingBackslash: true }
        });
        i++;
        continue;
      }
      const escapedChar = regexStr[i + 1];
      let value = '\\' + escapedChar;
      let end = i + 2;

      // Handle backreferences and special multi-character escape sequences (unicode etc.)
      if (escapedChar === 'u' && i + 2 < regexStr.length) {
        // e.g. \u1234 or \u{1234}
        if (regexStr[i + 2] === '{') {
          const closingIndex = regexStr.indexOf('}', i + 3);
          if (closingIndex !== -1) {
            value = regexStr.substring(i, closingIndex + 1);
            end = closingIndex + 1;
          }
        } else if (i + 5 < regexStr.length && /^[0-9a-fA-F]{4}$/.test(regexStr.substring(i + 2, i + 6))) {
          value = regexStr.substring(i, i + 6);
          end = i + 6;
        }
      } else if (escapedChar === 'x' && i + 3 < regexStr.length && /^[0-9a-fA-F]{2}$/.test(regexStr.substring(i + 2, i + 4))) {
        value = regexStr.substring(i, i + 4);
        end = i + 4;
      } else if (/^[1-9]$/.test(escapedChar)) {
        // Check for double digit backreference e.g. \10
        let backrefVal = escapedChar;
        let offset = 2;
        while (i + offset < regexStr.length && /^[0-9]$/.test(regexStr[i + offset])) {
          backrefVal += regexStr[i + offset];
          offset++;
        }
        tokens.push({
          type: 'BACKREFERENCE',
          value: '\\' + backrefVal,
          start,
          end: i + offset,
          properties: { index: parseInt(backrefVal, 10) }
        });
        i += offset;
        continue;
      }

      tokens.push({
        type: 'ESCAPE',
        value,
        start,
        end,
        properties: { value: escapedChar }
      });
      i = end;
      continue;
    }

    // Anchors
    if (char === '^' || char === '$') {
      tokens.push({ type: 'ANCHOR', value: char, start, end: i + 1 });
      i++;
      continue;
    }

    // Dot
    if (char === '.') {
      tokens.push({ type: 'DOT', value: char, start, end: i + 1 });
      i++;
      continue;
    }

    // Alternation
    if (char === '|') {
      tokens.push({ type: 'ALTERNATION', value: char, start, end: i + 1 });
      i++;
      continue;
    }

    // Group Starts and Ends
    if (char === '(') {
      let groupType = 'capture';
      let name: string | undefined = undefined;
      let value = '(';
      let end = i + 1;

      if (regexStr.startsWith('(?:', i)) {
        groupType = 'nonCapture';
        value = '(?:';
        end = i + 3;
      } else if (regexStr.startsWith('(?=', i)) {
        groupType = 'lookahead';
        value = '(?=';
        end = i + 3;
      } else if (regexStr.startsWith('(?!', i)) {
        groupType = 'negativeLookahead';
        value = '(?!';
        end = i + 3;
      } else if (regexStr.startsWith('(?<=', i)) {
        groupType = 'lookbehind';
        value = '(?<=';
        end = i + 4;
      } else if (regexStr.startsWith('(?<!', i)) {
        groupType = 'negativeLookbehind';
        value = '(?<!';
        end = i + 4;
      } else if (regexStr.startsWith('(?<', i)) {
        // Named capture group e.g. (?<name>...)
        const closeBracket = regexStr.indexOf('>', i + 3);
        if (closeBracket !== -1) {
          name = regexStr.substring(i + 3, closeBracket);
          groupType = 'namedCapture';
          value = `(?<${name}>`;
          end = closeBracket + 1;
        }
      }

      tokens.push({
        type: 'GROUP_START',
        value,
        start,
        end,
        properties: { groupType, name }
      });
      i = end;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'GROUP_END', value: char, start, end: i + 1 });
      i++;
      continue;
    }

    // Brackets (Charsets)
    if (char === '[') {
      tokens.push({ type: 'BRACKET_START', value: char, start, end: i + 1 });
      i++;
      continue;
    }

    if (char === ']') {
      tokens.push({ type: 'BRACKET_END', value: char, start, end: i + 1 });
      i++;
      continue;
    }

    // Quantifiers
    if (char === '*' || char === '+' || char === '?') {
      let lazy = false;
      let end = i + 1;
      if (i + 1 < regexStr.length && regexStr[i + 1] === '?') {
        lazy = true;
        end = i + 2;
      }
      tokens.push({
        type: 'QUANTIFIER',
        value: regexStr.substring(i, end),
        start,
        end,
        properties: { quantifierType: char, lazy }
      });
      i = end;
      continue;
    }

    if (char === '{') {
      const closeBrace = regexStr.indexOf('}', i);
      if (closeBrace !== -1) {
        const content = regexStr.substring(i + 1, closeBrace);
        // Valid custom quantifier formats: {n}, {n,}, {n,m}
        if (/^\d+(,\d*)?$/.test(content)) {
          const parts = content.split(',');
          const min = parseInt(parts[0], 10);
          const max = parts.length === 1 ? min : parts[1] === '' ? null : parseInt(parts[1], 10);
          let lazy = false;
          let end = closeBrace + 1;
          if (closeBrace + 1 < regexStr.length && regexStr[closeBrace + 1] === '?') {
            lazy = true;
            end = closeBrace + 2;
          }
          tokens.push({
            type: 'QUANTIFIER',
            value: regexStr.substring(i, end),
            start,
            end,
            properties: { quantifierType: 'custom', min, max, lazy }
          });
          i = end;
          continue;
        }
      }
    }

    // Literals
    tokens.push({ type: 'LITERAL', value: char, start, end: i + 1 });
    i++;
  }

  return tokens;
}
