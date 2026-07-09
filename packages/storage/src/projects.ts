/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, StoredProject } from './database';
import { 
  RegexDocument, 
  migrateProjectToDocument, 
  migrateDocumentToProject 
} from '@thulasidharan96/regex-core';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function createProject(
  name = 'Untitled Project', 
  options: Partial<StoredProject> = {}
): Promise<StoredProject> {
  const newProj: StoredProject = {
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
    favorite: false,
    tags: [],
    examples: [],
    ...options
  };

  await db.projects.put(newProj);
  return newProj;
}

export async function getProject(id: string): Promise<StoredProject | undefined> {
  return await db.projects.get(id);
}

export async function getProjects(): Promise<StoredProject[]> {
  const list = await db.projects.toArray();
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function saveProject(project: StoredProject): Promise<void> {
  project.updatedAt = new Date().toISOString();
  await db.projects.put(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function duplicateProject(id: string): Promise<StoredProject | null> {
  const original = await db.projects.get(id);
  if (!original) return null;

  const copy: StoredProject = {
    ...original,
    id: generateId(),
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false,
  };

  await db.projects.put(copy);
  return copy;
}

export async function exportProject(id: string): Promise<string | null> {
  const project = await db.projects.get(id);
  if (!project) return null;

  const doc = migrateProjectToDocument(project);
  return JSON.stringify(doc, null, 2);
}

export async function importProject(jsonStr: string): Promise<StoredProject> {
  const parsed = JSON.parse(jsonStr);
  let project: StoredProject;

  if (parsed.version && parsed.root && parsed.flags) {
    project = migrateDocumentToProject(parsed as RegexDocument) as StoredProject;
  } else if (parsed.id && parsed.ast && parsed.flags) {
    project = parsed as StoredProject;
  } else {
    throw new Error('Invalid JSON format. Must be a valid RegexDocument or RegexProject schema.');
  }

  project.id = generateId();
  project.createdAt = new Date().toISOString();
  project.updatedAt = new Date().toISOString();

  await db.projects.put(project);
  return project;
}

// Seed helper
export async function seedInitialProjects(defaultProjects: any[]) {
  const count = await db.projects.count();
  if (count === 0) {
    for (const project of defaultProjects) {
      await db.projects.put(project);
    }
  }
}
