/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DebugStep } from '@thulasidharan96/regex-core';

export interface TimelineMark {
  index: number;
  label: string;
  type: 'match' | 'backtrack' | 'start' | 'end';
}

export function generateTimelineMarks(steps: DebugStep[]): TimelineMark[] {
  const marks: TimelineMark[] = [];
  steps.forEach((step, idx) => {
    if (idx === 0) {
      marks.push({ index: idx, label: 'Start', type: 'start' });
    } else if (idx === steps.length - 1) {
      marks.push({ index: idx, label: step.state === 'success' ? 'Success' : 'Failure', type: 'end' });
    } else if (step.state === 'failure') {
      marks.push({ index: idx, label: `Backtrack`, type: 'backtrack' });
    } else if (step.matched) {
      marks.push({ index: idx, label: `Match`, type: 'match' });
    }
  });
  return marks;
}
