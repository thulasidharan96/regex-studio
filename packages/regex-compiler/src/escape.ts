/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function escapeLiteral(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}
