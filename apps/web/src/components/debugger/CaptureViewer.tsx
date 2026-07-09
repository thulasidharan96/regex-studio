/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DebugStep } from '@thulasidharan96/regex-core';
import { Bookmark, HelpCircle } from 'lucide-react';

interface CaptureViewerProps {
  step: DebugStep | null;
}

export const CaptureViewer: React.FC<CaptureViewerProps> = ({ step }) => {
  return (
    <div className="space-y-1.5 bg-sidebar/40 p-2.5 rounded-lg border border-border-custom/40 font-sans">
      <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
        <Bookmark className="h-3.5 w-3.5 text-emerald-400" />
        <span>Capture Group Buffer</span>
      </div>

      {step && step.capturedText ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 p-2 rounded text-[11px] font-mono break-all">
            <span className="text-[8px] font-bold px-1 py-0.5 bg-emerald-900/40 text-emerald-300 rounded shrink-0">
              VALUE
            </span>
            <span>"{step.capturedText}"</span>
          </div>
          <span className="text-[9px] text-slate-500 block leading-tight">
            Matches are saved in the backreference heap for current group pointers.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-slate-900/10 border border-border-custom/40 rounded text-[11px] text-slate-500 italic">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>No capture data buffered at this step</span>
        </div>
      )}
    </div>
  );
};
