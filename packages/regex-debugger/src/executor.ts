/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DebugStep, ASTNode } from '@thulasidharan96/regex-core';
import { generateDebugSteps } from './index';

export class DebuggerExecutor {
  private steps: DebugStep[] = [];
  private currentStepIndex = 0;
  private timer: any = null;
  private onStepCallback?: (step: DebugStep, index: number) => void;
  private onStateChangeCallback?: (state: 'playing' | 'paused' | 'stopped') => void;
  private playSpeed = 1000;

  constructor(nodes: ASTNode[], sampleText: string) {
    this.steps = generateDebugSteps(nodes, sampleText);
    this.currentStepIndex = 0;
  }

  getSteps(): DebugStep[] {
    return this.steps;
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  getCurrentStep(): DebugStep | null {
    if (this.steps.length === 0) return null;
    return this.steps[this.currentStepIndex] || null;
  }

  stepForward(): DebugStep | null {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      const step = this.getCurrentStep();
      if (step && this.onStepCallback) {
        this.onStepCallback(step, this.currentStepIndex);
      }
      return step;
    }
    return null;
  }

  stepBackward(): DebugStep | null {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      const step = this.getCurrentStep();
      if (step && this.onStepCallback) {
        this.onStepCallback(step, this.currentStepIndex);
      }
      return step;
    }
    return null;
  }

  play(speedMs = 1000, onStep?: (step: DebugStep, index: number) => void): void {
    this.pause();
    this.playSpeed = speedMs;
    if (onStep) this.onStepCallback = onStep;
    
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('playing');
    }

    this.timer = setInterval(() => {
      const nextStep = this.stepForward();
      if (!nextStep) {
        this.pause();
      }
    }, this.playSpeed);
  }

  pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('paused');
    }
  }

  stop(): void {
    this.pause();
    this.currentStepIndex = 0;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('stopped');
    }
    const step = this.getCurrentStep();
    if (step && this.onStepCallback) {
      this.onStepCallback(step, 0);
    }
  }

  onStep(callback: (step: DebugStep, index: number) => void): void {
    this.onStepCallback = callback;
  }

  onStateChange(callback: (state: 'playing' | 'paused' | 'stopped') => void): void {
    this.onStateChangeCallback = callback;
  }
}
