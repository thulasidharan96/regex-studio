/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { type Table } from 'dexie';
import { RegexProject } from '@regex-studio/regex-core';

export interface StoredProject extends RegexProject {
  description?: string;
  regex?: string;
  examples?: string[];
  tags?: string[];
  favorite?: boolean;
}

export class RegexStudioDB extends Dexie {
  projects!: Table<StoredProject>;

  constructor() {
    super('RegexStudioDB');
    this.version(1).stores({
      projects: 'id, name, favorite, createdAt, updatedAt',
    });
  }
}

export const db = new RegexStudioDB();
export const dbInstance = db;
