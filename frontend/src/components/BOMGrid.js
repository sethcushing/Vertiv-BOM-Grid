import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Download,
  Settings,
  Star,
  Package,
  AlertCircle,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';
import axios from 'axios';
import ItemDetailDrawer from './ItemDetailDrawer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// KPI data
const bomKPIs = {
  notYetInERP: { percentage: 15, count: 18, total: 124 },
  pendingCOs: { count: 7, avgAging: 23 },
  notOrderable: { percentage: 12, count: 15, total: 124 },
  clearToBuild: { 
    forecastedDate: '2026-03-15', 
    requiredDate: '2026-03-10', 
    gapDays: 5, 
    status: 'late' 
  }
};

const BOMGrid = ({ 
  onNavigateToDashboard, 
  onNavigateToCO, 
  onNavigateToSearch, 
  selectedScope, 
  onScopeChange 
}) => {
  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set(['1', '2']));
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toISOString());
  
  const gridScrollRef = useRef(null);
  const topScrollRef = useRef(null);
  const topScrollContentRef = useRef(null);

  // Fetch BOM data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bom-items`);
        setBomData(response.data);
        setLastRefreshed(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching BOM data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync horizontal scroll
  useEffect(() => {
    const gridScroll = gridScrollRef.current;
    const topScroll = topScrollRef.current;
    const topScrollContent = topScrollContentRef.current;

    if (!gridScroll || !topScroll || !topScrollContent) return;

    const updateScrollbarWidth = () => {
      const gridContent = gridScroll.querySelector('.min-w-max');
      if (gridContent) {
        topScrollContent.style.width = `${gridContent.scrollWidth}px`;
      }
    };

    const handleGridScroll = () => { topScroll.scrollLeft = gridScroll.scrollLeft; };
    const handleTopScroll = () => { gridScroll.scrollLeft = topScroll.scrollLeft; };

    updateScrollbarWidth();
    gridScroll.addEventListener('scroll', handleGridScroll);
    topScroll.addEventListener('scroll', handleTopScroll);

    return () => {
      gridScroll.removeEventListener('scroll', handleGridScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
    };
  }, [bomData.length]);

  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Build visible rows with hierarchy
  const visibleRows = useMemo(() => {
    const rows = [];
    
    const addItemAndChildren = (item) => {
      rows.push(item);
      if (item.hasChildren && expandedItems.has(item.id)) {
        const children = bomData.filter(i => i.parentId === item.id);
        children.forEach(child => addItemAndChildren(child));
      }
    };

    bomData.filter(item => item.level === 0).forEach(item => {
      addItemAndChildren(item);
    });

    return rows;
  }, [bomData, expandedItems]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/bom-items`);
      setBomData(response.data);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLifecycleBadgeClass = (stage) => {
    switch (stage) {
      case 'Orderable': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'CO Approved': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'CO Submitted': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'CCO In Progress': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Ready for CO': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getAMLBadgeClass = (aml) => {
    if (aml === 0) return 'bg-red-100 text-red-700';
    if (aml <= 2) return 'bg-amber-100 text-amber-700';
    if (aml === 3) return 'bg-green-100 text-green-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading BOM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100" data-testid="bom-grid">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-3">
          {/* Context Callout */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {onNavigateToSearch && (
                <button
                  onClick={onNavigateToSearch}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  data-testid="back-to-search-btn"
                >
                  ← Back to search
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs">
                <span className="font-medium text-slate-700">Project:</span>
                <span className="text-slate-900">{selectedScope}</span>
                <span className="text-slate-400">|</span>
                <span className="font-medium text-slate-700">Top-Level Item:</span>
                <span className="text-slate-900">ASM-12000</span>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="ml-1 text-slate-400 hover:text-amber-500 transition-colors"
                  title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Title and Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">BOM Grid</h1>
              <p className="text-sm text-slate-500 mt-1">Showing {visibleRows.length} total items</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Last refreshed: {new Date(lastRefreshed).toLocaleString()}
              </span>
              
              <div className="h-5 w-px bg-slate-300"></div>

              <button 
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
                data-testid="export-btn"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="h-5 w-px bg-slate-300"></div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${
                  showFilters ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'
                }`}
                data-testid="filter-btn"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
                data-testid="column-settings-btn"
              >
                <Settings className="w-4 h-4" />
                Column Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Analytics Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          {/* KPI 1: Not Yet in ERP */}
          <div className="border border-slate-200 rounded-md px-4 py-3 bg-white" data-testid="kpi-not-in-erp">
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${
                bomKPIs.notYetInERP.percentage > 25 ? 'text-red-600' : 
                bomKPIs.notYetInERP.percentage > 10 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-medium text-slate-600">Not Yet in ERP</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{bomKPIs.notYetInERP.percentage}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {bomKPIs.notYetInERP.count} of {bomKPIs.notYetInERP.total} items
            </div>
          </div>

          {/* KPI 2: Pending COs */}
          <div className="border border-slate-200 rounded-md px-4 py-3 bg-white" data-testid="kpi-pending-cos">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-4 h-4 ${
                bomKPIs.pendingCOs.count > 10 ? 'text-red-600' : 
                bomKPIs.pendingCOs.count > 5 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-medium text-slate-600">Pending COs</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{bomKPIs.pendingCOs.count}</div>
            <div className="text-xs text-slate-500 mt-1">Avg Aging: {bomKPIs.pendingCOs.avgAging} days</div>
          </div>

          {/* KPI 3: Items Not Orderable */}
          <div className="border border-slate-200 rounded-md px-4 py-3 bg-white" data-testid="kpi-not-orderable">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${
                bomKPIs.notOrderable.percentage > 20 ? 'text-red-600' : 
                bomKPIs.notOrderable.percentage > 10 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-medium text-slate-600">Items Not Orderable</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{bomKPIs.notOrderable.percentage}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {bomKPIs.notOrderable.count} of {bomKPIs.notOrderable.total} items
            </div>
          </div>

          {/* KPI 4: Clear-to-Build */}
          <div className="border border-slate-200 rounded-md px-4 py-3 bg-white" data-testid="kpi-clear-to-build">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${
                bomKPIs.clearToBuild.status === 'late' ? 'text-red-600' : 
                bomKPIs.clearToBuild.status === 'ontime' ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-medium text-slate-600">Clear-to-Build vs Required</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{bomKPIs.clearToBuild.forecastedDate}</div>
            <div className="text-xs text-slate-500 mt-1">Required: {bomKPIs.clearToBuild.requiredDate}</div>
            <div className={`text-xs font-medium mt-1 ${
              bomKPIs.clearToBuild.status === 'late' ? 'text-red-600' : 
              bomKPIs.clearToBuild.status === 'ontime' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              +{bomKPIs.clearToBuild.gapDays} days late
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Legend */}
      <div className="bg-white border-b border-slate-200 px-6 py-2">
        <div className="flex items-center justify-end gap-4">
          <span className="text-xs font-medium text-slate-600">Data Source Legend:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-xs text-slate-700">PD (Read Only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded"></div>
              <span className="text-xs text-slate-700">EBS / ALICE ERP (Read Only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
              <span className="text-xs text-slate-700">Editable (Pre-CO Closure)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Scrollbar */}
        <div 
          ref={topScrollRef}
          className="bom-grid-top-scroll overflow-x-auto overflow-y-hidden bg-white border-b border-slate-200 sticky top-0 z-[5]"
          style={{ height: '14px' }}
        >
          <div ref={topScrollContentRef} style={{ height: '1px', pointerEvents: 'none' }}></div>
        </div>

        {/* Main Grid */}
        <div ref={gridScrollRef} className="bom-grid-scroll flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="bg-slate-100 border-b-2 border-slate-300 sticky top-0 z-10">
              <div className="flex text-xs font-semibold text-slate-700">
                <div className="w-10 px-2 py-2 border-r border-slate-300 bg-slate-100 sticky left-0 z-20"></div>
                
                {/* PD Section - Blue */}
                <div className="w-16 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400 sticky left-10 z-20">Level</div>
                <div className="w-32 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400 sticky left-[104px] z-20">Item Number</div>
                <div className="w-24 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">Revision</div>
                <div className="w-40 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">Commodity</div>
                <div className="w-64 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">Description</div>
                <div className="w-36 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">Plant</div>
                <div className="w-32 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">Lifecycle</div>
                <div className="w-28 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">CO #</div>
                <div className="w-24 px-3 py-2 border-r border-slate-200 bg-blue-50 border-t-2 border-t-blue-400">Make/Buy</div>
                <div className="w-24 px-3 py-2 border-r-2 border-r-blue-400 bg-blue-50 border-t-2 border-t-blue-400">AML</div>

                {/* ERP Section - Green */}
                <div className="w-36 px-3 py-2 border-r border-slate-200 bg-emerald-50 border-t-2 border-t-emerald-400">Supplier</div>
                <div className="w-28 px-3 py-2 border-r border-slate-200 bg-emerald-50 border-t-2 border-t-emerald-400">Lead Time</div>
                <div className="w-32 px-3 py-2 border-r border-slate-200 bg-emerald-50 border-t-2 border-t-emerald-400">CCO Status</div>
                <div className="w-28 px-3 py-2 border-r-2 border-r-emerald-400 bg-emerald-50 border-t-2 border-t-emerald-400">Orderable</div>

                {/* Quality Section */}
                <div className="w-28 px-3 py-2 border-r border-slate-200 bg-slate-100 border-t-2 border-t-slate-400">PPAP</div>
                <div className="w-24 px-3 py-2 border-r border-slate-200 bg-slate-100 border-t-2 border-t-slate-400">COO</div>
                <div className="w-32 px-3 py-2 border-r border-slate-200 bg-slate-100 border-t-2 border-t-slate-400">Trade Status</div>
                <div className="w-28 px-3 py-2 border-r border-slate-200 bg-slate-100 border-t-2 border-t-slate-400">Readiness</div>
              </div>
            </div>

            {/* Data Rows */}
            <div className="bg-white">
              {visibleRows.map((item) => (
                <div
                  key={item.id}
                  className={`flex text-sm border-b cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-50 border-blue-400 border-l-4 border-l-blue-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                  data-testid={`bom-row-${item.id}`}
                >
                  {/* Expand/Collapse */}
                  <div className={`w-10 px-2 py-3 border-r border-slate-200 flex items-center justify-center sticky left-0 z-10 ${
                    selectedItem?.id === item.id ? 'bg-blue-50' : 'bg-white'
                  }`}>
                    {item.hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        className="hover:bg-slate-200 rounded p-1"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Level */}
                  <div className={`w-16 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs sticky left-10 z-10 ${
                    selectedItem?.id === item.id ? 'bg-blue-50' : 'bg-white'
                  }`}>
                    {item.level}
                  </div>

                  {/* Item Number */}
                  <div
                    className={`w-32 px-3 py-3 border-r border-slate-200 font-medium sticky left-[104px] z-10 ${
                      selectedItem?.id === item.id ? 'bg-blue-50' : 'bg-white'
                    }`}
                    style={{ paddingLeft: `${item.level * 16 + 12}px` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-600 text-xs">{item.itemNumber}</span>
                      {item.isNewPart && (
                        <span className="text-[10px] px-1 py-0 bg-green-600 text-white rounded">New</span>
                      )}
                    </div>
                  </div>

                  {/* Revision */}
                  <div className="w-24 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs">
                    {item.revision}
                  </div>

                  {/* Commodity */}
                  <div className="w-40 px-3 py-3 border-r border-slate-200 text-slate-700 text-xs">
                    {item.commodity}
                  </div>

                  {/* Description */}
                  <div className="w-64 px-3 py-3 border-r border-slate-200 text-slate-900 text-xs truncate">
                    {item.description}
                  </div>

                  {/* Plant */}
                  <div className="w-36 px-3 py-3 border-r border-slate-200 text-slate-700 text-xs">
                    {item.plant}
                  </div>

                  {/* Lifecycle */}
                  <div className="w-32 px-3 py-3 border-r border-slate-200">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getLifecycleBadgeClass(item.lifecycleStage)}`}>
                      {item.lifecycleStage}
                    </span>
                  </div>

                  {/* CO # */}
                  <div className="w-28 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs">
                    {item.pendingCONumber || '-'}
                  </div>

                  {/* Make/Buy */}
                  <div className="w-24 px-3 py-3 border-r border-slate-200 text-slate-700 text-xs">
                    {item.makeBuy}
                  </div>

                  {/* AML */}
                  <div className="w-24 px-3 py-3 border-r-2 border-r-blue-400 text-xs">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${getAMLBadgeClass(item.aml)}`}>
                      {item.aml >= 4 ? '4+' : item.aml}
                    </span>
                  </div>

                  {/* Supplier */}
                  <div className="w-36 px-3 py-3 border-r border-slate-200 text-slate-700 text-xs truncate">
                    {item.supplier || '-'}
                  </div>

                  {/* Lead Time */}
                  <div className="w-28 px-3 py-3 border-r border-slate-200 text-slate-600 text-xs">
                    {item.leadTime > 0 ? `${item.leadTime} days` : '-'}
                  </div>

                  {/* CCO Status */}
                  <div className="w-32 px-3 py-3 border-r border-slate-200 text-xs">
                    {item.ccoStatus === 'Complete' ? (
                      <span className="text-emerald-600">Complete</span>
                    ) : (
                      <span className="text-slate-400">{item.ccoStatus || '-'}</span>
                    )}
                  </div>

                  {/* Orderable */}
                  <div className="w-28 px-3 py-3 border-r-2 border-r-emerald-400 text-xs">
                    {item.orderable ? (
                      <span className="text-emerald-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </div>

                  {/* PPAP */}
                  <div className="w-28 px-3 py-3 border-r border-slate-200 text-xs">
                    <span className={item.ppapStatus === 'Approved' ? 'text-emerald-600' : 'text-slate-600'}>
                      {item.ppapStatus || '-'}
                    </span>
                  </div>

                  {/* COO */}
                  <div className="w-24 px-3 py-3 border-r border-slate-200 text-slate-700 text-xs">
                    {item.coo || '-'}
                  </div>

                  {/* Trade Status */}
                  <div className="w-32 px-3 py-3 border-r border-slate-200 text-xs">
                    <span className={
                      item.tradeComplianceStatus === 'Cleared' ? 'text-emerald-600' :
                      item.tradeComplianceStatus === 'Pending' ? 'text-amber-600' :
                      item.tradeComplianceStatus === 'Flagged' ? 'text-red-600' :
                      'text-slate-400'
                    }>
                      {item.tradeComplianceStatus}
                    </span>
                  </div>

                  {/* Readiness */}
                  <div className="w-28 px-3 py-3 border-r border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.overallReadiness >= 80 ? 'bg-emerald-500' :
                            item.overallReadiness >= 50 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.overallReadiness}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700">{item.overallReadiness}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Drawer */}
      {selectedItem && (
        <ItemDetailDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default BOMGrid;
