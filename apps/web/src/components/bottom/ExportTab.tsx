/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExportPanel } from '../export/ExportPanel';

export const ExportTab: React.FC = () => {
  return (
    <div id="bottom-dock-export-tab" className="h-full overflow-hidden">
      <ExportPanel />
    </div>
  );
};
