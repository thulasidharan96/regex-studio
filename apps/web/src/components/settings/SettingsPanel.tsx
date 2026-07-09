/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSettingsStore } from '@thulasidharan96/stores';
import { Settings, Sliders, Keyboard, HelpCircle, Monitor } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const {
    theme,
    setTheme,
    reducedMotion,
    setReducedMotion,
    preferences,
    updatePreferences,
  } = useSettingsStore();

  const themes: { id: typeof theme; name: string; desc: string }[] = [
    { id: 'regex-studio-dark', name: 'Cosmic Slate', desc: 'Default high contrast dark palette' },
    { id: 'vs-code-dark', name: 'VS Code Dark', desc: 'Standard Microsoft dark scheme' },
    { id: 'github-dark', name: 'GitHub Dark', desc: 'Slightly softer charcoal dark design' },
    { id: 'high-contrast', name: 'High Contrast Pro', desc: 'Maximum accessibility pure black/white' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#070b13] overflow-y-auto select-none font-sans">
      {/* Settings Header */}
      <div className="p-3 border-b border-border-custom bg-sidebar/50 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-sans font-extrabold text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-accent" />
          <span>Editor preferences</span>
        </span>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Theme Settings block */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Monitor className="h-3.5 w-3.5 text-slate-500" />
            <span>Visual Theme</span>
          </div>
          <div className="space-y-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col gap-0.5 cursor-pointer ${
                  theme === t.id
                    ? 'bg-accent/10 border-accent shadow-sm'
                    : 'bg-input-bg/10 hover:bg-input-bg/35 border-border-custom/50 hover:border-border-custom'
                }`}
              >
                <span className="text-xs font-bold text-slate-100">{t.name}</span>
                <span className="text-[9.5px] text-slate-500">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas & Compile Preferences */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Sliders className="h-3.5 w-3.5 text-slate-500" />
            <span>Interactive Rules</span>
          </div>

          <div className="space-y-2 bg-input-bg/15 border border-border-custom/65 p-3 rounded-lg text-xs">
            {/* Auto Compile */}
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200">Auto Compile AST</span>
                <p className="text-[9px] text-slate-500">Instantly generate regex string upon nodes drop</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoCompile}
                onChange={(e) => updatePreferences({ autoCompile: e.target.checked })}
                className="rounded accent-accent border-border-custom cursor-pointer h-4 w-4 bg-sidebar"
              />
            </label>

            <div className="border-t border-border-custom/30 my-2" />

            {/* Show Grid */}
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200">Show Flow Grid</span>
                <p className="text-[9px] text-slate-500">Render helpful dot pattern grid behind the nodes</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showGrid}
                onChange={(e) => updatePreferences({ showGrid: e.target.checked })}
                className="rounded accent-accent border-border-custom cursor-pointer h-4 w-4 bg-sidebar"
              />
            </label>

            <div className="border-t border-border-custom/30 my-2" />

            {/* Snap to Grid */}
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200">Snap to Flow Grid</span>
                <p className="text-[9px] text-slate-500">Align canvas coordinates of matching blocks</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.snapToGrid}
                onChange={(e) => updatePreferences({ snapToGrid: e.target.checked })}
                className="rounded accent-accent border-border-custom cursor-pointer h-4 w-4 bg-sidebar"
              />
            </label>

            <div className="border-t border-border-custom/30 my-2" />

            {/* Reduced motion */}
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200">Reduced Motion UI</span>
                <p className="text-[9px] text-slate-500">Disable subtle fading or timeline play loops</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="rounded accent-accent border-border-custom cursor-pointer h-4 w-4 bg-sidebar"
              />
            </label>
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Keyboard className="h-3.5 w-3.5 text-slate-500" />
            <span>Keyboard Shortcuts</span>
          </div>

          <div className="space-y-1.5 bg-input-bg/15 border border-border-custom/65 p-2.5 rounded-lg font-mono text-[10.5px]">
            {[
              { desc: 'Open Command Palette', keys: ['Ctrl', 'K'] },
              { desc: 'Undo modification', keys: ['Ctrl', 'Z'] },
              { desc: 'Redo modification', keys: ['Ctrl', 'Y'] },
              { desc: 'Focus Canvas Node', keys: ['Alt', 'L'] },
              { desc: 'Save Project', keys: ['Ctrl', 'S'] },
            ].map((sh, sidx) => (
              <div key={sidx} className="flex items-center justify-between text-slate-400 py-1 border-b border-border-custom/20 last:border-0">
                <span>{sh.desc}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {sh.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 bg-sidebar border border-border-custom text-slate-200 rounded text-[9.5px] font-sans font-bold shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-2.5 bg-accent/5 border border-accent/15 rounded-lg flex items-start gap-1.5 text-[10.5px] text-slate-400 leading-normal">
          <HelpCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <span>
            These settings persist in local browser state and are synced instantly to your viewport.
          </span>
        </div>
      </div>
    </div>
  );
};
