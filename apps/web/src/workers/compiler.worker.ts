/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Comlink from 'comlink';
import { compileAST } from '@thulasidharan96/regex-compiler';

const workerAPI = {
  compileAsync(ast: any[], options?: any): string {
    return compileAST(ast, options);
  }
};

Comlink.expose(workerAPI);
export type CompilerWorkerType = typeof workerAPI;
export default {} as any;
