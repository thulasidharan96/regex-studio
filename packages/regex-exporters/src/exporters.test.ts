/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { generateExporters } from './index';

describe('Regex Exporters', () => {
  it('should generate JS, TS, Python, Go, Rust, Java, PHP, C#, Ruby, and AJV exporters cleanly', () => {
    const snippets = generateExporters('^[a-z]+$', 'g');
    expect(snippets.length).toBeGreaterThan(5);

    const languages = snippets.map(s => s.language);
    expect(languages).toContain('JavaScript');
    expect(languages).toContain('TypeScript');
    expect(languages).toContain('Python');
    expect(languages).toContain('Go');
    expect(languages).toContain('Rust');
    expect(languages).toContain('Java');
    expect(languages).toContain('PHP');
    expect(languages).toContain('C#');
    expect(languages).toContain('Ruby');
    expect(languages).toContain('Ajv Schema');
  });
});
