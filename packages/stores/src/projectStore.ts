/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { RegexProject } from '@regex-studio/regex-core';
import { db } from '@regex-studio/storage';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export interface ProjectState {
  activeProject: RegexProject | null;
  savedProjects: RegexProject[];
  isLoading: boolean;
  
  initProjects: (defaultProjects: RegexProject[]) => Promise<void>;
  setActiveProject: (project: RegexProject) => void;
  createNewProject: (name?: string) => Promise<RegexProject>;
  saveCurrentProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  updateProjectProperties: (updates: Partial<RegexProject>) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  activeProject: null,
  savedProjects: [],
  isLoading: false,

  initProjects: async (defaultProjects) => {
    set({ isLoading: true });
    try {
      const count = await db.projects.count();
      if (count === 0) {
        for (const project of defaultProjects) {
          await db.projects.put(project);
        }
      }
      const projects = await db.projects.toArray();
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      set({
        savedProjects: projects,
        activeProject: projects[0] || defaultProjects[0],
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to init projects:', err);
      set({ isLoading: false });
    }
  },

  setActiveProject: (project) => {
    set({ activeProject: project });
  },

  createNewProject: async (name = 'Untitled Project') => {
    const newProj: RegexProject = {
      id: generateId(),
      name,
      ast: [{ id: generateId(), type: 'literal', properties: { value: 'hello' } } as any],
      flags: {
        global: true,
        ignoreCase: false,
        multiline: false,
        dotAll: false,
        unicode: false,
        sticky: false,
      },
      sampleText: 'hello world',
      notes: 'My custom visual regex project.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.projects.put(newProj);
      const projects = await db.projects.toArray();
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      set({
        savedProjects: projects,
        activeProject: newProj,
      });
    } catch (err) {
      console.error('Failed to create new project:', err);
    }

    return newProj;
  },

  saveCurrentProject: async () => {
    const { activeProject } = get();
    if (!activeProject) return;

    const updated = {
      ...activeProject,
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.projects.put(updated);
      const projects = await db.projects.toArray();
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      set({
        savedProjects: projects,
        activeProject: updated,
      });
    } catch (err) {
      console.error('Failed to save current project:', err);
    }
  },

  loadProject: async (id) => {
    try {
      const found = await db.projects.get(id);
      if (found) {
        set({ activeProject: found });
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  },

  deleteProject: async (id) => {
    try {
      await db.projects.delete(id);
      const projects = await db.projects.toArray();
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      set({ savedProjects: projects });

      const currentActive = get().activeProject;
      if (currentActive && currentActive.id === id) {
        if (projects.length > 0) {
          set({ activeProject: projects[0] });
        } else {
          await get().createNewProject('Default Project');
        }
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  },

  duplicateProject: async (id) => {
    try {
      const found = await db.projects.get(id);
      if (found) {
        const cloned: RegexProject = {
          ...found,
          id: generateId(),
          name: found.name + ' (Copy)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.projects.put(cloned);
        const projects = await db.projects.toArray();
        projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        set({
          savedProjects: projects,
          activeProject: cloned,
        });
      }
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
  },

  updateProjectProperties: (updates) => {
    const { activeProject } = get();
    if (!activeProject) return;

    const updated = {
      ...activeProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    set({ activeProject: updated });
    
    // Auto sync to IndexedDB
    db.projects.put(updated).then(() => {
      db.projects.toArray().then((projects) => {
        projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        set({ savedProjects: projects });
      });
    }).catch(err => {
      console.error('Failed auto-sync to IndexedDB:', err);
    });
  },
}));
