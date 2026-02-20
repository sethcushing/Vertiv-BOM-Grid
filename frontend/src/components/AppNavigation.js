import React from 'react';
import { LayoutGrid, ClipboardCheck, BarChart3, Home, Sparkles } from 'lucide-react';

const AppNavigation = ({ activeTab, onTabChange, onNavigateToHome }) => {
  const tabs = [
    { id: 'bom-grid', label: 'BOM Grid', icon: LayoutGrid },
    { id: 'co-readiness', label: 'CO Readiness', icon: ClipboardCheck },
    { id: 'pm-dashboard', label: 'PM Dashboard', icon: BarChart3 },
  ];

  return (
    <div className="nav-modern border-b border-slate-700/50">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Home */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onNavigateToHome}
              className="home-btn flex items-center gap-2.5 text-white"
              data-testid="nav-home-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">BOM Grid</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  data-testid={`nav-${tab.id}-btn`}
                  className={`nav-item flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'active bg-white/10 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Home Button on Right */}
          <button
            onClick={onNavigateToHome}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            data-testid="nav-home-right-btn"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;
