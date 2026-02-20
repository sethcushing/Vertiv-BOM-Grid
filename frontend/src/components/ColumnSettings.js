import React, { useState } from 'react';
import { X, GripVertical, Eye, EyeOff, RotateCcw, Check, Search } from 'lucide-react';

const ColumnSettings = ({ isOpen, onClose, columns, onSaveColumns }) => {
  const [localColumns, setLocalColumns] = useState(columns || defaultColumns);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  const defaultColumns = [
    { id: 'level', label: 'Level', group: 'Identity', visible: true, frozen: true },
    { id: 'itemNumber', label: 'Item Number', group: 'Identity', visible: true, frozen: true },
    { id: 'revision', label: 'Revision', group: 'Identity', visible: true, frozen: false },
    { id: 'commodity', label: 'Commodity', group: 'Identity', visible: true, frozen: false },
    { id: 'description', label: 'Description', group: 'Identity', visible: true, frozen: false },
    { id: 'plant', label: 'Plant', group: 'Identity', visible: true, frozen: false },
    { id: 'lifecycleStage', label: 'Lifecycle Stage', group: 'Governance', visible: true, frozen: false },
    { id: 'pendingCONumber', label: 'CO #', group: 'Governance', visible: true, frozen: false },
    { id: 'makeBuy', label: 'Make/Buy', group: 'Procurement', visible: true, frozen: false },
    { id: 'aml', label: 'AML', group: 'Procurement', visible: true, frozen: false },
    { id: 'supplier', label: 'Supplier', group: 'Procurement', visible: true, frozen: false },
    { id: 'leadTime', label: 'Lead Time', group: 'Procurement', visible: true, frozen: false },
    { id: 'ccoStatus', label: 'CCO Status', group: 'ERP', visible: true, frozen: false },
    { id: 'orderable', label: 'Orderable', group: 'ERP', visible: true, frozen: false },
    { id: 'ppapStatus', label: 'PPAP Status', group: 'Quality', visible: true, frozen: false },
    { id: 'coo', label: 'COO', group: 'Quality', visible: true, frozen: false },
    { id: 'tradeComplianceStatus', label: 'Trade Compliance', group: 'Quality', visible: true, frozen: false },
    { id: 'overallReadiness', label: 'Overall Readiness', group: 'Readiness', visible: true, frozen: false },
    { id: 'designReadiness', label: 'Design Readiness', group: 'Readiness', visible: false, frozen: false },
    { id: 'procurementReadiness', label: 'Procurement Readiness', group: 'Readiness', visible: false, frozen: false },
    { id: 'manufacturingReadiness', label: 'Manufacturing Readiness', group: 'Readiness', visible: false, frozen: false },
    { id: 'qualityReadiness', label: 'Quality Readiness', group: 'Readiness', visible: false, frozen: false },
    { id: 'engOwner', label: 'Eng Owner', group: 'Ownership', visible: false, frozen: false },
    { id: 'procurementOwner', label: 'Procurement Owner', group: 'Ownership', visible: false, frozen: false },
    { id: 'ameOwner', label: 'AME Owner', group: 'Ownership', visible: false, frozen: false },
    { id: 'qualityOwner', label: 'Quality Owner', group: 'Ownership', visible: false, frozen: false },
    { id: 'blockerOwner', label: 'Blocker Owner', group: 'Ownership', visible: false, frozen: false },
    { id: 'erpStatus', label: 'ERP Status', group: 'ERP', visible: false, frozen: false },
    { id: 'hasBPA', label: 'Has BPA', group: 'Procurement', visible: false, frozen: false },
    { id: 'quoteStatus', label: 'Quote Status', group: 'Procurement', visible: false, frozen: false },
  ];

  const presets = [
    { 
      name: 'Default View', 
      description: 'Standard column configuration',
      columns: defaultColumns.map(c => c.id).slice(0, 18)
    },
    { 
      name: 'Engineering View', 
      description: 'Focus on design & engineering fields',
      columns: ['level', 'itemNumber', 'revision', 'description', 'lifecycleStage', 'designReadiness', 'engOwner', 'commodity']
    },
    { 
      name: 'Procurement View', 
      description: 'Focus on sourcing & supplier fields',
      columns: ['level', 'itemNumber', 'description', 'makeBuy', 'supplier', 'leadTime', 'aml', 'hasBPA', 'quoteStatus', 'procurementReadiness', 'procurementOwner']
    },
    { 
      name: 'PM View', 
      description: 'Focus on readiness & blockers',
      columns: ['level', 'itemNumber', 'description', 'lifecycleStage', 'overallReadiness', 'designReadiness', 'procurementReadiness', 'manufacturingReadiness', 'qualityReadiness', 'orderable']
    },
    { 
      name: 'AME View', 
      description: 'Focus on manufacturing & quality',
      columns: ['level', 'itemNumber', 'description', 'plant', 'manufacturingReadiness', 'qualityReadiness', 'ppapStatus', 'ameOwner']
    }
  ];

  const groups = [...new Set(localColumns.map(c => c.group))];

  const toggleColumn = (columnId) => {
    setLocalColumns(prev => 
      prev.map(col => 
        col.id === columnId && !col.frozen
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  const toggleGroupVisibility = (group, visible) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col.group === group && !col.frozen
          ? { ...col, visible }
          : col
      )
    );
  };

  const applyPreset = (preset) => {
    setLocalColumns(prev =>
      prev.map(col => ({
        ...col,
        visible: preset.columns.includes(col.id) || col.frozen
      }))
    );
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newColumns = [...localColumns];
    const item = newColumns[draggedItem];
    newColumns.splice(draggedItem, 1);
    newColumns.splice(index, 0, item);
    setLocalColumns(newColumns);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleReset = () => {
    setLocalColumns(defaultColumns);
  };

  const handleSave = () => {
    onSaveColumns(localColumns);
    onClose();
  };

  const visibleCount = localColumns.filter(c => c.visible).length;
  const filteredColumns = localColumns.filter(col =>
    col.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-overlay fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="modal-modern w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in" data-testid="column-settings-modal">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Column Settings</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {visibleCount} of {localColumns.length} columns visible
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid="close-column-settings"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Presets</p>
            <div className="flex gap-2 flex-wrap">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search columns..."
                className="input-modern w-full pl-10"
              />
            </div>
          </div>

          {/* Column List */}
          <div className="flex-1 overflow-y-auto p-6">
            {groups.map(group => {
              const groupColumns = filteredColumns.filter(col => col.group === group);
              if (groupColumns.length === 0) return null;
              
              const allVisible = groupColumns.every(col => col.visible);
              const someVisible = groupColumns.some(col => col.visible);

              return (
                <div key={group} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800">{group}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleGroupVisibility(group, true)}
                        className={`p-1.5 rounded-md transition-colors ${allVisible ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}
                        title="Show all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleGroupVisibility(group, false)}
                        className={`p-1.5 rounded-md transition-colors ${!someVisible ? 'bg-slate-200 text-slate-600' : 'hover:bg-slate-100 text-slate-400'}`}
                        title="Hide all"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {groupColumns.map((column, index) => (
                      <div
                        key={column.id}
                        draggable={!column.frozen}
                        onDragStart={(e) => handleDragStart(e, localColumns.indexOf(column))}
                        onDragOver={(e) => handleDragOver(e, localColumns.indexOf(column))}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          column.visible 
                            ? 'bg-white border-slate-200 shadow-sm' 
                            : 'bg-slate-50 border-slate-100'
                        } ${!column.frozen ? 'cursor-move' : ''}`}
                      >
                        {!column.frozen && (
                          <GripVertical className="w-4 h-4 text-slate-300" />
                        )}
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${column.visible ? 'text-slate-800' : 'text-slate-500'}`}>
                            {column.label}
                          </span>
                          {column.frozen && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                              Frozen
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleColumn(column.id)}
                          disabled={column.frozen}
                          className={`p-2 rounded-lg transition-all ${
                            column.frozen 
                              ? 'opacity-50 cursor-not-allowed' 
                              : column.visible
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {column.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
              data-testid="reset-columns-btn"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                data-testid="save-columns-btn"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ColumnSettings;
