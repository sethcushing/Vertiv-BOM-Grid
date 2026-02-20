import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
  FileDown
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const COReadinessReview = ({ 
  onNavigateToBOM, 
  onNavigateToDashboard, 
  onNavigateToSearch, 
  selectedScope 
}) => {
  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCOs, setExpandedCOs] = useState(new Set(['CO-2026-001']));
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toISOString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bom-items`);
        setBomData(response.data);
        setLastRefreshed(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group items by CO
  const coGroups = bomData.reduce((acc, item) => {
    const co = item.pendingCONumber || 'No CO Assigned';
    if (!acc[co]) {
      acc[co] = {
        coNumber: co,
        items: [],
        status: item.coStatus,
        readyCount: 0,
        blockedCount: 0
      };
    }
    acc[co].items.push(item);
    if (item.orderable) acc[co].readyCount++;
    if (item.blockers?.length > 0) acc[co].blockedCount++;
    return acc;
  }, {});

  const coList = Object.values(coGroups).filter(co => co.coNumber !== 'No CO Assigned');

  // Calculate statistics
  const totalItems = bomData.length;
  const orderableItems = bomData.filter(item => item.orderable).length;
  const itemsWithBlockers = bomData.filter(item => item.blockers?.length > 0).length;
  const avgReadiness = totalItems > 0 
    ? Math.round(bomData.reduce((sum, item) => sum + item.overallReadiness, 0) / totalItems)
    : 0;

  const toggleCO = (coNumber) => {
    const newExpanded = new Set(expandedCOs);
    if (newExpanded.has(coNumber)) {
      newExpanded.delete(coNumber);
    } else {
      newExpanded.add(coNumber);
    }
    setExpandedCOs(newExpanded);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/bom-items`);
      setBomData(response.data);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (readiness) => {
    if (readiness >= 80) return 'text-emerald-600';
    if (readiness >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getReadinessBarColor = (readiness) => {
    if (readiness >= 80) return 'bg-gradient-to-r from-emerald-400 to-green-500';
    if (readiness >= 50) return 'bg-gradient-to-r from-amber-400 to-yellow-500';
    return 'bg-gradient-to-r from-red-400 to-rose-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
          <p className="text-slate-600 font-medium">Loading CO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" data-testid="co-readiness-review">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onNavigateToSearch && (
                <button
                  onClick={onNavigateToSearch}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  data-testid="back-to-search-btn"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to search
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">CO Readiness Review</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Project: {selectedScope} • Reviewing {coList.length} Change Order(s)
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

      {/* Summary Statistics */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="grid grid-cols-4 gap-5">
          <div className="kpi-card p-5" data-testid="stat-total-items">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Total Items</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalItems}</div>
            <div className="text-sm text-slate-500 mt-1">Across all COs</div>
          </div>

          <div className="kpi-card p-5" data-testid="stat-orderable">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Orderable</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{orderableItems}</div>
            <div className="text-sm text-emerald-600 font-semibold mt-1">
              {totalItems > 0 ? Math.round((orderableItems / totalItems) * 100) : 0}% complete
            </div>
          </div>

          <div className="kpi-card p-5" data-testid="stat-blockers">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">With Blockers</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{itemsWithBlockers}</div>
            <div className="text-sm text-red-600 font-semibold mt-1">Require attention</div>
          </div>

          <div className="kpi-card p-5" data-testid="stat-readiness">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                avgReadiness >= 80 ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                avgReadiness >= 50 ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                'bg-gradient-to-br from-red-500 to-rose-600'
              }`}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Avg Readiness</span>
            </div>
            <div className={`text-3xl font-bold ${getReadinessColor(avgReadiness)}`}>
              {avgReadiness}%
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mt-3 shadow-inner">
              <div 
                className={`h-full ${getReadinessBarColor(avgReadiness)} rounded-full`}
                style={{ width: `${avgReadiness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CO List */}
      <div className="px-6 py-6">
        <div className="space-y-5">
          {coList.map((co) => (
            <div key={co.coNumber} className="card-elevated overflow-hidden">
              {/* CO Header */}
              <button
                onClick={() => toggleCO(co.coNumber)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                data-testid={`co-header-${co.coNumber}`}
              >
                <div className="flex items-center gap-5">
                  {expandedCOs.has(co.coNumber) ? (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-lg">{co.coNumber}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${
                        co.status === 'Released' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200' :
                        co.status === 'Pending' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {co.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1.5">
                      {co.items.length} items • {co.readyCount} ready • {co.blockedCount} blocked
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1.5 font-medium">Overall Readiness</div>
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full ${getReadinessBarColor(
                            Math.round(co.items.reduce((sum, item) => sum + item.overallReadiness, 0) / co.items.length)
                          )} rounded-full`}
                          style={{ 
                            width: `${Math.round(co.items.reduce((sum, item) => sum + item.overallReadiness, 0) / co.items.length)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {Math.round(co.items.reduce((sum, item) => sum + item.overallReadiness, 0) / co.items.length)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* CO Items */}
              {expandedCOs.has(co.coNumber) && (
                <div className="border-t border-slate-200">
                  <table className="w-full table-modern">
                    <thead className="bg-slate-50">
                      <tr className="text-xs text-slate-600 font-bold">
                        <th className="px-5 py-3 text-left">Item Number</th>
                        <th className="px-5 py-3 text-left">Description</th>
                        <th className="px-5 py-3 text-left">Lifecycle</th>
                        <th className="px-5 py-3 text-center">Design</th>
                        <th className="px-5 py-3 text-center">Procurement</th>
                        <th className="px-5 py-3 text-center">Mfg</th>
                        <th className="px-5 py-3 text-center">Quality</th>
                        <th className="px-5 py-3 text-center">Overall</th>
                        <th className="px-5 py-3 text-center">Blockers</th>
                        <th className="px-5 py-3 text-center">Orderable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {co.items.map((item) => (
                        <tr 
                          key={item.id}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => onNavigateToBOM && onNavigateToBOM(item.itemNumber)}
                          data-testid={`co-item-${item.id}`}
                        >
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-blue-600 hover:text-blue-700">{item.itemNumber}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-700 truncate block max-w-[200px] font-medium">
                              {item.description}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                              item.lifecycleStage === 'Orderable' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200' :
                              item.lifecycleStage === 'CO Approved' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200' :
                              item.lifecycleStage === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                              'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200'
                            }`}>
                              {item.lifecycleStage}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-xs font-bold ${getReadinessColor(item.designReadiness)}`}>
                              {item.designReadiness}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-xs font-bold ${getReadinessColor(item.procurementReadiness)}`}>
                              {item.procurementReadiness}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-xs font-bold ${getReadinessColor(item.manufacturingReadiness)}`}>
                              {item.manufacturingReadiness}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-xs font-bold ${getReadinessColor(item.qualityReadiness)}`}>
                              {item.qualityReadiness}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-14 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full ${getReadinessBarColor(item.overallReadiness)} rounded-full`}
                                  style={{ width: `${item.overallReadiness}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${getReadinessColor(item.overallReadiness)}`}>
                                {item.overallReadiness}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {item.blockers?.length > 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                                <AlertCircle className="w-4 h-4" />
                                {item.blockers.length}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {item.orderable ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                            ) : (
                              <span className="text-xs text-slate-400">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default COReadinessReview;
