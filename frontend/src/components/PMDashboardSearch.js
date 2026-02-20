import React, { useState } from 'react';
import { Search, Folder, ArrowRight, BarChart3, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900" data-testid="pm-search-title">
                PM Dashboard
              </h1>
              <p className="text-slate-500">
                Select a project to view KPIs and analytics
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or code..."
              className="search-input-modern w-full"
              data-testid="pm-search-input"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
              data-testid="pm-search-submit-btn"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Projects */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Folder className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Select Project</h2>
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
                className="w-full p-6 text-left rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group shadow-sm hover:shadow-lg"
                data-testid={`pm-project-${project.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{project.name}</p>
                        <p className="text-sm text-slate-500">{project.code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm mt-4 pl-16">
                      <span className="text-slate-600">
                        <span className="font-bold text-slate-800">{project.items}</span> items
                      </span>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-slate-600">Readiness:</span>
                        <div className="w-40 h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full ${
                              project.readiness >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                              project.readiness >= 60 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                              'bg-gradient-to-r from-red-400 to-rose-500'
                            }`}
                            style={{ width: `${project.readiness}%` }}
                          />
                        </div>
                        <span className={`font-bold text-lg ${
                          project.readiness >= 80 ? 'text-emerald-600' :
                          project.readiness >= 60 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {project.readiness}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-3" />
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
