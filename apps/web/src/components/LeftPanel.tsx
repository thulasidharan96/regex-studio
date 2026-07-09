/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRegexStudio } from './RegexStudioContext';
import { ASTNode, CharacterType, BoundaryType, GroupType, LookaroundType } from '@regex-studio/regex-core';
import { 
  Type, 
  Hash, 
  HelpCircle, 
  FolderOpen, 
  GitFork, 
  Eye, 
  Anchor, 
  ChevronDown, 
  ChevronUp, 
  FlameKindling,
  Braces
} from 'lucide-react';

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface LeftPanelItem {
  name: string;
  icon: React.ReactNode;
  description: string;
  createNode: () => ASTNode;
}

export const LeftPanel: React.FC = () => {
  const { activeProject, updateAST, selectedNodeId, setSelectedNodeId } = useRegexStudio();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    groups: true,
    logic: true,
    boundaries: true,
    advanced: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
        if (node.children && (node.type === 'group' || node.type === 'lookaround' || node.type === 'alternative')) {
          newList.push({
            ...node,
            children: [...node.children, newNode],
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
    
    // Automatically select the newly created node for instant configuration
    setSelectedNodeId(newNode.id);
  };

  const sections: {
    title: string;
    key: keyof typeof expandedSections;
    items: LeftPanelItem[];
  }[] = [
    {
      title: 'Basic Elements',
      key: 'basic',
      items: [
        {
          name: 'Plain Text',
          icon: <Type className="h-4 w-4 text-emerald-400" />,
          description: 'Match exact string of characters',
          createNode: () => ({
            id: generateId(),
            type: 'literal',
            value: 'text',
          }),
        },
        {
          name: 'Any Character',
          icon: <HelpCircle className="h-4 w-4 text-emerald-400" />,
          description: 'Match any char except newline (.)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'any',
          }),
        },
        {
          name: 'Digit',
          icon: <Hash className="h-4 w-4 text-emerald-400" />,
          description: 'Match any number 0-9 (\\d)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'digit',
          }),
        },
        {
          name: 'Word Character',
          icon: <Type className="h-4 w-4 text-emerald-400" />,
          description: 'Letters, digits, underscores (\\w)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'word',
          }),
        },
        {
          name: 'Whitespace',
          icon: <Braces className="h-4 w-4 text-emerald-400" />,
          description: 'Spaces, tabs, newlines (\\s)',
          createNode: () => ({
            id: generateId(),
            type: 'character',
            charType: 'space',
          }),
        },
        {
          name: 'Character Range',
          icon: <Braces className="h-4 w-4 text-emerald-400" />,
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
      key: 'groups',
      items: [
        {
          name: 'Capture Group',
          icon: <FolderOpen className="h-4 w-4 text-blue-400" />,
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
          icon: <FolderOpen className="h-4 w-4 text-blue-400" />,
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
          icon: <FolderOpen className="h-4 w-4 text-blue-400" />,
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
      title: 'Logic',
      key: 'logic',
      items: [
        {
          name: 'Alternative (OR)',
          icon: <GitFork className="h-4 w-4 text-amber-400" />,
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
      ],
    },
    {
      title: 'Anchors & Boundaries',
      key: 'boundaries',
      items: [
        {
          name: 'Start of Line',
          icon: <Anchor className="h-4 w-4 text-indigo-400" />,
          description: 'Match beginning of string (^)',
          createNode: () => ({
            id: generateId(),
            type: 'boundary',
            boundaryType: 'start',
          }),
        },
        {
          name: 'End of Line',
          icon: <Anchor className="h-4 w-4 text-indigo-400" />,
          description: 'Match end of string ($)',
          createNode: () => ({
            id: generateId(),
            type: 'boundary',
            boundaryType: 'end',
          }),
        },
        {
          name: 'Word Boundary',
          icon: <Anchor className="h-4 w-4 text-indigo-400" />,
          description: 'Match boundary of words (\\b)',
          createNode: () => ({
            id: generateId(),
            type: 'boundary',
            boundaryType: 'word',
          }),
        },
      ],
    },
    {
      title: 'Advanced / Lookarounds',
      key: 'advanced',
      items: [
        {
          name: 'Lookahead',
          icon: <Eye className="h-4 w-4 text-fuchsia-400" />,
          description: 'Assert what follows next (?=...)',
          createNode: () => ({
            id: generateId(),
            type: 'lookaround',
            lookaroundType: 'lookahead',
            children: [],
          }),
        },
        {
          name: 'Negative Lookahead',
          icon: <Eye className="h-4 w-4 text-fuchsia-400" />,
          description: 'Assert what does NOT follow next (?!...)',
          createNode: () => ({
            id: generateId(),
            type: 'lookaround',
            lookaroundType: 'neg-lookahead',
            children: [],
          }),
        },
        {
          name: 'Lookbehind',
          icon: <Eye className="h-4 w-4 text-fuchsia-400" />,
          description: 'Assert what precedes (?<=...)',
          createNode: () => ({
            id: generateId(),
            type: 'lookaround',
            lookaroundType: 'lookbehind',
            children: [],
          }),
        },
        {
          name: 'Backreference',
          icon: <FlameKindling className="h-4 w-4 text-fuchsia-400" />,
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

  return (
    <aside className="w-[220px] border-r border-border-custom bg-sidebar flex flex-col h-full shrink-0 overflow-y-auto select-none">
      <div className="p-3.5 border-b border-border-custom bg-sidebar/50 shrink-0">
        <h3 className="font-sans font-bold text-[10px] uppercase tracking-wider text-slate-400">
          Component Library
        </h3>
        <p className="text-[10px] text-slate-500 mt-1">
          Click elements below to insert.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {sections.map(sec => (
          <div key={sec.key} className="space-y-1">
            <button
              onClick={() => toggleSection(sec.key)}
              className="w-full flex items-center justify-between py-1 px-1.5 hover:bg-bg rounded text-[11px] font-bold text-slate-300 transition cursor-pointer"
            >
              <span>{sec.title}</span>
              {expandedSections[sec.key] ? (
                <ChevronUp className="h-3 w-3 text-slate-500" />
              ) : (
                <ChevronDown className="h-3 w-3 text-slate-500" />
              )}
            </button>

            {expandedSections[sec.key] && (
              <div className="grid grid-cols-1 gap-1 pl-1 pt-0.5">
                {sec.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddItem(item.createNode)}
                    className="flex items-center gap-2.5 p-2 rounded-md border border-border-custom bg-node-bg hover:border-accent hover:bg-sidebar/80 transition text-left cursor-pointer group"
                  >
                    <div className="p-1.5 rounded bg-sidebar border border-border-custom shrink-0 transition">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 group-hover:text-slate-100 transition leading-none">
                        {item.name}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate mt-1 leading-none">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
