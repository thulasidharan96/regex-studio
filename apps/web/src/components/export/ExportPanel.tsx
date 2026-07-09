/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { generateExporters } from '@regex-studio/regex-exporters';
import { LanguageSelector } from './LanguageSelector';
import { CodePreview } from './CodePreview';

export const ExportPanel: React.FC = () => {
  const { compiledRegex, compiledFlags } = useRegexStudio();
  const [selectedLang, setSelectedLang] = useState('JavaScript');

  // Load exporters from library
  const snippets = useMemo(() => {
    return generateExporters(compiledRegex || '.*', compiledFlags);
  }, [compiledRegex, compiledFlags]);

  // Map snippets list to categories
  const languagesList = useMemo(() => {
    return snippets.map((s) => {
      const isFramework = ['Zod', 'Yup', 'Ajv'].includes(s.language);
      return {
        name: s.language,
        category: (isFramework ? 'Framework' : 'Language') as 'Language' | 'Framework',
      };
    });
  }, [snippets]);

  // Find active snippet
  const activeSnippet = useMemo(() => {
    return snippets.find((s) => s.language === selectedLang) || snippets[0];
  }, [snippets, selectedLang]);

  return (
    <div className="flex h-full bg-[#070b13] overflow-hidden">
      {/* Left Column: Languages Selector */}
      <LanguageSelector
        languages={languagesList}
        selectedLang={selectedLang}
        onSelectLang={setSelectedLang}
      />

      {/* Right Column: Code Preview */}
      {activeSnippet ? (
        <CodePreview
          language={activeSnippet.language}
          code={activeSnippet.code}
          extension={activeSnippet.extension}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
          No exporters available. Add some nodes to compiling AST.
        </div>
      )}
    </div>
  );
};
