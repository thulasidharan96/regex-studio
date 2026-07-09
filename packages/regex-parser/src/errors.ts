/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParserError {
  position: number;
  expected?: string;
  suggestion: string;
  message: string;
  error?: string; // added for requested format
}
