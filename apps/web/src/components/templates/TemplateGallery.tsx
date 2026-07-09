/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { templatesRegistry } from '@thulasidharan96/templates';
import { TemplateCard } from './TemplateCard';
import { TemplatePreview } from './TemplatePreview';
import { Search, Compass } from 'lucide-react';

export const TemplateGallery: React.FC = () => {
  const { updateAST, updateFlags, commitWithDescription, updateSampleText } = useRegexStudio();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const list = new Set<string>();
    templatesRegistry.forEach((t) => {
      if (t.category) list.add(t.category);
    });
    return ['All', ...Array.from(list)];
  }, []);

  const filteredTemplates = useMemo(() => {
    return templatesRegistry.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.regex.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const selectedTemplate = useMemo(() => {
    return templatesRegistry.find((t) => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId]);

  const handleApplyTemplate = (tpl: typeof templatesRegistry[number]) => {
    // Overwrite AST
    updateAST(tpl.ast);

    // Overwrite flags
    if (tpl.regex) {
      const isGlobal = tpl.regex.includes('g');
      const isIgnoreCase = tpl.regex.includes('i');
      updateFlags({
        global: isGlobal,
        ignoreCase: isIgnoreCase,
        multiline: false,
        dotAll: false,
        unicode: false,
        sticky: false,
      });
    }

    // Overwrite sample text if examples are present
    if (tpl.examples && tpl.examples.length > 0) {
      updateSampleText(tpl.examples.join('\n'));
    }

    commitWithDescription(`Applied regex template: ${tpl.name}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b13] overflow-hidden">
      {/* Search Header */}
      <div className="p-3 border-b border-border-custom bg-sidebar/50 flex flex-col gap-2 shrink-0">
        <div className="relative">
          <input
            id="template-search-input"
            type="text"
            placeholder="Search regex templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-bg border border-border-custom text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-accent"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold border transition shrink-0 ${
                activeCategory === cat
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'border-border-custom bg-input-bg/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main split viewport */}
      <div className="flex-1 flex flex-col min-h-0 divide-y divide-border-custom overflow-y-auto">
        {/* Templates Grid List */}
        <div className="p-3 grid grid-cols-1 gap-2.5 overflow-y-auto max-h-[50%]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No templates match your query
            </div>
          ) : (
            filteredTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={selectedTemplateId === tpl.id}
                onSelect={() => setSelectedTemplateId(tpl.id)}
                onApply={() => handleApplyTemplate(tpl)}
              />
            ))
          )}
        </div>

        {/* Details and Actions view */}
        <div className="flex-1 min-h-0 flex flex-col">
          <TemplatePreview
            template={selectedTemplate}
            onApply={() => selectedTemplate && handleApplyTemplate(selectedTemplate)}
          />
        </div>
      </div>
    </div>
  );
};
