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
    { key: 'ready', testId: 'ready', label: 'Ready', color: 'green', bgColor: 'bg-green-500', range: '90-100%', icon: CheckCircle2 },
    { key: 'inProgress', testId: 'in-progress', label: 'In Progress', color: 'blue', bgColor: 'bg-blue-500', range: '70-89%', icon: TrendingUp },
    { key: 'atRisk', testId: 'at-risk', label: 'At Risk', color: 'amber', bgColor: 'bg-amber-500', range: '40-69%', icon: AlertTriangle },
    { key: 'blocked', testId: 'blocked', label: 'Blocked', color: 'red', bgColor: 'bg-red-500', range: '0-39%', icon: AlertTriangle },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: { bg: 'bg-green-100', icon: 'bg-green-500', text: 'text-green-700', border: 'border-l-green-500' },
      blue: { bg: 'bg-blue-100', icon: 'bg-blue-500', text: 'text-blue-700', border: 'border-l-blue-500' },
      amber: { bg: 'bg-amber-100', icon: 'bg-amber-500', text: 'text-amber-700', border: 'border-l-amber-500' },
      red: { bg: 'bg-red-100', icon: 'bg-red-500', text: 'text-red-700', border: 'border-l-red-500' }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={onNavigateToDashboard}
                  data-testid="co-back-to-dashboard"
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                >
                  ← Dashboard
                </button>
                <span className="text-gray-300">|</span>
                <h1 className="text-2xl font-display text-gray-900">
                  CO Readiness Review
                </h1>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {projectSummary.projectName} • Target CO: {projectSummary.targetCOSubmission}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToBOM}
                data-testid="co-to-bom-grid"
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
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {categories.map(({ key, testId, label, color, range, icon: Icon }) => {
            const colorClasses = getColorClasses(color);
            return (
              <div 
                key={key}
                data-testid={`readiness-category-${testId}`}
                className={`kpi-card border-l-4 ${colorClasses.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
                  <div className={`w-10 h-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                  </div>
                </div>
                <div className="text-5xl font-display text-gray-900 mb-2">
                  {categorizedItems[key].length}
                </div>
                <div className="text-sm text-gray-500">
                  Readiness: <span className="font-mono font-semibold">{range}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Readiness Distribution Bar */}
        <div className="kpi-card mb-8" data-testid="readiness-distribution">
          <h2 className="text-xl font-display text-gray-900 mb-5">
            Readiness Distribution
          </h2>
          <div className="h-10 flex rounded-xl overflow-hidden shadow-inner bg-gray-200">
            {categories.map(({ key, bgColor }) => {
              const percentage = (categorizedItems[key].length / sampleBOMData.length) * 100;
              return percentage > 0 ? (
                <div
                  key={key}
                  className={`${bgColor} flex items-center justify-center text-white text-sm font-bold transition-all`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage >= 10 && `${Math.round(percentage)}%`}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex justify-between mt-5 text-sm text-gray-500">
            {categories.map(({ key, label, bgColor }) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${bgColor} rounded-md`}></div>
                <span className="font-medium">{label}: {categorizedItems[key].length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items by Category */}
        <div className="space-y-6">
          {categories.map(({ key, testId, label, color, bgColor }) => {
            const colorClasses = getColorClasses(color);
            return categorizedItems[key].length > 0 && (
              <div key={key} className="kpi-card" data-testid={`items-${testId}`}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`text-xl font-display ${colorClasses.text} flex items-center gap-3`}>
                    <div className={`w-5 h-5 ${bgColor} rounded-md`}></div>
                    {label} Items ({categorizedItems[key].length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {categorizedItems[key].slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
                      onClick={onNavigateToBOM}
                    >
                      <div className="flex items-center gap-5">
                        <span className="font-mono font-semibold text-gray-900 w-32 text-base">{item.itemNumber}</span>
                        <span className="text-gray-600">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-36">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${bgColor} rounded-full`}
                                style={{ width: `${item.overallReadiness}%` }}
                              />
                            </div>
                            <span className={`text-sm font-mono font-semibold ${colorClasses.text}`}>
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
                      className="w-full text-center py-3 text-sm text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      View all {categorizedItems[key].length} items →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default COReadinessReview;
