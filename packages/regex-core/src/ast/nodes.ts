/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CharacterType =
  | 'any'        // .
  | 'digit'      // \d
  | 'non-digit'  // \D
  | 'word'       // \w
  | 'non-word'   // \W
  | 'space'      // \s
  | 'non-space'  // \S
  | 'tab'        // \t
  | 'newline';   // \n

export type BoundaryType =
  | 'start'      // ^
  | 'end'        // $
  | 'word'       // \b
  | 'non-word';  // \B

export type LookaroundType =
  | 'lookahead'      // (?=...)
  | 'neg-lookahead'  // (?!...)
  | 'lookbehind'     // (?<=...)
  | 'neg-lookbehind'; // (?<!...)

export type GroupType =
  | 'capture'        // (...)
  | 'named'          // (?<name>...)
  | 'non-capture';   // (?:...)

export type QuantifierType = 'none' | '*' | '+' | '?' | 'custom';

export interface Quantifier {
  type: QuantifierType;
  min: number;
  max: number | null; // null means infinite (e.g., + or *)
  lazy: boolean;
}

export interface RangeItem {
  id: string;
  start: string;
  end: string;
}

export interface ASTNodePosition {
  start: number;
  end: number;
}

export type RegexNodeType =
  | 'literal'
  | 'dot'
  | 'digit'
  | 'word'
  | 'space'
  | 'charset'
  | 'range'
  | 'captureGroup'
  | 'namedGroup'
  | 'nonCaptureGroup'
  | 'alternation'
  | 'quantifier'
  | 'lazyQuantifier'
  | 'startAnchor'
  | 'endAnchor'
  | 'wordBoundary'
  | 'lookahead'
  | 'negativeLookahead'
  | 'lookbehind'
  | 'negativeLookbehind'
  | 'backreference'
  | 'character' // preset like \d
  | 'group'
  | 'capture'
  | 'namedCapture'
  | 'nonCapture'
  | 'lookaround'
  | 'boundary'
  | 'anchor'
  | 'alternative';

// Unified structure for ASTNode / RegexNode
export interface ASTNode {
  id: string;
  type: RegexNodeType;
  children?: ASTNode[];
  position?: ASTNodePosition;
  location?: ASTNodePosition;
  
  properties?: {
    value?: string;
    charType?: CharacterType;
    boundaryType?: BoundaryType;
    lookaroundType?: LookaroundType;
    groupType?: GroupType;
    name?: string;
    quantifier?: Quantifier;
    ranges?: RangeItem[];
    negated?: boolean;
    [key: string]: any;
  };

  // Backwards compatibility legacy flat properties
  value?: string;
  charType?: CharacterType;
  boundaryType?: BoundaryType;
  lookaroundType?: LookaroundType;
  groupType?: GroupType;
  name?: string;
  quantifier?: Quantifier;
  ranges?: RangeItem[];
  negated?: boolean;
}

// Alias for RegexNode
export type RegexNode = ASTNode;

export interface DebugStep {
  stepIndex: number;
  description: string;
  nodeId: string;
  matched: boolean;
  index: number;         // current pointer in sample text
  matchLength: number;   // length of current match
  capturedText?: string; // what was captured at this step
  state: 'success' | 'failure' | 'evaluating';
}

export interface AnalysisIssue {
  id: string;
  severity: 'high' | 'warning' | 'info';
  title: string;
  description: string;
  nodeId?: string;
}

export interface MatchGroup {
  key: string;
  val: string;
}

export interface MatchResult {
  matches: {
    text: string;
    index: number;
    groups: MatchGroup[];
  }[];
  error?: string;
}
