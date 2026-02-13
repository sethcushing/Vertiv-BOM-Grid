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
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
    <div className="fixed inset-y-0 right-0 w-[600px] glass-strong shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className={`border-b px-6 py-4 ${item.isPreCO ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-display font-semibold text-slate-900 uppercase tracking-tight">{item.itemNumber}</h2>
              <span className="status-badge status-draft font-mono">Rev {item.revision}</span>
              {item.isPreCO && (
                <span className="status-badge bg-orange-100 text-orange-700 border-orange-200">
                  Pre-CO Workspace
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-drawer-btn"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* CO Submission Eligibility */}
        <div className={`mb-3 p-3 rounded-sm border-2 ${isEligible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">CO Submission Eligibility:</span>
            <span className={`status-badge ${isEligible ? 'status-ready' : 'status-blocked'} px-3 py-1 font-bold`}>
              {isEligible ? (
                <><CheckCircle2 className="w-4 h-4 inline mr-1" /> ELIGIBLE</>
              ) : (
                <><XCircle className="w-4 h-4 inline mr-1" /> NOT ELIGIBLE</>
              )}
            </span>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="mb-2">
          <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">Progress Toward CO Eligibility:</div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Design', value: item.designReadiness },
              { label: 'Procure', value: item.procurementReadiness },
              { label: 'Mfg', value: item.manufacturingReadiness },
              { label: 'Quality', value: item.qualityReadiness },
              { label: 'Overall', value: item.overallReadiness },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className={`text-lg font-display font-semibold px-2 py-1 rounded-sm ${getReadinessColor(value)}`}>
                  {value}%
                </div>
                <div className="text-xs text-slate-600 mt-1 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Boundary Indicator */}
        {item.isPreCO && (
          <div className="mt-3 p-3 bg-orange-500 text-white rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <Unlock className="w-4 h-4" />
              <span className="font-semibold text-sm uppercase tracking-wide">Pre-CO Workspace - Highly Editable</span>
            </div>
            <p className="text-xs text-orange-100">
              Most fields can be edited before CO submission. Once CO is released, fields will be locked per governance rules.
            </p>
          </div>
        )}

        {/* Edit Controls */}
        {item.editableFields.length > 0 && (
          <div className={`flex items-center justify-between pt-3 border-t ${item.isPreCO ? 'border-orange-200' : 'border-slate-200'}`}>
            <div className="text-xs text-slate-600 flex items-center gap-2">
              {item.isPreCO ? (
                <>
                  <Unlock className="w-3 h-3" />
                  {item.editableFields.length} field{item.editableFields.length > 1 ? 's' : ''} editable (Pre-CO)
                </>
              ) : (
                <>
                  {item.editableFields.length} field{item.editableFields.length > 1 ? 's' : ''} editable pre-CCO
                </>
              )}
            </div>
            {editMode ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditedItem(item);
                    setEditMode(false);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-sm font-medium text-sm"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                data-testid="edit-item-btn"
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm font-medium text-sm"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 px-6">
        <div className="flex gap-4">
          {['details', 'blockers', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-${tab}`}
              className={`py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
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
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Identity */}
            <Section title="Identity" icon={<Database className="w-4 h-4 text-slate-400" />}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Item Number" value={item.itemNumber} locked />
                <Field label="Revision" value={item.revision} locked />
                <Field label="Commodity" value={item.commodity} locked />
                <Field label="Plant" value={item.plant} locked />
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Database className="w-3 h-3" />
                Source: {item.dataSource.identity}
              </div>
            </Section>

            {/* Ownership */}
            <Section title="Ownership">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Engineering Owner" value={item.engOwner} locked />
                <Field label="Procurement Owner" value={item.procurementOwner} locked />
                <Field label="AME Owner" value={item.ameOwner} locked />
                <Field label="Quality Owner" value={item.qualityOwner} locked />
              </div>
            </Section>

            {/* Procurement */}
            <Section title="Procurement" icon={<Database className="w-4 h-4 text-slate-400" />}>
              <div className="mb-4 p-3 bg-slate-50 rounded-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">Make/Buy:</span>
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

              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <Field label="PPAP Required" value={item.ppapRequired ? 'Yes' : 'No'} locked />
                <Field label="PPAP Status" value={item.ppapStatus} locked />
                <Field label="Country of Origin" value={item.coo || 'TBD'} locked />
                <Field label="Trade Compliance" value={item.tradeComplianceStatus} locked />
              </div>
            </Section>

            {/* Governance */}
            <Section title="Governance">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Lifecycle State" value={item.lifecycleState} locked />
                <Field label="CO Number" value={item.pendingCONumber || 'N/A'} locked />
                <Field label="CO Status" value={item.coStatus} locked />
                <Field label="Orderable" value={item.orderable ? 'Yes' : 'No'} locked />
              </div>
            </Section>

            {/* Multi-Org Orderability */}
            <Section title="Multi-Org Orderability">
              <div className="space-y-3">
                {item.orgOrderability.map((org) => (
                  <div key={org.org} className="border border-slate-200 rounded-sm p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{org.org}</span>
                      <span className={`status-badge ${org.orderable ? 'status-ready' : 'status-blocked'}`}>
                        {org.orderable ? 'Orderable' : 'Not Orderable'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mb-1">
                      Supplier Setup: <span className="font-medium">{org.supplierSetup ? 'Yes' : 'No'}</span>
                    </div>
                    {org.blockers.length > 0 && (
                      <div className="text-xs text-red-600 mt-2">
                        <div className="font-medium mb-1">Blockers:</div>
                        <ul className="list-disc list-inside space-y-0.5">
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-sm flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-slate-600">No blockers for this item</p>
              </div>
            ) : (
              <div className="space-y-4">
                {item.blockers.map((blocker, index) => (
                  <div
                    key={index}
                    className={`border rounded-sm p-4 ${getSeverityColor(blocker.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="status-badge bg-white/50 border-current">{blocker.category}</span>
                        <span className="status-badge bg-white/50 border-current uppercase">{blocker.severity}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        {blocker.agingDays} days
                      </div>
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1">{blocker.description}</h4>
                    <p className="text-sm text-slate-600 mb-2">{blocker.notes}</p>
                    <div className="text-xs">
                      Owner: <span className="font-medium">{blocker.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
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
      <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
        <div className="text-xs text-slate-500 font-mono">
          Last updated: {item.lastUpdated}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
    <h3 className="text-sm font-display font-semibold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
      {title}
      {icon}
    </h3>
    {children}
  </div>
);

const Field = ({ label, value, locked = false, editable = false, onChange }) => (
  <div>
    <label className="text-xs text-slate-600 mb-1 flex items-center gap-1 uppercase tracking-wide">
      {label}
      {locked && <Lock className="w-3 h-3 text-slate-400" />}
      {editable && <Unlock className="w-3 h-3 text-orange-600" />}
    </label>
    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-8 px-2 text-sm bg-orange-50 border border-orange-300 rounded-sm"
      />
    ) : (
      <div className={`text-sm font-medium font-mono ${locked ? 'text-slate-600' : 'text-slate-900'}`}>
        {value || '-'}
      </div>
    )}
  </div>
);

const HistoryEntry = ({ date, user, action, source }) => (
  <div className="flex gap-3 text-sm border-l-2 border-slate-200 pl-3 py-1">
    <div className="flex-1">
      <div className="text-slate-900">{action}</div>
      <div className="text-xs text-slate-500 mt-0.5 font-mono">
        {user} • {date}
        <span className="ml-2 inline-flex items-center gap-1">
          <Database className="w-3 h-3" />
          {source}
        </span>
      </div>
    </div>
  </div>
);

export default ItemDetailDrawer;
