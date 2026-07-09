/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from './nodes';

export function validateASTNode(node: any): string[] {
  const errors: string[] = [];
  if (!node || typeof node !== 'object') {
    return ['Node must be an object'];
  }
  if (typeof node.id !== 'string') {
    errors.push('Node missing a valid string id');
  }
  if (typeof node.type !== 'string') {
    errors.push(`Node ${node.id || ''} missing a valid string type`);
  }
  
  if (node.children) {
    if (!Array.isArray(node.children)) {
      errors.push(`Node ${node.id || ''} children must be an array`);
    } else {
      node.children.forEach((child: any, idx: number) => {
        const childErrors = validateASTNode(child);
        errors.push(...childErrors.map(e => `Child [${idx}] of Node ${node.id}: ${e}`));
      });
    }
  }
  return errors;
}

export function validateRegexDocument(doc: any): string[] {
  const errors: string[] = [];
  if (!doc || typeof doc !== 'object') {
    return ['Document must be an object'];
  }
  if (typeof doc.version !== 'number') {
    errors.push('Document must have a numeric version');
  }
  if (typeof doc.id !== 'string') {
    errors.push('Document must have a string id');
  }
  if (!Array.isArray(doc.root)) {
    errors.push('Document root must be an array of AST nodes');
  } else {
    doc.root.forEach((node: any, idx: number) => {
      const nodeErrors = validateASTNode(node);
      errors.push(...nodeErrors.map(e => `Root Node [${idx}]: ${e}`));
    });
  }
  if (!doc.flags) {
    errors.push('Document must contain flags');
  }
  return errors;
}

export function validateAST(root: ASTNode[]): string[] {
  const errors: string[] = [];
  root.forEach((node, idx) => {
    const nodeErrors = validateASTNode(node);
    errors.push(...nodeErrors.map(e => `Node [${idx}]: ${e}`));
  });
  return errors;
}
