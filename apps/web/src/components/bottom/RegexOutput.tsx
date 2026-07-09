/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { Copy, Check, Sliders, Info } from 'lucide-react';

export const RegexOutput: React.FC = () => {
  const { compiledRegex, compiledFlags, activeProject, updateFlags, commitWithDescription } = useRegexStudio();
  const [copied, setCopied] = useState(false);

  const flagsList = [
    { key: 'global', char: 'g', name: 'Global', desc: 'Don\'t return after first match' },
    { key: 'ignoreCase', char: 'i', name: 'Ignore Case', desc: 'Case-insensitive matching' },
    { key: 'multiline', char: 'm', name: 'Multiline', desc: 'Start/end anchors match lines' },
    { key: 'dotAll', char: 's', name: 'Dot All', desc: 'Dot (.) matches newlines' },
    { key: 'unicode', char: 'u', name: 'Unicode', desc: 'Enable unicode pattern features' },
    { key: 'sticky', char: 'y', name: 'Sticky', desc: 'Match only from lastIndex' },
  ];

  const handleCopy = () => {
    const rxStr = `/${compiledRegex || '.*'}/${compiledFlags}`;
    navigator.clipboard.writeText(rxStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleFlag = (key: string, currentState: boolean) => {
    const updatedFlags = {
      ...activeProject.flags,
      [key]: !currentState,
    };
    updateFlags(updatedFlags);
    commitWithDescription(`Toggled flag: ${key} to ${!currentState}`);
  };

  return (
    <div className="h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border-custom bg-[#070b13] overflow-hidden font-sans select-none">
      {/* Visual Regex Display (Left side) */}
      <div className="flex-1 p-3.5 flex flex-col gap-3 justify-center min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest leading-none">
            Compiled Pattern Output
          </span>
          <button
            onClick={handleCopy}
            className="px-2 py-0.75 bg-sidebar hover:bg-bg border border-border-custom text-[10px] font-bold text-slate-300 hover:text-slate-100 rounded transition flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                <span>Copied Literal!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy RegExp</span>
              </>
            )}
          </button>
        </div>

        {/* Highlighted syntax block */}
        <div className="bg-black/40 border border-border-custom rounded-lg p-4 font-mono text-base md:text-lg text-emerald-400 font-bold overflow-x-auto break-all relative select-all flex items-center justify-between leading-normal shadow-inner">
          <span>
            <span className="text-slate-600">/</span>
            {compiledRegex || '.*'}
            <span className="text-slate-600">/</span>
            <span className="text-accent">{compiledFlags}</span>
          </span>
        </div>
      </div>

      {/* Flag modifiers list (Right side) */}
      <div className="w-full md:w-[280px] p-3.5 bg-sidebar/20 overflow-y-auto shrink-0 flex flex-col gap-2">
        <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
          <Sliders className="h-3 w-3 text-slate-500" />
          <span>Active Flag Swaps</span>
        </span>

        <div className="space-y-1 max-h-[115px] overflow-y-auto">
          {flagsList.map((f) => {
            const isActive = !!(activeProject.flags as any)[f.key];
            return (
              <label
                key={f.key}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md border text-xs cursor-pointer transition select-none ${
                  isActive
                    ? 'bg-accent/5 border-accent/30 text-slate-200'
                    : 'bg-input-bg/10 border-border-custom/50 text-slate-400 hover:text-slate-300'
                }`}
                title={f.desc}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-[11px] leading-tight flex items-center gap-1.5">
                    <span>{f.name}</span>
                    <span className="font-mono text-[9px] text-accent font-extrabold bg-accent/15 px-1 rounded">
                      -{f.char}
                    </span>
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => handleToggleFlag(f.key, isActive)}
                  className="rounded accent-accent h-3.5 w-3.5 cursor-pointer bg-sidebar"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
