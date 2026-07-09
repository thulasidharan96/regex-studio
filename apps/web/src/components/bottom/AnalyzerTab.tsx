/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnalyzerPanel } from '../analyzer/AnalyzerPanel';

export const AnalyzerTab: React.FC = () => {
  return (
    <div id="bottom-dock-analyzer-tab" className="h-full overflow-hidden">
      <AnalyzerPanel />
    </div>
  );
};
