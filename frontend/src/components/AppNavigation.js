import React from 'react';
import { LayoutGrid, ClipboardCheck, BarChart3, Home } from 'lucide-react';

const AppNavigation = ({ activeTab, onTabChange, onNavigateToHome }) => {
  const tabs = [
    { id: 'bom-grid', label: 'BOM Grid', icon: LayoutGrid },
    { id: 'co-readiness', label: 'CO Readiness', icon: ClipboardCheck },
    { id: 'pm-dashboard', label: 'PM Dashboard', icon: BarChart3 },
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Home */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onNavigateToHome}
              className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
              data-testid="nav-home-btn"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold text-sm">BOM Grid</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  data-testid={`nav-${tab.id}-btn`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right side - placeholder for user menu */}
          <div className="w-32" />
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;
