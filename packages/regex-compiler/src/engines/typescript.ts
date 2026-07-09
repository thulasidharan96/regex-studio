/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';
import { compileJS } from './javascript';
import { CompilerOptions } from '../compiler';

export function compileTS(nodes: ASTNode[]): string {
  return compileJS(nodes);
}

export function generateCode(ast: ASTNode[], options?: CompilerOptions): string {
  return compileTS(ast);
}
