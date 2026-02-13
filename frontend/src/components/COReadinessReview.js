import { 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { sampleBOMData, projectSummary } from '../data/bomData';

const COReadinessReview = ({ onNavigateToDashboard, onNavigateToBOM }) => {
  const getReadinessCategory = (readiness) => {
    if (readiness >= 90) return 'ready';
    if (readiness >= 70) return 'inProgress';
    if (readiness >= 40) return 'atRisk';
    return 'blocked';
  };

  const categorizedItems = {
    ready: sampleBOMData.filter(item => getReadinessCategory(item.overallReadiness) === 'ready'),
    inProgress: sampleBOMData.filter(item => getReadinessCategory(item.overallReadiness) === 'inProgress'),
    atRisk: sampleBOMData.filter(item => getReadinessCategory(item.overallReadiness) === 'atRisk'),
    blocked: sampleBOMData.filter(item => getReadinessCategory(item.overallReadiness) === 'blocked'),
  };

  const categories = [
    { key: 'ready', label: 'Ready', color: 'green', range: '90-100%', icon: CheckCircle2 },
    { key: 'inProgress', label: 'In Progress', color: 'blue', range: '70-89%', icon: TrendingUp },
    { key: 'atRisk', label: 'At Risk', color: 'amber', range: '40-69%', icon: AlertTriangle },
    { key: 'blocked', label: 'Blocked', color: 'red', range: '0-39%', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="glass-strong border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={onNavigateToDashboard}
                  data-testid="co-back-to-dashboard"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wide"
                >
                  ← Dashboard
                </button>
                <span className="text-slate-300">|</span>
                <h1 className="text-2xl font-display font-bold text-slate-900 uppercase tracking-tight">
                  CO Readiness Review
                </h1>
              </div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">
                {projectSummary.projectName} • Target CO: {projectSummary.targetCOSubmission}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToBOM}
                data-testid="co-to-bom-grid"
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
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {categories.map(({ key, label, color, range, icon: Icon }) => (
            <div 
              key={key}
              data-testid={`readiness-category-${key}`}
              className={`kpi-card border-l-4 border-l-${color}-500`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
                <Icon className={`w-5 h-5 text-${color}-500`} />
              </div>
              <div className="text-4xl font-display font-bold text-slate-900 mb-1">
                {categorizedItems[key].length}
              </div>
              <div className="text-sm text-slate-500">
                Readiness: <span className="font-mono">{range}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Readiness Distribution Bar */}
        <div className="kpi-card mb-8" data-testid="readiness-distribution">
          <h2 className="text-lg font-display font-semibold text-slate-900 mb-4 uppercase tracking-tight">
            Readiness Distribution
          </h2>
          <div className="h-8 flex rounded-sm overflow-hidden">
            {categories.map(({ key, color }) => {
              const percentage = (categorizedItems[key].length / sampleBOMData.length) * 100;
              return percentage > 0 ? (
                <div
                  key={key}
                  className={`bg-${color}-500 flex items-center justify-center text-white text-xs font-bold transition-all`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage >= 10 && `${Math.round(percentage)}%`}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-500">
            {categories.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 bg-${color}-500 rounded-sm`}></div>
                <span>{label}: {categorizedItems[key].length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items by Category */}
        <div className="space-y-6">
          {categories.map(({ key, label, color }) => (
            categorizedItems[key].length > 0 && (
              <div key={key} className="kpi-card" data-testid={`items-${key}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-display font-semibold text-${color}-700 uppercase tracking-tight flex items-center gap-2`}>
                    <div className={`w-4 h-4 bg-${color}-500 rounded-sm`}></div>
                    {label} Items ({categorizedItems[key].length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {categorizedItems[key].slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-sm hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
                      onClick={onNavigateToBOM}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-medium text-slate-900 w-28">{item.itemNumber}</span>
                        <span className="text-sm text-slate-600">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-${color}-500`}
                                style={{ width: `${item.overallReadiness}%` }}
                              />
                            </div>
                            <span className={`text-xs font-mono font-medium text-${color}-700`}>
                              {item.overallReadiness}%
                            </span>
                          </div>
                        </div>
                        {item.blockers.length > 0 && (
                          <span className="status-badge status-blocked">
                            {item.blockers.length} blocker{item.blockers.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {categorizedItems[key].length > 5 && (
                    <button
                      onClick={onNavigateToBOM}
                      className="w-full text-center py-2 text-sm text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wide"
                    >
                      View all {categorizedItems[key].length} items →
                    </button>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default COReadinessReview;
