/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DebugStep } from '@regex-studio/regex-core';
import { Target, ArrowRight, CornerDownRight, RotateCcw } from 'lucide-react';

interface ExecutionStepProps {
  step: DebugStep | null;
  totalSteps: number;
  sampleText: string;
  onLocateNode: (nodeId?: string) => void;
}

export const ExecutionStep: React.FC<ExecutionStepProps> = ({
  step,
  totalSteps,
  sampleText,
  onLocateNode,
}) => {
  if (!step) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-sans text-xs italic p-4 select-none">
        No active trace step
      </div>
    );
  }

  // Draw slice with marked pointer
  const startIdx = Math.max(0, step.index - 10);
  const endIdx = Math.min(sampleText.length, step.index + 10);
  const leftStr = sampleText.substring(startIdx, step.index);
  const pointerChar = sampleText[step.index] || ' ';
  const rightStr = sampleText.substring(step.index + 1, endIdx);

  return (
    <div className="flex-1 bg-input-bg border border-border-custom p-3 rounded-lg flex flex-col gap-3 font-sans select-none justify-start overflow-y-auto">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-border-custom/50 pb-2">
        <span className="text-[9px] font-sans font-extrabold text-slate-500 uppercase tracking-widest leading-none">
          Active VM Step
        </span>
        <span className="text-accent font-mono text-[10px] font-bold">
          Step {step.stepIndex} of {totalSteps}
        </span>
      </div>

      {/* Input Pointer Location */}
      <div className="space-y-1.5 bg-sidebar/40 p-2.5 rounded-lg border border-border-custom/40">
        <div className="flex items-center justify-between text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
          <span>Input Text Pointer</span>
          <span className="font-mono text-[9px] text-slate-500">
            Index: <span className="text-accent font-extrabold">{step.index}</span>
          </span>
        </div>

        <div className="bg-bg text-[11px] text-slate-300 font-mono px-2 py-1.5 rounded border border-border-custom/50 truncate flex items-center justify-center">
          <span className="text-slate-500">{leftStr}</span>
          <span className="bg-accent/25 text-accent border border-accent/40 font-extrabold px-1.5 rounded mx-0.5 animate-pulse">
            {pointerChar}
          </span>
          <span className="text-slate-500">{rightStr}</span>
        </div>
      </div>

      {/* Target AST Node */}
      <div className="space-y-1 bg-sidebar/40 p-2.5 rounded-lg border border-border-custom/40">
        <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
          Matched AST Rule Reference
        </div>
        <div className="flex items-center justify-between gap-2.5 text-xs">
          <span className="font-mono text-slate-300 font-semibold truncate flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-blue-400" />
            <span>Node: <span className="text-blue-400 font-extrabold">{step.nodeId || 'ROOT'}</span></span>
          </span>
          {step.nodeId && (
            <button
              onClick={() => onLocateNode(step.nodeId)}
              className="px-2 py-0.5 bg-accent/15 hover:bg-accent text-accent hover:text-white rounded text-[9px] font-bold transition cursor-pointer"
            >
              Locate Node
            </button>
          )}
        </div>
      </div>

      {/* Execution state evaluation */}
      <div className="space-y-1.5 bg-sidebar/40 p-2.5 rounded-lg border border-border-custom/40">
        <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
          VM Decision State
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              step.state === 'success'
                ? 'bg-emerald-500 animate-pulse'
                : step.state === 'failure'
                  ? 'bg-rose-500'
                  : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-xs font-bold text-slate-100">
            {step.state === 'success'
              ? 'MATCH_SUCCESS'
              : step.state === 'failure'
                ? 'BACKTRACK_POP_FAIL'
                : 'EVALUATING'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 italic leading-snug">
          {step.state === 'success'
            ? 'The engine successfully advanced. Ready to evaluate sequence branches.'
            : step.state === 'failure'
              ? 'Match conditions failed. Popping current search tree state and initiating backtracking.'
              : 'Evaluating next sequential token or repeating quantifier branches.'}
        </p>
      </div>
    </div>
  );
};
