import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Filter, Check } from 'lucide-react';

const ColumnFilterDropdown = ({ values, selectedValues, onApply, onClose }) => {
  const [localSelected, setLocalSelected] = useState(new Set(selectedValues));
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const toggleValue = (val) => {
    const next = new Set(localSelected);
    if (next.has(val)) next.delete(val); else next.add(val);
    setLocalSelected(next);
  };

  const allSelected = values.length === localSelected.size;

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg z-50 min-w-[200px]"
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      onClick={e => e.stopPropagation()}
      data-testid="column-filter-dropdown"
    >
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter</span>
        <div className="flex gap-2">
          <button
            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => setLocalSelected(new Set(values))}
          >
            All
          </button>
          <span className="text-slate-300">|</span>
          <button
            className="text-[11px] text-slate-500 hover:text-slate-700 font-medium"
            onClick={() => setLocalSelected(new Set())}
          >
            None
          </button>
        </div>
      </div>
      <div className="max-h-[220px] overflow-y-auto p-1.5">
        {values.map(val => (
          <label
            key={val}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
              localSelected.has(val) 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-slate-300 bg-white'
            }`}>
              {localSelected.has(val) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs text-slate-700 truncate">{val || '(empty)'}</span>
          </label>
        ))}
        {values.length === 0 && (
          <div className="text-xs text-slate-400 px-2.5 py-3 text-center">No values</div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-slate-100 flex gap-2">
        <button
          className="flex-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-medium transition-colors"
          onClick={() => { onApply([...localSelected]); onClose(); }}
          data-testid="column-filter-apply-btn"
        >
          Apply
        </button>
        <button
          className="text-xs text-slate-500 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const ColumnHeaderCell = ({ columnKey, label, sortConfig, onSort, columnFilters, uniqueValues, onFilterApply }) => {
  const [showFilter, setShowFilter] = useState(false);
  const isSorted = sortConfig.key === columnKey;
  const hasFilter = columnFilters[columnKey]?.length > 0;

  const SortIcon = isSorted
    ? (sortConfig.direction === 'asc' ? ArrowUp : ArrowDown)
    : ArrowUpDown;

  return (
    <div className="flex items-center gap-0.5 relative w-full h-full">
      <button
        className="flex items-center gap-1 flex-1 min-w-0 text-left group/sort"
        onClick={(e) => { e.stopPropagation(); onSort(columnKey); }}
        data-testid={`sort-${columnKey}`}
      >
        <span className="truncate">{label}</span>
        <SortIcon className={`w-3 h-3 flex-shrink-0 transition-all ${
          isSorted ? 'text-blue-600' : 'text-slate-400 opacity-0 group-hover/sort:opacity-100'
        }`} />
      </button>
      <button
        className={`p-0.5 rounded flex-shrink-0 transition-all ${
          hasFilter 
            ? 'text-blue-600' 
            : 'text-slate-400 opacity-40 hover:opacity-100'
        }`}
        onClick={(e) => { e.stopPropagation(); setShowFilter(!showFilter); }}
        data-testid={`filter-col-${columnKey}`}
      >
        <Filter className="w-3 h-3" />
      </button>
      {showFilter && (
        <ColumnFilterDropdown
          values={uniqueValues}
          selectedValues={columnFilters[columnKey] || []}
          onApply={(vals) => onFilterApply(columnKey, vals)}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default ColumnHeaderCell;
