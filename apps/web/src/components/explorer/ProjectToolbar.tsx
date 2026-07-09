/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, FolderPlus, Star, SlidersHorizontal, Tag } from 'lucide-react';

interface ProjectToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  availableTags: string[];
  sortBy: 'updatedAt' | 'name' | 'createdAt';
  setSortBy: (sort: 'updatedAt' | 'name' | 'createdAt') => void;
  onCreateProject: () => void;
}

export const ProjectToolbar: React.FC<ProjectToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  showFavoritesOnly,
  setShowFavoritesOnly,
  selectedTag,
  setSelectedTag,
  availableTags,
  sortBy,
  setSortBy,
  onCreateProject,
}) => {
  return (
    <div id="project-toolbar" className="p-3 border-b border-border-custom bg-sidebar/50 flex flex-col gap-2.5 shrink-0">
      {/* Search and Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="explorer-search"
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-bg border border-border-custom text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-accent font-medium"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
        </div>

        <button
          id="explorer-create-btn"
          onClick={onCreateProject}
          className="p-1.5 bg-accent/15 hover:bg-accent text-accent hover:text-white rounded border border-accent/25 transition cursor-pointer flex items-center justify-center"
          title="New Project"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Favorite filter */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
            showFavoritesOnly
              ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
              : 'border-border-custom bg-input-bg/40 text-slate-400 hover:text-slate-200'
          }`}
          title="Filter Favorites"
        >
          <Star className={`h-3 w-3 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>Starred</span>
        </button>

        {/* Sort selector */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
          <SlidersHorizontal className="h-3 w-3 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-0 text-slate-300 font-sans cursor-pointer focus:ring-0 focus:outline-none text-[10px] font-bold pr-1"
          >
            <option value="updatedAt">Modified</option>
            <option value="name">A-Z Name</option>
            <option value="createdAt">Created</option>
          </select>
        </div>
      </div>

      {/* Tags Quick List */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          <Tag className="h-3 w-3 text-slate-500 shrink-0" />
          <button
            onClick={() => setSelectedTag('')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition shrink-0 ${
              selectedTag === '' ? 'bg-accent/20 text-accent' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition shrink-0 border ${
                selectedTag === tag
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'border-border-custom/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
