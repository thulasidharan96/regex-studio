/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RegexProject } from '@thulasidharan96/regex-core';
import { Star, Copy, Trash2, Edit2, Check, X, Tag, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: RegexProject & { favorite?: boolean; tags?: string[] };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onRename: (newName: string) => void;
  onUpdateTags: (tags: string[]) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onRename,
  onUpdateTags,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState((project.tags || []).join(', '));

  const handleRenameSubmit = () => {
    if (nameInput.trim()) {
      onRename(nameInput.trim());
    }
    setIsRenaming(false);
  };

  const handleTagsSubmit = () => {
    const list = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onUpdateTags(list);
    setIsEditingTags(false);
  };

  const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`project-card-${project.id}`}
      className={`p-2.5 rounded-lg border transition duration-200 select-none group flex flex-col gap-1.5 ${
        isActive
          ? 'bg-accent/10 border-accent/40 shadow-md shadow-accent/5'
          : 'bg-input-bg/15 hover:bg-input-bg/35 border-border-custom/50 hover:border-border-custom'
      }`}
    >
      {/* Name and Action Row */}
      <div className="flex items-start justify-between gap-1.5">
        {isRenaming ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-bg border border-accent text-slate-200 text-xs px-1.5 py-0.5 rounded focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
            />
            <button onClick={handleRenameSubmit} className="text-emerald-400 p-0.5 hover:bg-emerald-500/10 rounded cursor-pointer">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={() => setIsRenaming(false)} className="text-red-400 p-0.5 hover:bg-red-500/10 rounded cursor-pointer">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSelect}
            className={`flex-1 text-left text-xs font-bold truncate leading-tight cursor-pointer ${
              isActive ? 'text-slate-100' : 'text-slate-300 hover:text-slate-100'
            }`}
          >
            {project.name}
          </button>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition duration-150">
          <button
            onClick={() => setIsRenaming(true)}
            className="p-0.5 hover:text-accent text-slate-500 rounded transition cursor-pointer"
            title="Rename"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={onToggleFavorite}
            className={`p-0.5 hover:text-amber-400 transition cursor-pointer ${
              project.favorite ? 'text-amber-400' : 'text-slate-500'
            }`}
            title={project.favorite ? 'Unstar' : 'Star'}
          >
            <Star className={`h-3 w-3 ${project.favorite ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            onClick={onDuplicate}
            className="p-0.5 hover:text-accent text-slate-500 rounded transition cursor-pointer"
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-0.5 hover:text-red-400 text-slate-500 rounded transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Date & Note Row */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5 text-slate-600" />
          <span>{formattedDate}</span>
        </span>
        {project.notes && (
          <span className="truncate max-w-[120px] text-slate-500 text-[9px] italic">
            {project.notes}
          </span>
        )}
      </div>

      {/* Tags section */}
      <div className="flex flex-wrap items-center gap-1">
        {isEditingTags ? (
          <div className="flex items-center gap-1 w-full mt-0.5">
            <input
              type="text"
              placeholder="tag1, tag2..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="flex-1 bg-bg border border-accent/50 text-[9px] px-1 py-0.5 rounded focus:outline-none text-slate-300"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTagsSubmit();
                if (e.key === 'Escape') setIsEditingTags(false);
              }}
            />
            <button onClick={handleTagsSubmit} className="text-emerald-400 p-0.5 rounded cursor-pointer">
              <Check className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <>
            {(project.tags || []).map((tag) => (
              <span
                key={tag}
                className="bg-accent/5 text-accent border border-accent/15 px-1 py-0.25 rounded text-[8px] font-bold font-sans"
              >
                {tag}
              </span>
            ))}
            <button
              onClick={() => setIsEditingTags(true)}
              className="p-0.5 text-slate-600 hover:text-slate-400 transition cursor-pointer"
              title="Edit Tags"
            >
              <Tag className="h-2.5 w-2.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
