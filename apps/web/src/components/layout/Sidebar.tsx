/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { useSettingsStore } from '@regex-studio/stores';
import { templatesRegistry } from '@regex-studio/templates';
import { ASTNode } from '@regex-studio/regex-core';
import { 
  FolderPlus, 
  Search, 
  Trash2, 
  Copy, 
  FileHeart, 
  Clock, 
  Settings2,
  FileText,
  Compass,
  ArrowRight,
  Eye,
  Type,
  Hash,
  HelpCircle,
  GitFork,
  Anchor,
  FlameKindling,
  Braces
} from 'lucide-react';

// Sections helper for Component Library
interface LeftPanelItem {
  name: string;
  icon: React.ReactNode;
  description: string;
  createNode: () => ASTNode;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const Sidebar: React.FC = () => {
  const {
    activeProject,
    savedProjects,
    loadProject,
    createNewProject,
    deleteProject,
    duplicateProject,
    updateAST,
    setSelectedNodeId,
    selectedNodeId,
    history,
    historyIndex,
    pastDescriptions,
    futureDescriptions,
    jumpToHistoryIndex,
    commitWithDescription,
    updateFlags
  } = useRegexStudio();

  const activeSidebarTab = useSettingsStore((s) => s.activeSidebarTab);
  const sidebarExpanded = useSettingsStore((s) => s.sidebarExpanded);
  
  // Settings store properties
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const editorMode = useSettingsStore((s) => s.editorMode);
  const setEditorMode = useSettingsStore((s) => s.setEditorMode);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);
  const preferences = useSettingsStore((s) => s.preferences);
  const updatePreferences = useSettingsStore((s) => s.updatePreferences);

  const [projectSearch, setProjectSearch] = useState('');

  if (!sidebarExpanded || !activeSidebarTab) {
    return null;
  }

  // 1. PROJECT EXPLORER TAB
  const filteredProjects = savedProjects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Helper to insert a node in AST recursively
  const insertNodeIntoAST = (nodes: ASTNode[], targetId: string | null, newNode: ASTNode): { list: ASTNode[]; inserted: boolean } => {
    if (targetId === null) {
      return { list: [...nodes, newNode], inserted: true };
    }

    let inserted = false;
    const newList: ASTNode[] = [];

    for (const node of nodes) {
      if (node.id === targetId) {
        // If it's a container node, insert inside its children
        const isContainer = [
          'group', 'lookaround', 'alternative', 'captureGroup', 'namedGroup', 
          'nonCaptureGroup', 'lookahead', 'negativeLookahead', 'lookbehind', 
          'negativeLookbehind', 'alternation', 'charset'
        ].includes(node.type);

        if (isContainer) {
          newList.push({
            ...node,
            children: [...(node.children || []), newNode],
          });
          inserted = true;
        } else {
          // Insert immediately after this node in the current parent's array
          newList.push(node);
          newList.push(newNode);
          inserted = true;
        }
      } else if (node.children && node.children.length > 0) {
        // Recurse children
        const res = insertNodeIntoAST(node.children, targetId, newNode);
        newList.push({
          ...node,
          children: res.list,
        });
        if (res.inserted) {
          inserted = true;
        }
      } else {
        newList.push(node);
      }
    }

    return { list: newList, inserted };
  };

  const handleAddItem = (createNode: () => ASTNode) => {
    const newNode = createNode();
    const res = insertNodeIntoAST(activeProject.ast, selectedNodeId, newNode);
    updateAST(res.list);
    setSelectedNodeId(newNode.id);
  };

