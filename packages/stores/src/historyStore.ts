/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { RegexProject } from '@regex-studio/regex-core';
import { useProjectStore } from './projectStore';

export interface HistoryState {
  past: RegexProject[];
  present: RegexProject | null;
  future: RegexProject[];
  pastDescriptions: string[];
  futureDescriptions: string[];

  snapshot: (project: RegexProject, description?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: (initialProject: RegexProject) => void;
  jumpToHistoryIndex: (index: number) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],
  pastDescriptions: [],
  futureDescriptions: [],

  snapshot: (project, description = 'Modified pattern') => {
    const { present, past, pastDescriptions } = get();
    const clonedNew = JSON.parse(JSON.stringify(project));

    if (!present) {
      set({
        present: clonedNew,
        past: [],
        future: [],
        pastDescriptions: [],
        futureDescriptions: []
      });
      return;
    }

    // Avoid pushing duplicate states consecutively
    if (JSON.stringify(present) === JSON.stringify(clonedNew)) {
      return;
    }

    set({
      past: [...past, present],
      pastDescriptions: [...pastDescriptions, description],
      present: clonedNew,
      future: [],
      futureDescriptions: []
    });
  },

  undo: () => {
    const { past, present, future, pastDescriptions, futureDescriptions } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    const undoneDesc = pastDescriptions[pastDescriptions.length - 1] || 'Modified pattern';
    const newPastDesc = pastDescriptions.slice(0, pastDescriptions.length - 1);

    set({
      past: newPast,
      pastDescriptions: newPastDesc,
      present: previous,
      future: present ? [present, ...future] : future,
      futureDescriptions: [undoneDesc, ...futureDescriptions],
    });

    if (previous) {
      useProjectStore.getState().setActiveProject(JSON.parse(JSON.stringify(previous)));
    }
  },

  redo: () => {
    const { past, present, future, pastDescriptions, futureDescriptions } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    const redoneDesc = futureDescriptions[0] || 'Modified pattern';
    const newFutureDesc = futureDescriptions.slice(1);

    set({
      past: present ? [...past, present] : past,
      pastDescriptions: present ? [...pastDescriptions, redoneDesc] : pastDescriptions,
      present: next,
      future: newFuture,
      futureDescriptions: newFutureDesc,
    });

    if (next) {
      useProjectStore.getState().setActiveProject(JSON.parse(JSON.stringify(next)));
    }
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },

  clearHistory: (initialProject) => {
    set({
      past: [],
      present: JSON.parse(JSON.stringify(initialProject)),
      future: [],
      pastDescriptions: [],
      futureDescriptions: []
    });
  },

  jumpToHistoryIndex: (index: number) => {
    const { past, present, future, pastDescriptions, futureDescriptions } = get();
    const allStates = [...past, ...(present ? [present] : []), ...future];
    
    // Create custom description log of exact same length
    const currentDesc = 'Active pattern';
    const allDescs = [...pastDescriptions, currentDesc, ...futureDescriptions];

    if (index < 0 || index >= allStates.length) return;

    const targetState = allStates[index];
    const newPast = allStates.slice(0, index);
    const newFuture = allStates.slice(index + 1);

    const newPastDesc = allDescs.slice(0, index);
    const newFutureDesc = allDescs.slice(index + 1);

    set({
      past: newPast,
      pastDescriptions: newPastDesc,
      present: targetState,
      future: newFuture,
      futureDescriptions: newFutureDesc,
    });

    if (targetState) {
      useProjectStore.getState().setActiveProject(JSON.parse(JSON.stringify(targetState)));
    }
  }
}));
