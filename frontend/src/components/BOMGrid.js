import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Download,
  AlertTriangle,
  Plus,
  Send,
  Layers,
  Users,
  Wrench,
  ShoppingCart,
  Briefcase,
  X
} from 'lucide-react';
import { sampleBOMData, projectSummary } from '../data/bomData';

const BOMGrid = ({ onNavigateToDashboard, onNavigateToCO, onSelectItem }) => {
  const [expandedItems, setExpandedItems] = useState(new Set(['1', '2']));
  const [roleView, setRoleView] = useState('PM');
  const [viewMode, setViewMode] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPreCOItems, setSelectedPreCOItems] = useState(new Set());
  const [bomData] = useState(sampleBOMData);
  
  const [filters, setFilters] = useState({
    plant: [],
    blockedOnly: false,
    showPreCO: true,
    makeBuy: [],
    myItems: false
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

  const filteredItems = useMemo(() => {
    return bomData.filter(item => {
      if (viewMode === 'preco-only' && !item.isPreCO) return false;
      if (!filters.showPreCO && item.isPreCO) return false;
      if (filters.plant.length > 0 && !filters.plant.includes(item.plant)) return false;
      if (filters.blockedOnly && item.blockers.length === 0) return false;
      if (filters.makeBuy.length > 0 && !filters.makeBuy.includes(item.makeBuy)) return false;
      return true;
    });
  }, [bomData, filters, viewMode]);

  const visibleRows = useMemo(() => {
    const rows = [];
    
    const addItemAndChildren = (item) => {
      rows.push(item);
      if (item.hasChildren && expandedItems.has(item.id)) {
        const children = filteredItems.filter(i => i.parentId === item.id);
        children.forEach(child => addItemAndChildren(child));
      }
    };

    filteredItems.filter(item => item.level === 0).forEach(item => {
      addItemAndChildren(item);
    });

    return rows;
  }, [filteredItems, expandedItems]);

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

  const preCOStats = useMemo(() => {
    const precoItems = bomData.filter(item => item.isPreCO);
    return {
      total: precoItems.length,
      averageReadiness: precoItems.length > 0 
        ? Math.round(precoItems.reduce((sum, item) => sum + item.designReadiness, 0) / precoItems.length)
        : 0,
      readyForSubmission: precoItems.filter(item => item.designReadiness >= 80).length,
    };
  }, [bomData]);

  const togglePreCOSelection = (itemId) => {
    const newSelection = new Set(selectedPreCOItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedPreCOItems(newSelection);
  };

  const selectAllPreCO = () => {
    const precoIds = filteredItems.filter(item => item.isPreCO).map(item => item.id);
    setSelectedPreCOItems(new Set(precoIds));
  };

  const clearPreCOSelection = () => {
    setSelectedPreCOItems(new Set());
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Engineering': return <Wrench className="w-4 h-4" />;
      case 'Procurement': return <ShoppingCart className="w-4 h-4" />;
      case 'PM': return <Briefcase className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="glass-strong border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onNavigateToDashboard}
                  data-testid="back-to-dashboard-btn"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wide"
                >
                  ← Dashboard
                </button>
                <span className="text-slate-300">|</span>
                <h1 className="text-xl font-display font-semibold text-slate-900 uppercase tracking-tight">
                  BOM Convergence Grid
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Enterprise Convergence & Readiness Workspace • {visibleRows.length} items shown
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToCO}
                data-testid="co-readiness-btn"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                CO Readiness Review
              </button>
              <button 
                data-testid="export-btn"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                data-testid="refresh-btn"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Role View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-sm p-1">
                {['Engineering', 'Procurement', 'PM'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleView(role)}
                    data-testid={`role-${role.toLowerCase()}-btn`}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                      roleView === role
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {getRoleIcon(role)}
                    {role}
                  </button>
                ))}
              </div>
              
              <div className="h-6 w-px bg-slate-300"></div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-sm p-1">
                <button
                  onClick={() => setViewMode('all')}
                  data-testid="view-all-btn"
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                    viewMode === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  All Items
                </button>
                <button
                  onClick={() => setViewMode('preco-only')}
                  data-testid="view-preco-btn"
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                    viewMode === 'preco-only'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Pre-CO Workspace
                  {preCOStats.total > 0 && (
                    <span className="ml-1 bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded-sm">
                      {preCOStats.total}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => setFilters(prev => ({ ...prev, myItems: !prev.myItems }))}
                data-testid="my-items-btn"
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-medium text-sm ${
                  filters.myItems 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                My Items
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                data-testid="filter-toggle-btn"
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-medium text-sm ${
                  showFilters 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <div className="text-sm text-slate-500 flex items-center gap-2 font-mono">
              Last refreshed: {projectSummary.lastRefreshed}
            </div>
          </div>
          
          {/* Pre-CO Workspace Actions Bar */}
          {viewMode === 'preco-only' && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-2xl font-display font-semibold text-orange-900">{preCOStats.total}</div>
                    <div className="text-xs text-orange-700 uppercase tracking-wider">Pre-CO Items</div>
                  </div>
                  <div className="h-8 w-px bg-orange-300"></div>
                  <div>
                    <div className="text-2xl font-display font-semibold text-orange-900">{preCOStats.averageReadiness}%</div>
                    <div className="text-xs text-orange-700 uppercase tracking-wider">Avg Design Readiness</div>
                  </div>
                  <div className="h-8 w-px bg-orange-300"></div>
                  <div>
                    <div className="text-2xl font-display font-semibold text-orange-900">{preCOStats.readyForSubmission}</div>
                    <div className="text-xs text-orange-700 uppercase tracking-wider">Ready for CO</div>
                  </div>
                  
                  {selectedPreCOItems.size > 0 && (
                    <>
                      <div className="h-8 w-px bg-orange-300"></div>
                      <div>
                        <div className="text-sm font-medium text-orange-900">
                          {selectedPreCOItems.size} selected
                        </div>
                        <button 
                          onClick={clearPreCOSelection}
                          className="text-xs text-orange-600 hover:text-orange-700 underline"
                        >
                          Clear selection
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedPreCOItems.size > 0 && (
                    <button
                      data-testid="submit-to-co-btn"
                      className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-sm font-medium uppercase tracking-wide shadow-sm transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      Submit to CO ({selectedPreCOItems.size})
                    </button>
                  )}
                  <button
                    data-testid="create-preco-btn"
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-sm font-medium uppercase tracking-wide shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Create Pre-CO Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-strong border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-slate-900 uppercase tracking-wide">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Blocked Only:</label>
              <input 
                type="checkbox" 
                checked={filters.blockedOnly}
                onChange={(e) => setFilters({...filters, blockedOnly: e.target.checked})}
                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Show Pre-CO:</label>
              <input 
                type="checkbox" 
                checked={filters.showPreCO}
                onChange={(e) => setFilters({...filters, showPreCO: e.target.checked})}
                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Make/Buy:</label>
              <select 
                value={filters.makeBuy[0] || ''}
                onChange={(e) => setFilters({...filters, makeBuy: e.target.value ? [e.target.value] : []})}
                className="px-3 py-1 border border-slate-200 rounded-sm text-sm"
              >
                <option value="">All</option>
                <option value="Make">Make</option>
                <option value="Buy">Buy</option>
                <option value="TBD">TBD</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid-header flex text-xs font-bold text-slate-500 uppercase tracking-wider">
            {viewMode === 'preco-only' && (
              <div className="w-10 px-2 py-2 border-r border-slate-200 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedPreCOItems.size > 0 && selectedPreCOItems.size === filteredItems.filter(i => i.isPreCO).length}
                  onChange={(e) => e.target.checked ? selectAllPreCO() : clearPreCOSelection()}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                />
              </div>
            )}
            <div className="w-12 px-3 py-2 border-r border-slate-200"></div>
            <div className="w-16 px-3 py-2 border-r border-slate-200">Level</div>
            <div className="w-32 px-3 py-2 border-r border-slate-200">Item #</div>
            <div className="w-16 px-3 py-2 border-r border-slate-200">Rev</div>
            <div className="w-64 px-3 py-2 border-r border-slate-200">Description</div>
            <div className="w-32 px-3 py-2 border-r border-slate-200">Commodity</div>
            <div className="w-28 px-3 py-2 border-r border-slate-200">Plant</div>
            
            {/* Role-specific columns */}
            {(roleView === 'Engineering' || roleView === 'PM') && (
              <>
                <div className="w-28 px-3 py-2 border-r border-slate-200">Eng Owner</div>
                <div className="w-28 px-3 py-2 border-r border-slate-200">Design Status</div>
              </>
            )}
            {(roleView === 'Procurement' || roleView === 'PM') && (
              <>
                <div className="w-24 px-3 py-2 border-r border-slate-200">Make/Buy</div>
                <div className="w-36 px-3 py-2 border-r border-slate-200">Supplier</div>
                <div className="w-28 px-3 py-2 border-r border-slate-200">Quote Status</div>
              </>
            )}
            
            <div className="w-28 px-3 py-2 border-r border-slate-200">Lifecycle</div>
            <div className="w-24 px-3 py-2 border-r border-slate-200">Readiness</div>
            <div className="w-24 px-3 py-2">Blockers</div>
          </div>

          {/* Data Rows */}
          <div className="bg-white">
            {visibleRows.map((item) => (
              <div
                key={item.id}
                data-testid={`bom-row-${item.id}`}
                className={`flex text-sm border-b cursor-pointer transition-colors ${
                  item.isPreCO 
                    ? 'bg-orange-50/50 border-l-4 border-l-orange-500 border-b-orange-100 hover:bg-orange-100/50' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
                onClick={() => onSelectItem(item)}
              >
                {/* Checkbox for Pre-CO items */}
                {viewMode === 'preco-only' && item.isPreCO && (
                  <div className="w-10 px-2 py-3 border-r border-slate-200 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedPreCOItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        togglePreCOSelection(item.id);
                      }}
                      className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                    />
                  </div>
                )}
                
                {/* Expand/Collapse */}
                <div className="w-12 px-3 py-3 border-r border-slate-200 flex items-center justify-center">
                  {item.hasChildren && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="hover:bg-slate-200 rounded p-1"
                    >
                      {expandedItems.has(item.id) ? (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  )}
                </div>

                {/* Level */}
                <div className="w-16 px-3 py-3 border-r border-slate-200 text-slate-500 font-mono">
                  {item.level}
                </div>

                {/* Item Number */}
                <div
                  className="w-32 px-3 py-3 border-r border-slate-200 font-mono font-medium flex items-center gap-2"
                  style={{ paddingLeft: `${item.level * 16 + 12}px` }}
                >
                  <span className={item.isPreCO ? 'text-orange-700' : 'text-slate-900'}>
                    {item.itemNumber}
                  </span>
                  {item.isPreCO && (
                    <span className="status-badge bg-orange-100 text-orange-700 border-orange-200">
                      Pre-CO
                    </span>
                  )}
                </div>

                {/* Revision */}
                <div className="w-16 px-3 py-3 border-r border-slate-200 text-slate-600 font-mono">
                  {item.revision}
                </div>

                {/* Description */}
                <div className="w-64 px-3 py-3 border-r border-slate-200 text-slate-900 truncate">
                  {item.description}
                </div>

                {/* Commodity */}
                <div className="w-32 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs truncate">
                  {item.commodity}
                </div>

                {/* Plant */}
                <div className="w-28 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs">
                  {item.plant.split(',')[0]}
                </div>

                {/* Engineering columns */}
                {(roleView === 'Engineering' || roleView === 'PM') && (
                  <>
                    <div className="w-28 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs truncate">
                      {item.engOwner}
                    </div>
                    <div className="w-28 px-3 py-3 border-r border-slate-200">
                      <span className={`status-badge ${
                        item.designStatus === 'Released' ? 'status-ready' : 
                        item.designStatus === 'In Review' ? 'status-progress' : 
                        'status-draft'
                      }`}>
                        {item.designStatus}
                      </span>
                    </div>
                  </>
                )}

                {/* Procurement columns */}
                {(roleView === 'Procurement' || roleView === 'PM') && (
                  <>
                    <div className="w-24 px-3 py-3 border-r border-slate-200">
                      <span className={`status-badge ${
                        item.makeBuy === 'Make' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        item.makeBuy === 'Buy' ? 'bg-green-50 text-green-700 border-green-200' : 
                        'status-draft'
                      }`}>
                        {item.makeBuy}
                      </span>
                    </div>
                    <div className="w-36 px-3 py-3 border-r border-slate-200 text-slate-900 text-xs truncate">
                      {item.approvedSupplier || item.potentialSupplier || '-'}
                    </div>
                    <div className="w-28 px-3 py-3 border-r border-slate-200">
                      <span className={`status-badge ${
                        item.quoteStatus === 'Received' ? 'status-ready' : 
                        item.quoteStatus === 'Pending' ? 'status-warning' : 
                        'status-draft'
                      }`}>
                        {item.quoteStatus}
                      </span>
                    </div>
                  </>
                )}

                {/* Lifecycle */}
                <div className="w-28 px-3 py-3 border-r border-slate-200">
                  <span className={`status-badge ${
                    item.lifecycleState === 'Released' ? 'status-ready' : 
                    item.lifecycleState === 'In Review' ? 'status-progress' : 
                    item.lifecycleState === 'Obsolete' ? 'status-blocked' :
                    'status-draft'
                  }`}>
                    {item.lifecycleState}
                  </span>
                </div>

                {/* Readiness */}
                <div className="w-24 px-3 py-3 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getReadinessColor(item.overallReadiness)} progress-fill`}
                        style={{ width: `${item.overallReadiness}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-medium ${getReadinessTextColor(item.overallReadiness)}`}>
                      {item.overallReadiness}%
                    </span>
                  </div>
                </div>

                {/* Blockers */}
                <div className="w-24 px-3 py-3">
                  {item.blockers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="status-badge status-blocked">
                        {item.blockers.length}
                      </span>
                      {item.blockerAging > 0 && (
                        <span className="text-xs text-slate-500">{item.blockerAging}d</span>
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
