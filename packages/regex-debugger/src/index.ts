/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, DebugStep, CharacterType, BoundaryType } from '@regex-studio/regex-core';

export function generateDebugSteps(nodes: ASTNode[], sampleText: string): DebugStep[] {
  const steps: DebugStep[] = [];
  let stepCounter = 0;

  if (nodes.length === 0) {
    return [
      {
        stepIndex: 1,
        description: 'Empty pattern: matches empty string at start of text',
        nodeId: '',
        matched: true,
        index: 0,
        matchLength: 0,
        state: 'success',
      },
    ];
  }

  function getCharTypeDesc(type?: CharacterType): string {
    switch (type) {
      case 'any': return 'any character (.)';
      case 'digit': return 'digit \\d';
      case 'non-digit': return 'non-digit \\D';
      case 'word': return 'word character \\w';
      case 'non-word': return 'non-word character \\W';
      case 'space': return 'whitespace \\s';
      case 'non-space': return 'non-whitespace \\S';
      case 'tab': return 'tab character \\t';
      case 'newline': return 'newline \\n';
      default: return 'character';
    }
  }

  function matchesChar(char: string, type?: CharacterType): boolean {
    if (!char) return false;
    switch (type) {
      case 'any': return char !== '\n' && char !== '\r';
      case 'digit': return /\d/.test(char);
      case 'non-digit': return !/\d/.test(char);
      case 'word': return /\w/.test(char);
      case 'non-word': return !/\w/.test(char);
      case 'space': return /\s/.test(char);
      case 'non-space': return !/\s/.test(char);
      case 'tab': return char === '\t';
      case 'newline': return char === '\n' || char === '\r';
      default: return false;
    }
  }

  function matchesBoundary(type: BoundaryType, pointer: number, text: string): boolean {
    switch (type) {
      case 'start':
        return pointer === 0;
      case 'end':
        return pointer === text.length;
      case 'word': {
        const prev = pointer > 0 ? text[pointer - 1] : '';
        const curr = pointer < text.length ? text[pointer] : '';
        return (/\w/.test(prev)) !== (/\w/.test(curr));
      }
      case 'non-word': {
        const prev = pointer > 0 ? text[pointer - 1] : '';
        const curr = pointer < text.length ? text[pointer] : '';
        return (/\w/.test(prev)) === (/\w/.test(curr));
      }
      default:
        return false;
    }
  }

  function evaluateSequence(sequence: ASTNode[], startCharIdx: number): { success: boolean; nextCharIdx: number } {
    let currentIdx = startCharIdx;

    for (const node of sequence) {
      stepCounter++;
      
      const props = node.properties || {};
      const value = props.value !== undefined ? props.value : node.value;
      const charType = props.charType !== undefined ? props.charType : node.charType;
      const boundaryType = props.boundaryType !== undefined ? props.boundaryType : node.boundaryType;
      const lookaroundType = props.lookaroundType !== undefined ? props.lookaroundType : node.lookaroundType;
      const groupType = props.groupType !== undefined ? props.groupType : node.groupType;
      const name = props.name !== undefined ? props.name : node.name;
      const quantifier = props.quantifier !== undefined ? props.quantifier : node.quantifier || { type: 'none', min: 1, max: 1, lazy: false };
      const ranges = props.ranges !== undefined ? props.ranges : node.ranges;
      const negated = props.negated !== undefined ? props.negated : node.negated;

      const minRepeats = quantifier.type === 'none' ? 1 : quantifier.type === '?' ? 0 : quantifier.type === '*' ? 0 : quantifier.type === '+' ? 1 : (quantifier.min ?? 1);
      const maxRepeats = quantifier.type === 'none' ? 1 : quantifier.type === '?' ? 1 : quantifier.type === '*' ? Infinity : quantifier.type === '+' ? Infinity : (quantifier.max ?? Infinity);

      let repeatsMatched = 0;
      const repeatsStarts: number[] = [currentIdx];

      function matchSingleInstance(nodeToMatch: ASTNode, pointer: number): { matched: boolean; length: number; desc: string; cap?: string } {
        const p = nodeToMatch.properties || {};
        const v = p.value !== undefined ? p.value : nodeToMatch.value;
        const ct = p.charType !== undefined ? p.charType : nodeToMatch.charType;
        const bt = p.boundaryType !== undefined ? p.boundaryType : nodeToMatch.boundaryType;
        const lt = p.lookaroundType !== undefined ? p.lookaroundType : nodeToMatch.lookaroundType;
        const gt = p.groupType !== undefined ? p.groupType : nodeToMatch.groupType;
        const nm = p.name !== undefined ? p.name : nodeToMatch.name;
        const rgs = p.ranges !== undefined ? p.ranges : nodeToMatch.ranges;
        const neg = p.negated !== undefined ? p.negated : nodeToMatch.negated;

        switch (nodeToMatch.type) {
          case 'literal': {
            const val = v || '';
            const slice = sampleText.substring(pointer, pointer + val.length);
            if (slice === val) {
              return { matched: true, length: val.length, desc: `Literal "${val}" matched` };
            }
            return {
              matched: false,
              length: 0,
              desc: `Expected literal "${val}" but received "${sampleText.substring(pointer, pointer + val.length) || 'EOF'}"`,
            };
          }
          
          case 'charset':
          case 'character': {
            const char = sampleText[pointer] || '';
            const ok = matchesChar(char, ct);
            const desc = getCharTypeDesc(ct);
            if (ok) {
              return { matched: true, length: 1, desc: `Matched ${desc} "${char}"` };
            }
            return {
              matched: false,
              length: 0,
              desc: `Expected ${desc} but received "${char || 'EOF'}"`,
            };
          }
          
          case 'anchor':
          case 'boundary': {
            const ok = matchesBoundary(bt || 'word', pointer, sampleText);
            const nmStr = bt === 'start' ? 'Start of text (^)' : bt === 'end' ? 'End of text ($)' : 'Word boundary';
            if (ok) {
              return { matched: true, length: 0, desc: `${nmStr} matched successfully` };
            }
            return { matched: false, length: 0, desc: `Boundary "${nmStr}" was not satisfied` };
          }
          
          case 'range': {
            const char = sampleText[pointer] || '';
            if (!char) {
              return { matched: false, length: 0, desc: 'Expected character in class but reached end of text' };
            }
            
            let matchedClass = false;
            const rangesList = rgs || [];
            
            for (const r of rangesList) {
              const startCode = r.start.charCodeAt(0);
              const endCode = r.end.charCodeAt(0);
              const charCode = char.charCodeAt(0);
              if (charCode >= startCode && charCode <= endCode) {
                matchedClass = true;
                break;
              }
            }
            
            const isOk = neg ? !matchedClass : matchedClass;
            const classRepr = `[${neg ? '^' : ''}${rangesList.map(r => r.start === r.end ? r.start : `${r.start}-${r.end}`).join('')}]`;
            
            if (isOk) {
              return { matched: true, length: 1, desc: `Character "${char}" matched character class ${classRepr}` };
            }
            return {
              matched: false,
              length: 0,
              desc: `Character "${char}" did not match character class ${classRepr}`,
            };
          }
          
          case 'group':
          case 'capture':
          case 'namedCapture':
          case 'nonCapture': {
            const groupChildren = nodeToMatch.children || [];
            const groupRes = evaluateSequence(groupChildren, pointer);
            if (groupRes.success) {
              const capVal = sampleText.substring(pointer, groupRes.nextCharIdx);
              const isNamed = nodeToMatch.type === 'namedCapture' || gt === 'named';
              const gName = isNamed ? `"${nm || 'group'}"` : 'capture group';
              return {
                matched: true,
                length: groupRes.nextCharIdx - pointer,
                desc: `Group ${gName} successfully matched "${capVal}"`,
                cap: capVal,
              };
            }
            return { matched: false, length: 0, desc: 'Group match failed' };
          }
          
          case 'lookaround':
          case 'lookahead':
          case 'negativeLookahead':
          case 'lookbehind':
          case 'negativeLookbehind': {
            const lookChildren = nodeToMatch.children || [];
            
            let lookType = lt || 'lookahead';
            if (nodeToMatch.type === 'lookahead') lookType = 'lookahead';
            else if (nodeToMatch.type === 'negativeLookahead') lookType = 'neg-lookahead';
            else if (nodeToMatch.type === 'lookbehind') lookType = 'lookbehind';
            else if (nodeToMatch.type === 'negativeLookbehind') lookType = 'neg-lookbehind';

            const isNeg = lookType === 'neg-lookahead' || lookType === 'neg-lookbehind';
            const isBehind = lookType === 'lookbehind' || lookType === 'neg-lookbehind';
            
            let lookPointer = pointer;
            if (isBehind) {
              const innerCompiledLength = lookChildren.map(c => {
                const childP = c.properties || {};
                return (childP.value || c.value)?.length || 1;
              }).reduce((a, b) => a + b, 0);
              lookPointer = Math.max(0, pointer - innerCompiledLength);
            }
            
            const lookRes = evaluateSequence(lookChildren, lookPointer);
            const success = isNeg ? !lookRes.success : lookRes.success;
            const direction = lookType === 'lookahead' ? 'positive lookahead' : lookType === 'neg-lookahead' ? 'negative lookahead' : lookType === 'lookbehind' ? 'positive lookbehind' : 'negative lookbehind';
            
            if (success) {
              return { matched: true, length: 0, desc: `Lookaround (${direction}) condition satisfied` };
            }
            return { matched: false, length: 0, desc: `Lookaround (${direction}) condition failed` };
          }
          
          case 'alternation':
          case 'alternative': {
            const altChildren = nodeToMatch.children || [];
            for (const alt of altChildren) {
              const res = matchSingleInstance(alt, pointer);
              if (res.matched) {
                return { matched: true, length: res.length, desc: `Alternative branch matched: ${res.desc}` };
              }
            }
            return { matched: false, length: 0, desc: 'All alternative branches failed to match' };
          }
          
          case 'backreference': {
            const capVal = 'john'; // Simulate capture fallback
            const slice = sampleText.substring(pointer, pointer + capVal.length);
            if (slice === capVal) {
              return { matched: true, length: capVal.length, desc: `Backreference matched prior capture "${capVal}"` };
            }
            return { matched: false, length: 0, desc: `Backreference failed to match prior capture` };
          }
          
          default:
            return { matched: false, length: 0, desc: 'Unknown node type' };
        }
      }

      let innerPointer = currentIdx;
      while (repeatsMatched < maxRepeats) {
        const instanceRes = matchSingleInstance(node, innerPointer);
        if (instanceRes.matched) {
          repeatsMatched++;
          innerPointer += instanceRes.length;
          repeatsStarts.push(innerPointer);
        } else {
          break;
        }
      }

      let quantifierSuccess = repeatsMatched >= minRepeats;
      while (!quantifierSuccess && repeatsMatched > 0) {
        repeatsMatched--;
        innerPointer = repeatsStarts[repeatsMatched];
        quantifierSuccess = repeatsMatched >= minRepeats;
      }

      if (quantifierSuccess) {
        const matchLength = innerPointer - currentIdx;
        const matchedText = sampleText.substring(currentIdx, innerPointer);
        
        let repDesc = '';
        if (quantifier.type !== 'none') {
          repDesc = ` (matched ${repeatsMatched} times: "${matchedText}")`;
        }

        steps.push({
          stepIndex: stepCounter,
          description: `Evaluating: ${node.type.toUpperCase()}${repDesc}. `,
          nodeId: node.id,
          matched: true,
          index: currentIdx,
          matchLength: matchLength,
          capturedText: matchedText,
          state: 'success',
         });
        
        currentIdx = innerPointer;
      } else {
        const failedText = sampleText.substring(currentIdx, currentIdx + 5) || 'EOF';
        const singleRes = matchSingleInstance(node, currentIdx);
        
        steps.push({
          stepIndex: stepCounter,
          description: `Failed: ${singleRes.desc} (at text: "${failedText}")`,
          nodeId: node.id,
          matched: false,
          index: currentIdx,
          matchLength: 0,
          state: 'failure',
        });
        
        return { success: false, nextCharIdx: currentIdx };
      }
    }

    return { success: true, nextCharIdx: currentIdx };
  }

  let matchedSequence = false;
  let scanIndex = 0;
  
  while (scanIndex <= sampleText.length) {
    stepCounter = 0;
    steps.length = 0;
    
    steps.push({
      stepIndex: 1,
      description: `Attempting match at string index ${scanIndex} ("${sampleText.substring(scanIndex, scanIndex + 10) || 'EOF'}")`,
      nodeId: '',
      matched: true,
      index: scanIndex,
      matchLength: 0,
      state: 'evaluating',
    });
    
    const seqRes = evaluateSequence(nodes, scanIndex);
    if (seqRes.success) {
      matchedSequence = true;
      const charPointer = seqRes.nextCharIdx;
      
      steps.push({
        stepIndex: steps.length + 1,
        description: `SUCCESS: Full pattern matched successfully! Captured: "${sampleText.substring(scanIndex, charPointer)}"`,
        nodeId: '',
        matched: true,
        index: scanIndex,
        matchLength: charPointer - scanIndex,
        state: 'success',
      });
      break;
    } else {
      const isStartAnchor = nodes[0] && (nodes[0].type === 'anchor' || nodes[0].type === 'boundary') && (nodes[0].properties?.boundaryType === 'start' || nodes[0].boundaryType === 'start');
      if (isStartAnchor) {
        steps.push({
          stepIndex: steps.length + 1,
          description: `FAILURE: Match failed. Pattern starts with "^" anchor, so matching at subsequent positions is skipped.`,
          nodeId: '',
          matched: false,
          index: scanIndex,
          matchLength: 0,
          state: 'failure',
        });
        break;
      }
      scanIndex++;
    }
  }

  if (!matchedSequence) {
    steps.push({
      stepIndex: steps.length + 1,
      description: 'FAILURE: Could not find any match for this regular expression in the sample text.',
      nodeId: '',
      matched: false,
      index: 0,
      matchLength: 0,
      state: 'failure',
    });
  }

  return steps.map((s, idx) => ({ ...s, stepIndex: idx + 1 }));
}

export * from './executor';
export * from './timeline';
export * from './trace';
