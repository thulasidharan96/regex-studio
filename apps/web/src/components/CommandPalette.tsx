/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRegexStudio } from './RegexStudioContext';
import { useSettingsStore } from '@thulasidharan96/stores';
import { Search, Terminal, Plus, FolderOpen, Sliders, ShieldAlert, FileCode, Moon, Settings, Sparkles } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    createNewProject,
  } = useRegexStudio();

  const {
    theme,
    setTheme,
    setActiveSidebarTab: setStoreSidebarTab,
  } = useSettingsStore();

  // Listen for keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands = useMemo(() => {
    return [
      {
        id: 'create-project',
        name: 'Create New Project',
        description: 'Initialize a clean blank regex canvas',
        icon: <Plus className="h-4 w-4 text-emerald-400" />,
        action: () => {
          createNewProject();
          setIsOpen(false);
        },
      },
      {
        id: 'open-project',
        name: 'Open Project Explorer',
        description: 'Browse, load, rename, or delete saved projects',
        icon: <FolderOpen className="h-4 w-4 text-accent" />,
        action: () => {
          setStoreSidebarTab('explorer');
          setIsOpen(false);
        },
      },
      {
        id: 'load-template',
        name: 'Browse Template Gallery',
        description: 'Load pre-made regex components (Email, URL, etc.)',
        icon: <Sparkles className="h-4 w-4 text-amber-400" />,
        action: () => {
          setStoreSidebarTab('templates');
          setIsOpen(false);
        },
      },
      {
        id: 'debug-regex',
        name: 'Launch Visual VM Debugger',
        description: 'Step through and animate backtracks',
        icon: <Terminal className="h-4 w-4 text-indigo-400" />,
        action: () => {
          // Bottom dock is shown automatically
          setIsOpen(false);
        },
      },
      {
        id: 'analyze-regex',
        name: 'Inspect Security & Perf Issues',
        description: 'Audit AST for ReDoS vulnerabilities',
        icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
        action: () => {
          setIsOpen(false);
        },
      },
      {
        id: 'export-code',
        name: 'Generate Code Snippet',
        description: 'Export compiled regex to JS, TS, Python, Go, Rust',
        icon: <FileCode className="h-4 w-4 text-teal-400" />,
        action: () => {
          setIsOpen(false);
        },
      },
      {
        id: 'toggle-theme',
        name: 'Cyclic Toggle Dark Theme',
        description: 'Switch between Cosmic, VS Code, and GitHub Dark',
        icon: <Moon className="h-4 w-4 text-purple-400" />,
        action: () => {
          const nextTheme =
            theme === 'regex-studio-dark'
              ? 'vs-code-dark'
              : theme === 'vs-code-dark'
                ? 'github-dark'
                : 'regex-studio-dark';
          setTheme(nextTheme);
        },
      },
      {
        id: 'open-settings',
        name: 'Open Editor Settings',
        description: 'Customize grid snapping, animation speed, and layout',
        icon: <Settings className="h-4 w-4 text-slate-400" />,
        action: () => {
          setStoreSidebarTab('settings');
          setIsOpen(false);
        },
      },
    ];
  }, [createNewProject, setStoreSidebarTab, theme, setTheme]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const query = search.toLowerCase();
    return commands.filter(
      (c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
  }, [commands, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-start justify-center pt-24 px-4 select-none font-sans">
      <div className="bg-sidebar border border-border-custom w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-3.5 py-3 border-b border-border-custom bg-bg/40">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search action (e.g., templates, settings)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-slate-200 text-xs focus:outline-none placeholder-slate-500"
          />
          <span className="text-[10px] font-bold text-slate-500 bg-sidebar border border-border-custom/80 px-1.5 py-0.5 rounded shadow-sm shrink-0">
            ESC
          </span>
        </div>

        {/* Results items */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              No matching workspace actions found.
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={cmd.action}
                className="w-full text-left p-2.5 rounded-lg flex items-center justify-between gap-3.5 hover:bg-input-bg/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-bg border border-border-custom rounded-md shrink-0">
                    {cmd.icon}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 leading-none">
                      {cmd.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate leading-tight">
                      {cmd.description}
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold text-slate-600 uppercase shrink-0">
                  execute
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer tip bar */}
        <div className="px-3.5 py-2 border-t border-border-custom bg-bg/25 text-[10px] text-slate-500 flex items-center justify-between select-none">
          <span>Tip: Use ↑ ↓ arrow keys or mouse click to select commands</span>
          <span className="font-mono text-[9px] text-slate-600 font-semibold">
            Press Ctrl+K to close
          </span>
        </div>
      </div>
    </div>
  );
};
