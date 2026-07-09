/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSettingsStore } from '@regex-studio/stores';
import { 
  Folder, 
  Puzzle, 
  Library, 
  History, 
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface TabItem {
  id: 'explorer' | 'components' | 'templates' | 'history' | 'settings';
  label: string;
  icon: React.ComponentType<any>;
}

const TABS: TabItem[] = [
  { id: 'explorer', label: 'Project Explorer', icon: Folder },
  { id: 'components', label: 'Components', icon: Puzzle },
  { id: 'templates', label: 'Templates', icon: Library },
  { id: 'history', label: 'History & Git', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const ActivityBar: React.FC = () => {
  const activeSidebarTab = useSettingsStore((s) => s.activeSidebarTab);
  const sidebarExpanded = useSettingsStore((s) => s.sidebarExpanded);
  const setActiveSidebarTab = useSettingsStore((s) => s.setActiveSidebarTab);
  const setSidebarExpanded = useSettingsStore((s) => s.setSidebarExpanded);

  const handleTabClick = (tabId: typeof TABS[number]['id']) => {
    if (activeSidebarTab === tabId) {
      // Toggle expand/collapse if same tab is clicked
      setSidebarExpanded(!sidebarExpanded);
    } else {
      setActiveSidebarTab(tabId);
      setSidebarExpanded(true);
    }
  };

  return (
    <aside 
      id="activity-bar"
      className="w-12 bg-sidebar border-r border-border-custom flex flex-col justify-between items-center py-2 select-none shrink-0"
      aria-label="Activity Bar"
    >
      {/* Top Section */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Workspace Toggle Icon */}
        <div className="p-2 text-slate-500 hover:text-slate-300 transition rounded-md cursor-pointer mb-2">
          <Menu className="h-4 w-4" />
        </div>

        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSidebarTab === tab.id && sidebarExpanded;
          
          return (
            <button
              key={tab.id}
              id={`activity-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`relative group p-3 rounded-lg transition-all duration-200 cursor-pointer w-10 h-10 flex items-center justify-center ${
                isActive 
                  ? 'text-accent bg-accent/10 border-l-2 border-accent rounded-l-none' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-input-bg/40'
              }`}
              title={tab.label}
              aria-label={tab.label}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-105" />
              
              {/* Tooltip */}
              <div className="absolute left-14 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center w-full">
        <button
          id="collapse-sidebar-btn"
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-all cursor-pointer ${
            !sidebarExpanded ? 'rotate-180 text-accent bg-accent/5' : ''
          }`}
          title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label="Toggle Sidebar Size"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
        </button>
      </div>
    </aside>
  );
};
