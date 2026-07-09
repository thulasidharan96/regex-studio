/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRegexStudio } from './RegexStudioContext';
import { useSettingsStore } from '@regex-studio/stores';
import { 
  FolderOpen, 
  Plus, 
  Save, 
  Trash2, 
  Copy, 
  Share2, 
  Undo, 
  Redo, 
  ArrowRight, 
  FileJson,
  Terminal,
  Activity,
  AlertCircle,
  Download
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeProject,
    savedProjects,
    compiledRegex,
    compiledFlags,
    canUndo,
    canRedo,
    undo,
    redo,
    createNewProject,
    saveCurrentProject,
    loadProject,
    deleteProject,
    duplicateProject,
    importRegExp,
    getShareUrl,
    updateProjectName,
  } = useRegexStudio();

  const editorMode = useSettingsStore((s) => s.editorMode);
  const setEditorMode = useSettingsStore((s) => s.setEditorMode);

  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(activeProject.name);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Sync project name when active project changes
  React.useEffect(() => {
    setProjectName(activeProject.name);
  }, [activeProject.name]);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    });
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) return;
    
    const success = importRegExp(importInput);
    if (success) {
      setImportInput('');
      setImportError(false);
    } else {
      setImportError(true);
      setTimeout(() => setImportError(false), 3000);
    }
  };

  const handleShare = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (projectName.trim() && projectName !== activeProject.name) {
      updateProjectName(projectName.trim());
    }
  };

  return (
    <header className="bg-sidebar text-slate-100 border-b border-border-custom px-4 h-12 flex items-center justify-between gap-4 shrink-0 shadow-md z-50">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-2.5">
        <div className="bg-accent w-6 h-6 rounded-md flex items-center justify-center text-white shadow-sm font-bold text-sm">
          R
        </div>
        <div>
          <span className="font-sans font-bold text-sm tracking-tight text-slate-200">
            Regex Studio
          </span>
          <span className="text-[9px] font-mono text-slate-400 ml-1.5 border border-border-custom px-1 py-0.5 rounded bg-input-bg">
            / {activeProject.name.toLowerCase().replace(/\s+/g, '-')}
          </span>
        </div>
      </div>

      {/* Middle section: Project Selector & Name Editor */}
      <div className="flex items-center gap-3 bg-input-bg px-2.5 py-1 rounded-md border border-border-custom max-w-xs">
        <div className="relative">
          <button 
            id="project-selector-btn"
            onClick={() => setShowSavedList(!showSavedList)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-slate-100 px-1.5 py-0.5 rounded hover:bg-sidebar transition text-xs font-semibold cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5 text-accent" />
            <span>Open</span>
          </button>
          
          {showSavedList && (
            <div className="absolute left-0 mt-2 w-64 bg-sidebar border border-border-custom rounded-lg shadow-xl py-2 z-50 text-xs max-h-80 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-border-custom pb-2 mb-1 flex items-center justify-between">
                <span>My Projects</span>
                <button 
                  onClick={() => { createNewProject(); setShowSavedList(false); }}
                  className="text-accent hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> New
                </button>
              </div>
              
              {savedProjects.length === 0 ? (
                <div className="px-3 py-4 text-center text-slate-500 text-xs">
                  No saved projects
                </div>
              ) : (
                savedProjects.map((p) => (
                  <div 
                    key={p.id}
                    className={`flex items-center justify-between px-3 py-1.5 hover:bg-bg cursor-pointer group ${p.id === activeProject.id ? 'bg-bg border-l-2 border-accent' : ''}`}
                  >
                    <button
                      onClick={() => { loadProject(p.id); setShowSavedList(false); }}
                      className="flex-1 text-left truncate text-slate-300 hover:text-slate-100 font-semibold cursor-pointer"
                    >
                      {p.name}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => duplicateProject(p.id)}
                        title="Duplicate Project"
                        className="p-1 hover:text-accent text-slate-500 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => deleteProject(p.id)}
                        title="Delete Project"
                        className="p-1 hover:text-red-400 text-slate-500 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="h-3 w-[1px] bg-border-custom" />

        {isEditingName ? (
          <input
            id="project-name-input"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNameBlur(); }}
            autoFocus
            className="bg-sidebar border border-border-custom rounded px-2 py-0.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-accent w-36"
          />
        ) : (
          <button 
            id="project-name-btn"
            onClick={() => setIsEditingName(true)}
            className="text-slate-200 font-bold text-xs hover:underline cursor-pointer truncate max-w-[120px]"
            title="Click to rename"
          >
            {activeProject.name}
          </button>
        )}

        <button 
          id="project-save-btn"
          onClick={saveCurrentProject}
          title="Save Project State"
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-sidebar rounded transition cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Import Form */}
      <form onSubmit={handleImport} className="flex-1 max-w-sm flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            id="regex-import-input"
            type="text"
            placeholder="Import RegExp, e.g. /^([a-z]+)@([a-z]+)$/i"
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            className={`w-full bg-input-bg border text-xs text-slate-200 placeholder-slate-500 px-3 py-1 rounded-md focus:outline-none focus:border-accent font-mono transition ${
              importError ? 'border-red-500 bg-red-950/20 text-red-200' : 'border-border-custom'
            }`}
          />
          {importError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-red-400 text-[10px] gap-1 font-sans">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Invalid Pattern</span>
            </div>
          )}
        </div>
        <button
          id="regex-import-btn"
          type="submit"
          className="bg-sidebar hover:bg-bg text-xs font-semibold px-2.5 py-1 rounded-md border border-border-custom transition flex items-center gap-1 text-slate-300 cursor-pointer"
        >
          Import <ArrowRight className="h-3 w-3" />
        </button>
      </form>

      {/* Right control buttons: Undo, Redo, Share */}
      <div className="flex items-center gap-3">
        {/* Editor Mode Toggle */}
        <div className="flex items-center bg-input-bg p-0.5 rounded-md border border-border-custom shrink-0">
          <button
            onClick={() => setEditorMode('visual')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              editorMode === 'visual'
                ? 'bg-accent text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Canvas
          </button>
          <button
            onClick={() => setEditorMode('monaco')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              editorMode === 'monaco'
                ? 'bg-accent text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monaco Source
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-input-bg p-0.5 rounded-md border border-border-custom">
          <button
            id="undo-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1 rounded transition ${
              canUndo 
                ? 'text-slate-300 hover:text-slate-100 hover:bg-sidebar cursor-pointer' 
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            id="redo-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1 rounded transition ${
              canRedo 
                ? 'text-slate-300 hover:text-slate-100 hover:bg-sidebar cursor-pointer' 
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Install PWA Button */}
        {showInstallBtn && (
          <button
            id="install-pwa-btn"
            onClick={handleInstallClick}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install App</span>
          </button>
        )}

        {/* Share Button */}
        <button
          id="share-btn"
          onClick={handleShare}
          className={`px-3 py-1 rounded-md font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
            copied 
              ? 'bg-emerald-600 text-white' 
              : 'bg-accent hover:bg-blue-600 text-white shadow-blue-500/10'
          }`}
        >
          {copied ? (
            <>
              <span>Shared Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>Share IDE</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
