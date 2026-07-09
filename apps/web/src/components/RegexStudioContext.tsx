/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect } from 'react';
import LZString from 'lz-string';
import { ASTNode, RegexProject, AnalysisIssue } from '@regex-studio/regex-core';
import { compileAST, compileFlags } from '@regex-studio/regex-compiler';
import { analyzeAST } from '@regex-studio/regex-analyzer';
import {
  useProjectStore,
  useASTStore,
  useCanvasStore,
  useHistoryStore,
} from '@regex-studio/stores';

// URL Compression Helpers using lz-string
export function encodeShareState(state: { ast: ASTNode[]; flags: RegexProject['flags']; sampleText: string }): string {
  try {
    const jsonStr = JSON.stringify(state);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error('Error encoding share state:', err);
    return '';
  }
}

export function decodeShareState(encoded: string): { ast: ASTNode[]; flags: RegexProject['flags']; sampleText: string } | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    return JSON.parse(decompressed);
  } catch (err) {
    console.error('Error decoding share state:', err);
    return null;
  }
}

const DEFAULT_PROJECTS: RegexProject[] = [
  {
    id: 'email-validator',
    name: 'Email Validator',
    ast: [
      { id: 'b-start', type: 'boundary', boundaryType: 'start' },
      {
        id: 'user-group',
        type: 'group',
        groupType: 'capture',
        children: [
          {
            id: 'chars-class',
            type: 'range',
            ranges: [
              { id: 'r1', start: 'a', end: 'z' },
              { id: 'r2', start: 'A', end: 'Z' },
              { id: 'r3', start: '0', end: '9' },
              { id: 'r4', start: '.', end: '.' },
              { id: 'r5', start: '_', end: '_' },
              { id: 'r6', start: '%', end: '%' },
              { id: 'r7', start: '+', end: '+' },
              { id: 'r8', start: '-', end: '-' },
            ],
            quantifier: { type: '+', min: 1, max: null, lazy: false },
          }
        ]
      },
      { id: 'at-symbol', type: 'literal', value: '@' },
      {
        id: 'domain-group',
        type: 'group',
        groupType: 'capture',
        children: [
          {
            id: 'domain-class',
            type: 'range',
            ranges: [
              { id: 'd1', start: 'a', end: 'z' },
              { id: 'd2', start: 'A', end: 'Z' },
              { id: 'd3', start: '0', end: '9' },
              { id: 'd4', start: '-', end: '-' },
              { id: 'd5', start: '.', end: '.' },
            ],
            quantifier: { type: '+', min: 1, max: null, lazy: false },
          }
        ]
      },
      { id: 'dot-escaped', type: 'literal', value: '.' },
      {
        id: 'tld-group',
        type: 'group',
        groupType: 'capture',
        children: [
          {
            id: 'tld-class',
            type: 'range',
            ranges: [
              { id: 't1', start: 'a', end: 'z' },
              { id: 't2', start: 'A', end: 'Z' },
            ],
            quantifier: { type: 'custom', min: 2, max: 6, lazy: false },
          }
        ]
      },
      { id: 'b-end', type: 'boundary', boundaryType: 'end' },
    ],
    flags: {
      global: true,
      ignoreCase: true,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    },
    sampleText: 'john.doe@domain.com\ninvalid-email@domain\nsupport@google.co.uk',
    notes: 'A standard email validator verifying username, @ symbol, domain, and top-level domain.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

interface RegexStudioContextType {
  activeProject: RegexProject;
  savedProjects: RegexProject[];
  selectedNodeId: string | null;
  history: RegexProject[];
  historyIndex: number;
  pastDescriptions: string[];
  futureDescriptions: string[];
  jumpToHistoryIndex: (index: number) => void;
  commitWithDescription: (description: string) => void;
  analysisIssues: AnalysisIssue[];
  compiledRegex: string;
  compiledFlags: string;
  
  setSelectedNodeId: (id: string | null) => void;
  updateAST: (newAST: ASTNode[]) => void;
  updateFlags: (newFlags: RegexProject['flags']) => void;
  updateSampleText: (text: string) => void;
  updateNotes: (notes: string) => void;
  updateProjectName: (name: string) => void;
  
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  createNewProject: (name?: string) => void;
  saveCurrentProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  
  importRegExp: (pattern: string, flagsStr?: string) => boolean;
  getShareUrl: () => string;
}

const RegexStudioContext = createContext<RegexStudioContextType | undefined>(undefined);

export const RegexStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeProject = useProjectStore((s) => s.activeProject);
  const savedProjects = useProjectStore((s) => s.savedProjects);
  const initProjects = useProjectStore((s) => s.initProjects);
  const createNewProjectAction = useProjectStore((s) => s.createNewProject);
  const saveCurrentProjectAction = useProjectStore((s) => s.saveCurrentProject);
  const loadProjectAction = useProjectStore((s) => s.loadProject);
  const deleteProjectAction = useProjectStore((s) => s.deleteProject);
  const duplicateProjectAction = useProjectStore((s) => s.duplicateProject);
  const updateProjectProperties = useProjectStore((s) => s.updateProjectProperties);

  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);

  const updateASTAction = useASTStore((s) => s.updateAST);
  const importRegExpAction = useASTStore((s) => s.importRegExp);

  const history = useHistoryStore((s) => [...s.past, ...(s.present ? [s.present] : [])]);
  const historyIndex = useHistoryStore((s) => s.past.length);
  const pastDescriptions = useHistoryStore((s) => s.pastDescriptions);
  const futureDescriptions = useHistoryStore((s) => s.futureDescriptions);
  const jumpToHistoryIndex = useHistoryStore((s) => s.jumpToHistoryIndex);
  const commitToHistory = useHistoryStore((s) => s.snapshot);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const undoAction = useHistoryStore((s) => s.undo);
  const redoAction = useHistoryStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.canUndo());
  const canRedo = useHistoryStore((s) => s.canRedo());

  const commitWithDescription = (description: string) => {
    if (activeProject) {
      commitToHistory(activeProject, description);
    }
  };

  // Initialize projects on startup from IndexedDB Dexie
  useEffect(() => {
    const loadAndCheckShare = async () => {
      // 1. Initial project loading
      await initProjects(DEFAULT_PROJECTS);

      // 2. Clear history and start fresh with loaded project
      const loadedProject = useProjectStore.getState().activeProject;
      if (loadedProject) {
        clearHistory(loadedProject);
      }

      // 3. Check share URL hash
      const hash = window.location.hash;
      if (hash.startsWith('#/share/')) {
        const dataStr = hash.replace('#/share/', '');
        const decoded = decodeShareState(dataStr);
        if (decoded) {
          const sharedProject: RegexProject = {
            id: 'shared-' + Math.random().toString(36).substring(2, 9),
            name: 'Shared Regex Pattern',
            ast: decoded.ast,
            flags: decoded.flags,
            sampleText: decoded.sampleText,
            notes: 'This project was shared with you via compressed link.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          useProjectStore.setState({ activeProject: sharedProject });
          clearHistory(sharedProject);
          window.history.pushState('', document.title, window.location.pathname + window.location.search);
        }
      }
    };

    loadAndCheckShare();
  }, [initProjects, clearHistory]);

  // Hook to commit new edits into the history manager
  const commitProjectState = (newProjectState: RegexProject) => {
    commitToHistory(newProjectState);
  };

  // Compile and Analyze Live from state
  const compiledRegex = activeProject ? compileAST(activeProject.ast) : '';
  const compiledFlags = activeProject ? compileFlags(activeProject.flags) : '';
  const analysisIssues = activeProject
    ? analyzeAST(activeProject.ast).map((issue): AnalysisIssue => ({
        id: issue.id,
        severity: issue.severity,
        title: issue.title || issue.message,
        description: issue.description || issue.explanation,
        nodeId: issue.nodeId || issue.location,
      }))
    : [];

  // Wrappers matching standard interfaces
  const updateAST = (newAST: ASTNode[]) => {
    if (!activeProject) return;
    updateASTAction(newAST);
    const updated = useProjectStore.getState().activeProject;
    if (updated) commitProjectState(updated);
  };

  const updateFlags = (newFlags: RegexProject['flags']) => {
    if (!activeProject) return;
    updateProjectProperties({ flags: newFlags });
    const updated = useProjectStore.getState().activeProject;
    if (updated) commitProjectState(updated);
  };

  const updateSampleText = (text: string) => {
    if (!activeProject) return;
    updateProjectProperties({ sampleText: text });
    const updated = useProjectStore.getState().activeProject;
    if (updated) commitProjectState(updated);
  };

  const updateNotes = (notes: string) => {
    if (!activeProject) return;
    updateProjectProperties({ notes });
    const updated = useProjectStore.getState().activeProject;
    if (updated) commitProjectState(updated);
  };

  const updateProjectName = (name: string) => {
    if (!activeProject) return;
    updateProjectProperties({ name });
    const updated = useProjectStore.getState().activeProject;
    if (updated) commitProjectState(updated);
  };

  const createNewProject = async (name = 'Untitled Project') => {
    const newProj = await createNewProjectAction(name);
    clearHistory(newProj);
    setSelectedNodeId(null);
  };

  const saveCurrentProject = () => {
    saveCurrentProjectAction();
  };

  const loadProject = async (id: string) => {
    await loadProjectAction(id);
    const loaded = useProjectStore.getState().activeProject;
    if (loaded) {
      clearHistory(loaded);
    }
    setSelectedNodeId(null);
  };

  const deleteProject = (id: string) => {
    deleteProjectAction(id);
  };

  const duplicateProject = async (id: string) => {
    await duplicateProjectAction(id);
    const duplicated = useProjectStore.getState().activeProject;
    if (duplicated) {
      clearHistory(duplicated);
    }
    setSelectedNodeId(null);
  };

  const importRegExp = (pattern: string, flagsStr?: string): boolean => {
    const success = importRegExpAction(pattern, flagsStr);
    if (success) {
      const updated = useProjectStore.getState().activeProject;
      if (updated) commitProjectState(updated);
      setSelectedNodeId(null);
    }
    return success;
  };

  const getShareUrl = (): string => {
    if (!activeProject) return '';
    const shareData = {
      ast: activeProject.ast,
      flags: activeProject.flags,
      sampleText: activeProject.sampleText,
    };
    const compressed = encodeShareState(shareData);
    const origin = window.location.origin + window.location.pathname;
    return `${origin}#/share/${compressed}`;
  };

  // Safe fallback to prevent rendering crash before initialization finishes
  const fallbackProject: RegexProject = DEFAULT_PROJECTS[0];
  const safeActiveProject = activeProject || fallbackProject;

  return (
    <RegexStudioContext.Provider
      value={{
        activeProject: safeActiveProject,
        savedProjects,
        selectedNodeId,
        history,
        historyIndex,
        pastDescriptions,
        futureDescriptions,
        jumpToHistoryIndex,
        commitWithDescription,
        analysisIssues,
        compiledRegex,
        compiledFlags,
        setSelectedNodeId,
        updateAST,
        updateFlags,
        updateSampleText,
        updateNotes,
        updateProjectName,
        undo: undoAction,
        redo: redoAction,
        canUndo,
        canRedo,
        createNewProject,
        saveCurrentProject,
        loadProject,
        deleteProject,
        duplicateProject,
        importRegExp,
        getShareUrl,
      }}
    >
      {children}
    </RegexStudioContext.Provider>
  );
};

export const useRegexStudio = () => {
  const context = useContext(RegexStudioContext);
  if (!context) {
    throw new Error('useRegexStudio must be used within a RegexStudioProvider');
  }
  return context;
};
