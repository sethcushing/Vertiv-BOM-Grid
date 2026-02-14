import { 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  XCircle, 
  FileEdit,
  Layers,
  Activity
} from 'lucide-react';
import { sampleBOMData, projectSummary } from '../data/bomData';

const Dashboard = ({ onNavigateToBOM, onNavigateToCO }) => {
  const blockedItems = sampleBOMData.filter(item => item.blockers.length > 0);
  const orderableItems = sampleBOMData.filter(item => item.orderable);
  const criticalBlockers = sampleBOMData.filter(item => 
    item.blockers.some(b => b.severity === 'critical')
  );
  
  const preCOItems = sampleBOMData.filter(item => item.isPreCO);
  const preCOReadyForSubmission = preCOItems.filter(item => item.designReadiness >= 80);
  const preCOAvgReadiness = preCOItems.length > 0
    ? Math.round(preCOItems.reduce((sum, item) => sum + item.designReadiness, 0) / preCOItems.length)
    : 0;
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-gray-900">
                {projectSummary.projectName}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Enterprise Convergence & Readiness Workspace
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onNavigateToCO}
                data-testid="dashboard-co-review-btn"
                className="btn-secondary"
              >
                <AlertTriangle className="w-4 h-4" />
                CO Readiness Review
              </button>
              <button
                onClick={onNavigateToBOM}
                data-testid="dashboard-bom-grid-btn"
                className="btn-primary"
              >
                Open BOM Grid
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* KPI Cards - Bento Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Progress Card */}
          <div className="kpi-card group" data-testid="kpi-progress">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress Toward CO</div>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mb-4 relative">
              <div className="text-5xl font-display text-gray-900">
                {projectSummary.overallReadiness}%
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full progress-fill"
                style={{ width: `${projectSummary.overallReadiness}%` }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Target CO: <span className="font-mono font-semibold text-gray-700">{projectSummary.targetCOSubmission}</span>
            </div>
          </div>

          {/* Blockers Card */}
          <div className="kpi-card group" data-testid="kpi-blockers">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Blockers</div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="mb-2 relative">
              <div className="text-5xl font-display text-gray-900">
                {projectSummary.totalBlockers}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="text-red-600 font-bold">{criticalBlockers.length}</span> critical priority
            </div>
            <button
              onClick={onNavigateToCO}
              className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              View details <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* At Risk Card */}
          <div className="kpi-card group" data-testid="kpi-at-risk">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items at Risk</div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="mb-2 relative">
              <div className="text-5xl font-display text-gray-900">
                {projectSummary.itemsAtRisk}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              of {projectSummary.totalItems} total items
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Readiness &lt; 70%
            </div>
          </div>

          {/* Orderable Card */}
          <div className="kpi-card group" data-testid="kpi-orderable">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orderable Items</div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mb-2 relative">
              <div className="text-5xl font-display text-gray-900">
                {orderableItems.length}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((orderableItems.length / sampleBOMData.length) * 100)}% complete
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Target: <span className="font-mono font-semibold text-gray-700">{projectSummary.targetOrderable}</span>
            </div>
          </div>
        </div>

        {/* Pre-CO Workspace Card */}
        {preCOItems.length > 0 && (
          <div className="kpi-card bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-200/50 mb-8" data-testid="preco-workspace-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <FileEdit className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display text-orange-900 flex items-center gap-3">
                      Pre-CO Workspace
                      <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-mono font-semibold">
                        {preCOItems.length} items
                      </span>
                    </h2>
                    <p className="text-sm text-orange-700 mt-1">
                      Draft items in early design stage, not yet submitted for Change Order
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-orange-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <FileEdit className="w-4 h-4 text-orange-600" />
                      <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Total Pre-CO Items</div>
                    </div>
                    <div className="text-3xl font-display text-orange-900">{preCOItems.length}</div>
                    <div className="text-sm text-orange-600 mt-2">
                      {preCOItems.filter(i => i.designStatus === 'Draft').length} in draft, {preCOItems.filter(i => i.designStatus === 'In Review').length} in review
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-orange-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Avg Design Readiness</div>
                    </div>
                    <div className="text-3xl font-display text-orange-900">{preCOAvgReadiness}%</div>
                    <div className="mt-3 h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                        style={{ width: `${preCOAvgReadiness}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-orange-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Ready for CO</div>
                    </div>
                    <div className="text-3xl font-display text-orange-900">{preCOReadyForSubmission.length}</div>
                    <div className="text-sm text-orange-600 mt-2">
                      Design readiness ≥ 80%
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-8 pl-8 border-l border-orange-300/50 flex flex-col gap-4">
                <button
                  onClick={onNavigateToBOM}
                  data-testid="open-preco-workspace-btn"
                  className="btn-primary whitespace-nowrap"
                >
                  <Layers className="w-5 h-5" />
                  Open Pre-CO Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-sm text-orange-700 text-center">
                  Create and manage<br />draft BOM items
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cycle Time Metrics */}
        <div className="kpi-card mb-8" data-testid="cycle-time-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-display text-gray-900">Average Cycle Time</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-3 font-semibold">Design → Ready to Quote</div>
              <div className="text-4xl font-display text-gray-900">
                {projectSummary.cycleTime.designToQuote} <span className="text-xl text-gray-500 font-normal">days</span>
              </div>
              <div className="mt-4 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-3 font-semibold">Quote → Approval</div>
              <div className="text-4xl font-display text-gray-900">
                {projectSummary.cycleTime.quoteToApproval} <span className="text-xl text-gray-500 font-normal">days</span>
              </div>
              <div className="mt-4 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-3 font-semibold">Approval → Orderable</div>
              <div className="text-4xl font-display text-gray-900">
                {projectSummary.cycleTime.approvalToOrderable} <span className="text-xl text-gray-500 font-normal">days</span>
              </div>
              <div className="mt-4 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  style={{ width: '45%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Blocker Summary */}
        <div className="kpi-card" data-testid="blocker-summary-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-display text-gray-900">Items Requiring Attention</h2>
            </div>
            <button
              onClick={onNavigateToBOM}
              className="btn-secondary"
            >
              View in BOM Grid
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {blockedItems.slice(0, 5).map(item => (
              <div 
                key={item.id}
                data-testid={`blocked-item-${item.id}`}
                className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
                onClick={onNavigateToBOM}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-mono font-semibold text-gray-900 text-base">{item.itemNumber}</span>
                    <span className="text-gray-600">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">{item.blockers.length} blocker{item.blockers.length > 1 ? 's' : ''}</span>
                    <span className="text-gray-300">•</span>
                    <span>Owner: <span className="font-medium text-gray-700">{item.blockerOwner}</span></span>
                    <span className="text-gray-300">•</span>
                    <span>Aging: <span className="font-mono font-semibold text-gray-700">{item.blockerAging}</span> days</span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="text-lg font-mono font-semibold text-gray-900">
                      {item.overallReadiness}%
                    </div>
                    <div className="text-xs text-gray-500">readiness</div>
                  </div>
                  {item.blockers.some(b => b.severity === 'critical') && (
                    <div className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">
                      Critical
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500 font-mono">
          Last refreshed: {projectSummary.lastRefreshed}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
