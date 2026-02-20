import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ChevronRight
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
    'Draft': { bg: 'bg-slate-100', text: 'text-slate-700', bar: 'bg-slate-400' },
    'Ready for CO': { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
    'CO Submitted': { bg: 'bg-indigo-100', text: 'text-indigo-700', bar: 'bg-indigo-500' },
    'CO Approved': { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
    'CCO In Progress': { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
    'Orderable': { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' }
  };

  const lifecycleOrder = ['Draft', 'Ready for CO', 'CO Submitted', 'CO Approved', 'CCO In Progress', 'Orderable'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100" data-testid="project-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {onNavigateToSearch && (
                <button
                  onClick={onNavigateToSearch}
                  className="text-sm text-purple-600 hover:text-purple-700 hover:underline mb-2"
                  data-testid="back-to-search-btn"
                >
                  ← Back to search
                </button>
              )}
              <h1 className="text-xl font-semibold text-slate-900">PM Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Project: {selectedScope}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Last refreshed: {new Date(lastRefreshed).toLocaleString()}
              </span>
              
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
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 kpi-card" data-testid="kpi-total-items">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Items</p>
                <p className="text-2xl font-bold text-slate-900">{statistics?.totalItems || bomData.length}</p>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {preCOItems.length} pre-CO items
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 kpi-card" data-testid="kpi-orderable">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Orderable</p>
                <p className="text-2xl font-bold text-slate-900">{statistics?.orderableItems || orderableItems.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${bomData.length > 0 ? (orderableItems.length / bomData.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600">
                {bomData.length > 0 ? Math.round((orderableItems.length / bomData.length) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 kpi-card" data-testid="kpi-blockers">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Items with Blockers</p>
                <p className="text-2xl font-bold text-slate-900">{statistics?.itemsWithBlockers || blockedItems.length}</p>
              </div>
            </div>
            <div className="text-xs text-red-600">
              {allBlockers.length} total blockers
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 kpi-card" data-testid="kpi-readiness">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Avg Readiness</p>
                <p className="text-2xl font-bold text-slate-900">{statistics?.averageReadiness || 0}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    (statistics?.averageReadiness || 0) >= 80 ? 'bg-emerald-500' :
                    (statistics?.averageReadiness || 0) >= 50 ? 'bg-amber-500' :
                    'bg-red-500'
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
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Lifecycle Stage Distribution</h2>
            
            <div className="space-y-3">
              {lifecycleOrder.map((stage) => {
                const count = lifecycleDistribution[stage] || 0;
                const percentage = bomData.length > 0 ? (count / bomData.length) * 100 : 0;
                const colors = lifecycleColors[stage] || { bg: 'bg-slate-100', text: 'text-slate-700', bar: 'bg-slate-400' };
                
                return (
                  <div key={stage} className="flex items-center gap-4" data-testid={`lifecycle-${stage.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="w-32">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                        {stage}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                        <div 
                          className={`h-full ${colors.bar} rounded transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium text-slate-900">{count}</span>
                        <span className="text-xs text-slate-500 ml-1">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blockers by Category */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Blockers by Category</h2>
            
            {Object.keys(blockersByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(blockersByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-slate-800">{category}</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm">No blockers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Items at Risk */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Items at Risk */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Items at Risk</h2>
            
            {blockedItems.length > 0 ? (
              <div className="space-y-2">
                {blockedItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToBOM && onNavigateToBOM(item.itemNumber)}
                    className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
                    data-testid={`risk-item-${item.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.itemNumber}</p>
                      <p className="text-xs text-slate-600 truncate max-w-[250px]">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                        {item.blockers?.length} blocker(s)
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
                
                {blockedItems.length > 5 && (
                  <button
                    onClick={() => onNavigateToCO && onNavigateToCO()}
                    className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all {blockedItems.length} items at risk →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm">No items at risk</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigateToBOM && onNavigateToBOM()}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                data-testid="quick-action-bom"
              >
                <Package className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">View BOM Grid</p>
                <p className="text-xs text-slate-500 mt-1">Full BOM with all items</p>
              </button>
              
              <button
                onClick={() => onNavigateToCO && onNavigateToCO()}
                className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left"
                data-testid="quick-action-co"
              >
                <Clock className="w-6 h-6 text-emerald-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">CO Readiness</p>
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
