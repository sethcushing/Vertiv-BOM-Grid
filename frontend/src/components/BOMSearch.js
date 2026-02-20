import React, { useState } from 'react';
import { Search, Star, Clock, Folder, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2" data-testid="bom-search-title">
            BOM Grid Search
          </h1>
          <p className="text-slate-600 mb-8">
            Search by project name, item number, or description to access the BOM Grid view.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project, item number, or description..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="bom-search-input"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              data-testid="bom-search-submit-btn"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Recent Searches */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Recent Searches</h2>
              </div>
              <div className="space-y-2">
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToBOM(item.itemNumber)}
                    className="w-full p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group flex items-center justify-between"
                    data-testid={`recent-search-${item.id}`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.itemNumber} • {item.lastAccessed}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-800">Favorites</h2>
              </div>
              <div className="space-y-2">
                {favoriteItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToBOM(item.itemNumber)}
                    className="w-full p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group flex items-center justify-between"
                    data-testid={`favorite-item-${item.id}`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.itemNumber} • {item.project}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Projects */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-slate-800">Active Projects</h2>
              </div>
              <div className="space-y-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onNavigateToBOM(project.name)}
                    className="w-full p-4 text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    data-testid={`project-${project.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-slate-800">{project.name}</p>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">{project.items} items</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              project.readiness >= 80 ? 'bg-emerald-500' :
                              project.readiness >= 60 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${project.readiness}%` }}
                          />
                        </div>
                        <span className={`font-medium ${
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
