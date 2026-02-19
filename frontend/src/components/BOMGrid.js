import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Download,
  AlertTriangle,
  Layers,
  Users,
  Wrench,
  ShoppingCart,
  Briefcase,
  X,
  Package,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Database,
  Sparkles
} from 'lucide-react';
import { sampleBOMData, projectSummary, bomKPIs } from '../data/bomData';

const BOMGrid = ({ onNavigateToDashboard, onNavigateToCO, onSelectItem }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [roleView, setRoleView] = useState('PM');
  const [showFilters, setShowFilters] = useState(false);
  const [bomData] = useState(sampleBOMData);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const [filters, setFilters] = useState({
    plant: [],
    blockedOnly: false,
    makeBuy: [],
    myItems: false,
    lifecycleStage: []
  });

  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Handle column sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon for column header
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-orange-600" />
      : <ArrowDown className="w-3 h-3 text-orange-600" />;
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return bomData.filter(item => {
      if (filters.blockedOnly && item.blockers.length === 0) return false;
      if (filters.makeBuy.length > 0 && !filters.makeBuy.includes(item.makeBuy)) return false;
      if (filters.lifecycleStage.length > 0 && !filters.lifecycleStage.includes(item.lifecycleStage)) return false;
      return true;
    });
  }, [bomData, filters]);

  // Sort items
  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return filteredItems;
    
    return [...filteredItems].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested values and special cases
      if (sortConfig.key === 'supplier') {
        aValue = a.approvedSupplier || a.potentialSupplier || '';
        bValue = b.approvedSupplier || b.potentialSupplier || '';
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle strings
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortConfig]);

  // Build visible rows (hierarchical)
  const visibleRows = useMemo(() => {
    const rows = [];
    
    const addItemAndChildren = (item) => {
      rows.push(item);
      if (item.hasChildren && expandedItems.has(item.id)) {
        const children = sortedItems.filter(i => i.parentId === item.id);
        children.forEach(child => addItemAndChildren(child));
      }
    };

    sortedItems.filter(item => item.level === 0).forEach(item => {
      addItemAndChildren(item);
    });

    return rows;
  }, [sortedItems, expandedItems]);

  const getReadinessColor = (readiness) => {
    if (readiness >= 90) return 'bg-green-500';
    if (readiness >= 70) return 'bg-blue-500';
    if (readiness >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getReadinessTextColor = (readiness) => {
    if (readiness >= 90) return 'text-green-700';
    if (readiness >= 70) return 'text-blue-700';
    if (readiness >= 40) return 'text-amber-700';
    return 'text-red-700';
  };

  // V23: Lifecycle Stage badge colors
  const getLifecycleStageStyle = (stage) => {
    switch(stage) {
      case 'Orderable':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CCO In Progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CO Approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CO Submitted':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Ready for CO':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Draft':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // V23: AML badge colors
  const getAMLStyle = (aml) => {
    if (aml === 0) return 'bg-red-100 text-red-700';
    if (aml <= 2) return 'bg-amber-100 text-amber-700';
    if (aml === 3) return 'bg-green-100 text-green-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Engineering': return <Wrench className="w-4 h-4" />;
      case 'Procurement': return <ShoppingCart className="w-4 h-4" />;
      case 'PM': return <Briefcase className="w-4 h-4" />;
      default: return null;
    }
  };

  // Sortable header component
  const SortableHeader = ({ label, sortKey, width, className = '' }) => (
    <div 
      className={`${width} px-3 py-3 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between gap-1 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <span>{label}</span>
      {getSortIcon(sortKey)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onNavigateToDashboard}
                  data-testid="back-to-dashboard-btn"
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                >
                  ← Dashboard
                </button>
                <span className="text-gray-300">|</span>
                <h1 className="text-2xl font-display text-gray-900">
                  BOM Grid
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {visibleRows.length} items shown • Last refreshed: {projectSummary.lastRefreshed}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToCO}
                data-testid="co-readiness-btn"
                className="btn-secondary"
              >
                <AlertTriangle className="w-4 h-4" />
                CO Readiness Review
              </button>
              <button 
                data-testid="export-btn"
                className="btn-secondary"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                data-testid="refresh-btn"
                className="btn-secondary"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Role View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1.5">
                {['Engineering', 'Procurement', 'PM'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleView(role)}
                    data-testid={`role-${role.toLowerCase()}-btn`}
                    className={`toggle-btn ${
                      roleView === role
                        ? 'toggle-btn-active'
                        : 'toggle-btn-inactive'
                    }`}
                  >
                    {getRoleIcon(role)}
                    {role}
                  </button>
                ))}
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1.5">
                <button
                  data-testid="view-all-btn"
                  className="toggle-btn toggle-btn-active"
                >
                  <Layers className="w-4 h-4" />
                  All Items
                </button>
              </div>
              
              <button
                onClick={() => setFilters(prev => ({ ...prev, myItems: !prev.myItems }))}
                data-testid="my-items-btn"
                className={`toggle-btn rounded-xl px-4 ${
                  filters.myItems 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                My Items
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                data-testid="filter-toggle-btn"
                className={`toggle-btn rounded-xl px-4 ${
                  showFilters 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* V23: KPI Analytics Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          {/* KPI 1: Not Yet in ERP */}
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${
                bomKPIs.notYetInERP.percentage > 25 ? 'text-red-600' :
                bomKPIs.notYetInERP.percentage > 10 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Not Yet in ERP</span>
            </div>
            <div className="text-2xl font-display text-gray-900">{bomKPIs.notYetInERP.percentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {bomKPIs.notYetInERP.count} of {bomKPIs.notYetInERP.total} items
            </div>
          </div>

          {/* KPI 2: Pending COs */}
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-4 h-4 ${
                bomKPIs.pendingCOs.count > 10 ? 'text-red-600' :
                bomKPIs.pendingCOs.count > 5 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending COs</span>
            </div>
            <div className="text-2xl font-display text-gray-900">{bomKPIs.pendingCOs.count}</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg Aging: {bomKPIs.pendingCOs.avgAging} days
            </div>
          </div>

          {/* KPI 3: Items Not Orderable */}
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${
                bomKPIs.notOrderable.percentage > 20 ? 'text-red-600' :
                bomKPIs.notOrderable.percentage > 10 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Not Orderable</span>
            </div>
            <div className="text-2xl font-display text-gray-900">{bomKPIs.notOrderable.percentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {bomKPIs.notOrderable.count} of {bomKPIs.notOrderable.total} items
            </div>
          </div>

          {/* KPI 4: Clear-to-Build Gap */}
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${
                bomKPIs.clearToBuild.status === 'late' ? 'text-red-600' :
                bomKPIs.clearToBuild.status === 'ontime' ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Clear-to-Build</span>
            </div>
            <div className="text-2xl font-display text-gray-900">{bomKPIs.clearToBuild.forecastedDate}</div>
            <div className={`text-xs font-semibold mt-1 ${
              bomKPIs.clearToBuild.status === 'late' ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {bomKPIs.clearToBuild.status === 'late' ? '+' : '-'}{Math.abs(bomKPIs.clearToBuild.gapDays)} days {bomKPIs.clearToBuild.status}
            </div>
          </div>
        </div>
      </div>

      {/* V23: Data Source Legend */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-end gap-4">
          <span className="text-xs font-semibold text-gray-600">Data Source:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-xs text-gray-600">PLM (Read Only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded"></div>
              <span className="text-xs text-gray-600">ERP (Read Only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
              <span className="text-xs text-gray-600">Editable (Pre-CO)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-gray-900">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium">Blocked Only:</label>
              <input 
                type="checkbox" 
                checked={filters.blockedOnly}
                onChange={(e) => setFilters({...filters, blockedOnly: e.target.checked})}
                className="w-5 h-5 text-orange-500 border-gray-300 rounded-md focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium">Make/Buy:</label>
              <select 
                value={filters.makeBuy[0] || ''}
                onChange={(e) => setFilters({...filters, makeBuy: e.target.value ? [e.target.value] : []})}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white"
              >
                <option value="">All</option>
                <option value="Make">Make</option>
                <option value="Buy">Buy</option>
                <option value="TBD">TBD</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium">Lifecycle Stage:</label>
              <select 
                value={filters.lifecycleStage[0] || ''}
                onChange={(e) => setFilters({...filters, lifecycleStage: e.target.value ? [e.target.value] : []})}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white"
              >
                <option value="">All</option>
                <option value="Draft">Draft</option>
                <option value="Ready for CO">Ready for CO</option>
                <option value="CO Submitted">CO Submitted</option>
                <option value="CO Approved">CO Approved</option>
                <option value="CCO In Progress">CCO In Progress</option>
                <option value="Orderable">Orderable</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-white mx-6 my-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="min-w-max">
          {/* Header Row - Sortable */}
          <div className="grid-header flex text-xs font-bold text-gray-500 uppercase tracking-wider rounded-t-2xl">
            <div className="w-14 px-3 py-3 border-r border-gray-200"></div>
            <SortableHeader label="Level" sortKey="level" width="w-16" />
            <SortableHeader label="Item #" sortKey="itemNumber" width="w-36" />
            <SortableHeader label="Rev" sortKey="revision" width="w-16" />
            <SortableHeader label="Description" sortKey="description" width="w-64" />
            <SortableHeader label="Commodity" sortKey="commodity" width="w-36" />
            <SortableHeader label="Plant" sortKey="plant" width="w-32" />
            
            {/* V23: Lifecycle Stage Column */}
            <SortableHeader label="Lifecycle" sortKey="lifecycleStage" width="w-32" />
            
            {/* Role-specific columns */}
            {(roleView === 'Engineering' || roleView === 'PM') && (
              <>
                <SortableHeader label="Eng Owner" sortKey="engOwner" width="w-32" />
                <SortableHeader label="Design Status" sortKey="designStatus" width="w-28" />
              </>
            )}
            {(roleView === 'Procurement' || roleView === 'PM') && (
              <>
                <SortableHeader label="Make/Buy" sortKey="makeBuy" width="w-24" />
                <SortableHeader label="Supplier" sortKey="supplier" width="w-40" />
                <SortableHeader label="Quote Status" sortKey="quoteStatus" width="w-28" />
                <SortableHeader label="AML" sortKey="aml" width="w-16" />
              </>
            )}
            
            <SortableHeader label="Readiness" sortKey="overallReadiness" width="w-28" />
            <SortableHeader label="Blockers" sortKey="blockerAging" width="w-24" className="border-r-0" />
          </div>

          {/* Data Rows */}
          <div className="bg-white">
            {visibleRows.map((item) => (
              <div
                key={item.id}
                data-testid={`bom-row-${item.id}`}
                className={`flex text-sm border-b cursor-pointer transition-all duration-200 ${
                  item.lifecycleStage === 'Draft' 
                    ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-l-4 border-l-amber-400 hover:from-amber-100/50 hover:to-orange-100/30' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
                onClick={() => onSelectItem(item)}
              >
                {/* Expand/Collapse with Tree Indentation */}
                <div className="w-14 px-3 py-4 border-r border-gray-200 flex items-center">
                  <div style={{ marginLeft: `${item.level * 16}px` }} className="flex items-center">
                    {item.hasChildren ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        className="hover:bg-gray-200 rounded-lg p-1.5 transition-colors"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    ) : (
                      <div className="w-7 h-7" /> 
                    )}
                  </div>
                </div>

                {/* Level */}
                <div className="w-16 px-3 py-4 border-r border-gray-200 text-gray-500 font-mono font-semibold">
                  {item.level}
                </div>

                {/* Item Number with PLM Badge */}
                <div className="w-36 px-3 py-4 border-r border-gray-200 font-mono font-semibold flex items-center gap-2">
                  <span className={item.lifecycleStage === 'Draft' ? 'text-amber-700' : 'text-blue-700'}>
                    {item.itemNumber}
                  </span>
                  {item.isNewPart && (
                    <span className="status-badge bg-green-100 text-green-700 border-green-200 text-[10px] py-0.5 px-1.5">
                      New
                    </span>
                  )}
                </div>

                {/* Revision */}
                <div className="w-16 px-3 py-4 border-r border-gray-200 text-gray-600 font-mono">
                  {item.revision}
                </div>

                {/* Description */}
                <div className="w-64 px-3 py-4 border-r border-gray-200 text-gray-900 truncate">
                  {item.description}
                </div>

                {/* Commodity */}
                <div className="w-36 px-3 py-4 border-r border-gray-200 text-gray-600 text-xs">
                  {item.commodity}
                </div>

                {/* Plant */}
                <div className="w-32 px-3 py-4 border-r border-gray-200 text-gray-600 text-xs">
                  {item.plant.split(',')[0]}
                </div>

                {/* V23: Lifecycle Stage */}
                <div className="w-32 px-3 py-4 border-r border-gray-200">
                  <span className={`status-badge border ${getLifecycleStageStyle(item.lifecycleStage)}`}>
                    {item.lifecycleStage}
                  </span>
                </div>

                {/* Engineering columns */}
                {(roleView === 'Engineering' || roleView === 'PM') && (
                  <>
                    <div className="w-32 px-3 py-4 border-r border-gray-200 text-gray-600 text-xs">
                      {item.engOwner}
                    </div>
                    <div className="w-28 px-3 py-4 border-r border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className={`status-badge ${
                          item.designStatus === 'Released' ? 'status-ready' : 
                          item.designStatus === 'In Review' ? 'status-progress' : 
                          'status-draft'
                        }`}>
                          {item.designStatus}
                        </span>
                        <Database className="w-3 h-3 text-purple-500" title="PLM Mastered" />
                      </div>
                    </div>
                  </>
                )}

                {/* Procurement columns */}
                {(roleView === 'Procurement' || roleView === 'PM') && (
                  <>
                    <div className="w-24 px-3 py-4 border-r border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className={`status-badge ${
                          item.makeBuy === 'Make' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          item.makeBuy === 'Buy' ? 'bg-green-50 text-green-700 border-green-200' : 
                          'status-draft'
                        }`}>
                          {item.makeBuy}
                        </span>
                        {item.makeBuy !== 'TBD' && item.supplierSetupInERP && (
                          <Database className="w-3 h-3 text-indigo-500" title="ERP Activated" />
                        )}
                      </div>
                    </div>
                    <div className="w-40 px-3 py-4 border-r border-gray-200 text-gray-900 text-xs">
                      {item.approvedSupplier || item.potentialSupplier || '—'}
                    </div>
                    <div className="w-28 px-3 py-4 border-r border-gray-200">
                      <span className={`status-badge ${
                        item.quoteStatus === 'Received' ? 'status-ready' : 
                        item.quoteStatus === 'Pending' || item.quoteStatus === 'Requested' ? 'status-warning' : 
                        'status-draft'
                      }`}>
                        {item.quoteStatus}
                      </span>
                    </div>
                    {/* V23: AML Column */}
                    <div className="w-16 px-3 py-4 border-r border-gray-200">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold ${getAMLStyle(item.aml)}`}>
                        {item.aml >= 4 ? '4+' : item.aml}
                      </span>
                    </div>
                  </>
                )}

                {/* Readiness */}
                <div className="w-28 px-3 py-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getReadinessColor(item.overallReadiness)} progress-fill`}
                        style={{ width: `${item.overallReadiness}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-semibold ${getReadinessTextColor(item.overallReadiness)}`}>
                      {item.overallReadiness}%
                    </span>
                  </div>
                </div>

                {/* Blockers */}
                <div className="w-24 px-3 py-4">
                  {item.blockers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="status-badge status-blocked">
                        {item.blockers.length}
                      </span>
                      {item.blockerAging > 0 && (
                        <span className="text-xs text-gray-500 font-mono">{item.blockerAging}d</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMGrid;
