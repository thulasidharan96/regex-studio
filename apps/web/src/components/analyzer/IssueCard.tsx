/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnalysisIssue } from '@regex-studio/regex-analyzer';
import { AlertCircle, AlertTriangle, Info, HelpCircle, ArrowRight, Check } from 'lucide-react';

interface IssueCardProps {
  issue: AnalysisIssue;
  onLocate: () => void;
  onApplyFix: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onLocate,
  onApplyFix,
}) => {
  const [fixed, setFixed] = useState(false);

  const getSeverityStyles = () => {
    switch (issue.severity) {
      case 'high':
        return {
          icon: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />,
          title: 'Critical (ReDoS / Failure Risk)',
          color: 'border-rose-900/40 bg-rose-950/5 hover:border-rose-700/60',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
          title: 'Warning (Slow Performance / Redundancy)',
          color: 'border-amber-900/40 bg-amber-950/5 hover:border-amber-700/60',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        };
      default:
        return {
          icon: <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />,
          title: 'Info (Optimization Suggestion)',
          color: 'border-slate-800 bg-slate-900/10 hover:border-slate-700',
          badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className={`p-3 rounded-lg border flex flex-col gap-2 transition duration-200 select-none font-sans ${styles.color}`}>
      {/* Title block */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          {styles.icon}
          <div>
            <h4 className="font-bold text-slate-100 text-xs leading-snug">
              {issue.message || issue.title}
            </h4>
            <span className={`inline-block px-1 py-0.25 rounded text-[8px] font-bold font-sans mt-1 ${styles.badge}`}>
              {styles.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {issue.location && (
            <button
              onClick={onLocate}
              className="text-[9px] font-sans font-bold text-accent hover:text-blue-300 underline cursor-pointer"
            >
              Locate Node
            </button>
          )}
        </div>
      </div>

      {/* Problem details */}
      <p className="text-[11px] text-slate-400 leading-normal pl-6">
        {issue.explanation || issue.description}
      </p>

      {/* Suggested fix box */}
      <div className="ml-6 bg-black/40 border border-border-custom/50 rounded p-2 flex flex-col gap-1 text-[10px]">
        <div className="flex items-center gap-1 font-bold text-slate-400 uppercase tracking-wider text-[8px]">
          <HelpCircle className="h-3 w-3 text-slate-500" />
          <span>Recommended Fix</span>
        </div>
        <p className="text-slate-300 italic leading-snug">
          {issue.fix}
        </p>

        {/* Trigger fix button */}
        <div className="flex items-center justify-end mt-1.5">
          {fixed ? (
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              <span>Fix Applied!</span>
            </div>
          ) : (
            <button
              onClick={() => {
                onApplyFix();
                setFixed(true);
              }}
              className="px-2 py-0.75 bg-accent/15 hover:bg-accent text-accent hover:text-white rounded border border-accent/20 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <span>Auto Apply Fix</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
