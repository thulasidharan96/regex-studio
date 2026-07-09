/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useProjectStore } from '@thulasidharan96/stores';
import { ProjectToolbar } from './ProjectToolbar';
import { ProjectCard } from './ProjectCard';
import { Folder } from 'lucide-react';

export const ProjectExplorer: React.FC = () => {
  const activeProject = useProjectStore((s) => s.activeProject);
  const savedProjects = useProjectStore((s) => s.savedProjects);
  const loadProject = useProjectStore((s) => s.loadProject);
  const createNewProject = useProjectStore((s) => s.createNewProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const duplicateProject = useProjectStore((s) => s.duplicateProject);
  const updateProjectProperties = useProjectStore((s) => s.updateProjectProperties);

  // States for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'createdAt'>('updatedAt');

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    savedProjects.forEach((p: any) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((t: string) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [savedProjects]);

  // Handle filter, search, and sort logic
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...savedProjects] as any[];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    // 2. Favorites Filter
    if (showFavoritesOnly) {
      result = result.filter((p) => p.favorite === true);
    }

    // 3. Tags Filter
    if (selectedTag) {
      result = result.filter((p) => p.tags && p.tags.includes(selectedTag));
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [savedProjects, searchQuery, showFavoritesOnly, selectedTag, sortBy]);

  return (
    <div className="flex flex-col h-full bg-[#070b13] overflow-hidden">
      {/* Toolbar */}
      <ProjectToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        availableTags={availableTags}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onCreateProject={() => createNewProject()}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-2 text-slate-500">
            <Folder className="h-8 w-8 text-slate-600 mb-1.5" />
            <span className="text-xs font-bold text-slate-400">No Projects Found</span>
            <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 leading-normal">
              Try adjusting your search criteria, clearing filters, or create a new project!
            </p>
          </div>
        ) : (
          filteredAndSortedProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              isActive={activeProject?.id === p.id}
              onSelect={() => loadProject(p.id)}
              onDelete={() => deleteProject(p.id)}
              onDuplicate={() => duplicateProject(p.id)}
              onToggleFavorite={() =>
                updateProjectProperties({ favorite: !p.favorite } as any)
              }
              onRename={(newName) => updateProjectProperties({ name: newName })}
              onUpdateTags={(tags) => updateProjectProperties({ tags } as any)}
            />
          ))
        )}
      </div>
    </div>
  );
};
