/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegexStudioDB } from './database';

export function runMigrations(db: RegexStudioDB): void {
  // Standard migration setup for future schema changes or baseline migrations
  db.on('ready', () => {
    console.log('RegexStudioDB loaded and ready');
  });
}
