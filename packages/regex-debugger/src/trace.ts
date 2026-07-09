/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DebugStep } from '@thulasidharan96/regex-core';

export function formatTraceLog(steps: DebugStep[]): string {
  return steps
    .map(step => `[Step #${step.stepIndex}] Index: ${step.index} | MatchLen: ${step.matchLength} | State: ${step.state.toUpperCase()} | Desc: ${step.description}`)
    .join('\n');
}