  const componentSections: {
    title: string;
    items: LeftPanelItem[];
  }[] = [
    {
      title: 'Basic Elements',
      items: [
        {
          name: 'Plain Text',
          icon: <Type className="h-3.5 w-3.5 text-emerald-400" />,
          description: 'Match exact string of characters',
          createNode: () => ({
            id: generateId(),
            type: 'literal',
            value: 'text',
          }),
        },
        {
          name: 'Any Character',
          icon: <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />,
          description: 'Match any char except newline (.)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'any',
          }),
        },
        {
          name: 'Digit',
          icon: <Hash className="h-3.5 w-3.5 text-emerald-400" />,
          description: 'Match any number 0-9 (\\d)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'digit',
          }),
        },
        {
          name: 'Word Character',
          icon: <Type className="h-3.5 w-3.5 text-emerald-400" />,
          description: 'Letters, digits, underscores (\\w)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'word',
          }),
        },
        {
          name: 'Whitespace',
          icon: <Braces className="h-3.5 w-3.5 text-emerald-400" />,
          description: 'Spaces, tabs, newlines (\\s)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'space',
          }),
        },
        {
          name: 'Character Range',
          icon: <Braces className="h-3.5 w-3.5 text-emerald-400" />,
          description: 'Match set/range of chars, e.g. [a-z]',
          createNode: () => ({
            id: generateId(),
            type: 'range',
            ranges: [
              { id: generateId(), start: 'a', end: 'z' },
            ],
            negated: false,
          }),
        },
      ],
    },
    {
      title: 'Groups',
      items: [
        {
          name: 'Capture Group',
          icon: <FileText className="h-3.5 w-3.5 text-blue-400" />,
          description: 'Saves match for extraction (...)',
          createNode: () => ({
            id: generateId(),
            type: 'group',
            groupType: 'capture',
            children: [],
          }),
        },
        {
          name: 'Named Group',
          icon: <FileText className="h-3.5 w-3.5 text-blue-400" />,
          description: 'Capture group with a custom ID',
          createNode: () => ({
            id: generateId(),
            type: 'group',
            groupType: 'named',
            name: 'custom_name',
            children: [],
          }),
        },
        {
          name: 'Non-capture Group',
          icon: <FileText className="h-3.5 w-3.5 text-blue-400" />,
          description: 'Group without creating a capture (?:...)',
          createNode: () => ({
            id: generateId(),
            type: 'group',
            groupType: 'non-capture',
            children: [],
          }),
        },
      ],
    },
    {
      title: 'Logic & Anchors',
      items: [
        {
          name: 'Alternative (OR)',
          icon: <GitFork className="h-3.5 w-3.5 text-amber-400" />,
          description: 'Match left or right branch (A|B)',
          createNode: () => ({
            id: generateId(),
            type: 'alternative',
            children: [
              { id: generateId(), type: 'literal', value: 'A' },
              { id: generateId(), type: 'literal', value: 'B' },
            ],
          }),
        },
        {
          name: 'Start of Line',
          icon: <Anchor className="h-3.5 w-3.5 text-indigo-400" />,
          description: 'Match beginning of string (^)',
          createNode: () => ({
            id: generateId(),
            type: 'boundary',
            boundaryType: 'start',
          }),
        },
        {
          name: 'End of Line',
          icon: <Anchor className="h-3.5 w-3.5 text-indigo-400" />,
          description: 'Match end of string ($)',
          createNode: () => ({
            id: generateId(),
            type: 'boundary',
            boundaryType: 'end',
          }),
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          name: 'Lookahead',
          icon: <Eye className="h-3.5 w-3.5 text-fuchsia-400" />,
          description: 'Assert what follows next (?=...)',
          createNode: () => ({
            id: generateId(),
            type: 'lookaround',
            lookaroundType: 'lookahead',
            children: [],
          }),
        },
        {
          name: 'Backreference',
          icon: <FlameKindling className="h-3.5 w-3.5 text-fuchsia-400" />,
          description: 'Match exact prior captured value (\\1)',
          createNode: () => ({
            id: generateId(),
            type: 'backreference',
            value: '1',
          }),
        },
      ],
    },
  ];

  const handleApplyTemplate = (tpl: typeof templatesRegistry[number]) => {
    updateAST(tpl.ast);
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
    commitWithDescription(`Loaded template: ${tpl.name}`);
  };

  return (
    <aside 
      id="ide-sidebar"
      className="w-64 bg-[#0a0f1d] border-r border-border-custom flex flex-col h-full shrink-0 select-none overflow-hidden"
    >
      {/* 1. PROJECT EXPLORER */}
      {activeSidebarTab === 'explorer' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-border-custom flex items-center justify-between shrink-0">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              Project Explorer
            </span>
            <button 
              onClick={() => createNewProject()}
              className="p-1 hover:bg-input-bg text-slate-400 hover:text-accent rounded transition cursor-pointer"
              title="Create New Project"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full bg-input-bg border border-border-custom/50 text-slate-200 text-xs pl-7 pr-3 py-1 rounded focus:outline-none focus:border-accent"
              />
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
            {filteredProjects.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-8 font-semibold">
                No projects found
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isActive = p.id === activeProject.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer group transition ${
                      isActive 
                        ? 'bg-accent/10 border-l-2 border-accent text-slate-100 font-bold' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-input-bg/30'
                    }`}
                  >
                    <button
                      onClick={() => loadProject(p.id)}
                      className="flex-1 text-left truncate cursor-pointer mr-2 font-bold"
                    >
                      {p.name}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); }}
                        className="p-0.5 hover:text-accent text-slate-500 rounded transition cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        className="p-0.5 hover:text-red-400 text-slate-500 rounded transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. COMPONENT LIBRARY */}
      {activeSidebarTab === 'components' && (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-border-custom shrink-0">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              Component Library
            </span>
            <p className="text-[9px] text-slate-500 mt-1">
              Select a node in the visual canvas and click elements below to insert!
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {componentSections.map((sec, sidx) => (
              <div key={sidx} className="space-y-1">
                <span className="text-[9px] font-sans font-extrabold text-slate-500 uppercase tracking-widest block pl-1">
                  {sec.title}
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {sec.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddItem(item.createNode)}
                      className="w-full flex items-center gap-2 p-1.5 rounded border border-border-custom/40 hover:border-accent hover:bg-accent/5 transition text-left cursor-pointer group"
                    >
                      <div className="p-1 rounded bg-sidebar/55 border border-border-custom shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-200 group-hover:text-slate-100 leading-none">
                          {item.name}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5 leading-none">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TEMPLATE GALLERY */}
      {activeSidebarTab === 'templates' && (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-border-custom shrink-0">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              Regex Templates
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {templatesRegistry.map((tpl) => (
              <div
                key={tpl.id}
                className="p-2 rounded border border-border-custom bg-input-bg/15 hover:border-accent transition flex flex-col justify-between gap-1.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">
                      {tpl.name}
                    </span>
                    <span className="bg-accent/15 text-accent border border-accent/20 px-1 py-0.25 rounded text-[8px] font-mono font-bold">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {tpl.description}
                  </p>
                  <code className="text-[9px] font-mono text-emerald-400 bg-black/30 border border-border-custom/50 px-1.5 py-0.5 rounded mt-1.5 block truncate">
                    /{tpl.regex}/
                  </code>
                </div>

                <button
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full py-1 bg-accent/10 hover:bg-accent/20 border border-accent/30 text-[10px] font-bold text-accent rounded flex items-center justify-center gap-1 cursor-pointer transition mt-1"
                >
                  Apply Template <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. HISTORY TIMELINE */}
      {activeSidebarTab === 'history' && (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-border-custom shrink-0">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              History & Timeline
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
            <div className="text-[10px] font-sans text-slate-500 font-extrabold px-1.5 py-1 uppercase tracking-wider">
              Snapshots list
            </div>

            {pastDescriptions.map((desc, idx) => (
              <button
                key={`past-${idx}`}
                onClick={() => jumpToHistoryIndex(idx)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs cursor-pointer transition ${
                  idx === historyIndex
                    ? 'bg-accent/10 text-accent font-bold border-l border-accent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-input-bg/25'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{desc}</span>
              </button>
            ))}

            {/* Active present slot */}
            <div className="bg-accent/15 text-accent font-extrabold border-l-2 border-accent rounded px-2 py-1.5 text-xs flex items-center gap-2 select-none">
              <Clock className="h-3.5 w-3.5 animate-pulse text-accent" />
              <span className="truncate">Active present state</span>
            </div>

            {futureDescriptions.map((desc, idx) => {
              const realIdx = pastDescriptions.length + 1 + idx;
              return (
                <button
                  key={`future-${idx}`}
                  onClick={() => jumpToHistoryIndex(realIdx)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs text-slate-600 hover:text-slate-400 hover:bg-input-bg/25 cursor-pointer transition"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                  <span className="truncate">{desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SETTINGS PANEL */}
      {activeSidebarTab === 'settings' && (
        <div className="flex flex-col h-full p-3 space-y-4">
          <div className="border-b border-border-custom pb-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              IDE Preferences
            </span>
          </div>

          {/* Theme setting */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">
              Visual Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full bg-input-bg border border-border-custom text-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-accent"
            >
              <option value="regex-studio-dark">Regex Studio Dark</option>
              <option value="vs-code-dark">VS Code Dark</option>
              <option value="github-dark">GitHub Cosmic</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>

          {/* Source Editor toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">
              Editor Mode
            </label>
            <div className="flex rounded overflow-hidden border border-border-custom bg-input-bg">
              <button
                onClick={() => setEditorMode('visual')}
                className={`flex-1 py-1 text-center font-bold text-[11px] transition cursor-pointer ${
                  editorMode === 'visual' ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setEditorMode('monaco')}
                className={`flex-1 py-1 text-center font-bold text-[11px] transition cursor-pointer ${
                  editorMode === 'monaco' ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monaco
              </button>
            </div>
          </div>

          {/* Reduced motion */}
          <div className="flex items-center justify-between py-1.5 border-b border-border-custom/50">
            <span className="text-[11px] font-bold text-slate-300">
              Reduced Motion
            </span>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="accent-accent cursor-pointer"
            />
          </div>

          {/* Canvas Settings */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Workspace Grid
            </span>
            
            <div className="flex items-center justify-between py-1 border-b border-border-custom/30">
              <span className="text-[11px] text-slate-300">
                Show Canvas Grid
              </span>
              <input
                type="checkbox"
                checked={preferences.showGrid}
                onChange={(e) => updatePreferences({ showGrid: e.target.checked })}
                className="accent-accent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[11px] text-slate-300">
                Snap Nodes to Grid
              </span>
              <input
                type="checkbox"
                checked={preferences.snapToGrid}
                onChange={(e) => updatePreferences({ snapToGrid: e.target.checked })}
                className="accent-accent cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
