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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="glass-strong border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 uppercase tracking-tight">
                {projectSummary.projectName}
              </h1>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">
                Enterprise Convergence & Readiness Workspace
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToCO}
                data-testid="dashboard-co-review-btn"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                CO Readiness Review
              </button>
              <button
                onClick={onNavigateToBOM}
                data-testid="dashboard-bom-grid-btn"
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-sm font-medium uppercase tracking-wide shadow-sm transition-all active:scale-95"
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Progress Toward CO</div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div className="mb-3 relative">
              <div className="text-4xl font-display font-bold text-slate-900">
                {projectSummary.overallReadiness}%
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full progress-fill"
                style={{ width: `${projectSummary.overallReadiness}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Target CO: <span className="font-mono text-slate-700">{projectSummary.targetCOSubmission}</span>
            </div>
          </div>

          {/* Blockers Card */}
          <div className="kpi-card group" data-testid="kpi-blockers">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Blockers</div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mb-2 relative">
              <div className="text-4xl font-display font-bold text-slate-900">
                {projectSummary.totalBlockers}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              <span className="text-red-600 font-semibold">{criticalBlockers.length}</span> critical priority
            </div>
            <button
              onClick={onNavigateToCO}
              className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wide"
            >
              View details →
            </button>
          </div>

          {/* At Risk Card */}
          <div className="kpi-card group" data-testid="kpi-at-risk">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Items at Risk</div>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="mb-2 relative">
              <div className="text-4xl font-display font-bold text-slate-900">
                {projectSummary.itemsAtRisk}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              of {projectSummary.totalItems} total items
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Readiness &lt; 70%
            </div>
          </div>

          {/* Orderable Card */}
          <div className="kpi-card group" data-testid="kpi-orderable">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Orderable Items</div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-2 relative">
              <div className="text-4xl font-display font-bold text-slate-900">
                {orderableItems.length}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {Math.round((orderableItems.length / sampleBOMData.length) * 100)}% complete
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Target: <span className="font-mono text-slate-700">{projectSummary.targetOrderable}</span>
            </div>
          </div>
        </div>

        {/* Pre-CO Workspace Card */}
        {preCOItems.length > 0 && (
          <div className="kpi-card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 mb-8" data-testid="preco-workspace-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 text-white rounded-sm p-2.5">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-semibold text-orange-900 flex items-center gap-2 uppercase tracking-tight">
                      Pre-CO Workspace
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-sm font-mono">
                        {preCOItems.length} items
                      </span>
                    </h2>
                    <p className="text-sm text-orange-700">
                      Draft items in early design stage, not yet submitted for Change Order
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/60 backdrop-blur rounded-sm p-4 border border-orange-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileEdit className="w-4 h-4 text-orange-700" />
                      <div className="text-xs font-medium text-orange-700 uppercase tracking-wider">Total Pre-CO Items</div>
                    </div>
                    <div className="text-2xl font-display font-semibold text-orange-900">{preCOItems.length}</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {preCOItems.filter(i => i.designStatus === 'Draft').length} in draft, {preCOItems.filter(i => i.designStatus === 'In Review').length} in review
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur rounded-sm p-4 border border-orange-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-orange-700" />
                      <div className="text-xs font-medium text-orange-700 uppercase tracking-wider">Avg Design Readiness</div>
                    </div>
                    <div className="text-2xl font-display font-semibold text-orange-900">{preCOAvgReadiness}%</div>
                    <div className="mt-2 h-1.5 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${preCOAvgReadiness}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur rounded-sm p-4 border border-orange-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <div className="text-xs font-medium text-orange-700 uppercase tracking-wider">Ready for CO</div>
                    </div>
                    <div className="text-2xl font-display font-semibold text-orange-900">{preCOReadyForSubmission.length}</div>
                    <div className="text-xs text-orange-600 mt-1">
                      Design readiness ≥ 80%
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-6 pl-6 border-l border-orange-300 flex flex-col gap-3">
                <button
                  onClick={onNavigateToBOM}
                  data-testid="open-preco-workspace-btn"
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-sm font-medium uppercase tracking-wide shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  <Layers className="w-4 h-4" />
                  Open Pre-CO Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-xs text-orange-700 text-center">
                  Create and manage<br />draft BOM items
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cycle Time Metrics */}
        <div className="kpi-card mb-8" data-testid="cycle-time-card">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-display font-semibold text-slate-900 uppercase tracking-tight">Average Cycle Time</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-sm text-slate-600 mb-2 uppercase tracking-wide">Design → Ready to Quote</div>
              <div className="text-3xl font-display font-semibold text-slate-900">
                {projectSummary.cycleTime.designToQuote} <span className="text-lg text-slate-500">days</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2 uppercase tracking-wide">Quote → Approval</div>
              <div className="text-3xl font-display font-semibold text-slate-900">
                {projectSummary.cycleTime.quoteToApproval} <span className="text-lg text-slate-500">days</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2 uppercase tracking-wide">Approval → Orderable</div>
              <div className="text-3xl font-display font-semibold text-slate-900">
                {projectSummary.cycleTime.approvalToOrderable} <span className="text-lg text-slate-500">days</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: '45%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Blocker Summary */}
        <div className="kpi-card" data-testid="blocker-summary-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-display font-semibold text-slate-900 uppercase tracking-tight">Items Requiring Attention</h2>
            </div>
            <button
              onClick={onNavigateToBOM}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm"
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
                className="flex items-center justify-between p-4 bg-slate-50 rounded-sm hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
                onClick={onNavigateToBOM}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-medium text-slate-900">{item.itemNumber}</span>
                    <span className="text-sm text-slate-600">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{item.blockers.length} blocker{item.blockers.length > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Owner: {item.blockerOwner}</span>
                    <span>•</span>
                    <span>Aging: <span className="font-mono">{item.blockerAging}</span> days</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium text-slate-900">
                      {item.overallReadiness}%
                    </div>
                    <div className="text-xs text-slate-500">readiness</div>
                  </div>
                  {item.blockers.some(b => b.severity === 'critical') && (
                    <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-sm uppercase tracking-wide">
                      Critical
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-slate-500 font-mono">
          Last refreshed: {projectSummary.lastRefreshed}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
