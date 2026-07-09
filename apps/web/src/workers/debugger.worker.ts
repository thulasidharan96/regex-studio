/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Comlink from 'comlink';
import { generateDebugSteps } from '@regex-studio/regex-debugger';

const workerAPI = {
  debugAsync(ast: any[], sampleText: string) {
    return generateDebugSteps(ast, sampleText);
  }
};

Comlink.expose(workerAPI);
export type DebuggerWorkerType = typeof workerAPI;
export default {} as any;
