/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface SettingsState {
  theme: 'regex-studio-dark' | 'vs-code-dark' | 'github-dark' | 'nordic-light' | 'high-contrast';
  editorMode: 'visual' | 'monaco';
  reducedMotion: boolean;
  activeSidebarTab: 'explorer' | 'components' | 'templates' | 'history' | 'settings' | null;
  sidebarExpanded: boolean;
  preferences: {
    autoCompile: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  shortcuts: {
    undo: string;
    redo: string;
    save: string;
  };
  setTheme: (t: 'regex-studio-dark' | 'vs-code-dark' | 'github-dark' | 'nordic-light' | 'high-contrast') => void;
  setEditorMode: (m: 'visual' | 'monaco') => void;
  setReducedMotion: (rm: boolean) => void;
  setActiveSidebarTab: (tab: 'explorer' | 'components' | 'templates' | 'history' | 'settings' | null) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  updatePreferences: (prefs: Partial<SettingsState['preferences']>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'regex-studio-dark',
  editorMode: 'visual',
  reducedMotion: false,
  activeSidebarTab: 'explorer',
  sidebarExpanded: true,
  preferences: {
    autoCompile: true,
    showGrid: true,
    snapToGrid: false,
  },
  shortcuts: {
    undo: 'mod+z',
    redo: 'mod+y',
    save: 'mod+s',
  },
  setTheme: (t) => set({ theme: t }),
  setEditorMode: (m) => set({ editorMode: m }),
  setReducedMotion: (rm) => set({ reducedMotion: rm }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  updatePreferences: (prefs) => set((state) => ({
    preferences: { ...state.preferences, ...prefs }
  })),
}));
