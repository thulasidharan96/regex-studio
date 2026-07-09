/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, RotateCcw, Eye } from 'lucide-react';

interface HistoryItemProps {
  index: number;
  description: string;
  isActive: boolean;
  isCurrent: boolean;
  onPreview: () => void;
  onRestore: () => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  index,
  description,
  isActive,
  isCurrent,
  onPreview,
  onRestore,
}) => {
  return (
    <div
      onClick={onPreview}
      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between gap-3 select-none ${
        isActive
          ? 'bg-accent/10 border-accent'
          : 'bg-input-bg/10 hover:bg-input-bg/30 border-border-custom'
      }`}
    >
      <div className="flex items-start gap-2 min-w-0">
        <History className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isCurrent ? 'text-accent' : 'text-slate-500'}`} />
        <div className="space-y-0.5 min-w-0">
          <p className={`font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
            {description || `Action #${index + 1}`}
          </p>
          <span className="text-[9px] font-mono text-slate-500 block">
            State index: {index} {isCurrent && '(active pointer)'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!isCurrent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            className="p-1 bg-accent/15 hover:bg-accent text-accent hover:text-white rounded border border-accent/20 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition"
            title="Restore this specific state"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Restore</span>
          </button>
        )}
      </div>
    </div>
  );
};
