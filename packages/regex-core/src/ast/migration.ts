/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from './nodes';
import { generateId } from './factory';
import { RegexDocument, RegexProject } from './document';

export function migrateNodeToAST2(node: ASTNode): ASTNode {
  const properties = node.properties || {};
  
  const value = node.value !== undefined ? node.value : properties.value;
  const charType = node.charType !== undefined ? node.charType : properties.charType;
  const boundaryType = node.boundaryType !== undefined ? node.boundaryType : properties.boundaryType;
  const lookaroundType = node.lookaroundType !== undefined ? node.lookaroundType : properties.lookaroundType;
  const groupType = node.groupType !== undefined ? node.groupType : properties.groupType;
  const name = node.name !== undefined ? node.name : properties.name;
  const quantifier = node.quantifier !== undefined ? node.quantifier : properties.quantifier;
  const ranges = node.ranges !== undefined ? node.ranges : properties.ranges;
  const negated = node.negated !== undefined ? node.negated : properties.negated;

  let type = node.type;
  if (type === 'group') {
    if (groupType === 'capture') type = 'capture';
    else if (groupType === 'named') type = 'namedCapture';
    else if (groupType === 'non-capture') type = 'nonCapture';
  } else if (type === 'lookaround') {
    if (lookaroundType === 'lookahead') type = 'lookahead';
    else if (lookaroundType === 'neg-lookahead') type = 'negativeLookahead';
    else if (lookaroundType === 'lookbehind') type = 'lookbehind';
    else if (lookaroundType === 'neg-lookbehind') type = 'negativeLookbehind';
  } else if (type === 'alternative') {
    type = 'alternation';
  } else if (type === 'boundary') {
    if (boundaryType === 'start' || boundaryType === 'end') type = 'anchor';
  }

  const migratedChildren = node.children ? node.children.map(migrateNodeToAST2) : undefined;

  return {
    id: node.id,
    type,
    children: migratedChildren,
    position: node.position,
    properties: {
      value,
      charType,
      boundaryType,
      lookaroundType,
      groupType,
      name,
      quantifier,
      ranges,
      negated,
    },
    value,
    charType,
    boundaryType,
    lookaroundType,
    groupType,
    name,
    quantifier,
    ranges,
    negated,
  };
}

export function migrateProjectToDocument(project: RegexProject): RegexDocument {
  const root = project.ast.map(migrateNodeToAST2);
  return {
    id: project.id,
    version: 3,
    name: project.name,
    root,
    flags: project.flags,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    metadata: {
      name: project.name,
      description: 'Migrated from Project AST 1.0',
      notes: project.notes,
      sampleText: project.sampleText,
    }
  };
}

export function migrateDocumentToProject(doc: RegexDocument): RegexProject {
  const mapNodeBack = (node: ASTNode): ASTNode => {
    const props = node.properties || {};
    
    let type = node.type;
    let groupType = props.groupType;
    let lookaroundType = props.lookaroundType;
    let boundaryType = props.boundaryType;

    if (type === 'capture') {
      type = 'group';
      groupType = 'capture';
    } else if (type === 'namedCapture') {
      type = 'group';
      groupType = 'named';
    } else if (type === 'nonCapture') {
      type = 'group';
      groupType = 'non-capture';
    } else if (type === 'lookahead') {
      type = 'lookaround';
      lookaroundType = 'lookahead';
    } else if (type === 'negativeLookahead') {
      type = 'lookaround';
      lookaroundType = 'neg-lookahead';
    } else if (type === 'lookbehind') {
      type = 'lookaround';
      lookaroundType = 'lookbehind';
    } else if (type === 'negativeLookbehind') {
      type = 'lookaround';
      lookaroundType = 'neg-lookbehind';
    } else if (type === 'alternation') {
      type = 'alternative';
    } else if (type === 'anchor') {
      type = 'boundary';
      boundaryType = boundaryType || 'start';
    }

    const value = props.value !== undefined ? props.value : node.value;
    const charType = props.charType !== undefined ? props.charType : node.charType;
    const name = props.name !== undefined ? props.name : node.name;
    const quantifier = props.quantifier !== undefined ? props.quantifier : node.quantifier;
    const ranges = props.ranges !== undefined ? props.ranges : node.ranges;
    const negated = props.negated !== undefined ? props.negated : node.negated;

    const children = node.children ? node.children.map(mapNodeBack) : undefined;

    return {
      id: node.id,
      type: type as any,
      children,
      position: node.position,
      value,
      charType,
      boundaryType,
      lookaroundType,
      groupType,
      name,
      quantifier,
      ranges,
      negated,
      properties: props,
    };
  };

  const ast = doc.root.map(mapNodeBack);

  return {
    id: doc.id,
    name: doc.name || doc.metadata?.name || 'Untitled Project',
    ast,
    flags: Array.isArray(doc.flags) ? {
      global: doc.flags.includes('g'),
      ignoreCase: doc.flags.includes('i'),
      multiline: doc.flags.includes('m'),
      dotAll: doc.flags.includes('s'),
      unicode: doc.flags.includes('u'),
      sticky: doc.flags.includes('y'),
    } : doc.flags,
    sampleText: doc.metadata?.sampleText || '',
    notes: doc.metadata?.notes || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function getCurrentVersion(): number {
  return 3;
}

const customMigrations = new Map<number, (doc: any) => any>();

export function registerMigration(version: number, callback: (doc: any) => any): void {
  customMigrations.set(version, callback);
}

export function migrateDocument(doc: any): RegexDocument {
  let currentDoc = doc;
  if (!currentDoc) {
    return {
      id: generateId(),
      version: 3,
      name: 'Untitled Pattern',
      root: [],
      flags: {
        global: true,
        ignoreCase: false,
        multiline: false,
        dotAll: false,
        unicode: false,
        sticky: false,
      },
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Apply registered custom migrations if appropriate
  let docVersion = currentDoc.version || 1;
  while (customMigrations.has(docVersion)) {
    const migration = customMigrations.get(docVersion);
    if (migration) {
      currentDoc = migration(currentDoc);
      docVersion = currentDoc.version || (docVersion + 1);
    } else {
      break;
    }
  }

  if (currentDoc && !currentDoc.version && currentDoc.ast) {
    return migrateProjectToDocument(currentDoc);
  }
  
  const root = Array.isArray(currentDoc?.root) 
    ? currentDoc.root.map(migrateNodeToAST2) 
    : currentDoc?.root 
      ? [migrateNodeToAST2(currentDoc.root)]
      : [];
  
  return {
    id: currentDoc?.id || generateId(),
    version: 3,
    name: currentDoc?.name || 'Untitled Pattern',
    root,
    flags: currentDoc?.flags || {
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    },
    metadata: currentDoc?.metadata || {},
    createdAt: currentDoc?.createdAt || new Date().toISOString(),
    updatedAt: currentDoc?.updatedAt || new Date().toISOString(),
  };
}
