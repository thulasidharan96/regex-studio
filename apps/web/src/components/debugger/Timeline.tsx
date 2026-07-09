/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { DebugStep } from '@regex-studio/regex-core';
import { CheckCircle, AlertTriangle, Cpu, Play } from 'lucide-react';

interface TimelineProps {
  steps: DebugStep[];
  selectedStepIdx: number | null;
  onSelectStep: (idx: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  steps,
  selectedStepIdx,
  onSelectStep,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedStepIdx !== null && containerRef.current) {
      const activeEl = containerRef.current.querySelector(`[data-step-idx="${selectedStepIdx}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedStepIdx]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin select-none"
    >
      <div className="flex items-center gap-1.5 text-[9px] font-sans font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-2 px-1">
        <Cpu className="h-3.5 w-3.5 text-accent" />
        <span>Execution Steps Timeline ({steps.length})</span>
      </div>

      <div className="relative border-l border-border-custom/60 ml-3.5 pl-4 py-1.5 space-y-2">
        {steps.map((step) => {
          const isSelected = selectedStepIdx === step.stepIndex;
          
          let stateColor = 'border-border-custom/50 bg-input-bg/10 text-slate-400 hover:border-accent/40';
          let dotColor = 'bg-slate-600 border-slate-700';
          let icon = <Play className="h-2.5 w-2.5 text-slate-400" />;

          if (isSelected) {
            stateColor = 'border-accent bg-accent/5 ring-1 ring-accent/35';
            dotColor = 'bg-accent border-accent animate-ping';
          }

          if (step.state === 'success') {
            dotColor = 'bg-emerald-500 border-emerald-400';
            icon = <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />;
          } else if (step.state === 'failure') {
            dotColor = 'bg-rose-500 border-rose-400';
            icon = <AlertTriangle className="h-2.5 w-2.5 text-rose-400" />;
          }

          return (
            <div
              key={step.stepIndex}
              data-step-idx={step.stepIndex}
              onClick={() => onSelectStep(step.stepIndex)}
              className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 relative ${stateColor}`}
            >
              {/* Timeline Connector Dot */}
              <div
                className={`absolute -left-[21.5px] top-[14px] h-2.5 w-2.5 rounded-full border-2 ${dotColor} shrink-0 transition-all`}
              />

              <div className="flex items-start gap-2 min-w-0">
                <span className="font-mono text-slate-500 font-bold text-[10px] select-none mt-0.5">
                  #{step.stepIndex}
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-slate-200 leading-snug">
                    {step.description}
                  </h4>
                  {step.capturedText && (
                    <p className="text-[10px] font-mono text-emerald-400">
                      Matched: <span className="underline">"{step.capturedText}"</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {icon}
                <span className="text-[9px] font-mono font-bold text-slate-500">
                  idx {step.index}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
