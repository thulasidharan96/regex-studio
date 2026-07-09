/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { HistoryItem } from './HistoryItem';
import { Undo, Redo, RotateCcw, AlertCircle } from 'lucide-react';

export const HistoryTimeline: React.FC = () => {
  const {
    history,
    historyIndex,
    pastDescriptions,
    futureDescriptions,
    jumpToHistoryIndex,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useRegexStudio();

  // Map out all actions
  const allActions = useMemo(() => {
    const list: { index: number; description: string; isFuture: boolean }[] = [];

    // Past descriptions
    pastDescriptions.forEach((desc, idx) => {
      list.push({
        index: idx,
        description: desc,
        isFuture: false,
      });
    });

    // Current state (active index)
    list.push({
      index: pastDescriptions.length,
      description: 'Current State Pointer',
      isFuture: false,
    });

    // Future descriptions
    futureDescriptions.forEach((desc, idx) => {
      list.push({
        index: pastDescriptions.length + 1 + idx,
        description: desc,
        isFuture: true,
      });
    });

    return list;
  }, [pastDescriptions, futureDescriptions]);

  return (
    <div className="flex flex-col h-full bg-[#070b13] overflow-hidden select-none font-sans">
      {/* Top Undo/Redo Controls bar */}
      <div className="p-3 border-b border-border-custom bg-sidebar/50 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-sans font-extrabold text-slate-500 uppercase tracking-widest leading-none">
          Action Timeline History
        </span>

        <div className="flex items-center gap-1.5">
          {/* Undo Button */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded border border-border-custom bg-sidebar hover:bg-bg text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Undo last change"
          >
            <Undo className="h-3.5 w-3.5" />
            <span>Undo</span>
          </button>

          {/* Redo Button */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded border border-border-custom bg-sidebar hover:bg-bg text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Redo next change"
          >
            <Redo className="h-3.5 w-3.5" />
            <span>Redo</span>
          </button>
        </div>
      </div>

      {/* Main List of edits */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {allActions.length <= 1 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500 bg-sidebar/10 border border-dashed border-border-custom rounded-xl m-2">
            <AlertCircle className="h-8 w-8 text-slate-600 mb-1.5 animate-pulse" />
            <span className="text-xs font-bold text-slate-400">Empty History</span>
            <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 leading-normal">
              Perform some visual node additions or alterations to register history logs.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-full">
            {allActions.map((act) => {
              const isCurrent = act.index === historyIndex;
              return (
                <HistoryItem
                  key={act.index}
                  index={act.index}
                  description={act.description}
                  isActive={isCurrent}
                  isCurrent={isCurrent}
                  onPreview={() => jumpToHistoryIndex(act.index)}
                  onRestore={() => jumpToHistoryIndex(act.index)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
