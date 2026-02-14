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
  const [expandedItems, setExpandedItems] = useState(new Set());
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
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
                  BOM Convergence Grid
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Enterprise Convergence & Readiness Workspace • {visibleRows.length} items shown
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
                  onClick={() => setViewMode('all')}
                  data-testid="view-all-btn"
                  className={`toggle-btn ${
                    viewMode === 'all'
                      ? 'toggle-btn-active'
                      : 'toggle-btn-inactive'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  All Items
                </button>
                <button
                  onClick={() => setViewMode('preco-only')}
                  data-testid="view-preco-btn"
                  className={`toggle-btn ${
                    viewMode === 'preco-only'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'toggle-btn-inactive'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Pre-CO Workspace
                  {preCOStats.total > 0 && (
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                      viewMode === 'preco-only' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {preCOStats.total}
                    </span>
                  )}
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

            <div className="text-sm text-gray-500 flex items-center gap-2 font-mono">
              Last refreshed: {projectSummary.lastRefreshed}
            </div>
          </div>
          
          {/* Pre-CO Workspace Actions Bar */}
          {viewMode === 'preco-only' && (
            <div className="mt-5 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-3xl font-display text-orange-900">{preCOStats.total}</div>
                    <div className="text-xs text-orange-700 font-semibold uppercase tracking-wider">Pre-CO Items</div>
                  </div>
                  <div className="h-10 w-px bg-orange-300"></div>
                  <div>
                    <div className="text-3xl font-display text-orange-900">{preCOStats.averageReadiness}%</div>
                    <div className="text-xs text-orange-700 font-semibold uppercase tracking-wider">Avg Design Readiness</div>
                  </div>
                  <div className="h-10 w-px bg-orange-300"></div>
                  <div>
                    <div className="text-3xl font-display text-orange-900">{preCOStats.readyForSubmission}</div>
                    <div className="text-xs text-orange-700 font-semibold uppercase tracking-wider">Ready for CO</div>
                  </div>
                  
                  {selectedPreCOItems.size > 0 && (
                    <>
                      <div className="h-10 w-px bg-orange-300"></div>
                      <div>
                        <div className="text-sm font-semibold text-orange-900">
                          {selectedPreCOItems.size} selected
                        </div>
                        <button 
                          onClick={clearPreCOSelection}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                        >
                          Clear selection
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {selectedPreCOItems.size > 0 && (
                    <button
                      data-testid="submit-to-co-btn"
                      className="btn-primary"
                    >
                      <Send className="w-4 h-4" />
                      Submit to CO ({selectedPreCOItems.size})
                    </button>
                  )}
                  <button
                    data-testid="create-preco-btn"
                    className="btn-primary"
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
              <label className="text-sm text-gray-600 font-medium">Show Pre-CO:</label>
              <input 
                type="checkbox" 
                checked={filters.showPreCO}
                onChange={(e) => setFilters({...filters, showPreCO: e.target.checked})}
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
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-white mx-6 my-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid-header flex text-xs font-bold text-gray-500 uppercase tracking-wider rounded-t-2xl">
            {viewMode === 'preco-only' && (
              <div className="w-12 px-3 py-3 border-r border-gray-200 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedPreCOItems.size > 0 && selectedPreCOItems.size === filteredItems.filter(i => i.isPreCO).length}
                  onChange={(e) => e.target.checked ? selectAllPreCO() : clearPreCOSelection()}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded-md focus:ring-orange-500"
                />
              </div>
            )}
            <div className="w-14 px-3 py-3 border-r border-gray-200"></div>
            <div className="w-16 px-3 py-3 border-r border-gray-200">Level</div>
            <div className="w-36 px-3 py-3 border-r border-gray-200">Item #</div>
            <div className="w-16 px-3 py-3 border-r border-gray-200">Rev</div>
            <div className="w-72 px-3 py-3 border-r border-gray-200">Description</div>
            <div className="w-36 px-3 py-3 border-r border-gray-200">Commodity</div>
            <div className="w-32 px-3 py-3 border-r border-gray-200">Plant</div>
            
            {/* Role-specific columns */}
            {(roleView === 'Engineering' || roleView === 'PM') && (
              <>
                <div className="w-32 px-3 py-3 border-r border-gray-200">Eng Owner</div>
                <div className="w-28 px-3 py-3 border-r border-gray-200">Design Status</div>
              </>
            )}
            {(roleView === 'Procurement' || roleView === 'PM') && (
              <>
                <div className="w-24 px-3 py-3 border-r border-gray-200">Make/Buy</div>
                <div className="w-40 px-3 py-3 border-r border-gray-200">Supplier</div>
                <div className="w-28 px-3 py-3 border-r border-gray-200">Quote Status</div>
              </>
            )}
            
            <div className="w-28 px-3 py-3 border-r border-gray-200">Lifecycle</div>
            <div className="w-28 px-3 py-3 border-r border-gray-200">Readiness</div>
            <div className="w-24 px-3 py-3">Blockers</div>
          </div>

          {/* Data Rows */}
          <div className="bg-white">
            {visibleRows.map((item) => (
              <div
                key={item.id}
                data-testid={`bom-row-${item.id}`}
                className={`flex text-sm border-b cursor-pointer transition-all duration-200 ${
                  item.isPreCO 
                    ? 'bg-gradient-to-r from-orange-50/70 to-amber-50/30 border-l-4 border-l-orange-500 border-b-orange-100 hover:from-orange-100/70 hover:to-amber-100/30' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
                onClick={() => onSelectItem(item)}
              >
                {/* Checkbox for Pre-CO items */}
                {viewMode === 'preco-only' && item.isPreCO && (
                  <div className="w-12 px-3 py-4 border-r border-gray-200 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedPreCOItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        togglePreCOSelection(item.id);
                      }}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded-md focus:ring-orange-500"
                    />
                  </div>
                )}
                
                {/* Expand/Collapse */}
                <div className="w-14 px-3 py-4 border-r border-gray-200 flex items-center justify-center">
                  {item.hasChildren && (
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
                  )}
                </div>

                {/* Level */}
                <div className="w-16 px-3 py-4 border-r border-gray-200 text-gray-500 font-mono font-semibold">
                  {item.level}
                </div>

                {/* Item Number */}
                <div
                  className="w-36 px-3 py-4 border-r border-gray-200 font-mono font-semibold flex items-center gap-2"
                  style={{ paddingLeft: `${item.level * 16 + 12}px` }}
                >
                  <span className={item.isPreCO ? 'text-orange-700' : 'text-gray-900'}>
                    {item.itemNumber}
                  </span>
                  {item.isPreCO && (
                    <span className="status-badge bg-orange-100 text-orange-700 border-orange-200 text-[10px] py-0.5 px-2">
                      Pre-CO
                    </span>
                  )}
                </div>

                {/* Revision */}
                <div className="w-16 px-3 py-4 border-r border-gray-200 text-gray-600 font-mono">
                  {item.revision}
                </div>

                {/* Description */}
                <div className="w-72 px-3 py-4 border-r border-gray-200 text-gray-900">
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

                {/* Engineering columns */}
                {(roleView === 'Engineering' || roleView === 'PM') && (
                  <>
                    <div className="w-32 px-3 py-4 border-r border-gray-200 text-gray-600 text-xs">
                      {item.engOwner}
                    </div>
                    <div className="w-28 px-3 py-4 border-r border-gray-200">
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
                    <div className="w-24 px-3 py-4 border-r border-gray-200">
                      <span className={`status-badge ${
                        item.makeBuy === 'Make' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        item.makeBuy === 'Buy' ? 'bg-green-50 text-green-700 border-green-200' : 
                        'status-draft'
                      }`}>
                        {item.makeBuy}
                      </span>
                    </div>
                    <div className="w-40 px-3 py-4 border-r border-gray-200 text-gray-900 text-xs">
                      {item.approvedSupplier || item.potentialSupplier || '—'}
                    </div>
                    <div className="w-28 px-3 py-4 border-r border-gray-200">
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
                <div className="w-28 px-3 py-4 border-r border-gray-200">
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
