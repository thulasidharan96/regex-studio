/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DebuggerPanel } from '../debugger/DebuggerPanel';

export const DebuggerTab: React.FC = () => {
  return (
    <div id="bottom-dock-debugger-tab" className="h-full overflow-hidden">
      <DebuggerPanel />
    </div>
  );
};
