import React, { useState } from 'react';
import { Search, Folder, ArrowRight, BarChart3 } from 'lucide-react';

const PMDashboardSearch = ({ onNavigateToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const projects = [
    { id: 1, name: 'Atlas 2.0 – NPDI Launch', code: 'PRJ-2026-PDU-NG', items: 245, readiness: 72 },
    { id: 2, name: 'Phoenix Refresh – Phase 2', code: 'PRJ-2026-PHX-R2', items: 128, readiness: 85 },
    { id: 3, name: 'Titan Platform – Q3 2026', code: 'PRJ-2026-TTN-Q3', items: 89, readiness: 45 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToDashboard({ level: 'project', id: 'proj-search', name: searchQuery });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2" data-testid="pm-search-title">
            PM Dashboard
          </h1>
          <p className="text-slate-600 mb-8">
            Select a project or item to view the PM Dashboard with KPIs and analytics.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or code..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              data-testid="pm-search-input"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              data-testid="pm-search-submit-btn"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Folder className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-slate-800">Select Project</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onNavigateToDashboard({ 
                  level: 'project', 
                  id: `proj-${project.id}`, 
                  name: project.name 
                })}
                className="w-full p-6 text-left rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                data-testid={`pm-project-${project.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      <p className="font-semibold text-slate-800 text-lg">{project.name}</p>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{project.code}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-slate-600">
                        <span className="font-medium text-slate-800">{project.items}</span> items
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Readiness:</span>
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              project.readiness >= 80 ? 'bg-emerald-500' :
                              project.readiness >= 60 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${project.readiness}%` }}
                          />
                        </div>
                        <span className={`font-semibold ${
                          project.readiness >= 80 ? 'text-emerald-600' :
                          project.readiness >= 60 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {project.readiness}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMDashboardSearch;
