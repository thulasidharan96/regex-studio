/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Check, HelpCircle } from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  regex: string;
  examples: string[];
}

interface TemplatePreviewProps {
  template: TemplateItem | null;
  onApply: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onApply,
}) => {
  if (!template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-sans select-none border border-dashed border-border-custom/50 rounded-lg bg-input-bg/5 m-3">
        <Sparkles className="h-8 w-8 text-slate-600 mb-1.5" />
        <span className="text-xs font-bold text-slate-400">No Template Selected</span>
        <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 leading-normal">
          Select a regular expression template from the gallery to view its test cases and properties.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 bg-[#070b13] border border-border-custom rounded-lg m-3 font-sans select-none gap-3 justify-between overflow-y-auto">
      <div className="space-y-3">
        {/* Header */}
        <div className="border-b border-border-custom/50 pb-2.5">
          <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
            <Sparkles className="h-3 w-3 text-accent animate-pulse" />
            <span>Interactive Template View</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100">{template.name}</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Regular Expression */}
        <div className="space-y-1">
          <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest">
            Regular Expression Syntax
          </span>
          <div className="bg-black/45 border border-border-custom/80 p-2.5 rounded font-mono text-xs text-emerald-400 overflow-x-auto break-all font-bold">
            /{template.regex}/
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest">
            Valid Sample Inputs
          </span>
          <div className="space-y-1">
            {template.examples.map((ex, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-input-bg/40 border border-border-custom/40 rounded text-[11px] font-mono text-slate-200"
              >
                <div className="h-4 w-4 rounded-full bg-success/15 border border-success/35 text-success flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5" />
                </div>
                <span className="truncate select-all">{ex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-2 bg-accent/5 border border-accent/15 rounded flex items-start gap-1.5 text-[10px] text-slate-400 leading-normal">
          <HelpCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
          <span>
            Applying this template will fully overwrite your existing AST canvas and compile instantly.
          </span>
        </div>
      </div>

      <button
        onClick={onApply}
        className="w-full py-2 bg-accent hover:bg-accent/80 text-white font-bold rounded-md flex items-center justify-center gap-1.5 cursor-pointer text-xs transition shrink-0"
      >
        <Play className="h-3.5 w-3.5 fill-current" />
        <span>Load Template onto Workspace</span>
      </button>
    </div>
  );
};
