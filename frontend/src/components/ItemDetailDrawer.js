import { useState } from 'react';
import { 
  X, 
  Lock, 
  AlertTriangle, 
  Clock, 
  Database, 
  Edit3, 
  Save, 
  Unlock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ItemDetailDrawer = ({ item, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [activeTab, setActiveTab] = useState('details');

  if (!item) return null;

  const getReadinessColor = (readiness) => {
    if (readiness >= 90) return 'text-green-600 bg-green-50';
    if (readiness >= 70) return 'text-blue-600 bg-blue-50';
    if (readiness >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isFieldEditable = (fieldName) => {
    return editMode && item.editableFields.includes(fieldName);
  };

  const handleSave = () => {
    setEditMode(false);
  };

  const isEligible = 
    item.designStatus === 'Released' &&
    item.quoteStatus === 'Received' &&
    item.supplierSetupInERP &&
    (!item.ppapRequired || item.ppapStatus === 'Approved') &&
    item.manufacturingReviewed;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[750px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className={`border-b px-8 py-6 ${item.isPreCO ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-display text-gray-900">{item.itemNumber}</h2>
                <span className="status-badge status-draft font-mono">Rev {item.revision}</span>
                {item.isPreCO && (
                  <span className="status-badge bg-orange-100 text-orange-700 border-orange-200">
                    Pre-CO Workspace
                  </span>
                )}
              </div>
              <p className="text-base text-gray-600">{item.description}</p>
            </div>
            <button
              onClick={onClose}
              data-testid="close-drawer-btn"
              className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* CO Submission Eligibility */}
          <div className={`mb-5 p-4 rounded-xl border-2 ${isEligible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">CO Submission Eligibility:</span>
              <span className={`status-badge ${isEligible ? 'status-ready' : 'status-blocked'} px-4 py-1.5 text-sm font-bold`}>
                {isEligible ? (
                  <><CheckCircle2 className="w-4 h-4 inline mr-2" /> ELIGIBLE</>
                ) : (
                  <><XCircle className="w-4 h-4 inline mr-2" /> NOT ELIGIBLE</>
                )}
              </span>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="mb-4">
            <div className="text-sm font-bold text-gray-700 mb-3">Progress Toward CO Eligibility:</div>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Design', value: item.designReadiness },
                { label: 'Procure', value: item.procurementReadiness },
                { label: 'Mfg', value: item.manufacturingReadiness },
                { label: 'Quality', value: item.qualityReadiness },
                { label: 'Overall', value: item.overallReadiness },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className={`text-xl font-display px-3 py-2 rounded-xl ${getReadinessColor(value)}`}>
                    {value}%
                  </div>
                  <div className="text-xs text-gray-600 mt-2 font-semibold">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Boundary Indicator */}
          {item.isPreCO && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Unlock className="w-5 h-5" />
                <span className="font-bold text-base">Pre-CO Workspace - Highly Editable</span>
              </div>
              <p className="text-sm text-orange-100">
                Most fields can be edited before CO submission. Once CO is released, fields will be locked per governance rules.
              </p>
            </div>
          )}

          {/* Edit Controls */}
          {item.editableFields.length > 0 && (
            <div className={`flex items-center justify-between pt-4 mt-4 border-t ${item.isPreCO ? 'border-orange-200' : 'border-gray-200'}`}>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                {item.isPreCO ? (
                  <>
                    <Unlock className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{item.editableFields.length} field{item.editableFields.length > 1 ? 's' : ''} editable (Pre-CO)</span>
                  </>
                ) : (
                  <span className="font-medium">{item.editableFields.length} field{item.editableFields.length > 1 ? 's' : ''} editable pre-CCO</span>
                )}
              </div>
              {editMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditedItem(item);
                      setEditMode(false);
                    }}
                    className="btn-secondary py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary py-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  data-testid="edit-item-btn"
                  className="btn-secondary py-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-8">
          <div className="flex gap-6">
            {['details', 'blockers', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                className={`py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'blockers' && item.blockers.length > 0 && (
                  <span className="status-badge status-blocked mr-2">{item.blockers.length}</span>
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Identity */}
              <Section title="Identity" icon={<Database className="w-4 h-4 text-gray-400" />}>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Item Number" value={item.itemNumber} locked />
                  <Field label="Revision" value={item.revision} locked />
                  <Field label="Commodity" value={item.commodity} locked />
                  <Field label="Plant" value={item.plant} locked />
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-2 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                  <Database className="w-3 h-3" />
                  Source: {item.dataSource.identity}
                </div>
              </Section>

              {/* Ownership */}
              <Section title="Ownership">
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Engineering Owner" value={item.engOwner} locked />
                  <Field label="Procurement Owner" value={item.procurementOwner} locked />
                  <Field label="AME Owner" value={item.ameOwner} locked />
                  <Field label="Quality Owner" value={item.qualityOwner} locked />
                </div>
              </Section>

              {/* Procurement */}
              <Section title="Procurement" icon={<Database className="w-4 h-4 text-gray-400" />}>
                <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">Make/Buy:</span>
                      <span className={`status-badge ${
                        item.makeBuy === 'Make' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        item.makeBuy === 'Buy' ? 'bg-green-50 text-green-700 border-green-200' : 
                        'status-draft'
                      }`}>
                        {item.makeBuy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Field 
                    label="Quote Status" 
                    value={editedItem.quoteStatus}
                    editable={isFieldEditable('quoteStatus')}
                    onChange={(val) => setEditedItem({...editedItem, quoteStatus: val})}
                  />
                  <Field label="Quote Received" value={item.quoteReceivedDate || 'N/A'} locked />
                  <Field label="ERP Setup" value={item.supplierSetupInERP ? 'Yes' : 'No'} locked />
                  <Field label="Has BPA" value={item.hasBPA ? 'Yes' : 'No'} locked />
                  <Field label="Lead Time" value={item.leadTime > 0 ? `${item.leadTime} days` : 'TBD'} locked />
                </div>
              </Section>

              {/* Quality */}
              <Section title="Quality & Compliance">
                <div className="grid grid-cols-2 gap-6">
                  <Field label="PPAP Required" value={item.ppapRequired ? 'Yes' : 'No'} locked />
                  <Field label="PPAP Status" value={item.ppapStatus} locked />
                  <Field label="Country of Origin" value={item.coo || 'TBD'} locked />
                  <Field label="Trade Compliance" value={item.tradeComplianceStatus} locked />
                </div>
              </Section>

              {/* Governance */}
              <Section title="Governance">
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Lifecycle State" value={item.lifecycleState} locked />
                  <Field label="CO Number" value={item.pendingCONumber || 'N/A'} locked />
                  <Field label="CO Status" value={item.coStatus} locked />
                  <Field label="Orderable" value={item.orderable ? 'Yes' : 'No'} locked />
                </div>
              </Section>

              {/* Multi-Org Orderability */}
              <Section title="Multi-Org Orderability">
                <div className="space-y-4">
                  {item.orgOrderability.map((org) => (
                    <div key={org.org} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-900 text-base">{org.org}</span>
                        <span className={`status-badge ${org.orderable ? 'status-ready' : 'status-blocked'}`}>
                          {org.orderable ? 'Orderable' : 'Not Orderable'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Supplier Setup: <span className="font-semibold text-gray-800">{org.supplierSetup ? 'Yes' : 'No'}</span>
                      </div>
                      {org.blockers.length > 0 && (
                        <div className="text-sm text-red-600 mt-3 bg-red-50 p-3 rounded-lg">
                          <div className="font-bold mb-2">Blockers:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {org.blockers.map((blocker, idx) => (
                              <li key={idx}>{blocker}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'blockers' && (
            <div>
              {item.blockers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No blockers for this item</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {item.blockers.map((blocker, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-5 ${getSeverityColor(blocker.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="status-badge bg-white/60 border-current">{blocker.category}</span>
                          <span className="status-badge bg-white/60 border-current uppercase font-bold">{blocker.severity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono font-bold">{blocker.agingDays} days</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 text-base">{blocker.description}</h4>
                      <p className="text-sm text-gray-700 mb-3">{blocker.notes}</p>
                      <div className="text-sm">
                        Owner: <span className="font-bold">{blocker.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <HistoryEntry
                date="2026-02-12 07:45:00"
                user="Mike Johnson"
                action="Updated quote status to 'Pending'"
                source="CPQ"
              />
              <HistoryEntry
                date="2026-02-10 14:22:00"
                user="System"
                action="CCO status changed to 'Pending'"
                source="PLM"
              />
              <HistoryEntry
                date="2026-02-08 11:15:00"
                user="Sarah Chen"
                action="Design status changed to 'Released'"
                source="PLM"
              />
              <HistoryEntry
                date="2026-01-25 09:30:00"
                user="System"
                action="Item created in PLM"
                source="PLM"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
          <div className="text-sm text-gray-500 font-mono">
            Last updated: {item.lastUpdated}
          </div>
        </div>
      </div>
    </>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
    <h3 className="text-base font-display text-gray-900 mb-4 flex items-center gap-2">
      {title}
      {icon}
    </h3>
    {children}
  </div>
);

const Field = ({ label, value, locked = false, editable = false, onChange }) => (
  <div>
    <label className="text-xs text-gray-500 mb-2 flex items-center gap-1 font-semibold uppercase tracking-wide">
      {label}
      {locked && <Lock className="w-3 h-3 text-gray-400" />}
      {editable && <Unlock className="w-3 h-3 text-orange-600" />}
    </label>
    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-10 px-3 text-sm bg-orange-50 border-2 border-orange-300 rounded-xl font-medium"
      />
    ) : (
      <div className={`text-base font-medium font-mono ${locked ? 'text-gray-700' : 'text-gray-900'}`}>
        {value || '—'}
      </div>
    )}
  </div>
);

const HistoryEntry = ({ date, user, action, source }) => (
  <div className="flex gap-4 text-sm border-l-2 border-gray-200 pl-4 py-2 hover:border-orange-400 transition-colors">
    <div className="flex-1">
      <div className="text-gray-900 font-medium text-base">{action}</div>
      <div className="text-sm text-gray-500 mt-1 font-mono">
        {user} • {date}
        <span className="ml-3 inline-flex items-center gap-1 text-gray-400">
          <Database className="w-3 h-3" />
          {source}
        </span>
      </div>
    </div>
  </div>
);

export default ItemDetailDrawer;
