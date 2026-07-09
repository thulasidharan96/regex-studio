/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRegexStudio } from './RegexStudioContext';
import { RegexOutput } from './bottom/RegexOutput';
import { TestRunner } from './bottom/TestRunner';
import { DebuggerTab } from './bottom/DebuggerTab';
import { AnalyzerTab } from './bottom/AnalyzerTab';
import { ExportTab } from './bottom/ExportTab';
import { ConsoleTab } from './bottom/ConsoleTab';
import { 
  Play, 
  Terminal, 
  Activity, 
  FileCode2, 
  CheckCircle, 
  Cpu, 
  Settings, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';

export const BottomPanel: React.FC = () => {
  const { analysisIssues } = useRegexStudio();
  const [activeTab, setActiveTab] = useState<'output' | 'tests' | 'debugger' | 'analyzer' | 'export' | 'console'>('output');
  
  // Height Resizing state (defaults to 230px, constrained between 140px and 550px)
  const [height, setHeight] = useState(230);
  const isResizingRef = useRef(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.classList.add('select-none', 'cursor-ns-resize');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      if (newHeight >= 140 && newHeight <= 550) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.classList.remove('select-none', 'cursor-ns-resize');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const tabs = [
    { id: 'output', name: 'Output', icon: <Play className="h-3.5 w-3.5" /> },
    { id: 'tests', name: 'Tests', icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { id: 'debugger', name: 'Debugger', icon: <Cpu className="h-3.5 w-3.5" /> },
    { id: 'analyzer', name: 'Analyzer', icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 'export', name: 'Export', icon: <FileCode2 className="h-3.5 w-3.5" /> },
    { id: 'console', name: 'Console', icon: <Terminal className="h-3.5 w-3.5" /> },
  ];

  return (
    <footer 
      style={{ height: `${height}px` }} 
      className="border-t border-border-custom bg-sidebar flex flex-col shrink-0 overflow-hidden relative shadow-2xl transition-[height] duration-75 select-none"
    >
      {/* Visual Resizer Drag Strip */}
      <div 
        onMouseDown={startResize}
        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-accent/40 bg-transparent transition duration-150 z-50"
      />

      {/* Tabs Header rail */}
      <div className="bg-sidebar border-b border-border-custom px-4 flex items-center justify-between shrink-0 h-9 z-10">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 h-9 text-[11px] font-bold border-b-2 transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-accent text-accent bg-bg/25'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-bg/40'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.id === 'analyzer' && analysisIssues.length > 0 && (
                  <span className="ml-1 px-1 py-0.25 text-[8px] font-bold rounded bg-red-600 text-white leading-none">
                    {analysisIssues.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar Context helper */}
        <div className="flex items-center gap-2.5 shrink-0 text-[10px] text-slate-500 font-mono font-bold">
          <span>DRAG SPLIT TO RESIZE</span>
        </div>
      </div>

      {/* Dynamic Tab Body content */}
      <div className="flex-1 overflow-hidden min-h-0 relative z-10">
        {activeTab === 'output' && <RegexOutput />}
        {activeTab === 'tests' && <TestRunner />}
        {activeTab === 'debugger' && <DebuggerTab />}
        {activeTab === 'analyzer' && <AnalyzerTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'console' && <ConsoleTab />}
      </div>
    </footer>
  );
};
