import React, { useState } from 'react';
import { Search, Star, Clock, Folder, ArrowRight, Sparkles } from 'lucide-react';

const BOMSearch = ({ onNavigateToBOM }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const recentSearches = [
    { id: 1, name: 'Atlas 2.0 – NPDI Launch', itemNumber: 'ASM-12000', lastAccessed: '2 hours ago' },
    { id: 2, name: 'Power Distribution Unit', itemNumber: 'PDU-5500', lastAccessed: '1 day ago' },
    { id: 3, name: 'Control Board Assembly', itemNumber: 'CBA-3300', lastAccessed: '3 days ago' },
  ];

  const favoriteItems = [
    { id: 1, name: 'Main Power Distribution Unit', itemNumber: 'ASM-12000', project: 'Atlas 2.0' },
    { id: 2, name: 'Primary Circuit Board', itemNumber: 'ASM-12100', project: 'Atlas 2.0' },
  ];

  const projects = [
    { id: 1, name: 'Atlas 2.0 – NPDI Launch', items: 245, readiness: 72 },
    { id: 2, name: 'Phoenix Refresh – Phase 2', items: 128, readiness: 85 },
    { id: 3, name: 'Titan Platform – Q3 2026', items: 89, readiness: 45 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToBOM(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900" data-testid="bom-search-title">
                BOM Grid Search
              </h1>
              <p className="text-slate-500">
                Search by project name, item number, or description
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
              placeholder="Search by project, item number, or description..."
              className="search-input-modern w-full"
              data-testid="bom-search-input"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary"
              data-testid="bom-search-submit-btn"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Recent Searches */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="font-bold text-slate-800">Recent Searches</h2>
              </div>
              <div className="space-y-2">
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToBOM(item.itemNumber)}
                    className="w-full p-4 text-left rounded-xl hover:bg-slate-50 transition-all group flex items-center justify-between border border-transparent hover:border-slate-200 hover:shadow-sm"
                    data-testid={`recent-search-${item.id}`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.itemNumber} • {item.lastAccessed}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Favorites */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="font-bold text-slate-800">Favorites</h2>
              </div>
              <div className="space-y-2">
                {favoriteItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToBOM(item.itemNumber)}
                    className="w-full p-4 text-left rounded-xl hover:bg-amber-50 transition-all group flex items-center justify-between border border-transparent hover:border-amber-200 hover:shadow-sm"
                    data-testid={`favorite-item-${item.id}`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.itemNumber} • {item.project}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Projects */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-bold text-slate-800">Active Projects</h2>
              </div>
              <div className="space-y-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onNavigateToBOM(project.name)}
                    className="w-full p-5 text-left rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group shadow-sm hover:shadow-md"
                    data-testid={`project-${project.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-bold text-slate-800">{project.name}</p>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">{project.items} items</span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full ${
                              project.readiness >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                              project.readiness >= 60 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                              'bg-gradient-to-r from-red-400 to-rose-500'
                            }`}
                            style={{ width: `${project.readiness}%` }}
                          />
                        </div>
                        <span className={`font-bold ${
                          project.readiness >= 80 ? 'text-emerald-600' :
                          project.readiness >= 60 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {project.readiness}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMSearch;
