/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe, Code2, ShieldCheck, Box } from 'lucide-react';

interface Language {
  name: string;
  category: 'Language' | 'Framework';
}

interface LanguageSelectorProps {
  languages: Language[];
  selectedLang: string;
  onSelectLang: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLang,
  onSelectLang,
}) => {
  const langs = languages.filter((l) => l.category === 'Language');
  const frameworks = languages.filter((l) => l.category === 'Framework');

  return (
    <div className="w-48 bg-sidebar/30 p-2 flex flex-col gap-3.5 shrink-0 border-r border-border-custom overflow-y-auto select-none font-sans">
      {/* Languages Category */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1.5 py-1">
          <Globe className="h-3 w-3" />
          <span>Languages</span>
        </div>
        <div className="space-y-0.5">
          {langs.map((l) => (
            <button
              key={l.name}
              onClick={() => onSelectLang(l.name)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                selectedLang === l.name
                  ? 'bg-accent text-white shadow-sm shadow-accent/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-input-bg/30'
              }`}
            >
              <span>{l.name}</span>
              <Code2 className="h-3 w-3 opacity-40" />
            </button>
          ))}
        </div>
      </div>

      {/* Validation Frameworks Category */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1.5 py-1">
          <Box className="h-3 w-3" />
          <span>Frameworks</span>
        </div>
        <div className="space-y-0.5">
          {frameworks.map((l) => (
            <button
              key={l.name}
              onClick={() => onSelectLang(l.name)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                selectedLang === l.name
                  ? 'bg-accent text-white shadow-sm shadow-accent/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-input-bg/30'
              }`}
            >
              <span>{l.name}</span>
              <ShieldCheck className="h-3 w-3 opacity-40" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
