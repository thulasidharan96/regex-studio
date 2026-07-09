/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RegexStudioProvider } from './components/RegexStudioContext';
import { Header } from './components/Header';
import { ActivityBar } from './components/layout/ActivityBar';
import { Sidebar } from './components/layout/Sidebar';
import { MainEditor } from './components/layout/MainEditor';
import { Inspector } from './components/layout/Inspector';
import { BottomDock } from './components/layout/BottomDock';
import { StatusBar } from './components/layout/StatusBar';
import { CommandPalette } from './components/CommandPalette';

function App() {
  return (
    <RegexStudioProvider>
      <div className="flex flex-col h-screen w-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
        {/* Top Header Toolbar */}
        <Header />

        {/* Center Workspace Row */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Left-most Activity Bar */}
          <ActivityBar />

          {/* Left Sidebar (Explorer, Components, etc.) */}
          <Sidebar />

          {/* Main workspace section with layout: Canvas/Source and Bottom Dock */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Center Main Editor (Canvas or Source Editor) */}
            <MainEditor />

            {/* Bottom Dock Tools */}
            <BottomDock />
          </div>

          {/* Right Properties/Inspector panel */}
          <Inspector />
        </div>

        {/* Bottom Status Bar */}
        <StatusBar />

        {/* Global Command Palette */}
        <CommandPalette />
      </div>
    </RegexStudioProvider>
  );
}

export default App;
