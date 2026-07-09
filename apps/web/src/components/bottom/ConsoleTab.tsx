/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

export const ConsoleTab: React.FC = () => {
  const { compiledRegex, compiledFlags, activeProject } = useRegexStudio();

  const mockLogs = useMemo(() => {
    return [
      { type: 'info', text: 'Initializing Regex Studio Compiler VM Engine...' },
      { type: 'info', text: 'Dexie IndexedDB projects store initialized successfully.' },
      { type: 'success', text: `Loaded project: "${activeProject.name}" with ${activeProject.ast.length} nodes.` },
      { type: 'info', text: 'Running initial AST optimization verification checks...' },
      { type: 'success', text: `Compiled pattern compilation complete: /${compiledRegex || '.*'}/${compiledFlags}` },
    ];
  }, [activeProject.name, activeProject.ast.length, compiledRegex, compiledFlags]);

  return (
    <div id="bottom-dock-console-tab" className="h-full bg-black/95 text-slate-300 font-mono text-[11px] p-3 overflow-y-auto flex flex-col gap-1.5 select-none leading-relaxed">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 shrink-0 select-none">
        <span className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-zinc-500" />
          <span>Interactive build output console</span>
        </span>
        <span className="text-[9px] font-sans font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1 rounded flex items-center gap-1">
          <Shield className="h-2.5 w-2.5 animate-pulse" />
          <span>COMPILER_READY</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {mockLogs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-1.5">
            <span className="text-zinc-600 select-none">{new Date().toLocaleTimeString()}</span>
            {log.type === 'success' ? (
              <span className="text-emerald-400 font-bold">[SUCCESS]</span>
            ) : (
              <span className="text-blue-400 font-bold">[SYSTEM]</span>
            )}
            <span className="text-zinc-300 select-all">{log.text}</span>
          </div>
        ))}
        <div className="flex items-start gap-1.5 text-zinc-500 animate-pulse">
          <span className="text-zinc-600 select-none">{new Date().toLocaleTimeString()}</span>
          <span>$</span>
          <span>listening for visual tree actions...</span>
        </div>
      </div>
    </div>
  );
};
