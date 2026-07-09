/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { RightPanel } from '../RightPanel';
import { FileJson, Settings, Sparkles } from 'lucide-react';

export const Inspector: React.FC = () => {
  const { activeProject, selectedNodeId } = useRegexStudio();
  const [activeTab, setActiveTab] = useState<'properties' | 'ast-preview'>('properties');

  // Search node helper
  const findNodeInAST = (nodes: any[], id: string): any | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeInAST(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNodeInAST(activeProject.ast, selectedNodeId) : null;

  return (
    <aside 
      id="ide-inspector"
      className="w-[280px] bg-[#0a0f1d] border-l border-border-custom flex flex-col h-full shrink-0 select-none overflow-hidden"
    >
      {/* Header Tabs */}
      <div className="bg-sidebar border-b border-border-custom flex items-center shrink-0 h-9 px-1">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1.5 text-center font-bold text-[10px] uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'properties'
              ? 'border-accent text-accent'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings className="h-3 w-3" />
          <span>Properties</span>
        </button>
        <button
          onClick={() => setActiveTab('ast-preview')}
          className={`flex-1 py-1.5 text-center font-bold text-[10px] uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'ast-preview'
              ? 'border-accent text-accent'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileJson className="h-3 w-3" />
          <span>AST JSON</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'properties' ? (
          <div className="h-full overflow-y-auto">
            {/* Wrap RightPanel */}
            <RightPanel />
          </div>
        ) : (
          <div className="h-full flex flex-col p-3 gap-2.5 overflow-hidden">
            <div className="shrink-0 flex items-center gap-1 text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest leading-none">
              <Sparkles className="h-3 w-3 text-accent animate-pulse" />
              <span>AST Inspector</span>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-black/40 border border-border-custom/80 rounded p-2.5 font-mono text-[10px] leading-relaxed text-slate-300 select-text scrollbar-thin">
              {selectedNode ? (
                <>
                  <div className="text-[9px] text-accent font-sans font-bold mb-1.5 uppercase">
                    Selected Node Snapshot
                  </div>
                  <pre className="whitespace-pre-wrap word-break-all">
                    {JSON.stringify(selectedNode, null, 2)}
                  </pre>
                </>
              ) : (
                <>
                  <div className="text-[9px] text-slate-500 font-sans font-bold mb-1.5 uppercase">
                    Root AST Schema
                  </div>
                  <pre className="whitespace-pre-wrap word-break-all">
                    {JSON.stringify(activeProject.ast, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
