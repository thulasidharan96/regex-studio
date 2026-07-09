/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRegexStudio } from './RegexStudioContext';
import { ASTNode, CharacterType, BoundaryType, GroupType, LookaroundType, QuantifierType, RangeItem } from '@thulasidharan96/regex-core';
import { 
  Settings, 
  Trash2, 
  Plus, 
  Copy, 
  HelpCircle,
  Hash,
  Sliders,
  Sparkles,
  Bookmark
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const {
    activeProject,
    selectedNodeId,
    setSelectedNodeId,
    updateAST,
    updateFlags,
    updateNotes,
  } = useRegexStudio();

  // Selected node state lookup helper
  const findNodeInAST = (nodes: ASTNode[], id: string): ASTNode | null => {
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

  // Modify helper
  const modifySelectedNode = (modifyFn: (node: ASTNode) => void) => {
    if (!selectedNodeId) return;

    const modifyRecursively = (nodes: ASTNode[]): ASTNode[] => {
      return nodes.map(node => {
        if (node.id === selectedNodeId) {
          const cloned = { ...node };
          modifyFn(cloned);
          return cloned;
        } else if (node.children && node.children.length > 0) {
          return { ...node, children: modifyRecursively(node.children) };
        }
        return node;
      });
    };

    const updated = modifyRecursively(activeProject.ast);
    updateAST(updated);
  };

  // Node duplication/deletion actions inside inspector
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    const deleteRecursively = (nodes: ASTNode[]): ASTNode[] => {
      return nodes
        .filter(n => n.id !== selectedNodeId)
        .map(n => {
          if (n.children && n.children.length > 0) {
            return { ...n, children: deleteRecursively(n.children) };
          }
          return n;
        });
    };
    updateAST(deleteRecursively(activeProject.ast));
    setSelectedNodeId(null);
  };

  // Flag and note sync
  const handleFlagChange = (key: keyof typeof activeProject.flags) => {
    const updated = {
      ...activeProject.flags,
      [key]: !activeProject.flags[key],
    };
    updateFlags(updated);
  };

  // Custom range modifiers
  const handleAddRangeItem = () => {
    modifySelectedNode(node => {
      const currentRanges = node.ranges || [];
      node.ranges = [
        ...currentRanges,
        { id: Math.random().toString(36).substring(2, 9), start: 'a', end: 'z' }
      ];
    });
  };

  const handleUpdateRangeItem = (rangeId: string, fields: Partial<RangeItem>) => {
    modifySelectedNode(node => {
      node.ranges = (node.ranges || []).map(r => {
        if (r.id === rangeId) {
          return { ...r, ...fields };
        }
        return r;
      });
    });
  };

  const handleDeleteRangeItem = (rangeId: string) => {
    modifySelectedNode(node => {
      node.ranges = (node.ranges || []).filter(r => r.id !== rangeId);
    });
  };

  return (
    <aside className="w-[260px] border-l border-border-custom bg-sidebar flex flex-col h-full shrink-0 overflow-y-auto select-none">
      {/* 1. Global Settings View (When no node is selected) */}
      {!selectedNode ? (
        <div className="flex flex-col h-full divide-y divide-border-custom">
          {/* Header */}
          <div className="p-3.5 bg-sidebar/50 border-b border-border-custom">
            <h3 className="font-sans font-bold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-accent" />
              <span>Regex Settings</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              Select any visual block to configure parameters, or toggle overall flags.
            </p>
          </div>

          {/* Regex Flags section */}
          <div className="p-3.5 space-y-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 block">
              Active Flags (RegExp Options)
            </span>
            <div className="space-y-1.5">
              {[
                { key: 'global', name: 'Global Match (g)', desc: 'Match all matches instead of only first' },
                { key: 'ignoreCase', name: 'Case Insensitive (i)', desc: 'Ignore upper/lower case differences' },
                { key: 'multiline', name: 'Multiline (m)', desc: 'Treat ^ and $ as matching line starts/ends' },
                { key: 'dotAll', name: 'Dot All / Single Line (s)', desc: 'Allow dot (.) to match newlines' },
                { key: 'unicode', name: 'Unicode (u)', desc: 'Treat pattern as a sequence of unicode code points' },
                { key: 'sticky', name: 'Sticky (y)', desc: 'Anchor matches at the exact index position' },
              ].map(flag => (
                <label 
                  key={flag.key}
                  className="flex items-start gap-2.5 p-1.5 rounded hover:bg-bg cursor-pointer select-none border border-transparent hover:border-border-custom/50 transition"
                >
                  <input
                    type="checkbox"
                    checked={activeProject.flags[flag.key as keyof typeof activeProject.flags]}
                    onChange={() => handleFlagChange(flag.key as keyof typeof activeProject.flags)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-border-custom bg-input-bg text-accent focus:ring-accent cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block leading-none">
                      {flag.name}
                    </span>
                    <span className="text-[9px] text-slate-500 leading-tight block mt-1">
                      {flag.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Project notes & description */}
          <div className="p-3.5 flex-1 flex flex-col min-h-0">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Bookmark className="h-3.5 w-3.5 text-accent" />
              <span>Project Documentation</span>
            </span>
            <textarea
              id="project-notes-textarea"
              placeholder="Describe what this regular expression does, its constraints, or write usage notes..."
              value={activeProject.notes}
              onChange={(e) => updateNotes(e.target.value)}
              className="w-full flex-1 min-h-[140px] bg-input-bg text-xs text-slate-200 placeholder-slate-600 p-2.5 rounded-md border border-border-custom focus:outline-none focus:border-accent font-sans resize-none leading-normal"
            />
          </div>
        </div>
      ) : (
        /* 2. Node Properties Inspector */
        <div className="flex flex-col h-full divide-y divide-border-custom">
          {/* Node Header */}
          <div className="p-3.5 bg-sidebar/50 flex items-center justify-between border-b border-border-custom">
            <div>
              <h3 className="font-sans font-bold text-[10px] uppercase tracking-wider text-slate-400">
                Node Properties
              </h3>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                ID: {selectedNode.id}
              </span>
            </div>
            <button
              id="inspector-delete-btn"
              onClick={handleDeleteSelected}
              title="Delete Node"
              className="p-1 hover:bg-red-950/40 rounded-md text-slate-500 hover:text-red-400 border border-transparent hover:border-red-900/40 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Primary properties (specific to type) */}
          <div className="p-3.5 space-y-3.5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 block">
              Node Parameters ({selectedNode.type.toUpperCase()})
            </span>

            {/* Literal input */}
            {selectedNode.type === 'literal' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block">
                  Literal String Value
                </label>
                <input
                  id="param-literal-input"
                  type="text"
                  value={selectedNode.value || ''}
                  onChange={(e) => modifySelectedNode(n => { n.value = e.target.value; })}
                  className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 font-mono focus:outline-none focus:border-accent"
                />
              </div>
            )}

            {/* Character class select */}
            {selectedNode.type === 'character' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block">
                  Character Symbol Class
                </label>
                <select
                  id="param-char-select"
                  value={selectedNode.charType || 'any'}
                  onChange={(e) => modifySelectedNode(n => { n.charType = e.target.value as CharacterType; })}
                  className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="any">Any Character (.)</option>
                  <option value="digit">Digit (\d)</option>
                  <option value="non-digit">Non-digit (\D)</option>
                  <option value="word">Word character [a-zA-Z0-9_] (\w)</option>
                  <option value="non-word">Non-word character (\W)</option>
                  <option value="space">Whitespace (\s)</option>
                  <option value="non-space">Non-whitespace (\S)</option>
                  <option value="tab">Tab character (\t)</option>
                  <option value="newline">Newline (\n)</option>
                </select>
              </div>
            )}

            {/* Boundary anchor selector */}
            {selectedNode.type === 'boundary' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block">
                  Anchor / Boundary Type
                </label>
                <select
                  id="param-boundary-select"
                  value={selectedNode.boundaryType || 'start'}
                  onChange={(e) => modifySelectedNode(n => { n.boundaryType = e.target.value as BoundaryType; })}
                  className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="start">Start of Line (^)</option>
                  <option value="end">End of Line ($)</option>
                  <option value="word">Word Boundary (\b)</option>
                  <option value="non-word">Non-word Boundary (\B)</option>
                </select>
              </div>
            )}

            {/* Backreference selector */}
            {selectedNode.type === 'backreference' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block">
                  Referenced Capture Group Index
                </label>
                <input
                  id="param-backref-input"
                  type="number"
                  min="1"
                  max="9"
                  value={selectedNode.value || '1'}
                  onChange={(e) => modifySelectedNode(n => { n.value = e.target.value; })}
                  className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 focus:outline-none focus:border-accent"
                />
              </div>
            )}

            {/* Group type configurations */}
            {(selectedNode.type === 'group' || selectedNode.type === 'captureGroup' || selectedNode.type === 'namedGroup' || selectedNode.type === 'nonCaptureGroup') && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 block">
                    Group Behavior
                  </label>
                  <select
                    id="param-group-select"
                    value={selectedNode.type === 'captureGroup' ? 'capture' : selectedNode.type === 'namedGroup' ? 'named' : selectedNode.type === 'nonCaptureGroup' ? 'non-capture' : (selectedNode.groupType || 'capture')}
                    onChange={(e) => modifySelectedNode(n => {
                      const val = e.target.value;
                      if (val === 'capture') {
                        n.type = 'captureGroup';
                      } else if (val === 'named') {
                        n.type = 'namedGroup';
                        n.name = n.name || 'group';
                      } else {
                        n.type = 'nonCaptureGroup';
                      }
                    })}
                    className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="capture">Standard Capture Group (...)</option>
                    <option value="named">Named Capture Group (?&lt;name&gt;...)</option>
                    <option value="non-capture">Non-capturing Group (?:...)</option>
                  </select>
                </div>

                {(selectedNode.type === 'namedGroup' || selectedNode.groupType === 'named') && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-bold text-slate-400 block">
                      Group Variable Name
                    </label>
                    <input
                      id="param-group-name"
                      type="text"
                      value={selectedNode.name || ''}
                      onChange={(e) => modifySelectedNode(n => { 
                        // Strip non-alphanumeric chars for valid variable names
                        n.name = e.target.value.replace(/[^a-zA-Z0-9_]/g, ''); 
                      })}
                      className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Lookaround selection */}
            {(selectedNode.type === 'lookaround' || selectedNode.type === 'lookahead' || selectedNode.type === 'negativeLookahead' || selectedNode.type === 'lookbehind' || selectedNode.type === 'negativeLookbehind') && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block">
                  Lookaround Assertion Assertion
                </label>
                <select
                  id="param-lookaround-select"
                  value={selectedNode.type === 'lookahead' ? 'lookahead' : selectedNode.type === 'negativeLookahead' ? 'neg-lookahead' : selectedNode.type === 'lookbehind' ? 'lookbehind' : selectedNode.type === 'negativeLookbehind' ? 'neg-lookbehind' : (selectedNode.lookaroundType || 'lookahead')}
                  onChange={(e) => modifySelectedNode(n => {
                    const val = e.target.value;
                    if (val === 'lookahead') n.type = 'lookahead';
                    else if (val === 'neg-lookahead') n.type = 'negativeLookahead';
                    else if (val === 'lookbehind') n.type = 'lookbehind';
                    else if (val === 'neg-lookbehind') n.type = 'negativeLookbehind';
                  })}
                  className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="lookahead">Positive Lookahead (?=...)</option>
                  <option value="neg-lookahead">Negative Lookahead (?!...)</option>
                  <option value="lookbehind">Positive Lookbehind (?&lt;=...)</option>
                  <option value="neg-lookbehind">Negative Lookbehind (?&lt;!...)</option>
                </select>
              </div>
            )}

            {/* Character class Ranges controls */}
            {(selectedNode.type === 'range' || selectedNode.type === 'charset') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    Characters in Class
                  </span>
                  <button
                    onClick={handleAddRangeItem}
                    className="text-[10px] font-bold text-accent hover:text-blue-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Range
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 cursor-pointer bg-input-bg/40 p-1.5 rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedNode.negated || false}
                      onChange={(e) => modifySelectedNode(n => { n.negated = e.target.checked; })}
                      className="h-3.5 w-3.5 rounded border-border-custom bg-input-bg text-accent focus:ring-accent cursor-pointer"
                    />
                    <span>Negate Character Class ([^...])</span>
                  </label>

                  {/* List of custom ranges */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(selectedNode.ranges || []).length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic block py-2">
                        Empty class. Add characters.
                      </span>
                    ) : (
                      (selectedNode.ranges || []).map((r) => (
                        <div key={r.id} className="flex items-center gap-1 bg-input-bg/20 p-1 rounded border border-border-custom/80">
                          <input
                            type="text"
                            maxLength={1}
                            value={r.start}
                            onChange={(e) => handleUpdateRangeItem(r.id, { start: e.target.value })}
                            className="w-8 text-center bg-input-bg text-xs font-mono text-slate-200 border border-border-custom rounded py-0.5 focus:outline-none focus:border-accent"
                          />
                          <span className="text-slate-600 text-xs">-</span>
                          <input
                            type="text"
                            maxLength={1}
                            value={r.end}
                            onChange={(e) => handleUpdateRangeItem(r.id, { end: e.target.value })}
                            className="w-8 text-center bg-input-bg text-xs font-mono text-slate-200 border border-border-custom rounded py-0.5 focus:outline-none focus:border-accent"
                          />
                          <span className="text-[10px] text-slate-500 italic px-1 flex-1 font-mono">
                            {r.start === r.end ? r.start : `${r.start}-${r.end}`}
                          </span>
                          <button
                            onClick={() => handleDeleteRangeItem(r.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantifiers config */}
          <div className="p-3.5 space-y-3.5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-accent" />
              <span>Quantifier & Repeats</span>
            </span>

            {/* Quantifier type select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 block">
                Repetition Pattern
              </label>
              <select
                id="quantifier-type-select"
                value={selectedNode.quantifier?.type || 'none'}
                onChange={(e) => {
                  const val = e.target.value as QuantifierType;
                  modifySelectedNode(node => {
                    const currentQ = node.quantifier || { type: 'none', min: 1, max: 1, lazy: false };
                    node.quantifier = {
                      type: val,
                      min: val === '+' ? 1 : 0,
                      max: val === '?' ? 1 : null,
                      lazy: currentQ.lazy,
                    };
                  });
                }}
                className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded-md px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="none">Exactly once (no repeat)</option>
                <option value="*">Zero or more times (*)</option>
                <option value="+">One or more times (+)</option>
                <option value="?">Optional / Zero or one (?)</option>
                <option value="custom">Custom Repeat Count ({'{min,max}'})</option>
              </select>
            </div>

            {/* Custom repeat sliders / numbers */}
            {selectedNode.quantifier?.type === 'custom' && (
              <div className="space-y-2.5 bg-input-bg/30 p-2.5 rounded-md border border-border-custom animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Min Repeats</label>
                    <input
                      id="quantifier-min-input"
                      type="number"
                      min="0"
                      value={selectedNode.quantifier.min}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => modifySelectedNode(n => {
                        if (n.quantifier) {
                           n.quantifier.min = Math.max(0, parseInt(e.target.value, 10) || 0);
                        }
                      })}
                      className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded px-1.5 py-0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Max Repeats</label>
                    <input
                      id="quantifier-max-input"
                      type="number"
                      min="0"
                      disabled={selectedNode.quantifier.max === null}
                      value={selectedNode.quantifier.max ?? ''}
                      placeholder="Infinite"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => modifySelectedNode(n => {
                        if (n.quantifier) {
                          const val = e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0);
                          n.quantifier.max = val;
                        }
                      })}
                      className="w-full bg-input-bg text-xs text-slate-100 border border-border-custom rounded px-1.5 py-0.5 disabled:opacity-40 disabled:bg-sidebar"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[9px] text-slate-400 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNode.quantifier.max === null}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => modifySelectedNode(n => {
                      if (n.quantifier) {
                        n.quantifier.max = e.target.checked ? null : (n.quantifier.min || 1);
                      }
                    })}
                    className="h-3.5 w-3.5 rounded border-border-custom bg-input-bg text-accent focus:ring-accent cursor-pointer"
                  />
                  <span>Allow infinite repetitions ({'{min,}'})</span>
                </label>
              </div>
            )}

            {/* Lazy matching parameter */}
            {selectedNode.quantifier && selectedNode.quantifier.type !== 'none' && (
              <label className="flex items-start gap-2.5 p-2 rounded-md hover:bg-bg border border-border-custom transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedNode.quantifier.lazy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => modifySelectedNode(n => {
                    if (n.quantifier) {
                      n.quantifier.lazy = e.target.checked;
                    }
                  })}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-border-custom bg-input-bg text-accent focus:ring-accent cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Lazy Matching (Non-greedy)
                  </span>
                  <span className="text-[9px] text-slate-500 leading-tight block mt-0.5">
                    Match as few characters as possible (appends `?` to quantifier).
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
