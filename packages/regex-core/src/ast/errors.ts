/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class ASTError extends Error {
  constructor(message: string, public position?: number) {
    super(message);
    this.name = 'ASTError';
  }
}
