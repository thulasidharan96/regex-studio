/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSettingsStore } from '@regex-studio/stores';
import { Canvas } from '../Canvas';
import { RawRegexEditor } from '../RawRegexEditor';

export const MainEditor: React.FC = () => {
  const editorMode = useSettingsStore((s) => s.editorMode);

  return (
    <main id="ide-main-editor" className="flex-1 h-full min-w-0 relative flex flex-col overflow-hidden">
      {editorMode === 'visual' ? <Canvas /> : <RawRegexEditor />}
    </main>
  );
};
