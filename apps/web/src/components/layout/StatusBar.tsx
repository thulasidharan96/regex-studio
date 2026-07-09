/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { useSettingsStore } from '@regex-studio/stores';
import { performanceScore } from '@regex-studio/regex-analyzer';
import { CheckCircle2, AlertCircle, Eye, Activity, Sparkles, HardDrive, ShieldAlert } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeProject, compiledRegex, compiledFlags, analysisIssues } = useRegexStudio();
  const theme = useSettingsStore((s) => s.theme);
  const editorMode = useSettingsStore((s) => s.editorMode);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  // Match calculator to show accurate counts
  const matchDetails = useMemo(() => {
    if (!compiledRegex) return { count: 0, isValid: true, error: null };
    try {
      let safeFlags = 'g';
      if (compiledFlags.includes('i')) safeFlags += 'i';
      if (compiledFlags.includes('m')) safeFlags += 'm';
      if (compiledFlags.includes('s')) safeFlags += 's';
      if (compiledFlags.includes('u')) safeFlags += 'u';

      const rx = new RegExp(compiledRegex, safeFlags);
      const text = activeProject.sampleText;
      let count = 0;
      let m;
      let safetyCount = 0;
      while ((m = rx.exec(text)) !== null && safetyCount < 500) {
        safetyCount++;
        count++;
        if (m.index === rx.lastIndex) {
          rx.lastIndex++;
        }
      }
      return { count, isValid: true, error: null };
    } catch (err: any) {
      return { count: 0, isValid: false, error: err.message || 'Syntax Error' };
    }
  }, [compiledRegex, compiledFlags, activeProject.sampleText]);

  // Recursively count nodes in the AST
  const countNodes = (nodes: any[]): number => {
    let count = 0;
    nodes.forEach(node => {
      count++;
      if (node.children && node.children.length > 0) {
        count += countNodes(node.children);
      }
    });
    return count;
  };

  const nodeCount = useMemo(() => {
    return countNodes(activeProject.ast);
  }, [activeProject.ast]);

  // Performance score calculation
  const perfScore = useMemo(() => {
    return performanceScore(activeProject.ast);
  }, [activeProject.ast]);

  return (
    <footer 
      id="ide-status-bar"
      className="h-6 bg-[#030712] border-t border-border-custom px-3.5 flex items-center justify-between text-[11px] text-slate-400 font-sans select-none shrink-0"
      aria-label="Status Bar"
    >
      {/* Left side: Compile Status & Matches & Stats */}
      <div className="flex items-center gap-4">
        {matchDetails.isValid ? (
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Regex Valid</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Syntax Error</span>
          </div>
        )}

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-300">{matchDetails.count}</span>
          <span className="text-slate-500">matches</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-300">{nodeCount}</span>
          <span className="text-slate-500">AST nodes</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1">
          <span className="text-slate-600">Len:</span>
          <span className="font-bold text-slate-300">{compiledRegex.length}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1">
          <span className="text-slate-600">Score:</span>
          <span className={`font-bold ${perfScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{perfScore}%</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <HardDrive className="h-3 w-3 text-slate-600" />
          <span>Local IndexedDB Synced</span>
        </div>
      </div>

      {/* Right side: Editor Options / Indicators */}
      <div className="flex items-center gap-4 text-slate-500 font-medium">
        {analysisIssues.length > 0 && (
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <ShieldAlert className="h-3 w-3" />
            <span>{analysisIssues.length} warnings</span>
          </div>
        )}

        {reducedMotion && (
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Activity className="h-3 w-3" />
            <span>Reduced Motion</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-slate-600">Engine:</span>
          <span className="text-slate-300 font-bold">V8 Engine</span>
        </div>

        <div className="flex items-center gap-1 capitalize">
          <span className="text-slate-600">Mode:</span>
          <span className="text-slate-300 font-bold flex items-center gap-0.5">
            <Eye className="h-3 w-3 text-accent" />
            {editorMode}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-600">Theme:</span>
          <span className="text-slate-300 font-bold">{theme.replace(/-/g, ' ')}</span>
        </div>

        <div className="text-[10px] bg-accent/15 border border-accent/20 px-1.5 py-0.25 rounded text-accent font-extrabold flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 animate-pulse" />
          <span>V3.0.0</span>
        </div>
      </div>
    </footer>
  );
};
