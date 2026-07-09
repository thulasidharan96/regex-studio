/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BottomPanel } from '../BottomPanel';

export const BottomDock: React.FC = () => {
  return (
    <div id="ide-bottom-dock" className="shrink-0 w-full">
      <BottomPanel />
    </div>
  );
};
