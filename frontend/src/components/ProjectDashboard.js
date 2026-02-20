import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ChevronRight,
  Sparkles,
  FileDown
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProjectDashboard = ({ 
  onNavigateToBOM, 
  onNavigateToCO, 
  onNavigateToSearch, 
  selectedScope 
}) => {
  const [bomData, setBomData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [lifecycleDistribution, setLifecycleDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toISOString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, statsRes, lifecycleRes] = await Promise.all([
          axios.get(`${API_URL}/api/bom-items`),
          axios.get(`${API_URL}/api/statistics`),
          axios.get(`${API_URL}/api/lifecycle-distribution`)
        ]);
        
        setBomData(itemsRes.data);
        setStatistics(statsRes.data);
        setLifecycleDistribution(lifecycleRes.data);
        setLastRefreshed(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes, lifecycleRes] = await Promise.all([
        axios.get(`${API_URL}/api/bom-items`),
        axios.get(`${API_URL}/api/statistics`),
        axios.get(`${API_URL}/api/lifecycle-distribution`)
      ]);
      
      setBomData(itemsRes.data);
      setStatistics(statsRes.data);
      setLifecycleDistribution(lifecycleRes.data);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate additional metrics
  const orderableItems = bomData.filter(item => item.orderable);
  const blockedItems = bomData.filter(item => item.blockers?.length > 0);
  const preCOItems = bomData.filter(item => item.isPreCO);

  // Get top blockers
  const allBlockers = bomData.flatMap(item => 
    (item.blockers || []).map(b => ({ ...b, itemNumber: item.itemNumber }))
  );
  const blockersByCategory = allBlockers.reduce((acc, blocker) => {
    acc[blocker.category] = (acc[blocker.category] || 0) + 1;
    return acc;
  }, {});

  // Lifecycle stage colors
  const lifecycleColors = {
    'Draft': { bg: 'bg-slate-100', text: 'text-slate-700', bar: 'bg-gradient-to-r from-slate-400 to-slate-500' },
    'Ready for CO': { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-gradient-to-r from-amber-400 to-yellow-500' },
    'CO Submitted': { bg: 'bg-indigo-100', text: 'text-indigo-700', bar: 'bg-gradient-to-r from-indigo-400 to-violet-500' },
    'CO Approved': { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-gradient-to-r from-blue-400 to-cyan-500' },
    'CCO In Progress': { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-gradient-to-r from-purple-400 to-fuchsia-500' },
    'Orderable': { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-gradient-to-r from-emerald-400 to-green-500' }
  };

  const lifecycleOrder = ['Draft', 'Ready for CO', 'CO Submitted', 'CO Approved', 'CCO In Progress', 'Orderable'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" data-testid="project-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onNavigateToSearch && (
                <button
                  onClick={onNavigateToSearch}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  data-testid="back-to-search-btn"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to search
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">PM Dashboard</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Project: {selectedScope}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                Last refreshed: {new Date(lastRefreshed).toLocaleString()}
              </span>
              
              <button 
                className="btn-modern btn-secondary flex items-center gap-2"
                data-testid="export-btn"
              >
                <FileDown className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={handleRefresh}
                className="btn-modern btn-secondary flex items-center gap-2"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <div className="kpi-card p-6" data-testid="kpi-total-items">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Items</p>
                <p className="text-3xl font-bold text-slate-900">{statistics?.totalItems || bomData.length}</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              {preCOItems.length} pre-CO items
            </div>
          </div>

          <div className="kpi-card p-6" data-testid="kpi-orderable">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Orderable</p>
                <p className="text-3xl font-bold text-slate-900">{statistics?.orderableItems || orderableItems.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                  style={{ width: `${bomData.length > 0 ? (orderableItems.length / bomData.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {bomData.length > 0 ? Math.round((orderableItems.length / bomData.length) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="kpi-card p-6" data-testid="kpi-blockers">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Items with Blockers</p>
                <p className="text-3xl font-bold text-slate-900">{statistics?.itemsWithBlockers || blockedItems.length}</p>
              </div>
            </div>
            <div className="text-sm text-red-600 font-semibold">
              {allBlockers.length} total blockers
            </div>
          </div>

          <div className="kpi-card p-6" data-testid="kpi-readiness">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                (statistics?.averageReadiness || 0) >= 80 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30' 
                  : (statistics?.averageReadiness || 0) >= 50 
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-500/30'
                    : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'
              }`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Avg Readiness</p>
                <p className="text-3xl font-bold text-slate-900">{statistics?.averageReadiness || 0}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full ${
                    (statistics?.averageReadiness || 0) >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                    (statistics?.averageReadiness || 0) >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                    'bg-gradient-to-r from-red-400 to-rose-500'
                  }`}
                  style={{ width: `${statistics?.averageReadiness || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Lifecycle Funnel */}
          <div className="col-span-2 card-elevated p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Lifecycle Stage Distribution</h2>
            
            <div className="space-y-4">
              {lifecycleOrder.map((stage) => {
                const count = lifecycleDistribution[stage] || 0;
                const percentage = bomData.length > 0 ? (count / bomData.length) * 100 : 0;
                const colors = lifecycleColors[stage] || { bg: 'bg-slate-100', text: 'text-slate-700', bar: 'bg-slate-400' };
                
                return (
                  <div key={stage} className="flex items-center gap-4" data-testid={`lifecycle-${stage.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="w-36">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} shadow-sm`}>
                        {stage}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden shadow-inner">
                        <div 
                          className={`h-full ${colors.bar} rounded-lg transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-base font-bold text-slate-900">{count}</span>
                        <span className="text-xs text-slate-500 ml-1">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blockers by Category */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Blockers by Category</h2>
            
            {Object.keys(blockersByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(blockersByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-sm">
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{category}</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-sm font-medium">No blockers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Items at Risk */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Items at Risk */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Items at Risk</h2>
            
            {blockedItems.length > 0 ? (
              <div className="space-y-3">
                {blockedItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToBOM && onNavigateToBOM(item.itemNumber)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 rounded-xl transition-all text-left border border-red-100 hover:border-red-200 shadow-sm hover:shadow-md"
                    data-testid={`risk-item-${item.id}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.itemNumber}</p>
                      <p className="text-xs text-slate-600 truncate max-w-[250px]">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-semibold border border-red-200">
                        {item.blockers?.length} blocker(s)
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
                
                {blockedItems.length > 5 && (
                  <button
                    onClick={() => onNavigateToCO && onNavigateToCO()}
                    className="w-full text-center py-3 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    View all {blockedItems.length} items at risk →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-sm font-medium">No items at risk</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigateToBOM && onNavigateToBOM()}
                className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all text-left border-2 border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-md"
                data-testid="quick-action-bom"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-900">View BOM Grid</p>
                <p className="text-xs text-slate-500 mt-1">Full BOM with all items</p>
              </button>
              
              <button
                onClick={() => onNavigateToCO && onNavigateToCO()}
                className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl transition-all text-left border-2 border-emerald-100 hover:border-emerald-200 shadow-sm hover:shadow-md"
                data-testid="quick-action-co"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-900">CO Readiness</p>
                <p className="text-xs text-slate-500 mt-1">Review CO status</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
