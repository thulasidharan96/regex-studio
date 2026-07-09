/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Comlink from 'comlink';
import { analyzeAST, performanceScore } from '@thulasidharan96/regex-analyzer';

const workerAPI = {
  analyzeAsync(ast: any[]) {
    return analyzeAST(ast);
  },
  performanceScoreAsync(ast: any[]): number {
    return performanceScore(ast);
  }
};

Comlink.expose(workerAPI);
export type AnalyzerWorkerType = typeof workerAPI;
export default {} as any;
