import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  FileDown,
  FileSpreadsheet,
  X
} from 'lucide-react';
import axios from 'axios';
import ItemDetailDrawer from './ItemDetailDrawer';
import FilterPanel from './FilterPanel';
import ColumnSettings from './ColumnSettings';
import ColumnHeaderCell from './ColumnHeaderCell';

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
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toISOString());
  const [filters, setFilters] = useState({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [columnFilters, setColumnFilters] = useState({});
  
  const gridScrollRef = useRef(null);
  const topScrollRef = useRef(null);
  const topScrollContentRef = useRef(null);
  const exportMenuRef = useRef(null);

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

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Apply panel filters to data
  const filteredData = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return bomData;
    
    return bomData.filter(item => {
      if (filters.lifecycleStages?.length > 0 && !filters.lifecycleStages.includes(item.lifecycleStage)) return false;
      if (filters.makeBuy?.length > 0 && !filters.makeBuy.includes(item.makeBuy)) return false;
      if (filters.plants?.length > 0 && !filters.plants.includes(item.plant)) return false;
      if (filters.hasBlockers === true && (!item.blockers || item.blockers.length === 0)) return false;
      if (filters.hasBlockers === false && item.blockers && item.blockers.length > 0) return false;
      if (filters.orderable === true && !item.orderable) return false;
      if (filters.orderable === false && item.orderable) return false;
      if (filters.commodities?.length > 0 && !filters.commodities.includes(item.commodity)) return false;
      return true;
    });
  }, [bomData, filters]);

  // Apply column-level filters
  const columnFilteredData = useMemo(() => {
    const activeColFilters = Object.entries(columnFilters).filter(([, vals]) => vals.length > 0);
    if (activeColFilters.length === 0) return filteredData;

    return filteredData.filter(item => {
      return activeColFilters.every(([key, values]) => {
        const raw = item[key];
        const displayVal = key === 'orderable' ? (raw ? 'Yes' : 'No')
          : key === 'leadTime' ? (raw > 0 ? `${raw} days` : '-')
          : String(raw ?? '-');
        return values.includes(displayVal);
      });
    });
  }, [filteredData, columnFilters]);

  // Get unique display values for a column (for filter dropdowns)
  const getUniqueValues = useCallback((columnKey) => {
    const vals = new Set();
    filteredData.forEach(item => {
      const raw = item[columnKey];
      const display = columnKey === 'orderable' ? (raw ? 'Yes' : 'No')
        : columnKey === 'leadTime' ? (raw > 0 ? `${raw} days` : '-')
        : String(raw ?? '-');
      vals.add(display);
    });
    return [...vals].sort();
  }, [filteredData]);

  // Sort handler
  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Column filter handler
  const handleColumnFilter = useCallback((key, values) => {
    setColumnFilters(prev => {
      const next = { ...prev };
      if (values.length === 0) delete next[key];
      else next[key] = values;
      return next;
    });
  }, []);

  // Common props for header cells
  const headerCellProps = useCallback((columnKey, label) => ({
    columnKey,
    label,
    sortConfig,
    onSort: handleSort,
    columnFilters,
    uniqueValues: getUniqueValues(columnKey),
    onFilterApply: handleColumnFilter,
  }), [sortConfig, columnFilters, getUniqueValues, handleSort, handleColumnFilter]);

  // Build visible rows with hierarchy and sorting
  const visibleRows = useMemo(() => {
    const rows = [];

    const sortItems = (items) => {
      if (!sortConfig.key || !sortConfig.direction) return items;
      return [...items].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          return sortConfig.direction === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
        }
        aVal = String(aVal ?? '');
        bVal = String(bVal ?? '');
        const cmp = aVal.localeCompare(bVal);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    };
    
    const addItemAndChildren = (item) => {
      rows.push(item);
      if (item.hasChildren && expandedItems.has(item.id)) {
        const children = columnFilteredData.filter(i => i.parentId === item.id);
        sortItems(children).forEach(child => addItemAndChildren(child));
      }
    };

    const topItems = columnFilteredData.filter(item => item.level === 0);
    sortItems(topItems).forEach(item => addItemAndChildren(item));

    return rows;
  }, [columnFilteredData, expandedItems, sortConfig]);

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

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    let count = 0;
    if (newFilters.lifecycleStages?.length) count += newFilters.lifecycleStages.length;
    if (newFilters.makeBuy?.length) count += newFilters.makeBuy.length;
    if (newFilters.plants?.length) count += newFilters.plants.length;
    if (newFilters.hasBlockers !== null) count += 1;
    if (newFilters.orderable !== null) count += 1;
    if (newFilters.commodities?.length) count += newFilters.commodities.length;
    setActiveFilterCount(count);
  };

  const handleExportCSV = () => {
    const headers = ['Level', 'Item Number', 'Revision', 'Description', 'Commodity', 'Plant', 'Lifecycle Stage', 'Make/Buy', 'Supplier', 'Lead Time', 'Orderable', 'Overall Readiness'];
    const csvContent = [
      headers.join(','),
      ...visibleRows.map(item => [
        item.level,
        item.itemNumber,
        item.revision,
        `"${item.description}"`,
        item.commodity,
        item.plant,
        item.lifecycleStage,
        item.makeBuy,
        item.supplier || '',
        item.leadTime || '',
        item.orderable ? 'Yes' : 'No',
        `${item.overallReadiness}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bom_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    // For Excel, we'll create a more detailed CSV that Excel can open
    const headers = ['Level', 'Item Number', 'Revision', 'Description', 'Commodity', 'Plant', 'Lifecycle Stage', 'CO #', 'Make/Buy', 'AML', 'Supplier', 'Lead Time', 'CCO Status', 'Orderable', 'PPAP Status', 'COO', 'Trade Compliance', 'Design Readiness', 'Procurement Readiness', 'Mfg Readiness', 'Quality Readiness', 'Overall Readiness'];
    const csvContent = [
      headers.join('\t'),
      ...visibleRows.map(item => [
        item.level,
        item.itemNumber,
        item.revision,
        item.description,
        item.commodity,
        item.plant,
        item.lifecycleStage,
        item.pendingCONumber || '',
        item.makeBuy,
        item.aml,
        item.supplier || '',
        item.leadTime || '',
        item.ccoStatus || '',
        item.orderable ? 'Yes' : 'No',
        item.ppapStatus || '',
        item.coo || '',
        item.tradeComplianceStatus || '',
        `${item.designReadiness}%`,
        `${item.procurementReadiness}%`,
        `${item.manufacturingReadiness}%`,
        `${item.qualityReadiness}%`,
        `${item.overallReadiness}%`
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bom_export_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    setShowExportMenu(false);
  };

  const getLifecycleBadgeClass = (stage) => {
    switch (stage) {
      case 'Orderable': return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-300';
      case 'CO Approved': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300';
      case 'CO Submitted': return 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 border-indigo-300';
      case 'CCO In Progress': return 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 border-purple-300';
      case 'Ready for CO': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300';
      case 'Draft': return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getAMLBadgeClass = (aml) => {
    if (aml === 0) return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700';
    if (aml <= 2) return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700';
    if (aml === 3) return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700';
    return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
          <p className="text-slate-600 font-medium">Loading BOM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100" data-testid="bom-grid">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          {/* Context Callout */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onNavigateToSearch && (
                <button
                  onClick={onNavigateToSearch}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                  data-testid="back-to-search-btn"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to search
                </button>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl text-sm border border-slate-200 shadow-sm">
                <span className="font-semibold text-slate-700">Project:</span>
                <span className="text-slate-900">{selectedScope}</span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-700">Top-Level Item:</span>
                <span className="text-slate-900">ASM-12000</span>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="ml-2 text-slate-400 hover:text-amber-500 transition-colors"
                  title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Title and Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">BOM Grid</h1>
              <p className="text-sm text-slate-500 mt-1">
                Showing {visibleRows.length} of {bomData.length} items
                {(activeFilterCount > 0 || Object.keys(columnFilters).length > 0) && (
                  <span className="ml-2 text-blue-600">
                    ({activeFilterCount + Object.keys(columnFilters).length} filter{(activeFilterCount + Object.keys(columnFilters).length) !== 1 ? 's' : ''} active)
                  </span>
                )}
                {sortConfig.key && (
                  <span className="ml-2 text-slate-400">
                    Sorted by {sortConfig.key} ({sortConfig.direction})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                Last refreshed: {new Date(lastRefreshed).toLocaleString()}
              </span>
              
              <div className="h-6 w-px bg-slate-200"></div>

              {/* Export Button with Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn-modern btn-secondary flex items-center gap-2"
                  data-testid="export-btn"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 dropdown-modern z-20 animate-scale-in">
                    <button
                      onClick={handleExportCSV}
                      className="dropdown-item w-full flex items-center gap-3 text-left"
                      data-testid="export-csv-btn"
                    >
                      <FileDown className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-700">Export as CSV</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="dropdown-item w-full flex items-center gap-3 text-left"
                      data-testid="export-excel-btn"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-700">Export as Excel</span>
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={handleRefresh}
                className="btn-modern btn-secondary flex items-center gap-2"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="h-6 w-px bg-slate-200"></div>
              
              <button
                onClick={() => setShowFilters(true)}
                className={`btn-modern flex items-center gap-2 relative ${
                  activeFilterCount > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'btn-secondary'
                }`}
                data-testid="filter-btn"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowColumnSettings(true)}
                className="btn-modern btn-secondary flex items-center gap-2"
                data-testid="column-settings-btn"
              >
                <Settings className="w-4 h-4" />
                Columns
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Analytics Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="grid grid-cols-4 gap-5">
          {/* KPI 1: Not Yet in ERP */}
          <div className="kpi-card px-5 py-4" data-testid="kpi-not-in-erp">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                bomKPIs.notYetInERP.percentage > 25 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                bomKPIs.notYetInERP.percentage > 10 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 
                'bg-gradient-to-br from-emerald-500 to-green-600'
              }`}>
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Not Yet in ERP</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{bomKPIs.notYetInERP.percentage}%</div>
            <div className="text-sm text-slate-500 mt-1">
              {bomKPIs.notYetInERP.count} of {bomKPIs.notYetInERP.total} items
            </div>
          </div>

          {/* KPI 2: Pending COs */}
          <div className="kpi-card px-5 py-4" data-testid="kpi-pending-cos">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                bomKPIs.pendingCOs.count > 10 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                bomKPIs.pendingCOs.count > 5 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 
                'bg-gradient-to-br from-emerald-500 to-green-600'
              }`}>
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Pending COs</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{bomKPIs.pendingCOs.count}</div>
            <div className="text-sm text-slate-500 mt-1">Avg Aging: {bomKPIs.pendingCOs.avgAging} days</div>
          </div>

          {/* KPI 3: Items Not Orderable */}
          <div className="kpi-card px-5 py-4" data-testid="kpi-not-orderable">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                bomKPIs.notOrderable.percentage > 20 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                bomKPIs.notOrderable.percentage > 10 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 
                'bg-gradient-to-br from-emerald-500 to-green-600'
              }`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Items Not Orderable</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{bomKPIs.notOrderable.percentage}%</div>
            <div className="text-sm text-slate-500 mt-1">
              {bomKPIs.notOrderable.count} of {bomKPIs.notOrderable.total} items
            </div>
          </div>

          {/* KPI 4: Clear-to-Build */}
          <div className="kpi-card px-5 py-4" data-testid="kpi-clear-to-build">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                bomKPIs.clearToBuild.status === 'late' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                bomKPIs.clearToBuild.status === 'ontime' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 
                'bg-gradient-to-br from-emerald-500 to-green-600'
              }`}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Clear-to-Build</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{bomKPIs.clearToBuild.forecastedDate}</div>
            <div className="text-sm text-slate-500 mt-1">Required: {bomKPIs.clearToBuild.requiredDate}</div>
            <div className={`text-sm font-semibold mt-1 ${
              bomKPIs.clearToBuild.status === 'late' ? 'text-red-600' : 
              bomKPIs.clearToBuild.status === 'ontime' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              +{bomKPIs.clearToBuild.gapDays} days late
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Legend */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-end gap-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data Source Legend:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 shadow-sm"></div>
              <span className="text-xs text-slate-700 font-medium">PD (Read Only)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 shadow-sm"></div>
              <span className="text-xs text-slate-700 font-medium">EBS / ALICE ERP (Read Only)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 shadow-sm"></div>
              <span className="text-xs text-slate-700 font-medium">Editable (Pre-CO Closure)</span>
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
          style={{ height: '12px' }}
        >
          <div ref={topScrollContentRef} style={{ height: '1px', pointerEvents: 'none' }}></div>
        </div>

        {/* Main Grid */}
        <div ref={gridScrollRef} className="bom-grid-scroll flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="bg-gradient-to-b from-slate-100 to-slate-50 border-b-2 border-slate-300 sticky top-0 z-10 shadow-sm">
              <div className="flex text-xs font-bold text-slate-600 uppercase tracking-wide">
                <div className="w-10 px-2 py-3 border-r border-slate-300 bg-slate-100 sticky left-0 z-20"></div>
                
                {/* PD Section - Blue */}
                <div className="w-16 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500 sticky left-10 z-20">Level</div>
                <div className="w-32 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500 sticky left-[104px] z-20">Item Number</div>
                <div className="w-24 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">Revision</div>
                <div className="w-40 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">Commodity</div>
                <div className="w-64 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">Description</div>
                <div className="w-36 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">Plant</div>
                <div className="w-32 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">Lifecycle</div>
                <div className="w-28 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">CO #</div>
                <div className="w-24 px-3 py-3 border-r border-slate-200 bg-blue-50/80 border-t-4 border-t-blue-500">Make/Buy</div>
                <div className="w-24 px-3 py-3 border-r-2 border-r-blue-400 bg-blue-50/80 border-t-4 border-t-blue-500">AML</div>

                {/* ERP Section - Green */}
                <div className="w-36 px-3 py-3 border-r border-slate-200 bg-emerald-50/80 border-t-4 border-t-emerald-500">Supplier</div>
                <div className="w-28 px-3 py-3 border-r border-slate-200 bg-emerald-50/80 border-t-4 border-t-emerald-500">Lead Time</div>
                <div className="w-32 px-3 py-3 border-r border-slate-200 bg-emerald-50/80 border-t-4 border-t-emerald-500">CCO Status</div>
                <div className="w-28 px-3 py-3 border-r-2 border-r-emerald-400 bg-emerald-50/80 border-t-4 border-t-emerald-500">Orderable</div>

                {/* Quality Section */}
                <div className="w-28 px-3 py-3 border-r border-slate-200 bg-slate-50 border-t-4 border-t-slate-400">PPAP</div>
                <div className="w-24 px-3 py-3 border-r border-slate-200 bg-slate-50 border-t-4 border-t-slate-400">COO</div>
                <div className="w-32 px-3 py-3 border-r border-slate-200 bg-slate-50 border-t-4 border-t-slate-400">Trade Status</div>
                <div className="w-28 px-3 py-3 border-r border-slate-200 bg-slate-50 border-t-4 border-t-slate-400">Readiness</div>
              </div>
            </div>

            {/* Data Rows */}
            <div className="bg-white">
              {visibleRows.map((item) => (
                <div
                  key={item.id}
                  className={`flex text-sm border-b cursor-pointer bom-row ${
                    selectedItem?.id === item.id
                      ? 'bom-row-selected'
                      : 'border-slate-100 hover:bg-slate-50/80'
                  }`}
                  onClick={() => setSelectedItem(item)}
                  data-testid={`bom-row-${item.id}`}
                >
                  {/* Expand/Collapse */}
                  <div className={`w-10 px-2 py-3 border-r border-slate-100 flex items-center justify-center sticky left-0 z-10 ${
                    selectedItem?.id === item.id ? 'bg-blue-50' : 'bg-white'
                  }`}>
                    {item.hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        className="hover:bg-slate-200 rounded-lg p-1.5 transition-colors"
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
                  <div className={`w-16 px-3 py-3 border-r border-slate-100 text-slate-600 text-xs sticky left-10 z-10 ${
                    selectedItem?.id === item.id ? 'bg-blue-50' : 'bg-white'
                  }`}>
                    {item.level}
                  </div>

                  {/* Item Number */}
                  <div
                    className={`w-32 px-3 py-3 border-r border-slate-100 font-semibold sticky left-[104px] z-10 ${
                      selectedItem?.id === item.id ? 'bg-blue-50' : 'bg-white'
                    }`}
                    style={{ paddingLeft: `${item.level * 16 + 12}px` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-xs hover:text-blue-700 transition-colors">{item.itemNumber}</span>
                      {item.isNewPart && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md font-semibold shadow-sm">New</span>
                      )}
                    </div>
                  </div>

                  {/* Revision */}
                  <div className="w-24 px-3 py-3 border-r border-slate-100 text-slate-600 text-xs">
                    {item.revision}
                  </div>

                  {/* Commodity */}
                  <div className="w-40 px-3 py-3 border-r border-slate-100 text-slate-700 text-xs">
                    {item.commodity}
                  </div>

                  {/* Description */}
                  <div className="w-64 px-3 py-3 border-r border-slate-100 text-slate-900 text-xs truncate font-medium">
                    {item.description}
                  </div>

                  {/* Plant */}
                  <div className="w-36 px-3 py-3 border-r border-slate-100 text-slate-700 text-xs">
                    {item.plant}
                  </div>

                  {/* Lifecycle */}
                  <div className="w-32 px-3 py-3 border-r border-slate-100">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold shadow-sm ${getLifecycleBadgeClass(item.lifecycleStage)}`}>
                      {item.lifecycleStage}
                    </span>
                  </div>

                  {/* CO # */}
                  <div className="w-28 px-3 py-3 border-r border-slate-100 text-slate-600 text-xs">
                    {item.pendingCONumber || '-'}
                  </div>

                  {/* Make/Buy */}
                  <div className="w-24 px-3 py-3 border-r border-slate-100 text-slate-700 text-xs font-medium">
                    {item.makeBuy}
                  </div>

                  {/* AML */}
                  <div className="w-24 px-3 py-3 border-r-2 border-r-blue-200 text-xs">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getAMLBadgeClass(item.aml)}`}>
                      {item.aml >= 4 ? '4+' : item.aml}
                    </span>
                  </div>

                  {/* Supplier */}
                  <div className="w-36 px-3 py-3 border-r border-slate-100 text-slate-700 text-xs truncate">
                    {item.supplier || '-'}
                  </div>

                  {/* Lead Time */}
                  <div className="w-28 px-3 py-3 border-r border-slate-100 text-slate-600 text-xs">
                    {item.leadTime > 0 ? `${item.leadTime} days` : '-'}
                  </div>

                  {/* CCO Status */}
                  <div className="w-32 px-3 py-3 border-r border-slate-100 text-xs">
                    {item.ccoStatus === 'Complete' ? (
                      <span className="text-emerald-600 font-semibold">Complete</span>
                    ) : (
                      <span className="text-slate-400">{item.ccoStatus || '-'}</span>
                    )}
                  </div>

                  {/* Orderable */}
                  <div className="w-28 px-3 py-3 border-r-2 border-r-emerald-200 text-xs">
                    {item.orderable ? (
                      <span className="text-emerald-600 font-bold">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </div>

                  {/* PPAP */}
                  <div className="w-28 px-3 py-3 border-r border-slate-100 text-xs">
                    <span className={item.ppapStatus === 'Approved' ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
                      {item.ppapStatus || '-'}
                    </span>
                  </div>

                  {/* COO */}
                  <div className="w-24 px-3 py-3 border-r border-slate-100 text-slate-700 text-xs">
                    {item.coo || '-'}
                  </div>

                  {/* Trade Status */}
                  <div className="w-32 px-3 py-3 border-r border-slate-100 text-xs">
                    <span className={
                      item.tradeComplianceStatus === 'Cleared' ? 'text-emerald-600 font-semibold' :
                      item.tradeComplianceStatus === 'Pending' ? 'text-amber-600 font-semibold' :
                      item.tradeComplianceStatus === 'Flagged' ? 'text-red-600 font-semibold' :
                      'text-slate-400'
                    }>
                      {item.tradeComplianceStatus}
                    </span>
                  </div>

                  {/* Readiness */}
                  <div className="w-28 px-3 py-3 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full ${
                            item.overallReadiness >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                            item.overallReadiness >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                            'bg-gradient-to-r from-red-400 to-rose-500'
                          }`}
                          style={{ width: `${item.overallReadiness}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{item.overallReadiness}%</span>
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

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Column Settings Modal */}
      <ColumnSettings
        isOpen={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        columns={[]}
        onSaveColumns={(cols) => console.log('Saved columns:', cols)}
      />
    </div>
  );
};

export default BOMGrid;
