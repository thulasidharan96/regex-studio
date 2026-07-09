/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  regex: string;
  examples: string[];
}

interface TemplateCardProps {
  template: TemplateItem;
  isSelected: boolean;
  onSelect: () => void;
  onApply: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onApply,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative select-none ${
        isSelected
          ? 'bg-accent/10 border-accent shadow-md shadow-accent/5'
          : 'bg-input-bg/15 hover:bg-input-bg/30 border-border-custom hover:border-border-custom/80'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-slate-100 text-xs truncate">
            {template.name}
          </span>
          <span className="bg-accent/15 text-accent border border-accent/15 px-1 py-0.25 rounded text-[8px] font-sans font-extrabold uppercase shrink-0">
            {template.category}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
          {template.description}
        </p>

        <code className="text-[9px] font-mono text-emerald-400 bg-black/45 border border-border-custom/50 px-1.5 py-0.75 rounded mt-2 block truncate select-all">
          /{template.regex}/
        </code>
      </div>

      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
          className="px-2 py-1 bg-accent hover:bg-accent/80 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition"
        >
          <span>Load</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {isSelected && (
        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-accent text-white flex items-center justify-center border border-bg">
          <Check className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  );
};
