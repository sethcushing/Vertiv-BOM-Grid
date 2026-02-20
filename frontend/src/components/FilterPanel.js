import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, RotateCcw, Check } from 'lucide-react';

const FilterPanel = ({ isOpen, onClose, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    lifecycleStages: [],
    makeBuy: [],
    plants: [],
    hasBlockers: null,
    orderable: null,
    erpStatus: [],
    commodities: [],
    readinessRange: [0, 100]
  });

  const [expandedSections, setExpandedSections] = useState({
    lifecycle: true,
    makeBuy: true,
    plant: false,
    status: true,
    readiness: false,
    commodity: false
  });

  const lifecycleOptions = [
    { value: 'Draft', label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    { value: 'Ready for CO', label: 'Ready for CO', color: 'bg-amber-100 text-amber-700' },
    { value: 'CO Submitted', label: 'CO Submitted', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'CO Approved', label: 'CO Approved', color: 'bg-blue-100 text-blue-700' },
    { value: 'CCO In Progress', label: 'CCO In Progress', color: 'bg-purple-100 text-purple-700' },
    { value: 'Orderable', label: 'Orderable', color: 'bg-emerald-100 text-emerald-700' }
  ];

  const makeBuyOptions = [
    { value: 'Make', label: 'Make' },
    { value: 'Buy', label: 'Buy' },
    { value: 'TBD', label: 'TBD' }
  ];

  const plantOptions = [
    { value: 'Columbus, OH', label: 'Columbus, OH' },
    { value: 'Monterrey', label: 'Monterrey' },
    { value: 'Shanghai', label: 'Shanghai' }
  ];

  const erpStatusOptions = [
    { value: 'Activated', label: 'Activated' },
    { value: 'Not Activated', label: 'Not Activated' }
  ];

  const commodityOptions = [
    { value: 'Electrical Assembly', label: 'Electrical Assembly' },
    { value: 'PCB Assembly', label: 'PCB Assembly' },
    { value: 'PCB', label: 'PCB' },
    { value: 'Semiconductor', label: 'Semiconductor' },
    { value: 'Passive Component', label: 'Passive Component' },
    { value: 'Power Supply', label: 'Power Supply' },
    { value: 'Sheet Metal', label: 'Sheet Metal' },
    { value: 'Wire & Cable', label: 'Wire & Cable' },
    { value: 'Thermal Management', label: 'Thermal Management' },
    { value: 'Connector', label: 'Connector' }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = (key, value) => {
    setLocalFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const setBooleanFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const handleReset = () => {
    setLocalFilters({
      lifecycleStages: [],
      makeBuy: [],
      plants: [],
      hasBlockers: null,
      orderable: null,
      erpStatus: [],
      commodities: [],
      readinessRange: [0, 100]
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.lifecycleStages?.length) count += localFilters.lifecycleStages.length;
    if (localFilters.makeBuy?.length) count += localFilters.makeBuy.length;
    if (localFilters.plants?.length) count += localFilters.plants.length;
    if (localFilters.hasBlockers !== null) count += 1;
    if (localFilters.orderable !== null) count += 1;
    if (localFilters.erpStatus?.length) count += localFilters.erpStatus.length;
    if (localFilters.commodities?.length) count += localFilters.commodities.length;
    return count;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-[380px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right" data-testid="filter-panel">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="close-filter-panel"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Lifecycle Stage */}
          <div className="card-elevated overflow-hidden">
            <button
              onClick={() => toggleSection('lifecycle')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-800">Lifecycle Stage</span>
              <div className="flex items-center gap-2">
                {localFilters.lifecycleStages?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {localFilters.lifecycleStages.length}
                  </span>
                )}
                {expandedSections.lifecycle ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>
            {expandedSections.lifecycle && (
              <div className="px-4 pb-4 space-y-2">
                {lifecycleOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.lifecycleStages?.includes(option.value)}
                      onChange={() => toggleArrayFilter('lifecycleStages', option.value)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Make/Buy */}
          <div className="card-elevated overflow-hidden">
            <button
              onClick={() => toggleSection('makeBuy')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-800">Make/Buy</span>
              <div className="flex items-center gap-2">
                {localFilters.makeBuy?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {localFilters.makeBuy.length}
                  </span>
                )}
                {expandedSections.makeBuy ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>
            {expandedSections.makeBuy && (
              <div className="px-4 pb-4 flex gap-2">
                {makeBuyOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('makeBuy', option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      localFilters.makeBuy?.includes(option.value)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filters */}
          <div className="card-elevated overflow-hidden">
            <button
              onClick={() => toggleSection('status')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-800">Status Filters</span>
              {expandedSections.status ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {expandedSections.status && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Has Blockers</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBooleanFilter('hasBlockers', true)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        localFilters.hasBlockers === true
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setBooleanFilter('hasBlockers', false)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        localFilters.hasBlockers === false
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Orderable</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBooleanFilter('orderable', true)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        localFilters.orderable === true
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setBooleanFilter('orderable', false)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        localFilters.orderable === false
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plant */}
          <div className="card-elevated overflow-hidden">
            <button
              onClick={() => toggleSection('plant')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-800">Plant</span>
              <div className="flex items-center gap-2">
                {localFilters.plants?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {localFilters.plants.length}
                  </span>
                )}
                {expandedSections.plant ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>
            {expandedSections.plant && (
              <div className="px-4 pb-4 space-y-2">
                {plantOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.plants?.includes(option.value)}
                      onChange={() => toggleArrayFilter('plants', option.value)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Commodity */}
          <div className="card-elevated overflow-hidden">
            <button
              onClick={() => toggleSection('commodity')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-800">Commodity</span>
              <div className="flex items-center gap-2">
                {localFilters.commodities?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {localFilters.commodities.length}
                  </span>
                )}
                {expandedSections.commodity ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>
            {expandedSections.commodity && (
              <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
                {commodityOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.commodities?.includes(option.value)}
                      onChange={() => toggleArrayFilter('commodities', option.value)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <button
            onClick={handleApply}
            className="w-full btn-primary flex items-center justify-center gap-2"
            data-testid="apply-filters-btn"
          >
            <Check className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="w-full btn-secondary flex items-center justify-center gap-2"
            data-testid="reset-filters-btn"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
