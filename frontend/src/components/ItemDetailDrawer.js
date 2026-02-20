import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Pencil, Sparkles } from 'lucide-react';

// System source tag component
const SystemTag = ({ system }) => {
  const configs = {
    PD: { 
      bg: 'bg-gradient-to-r from-blue-100 to-blue-200', 
      text: 'text-blue-700', 
      border: 'border-blue-300',
      label: 'PD'
    },
    EBS: { 
      bg: 'bg-gradient-to-r from-emerald-100 to-emerald-200', 
      text: 'text-emerald-700', 
      border: 'border-emerald-300',
      label: 'ALICE ERP'
    },
    DataZen: { 
      bg: 'bg-gradient-to-r from-purple-100 to-purple-200', 
      text: 'text-purple-700', 
      border: 'border-purple-300',
      label: 'Data Zen'
    },
    Workbench: { 
      bg: 'bg-gradient-to-r from-slate-100 to-slate-200', 
      text: 'text-slate-700', 
      border: 'border-slate-300',
      label: 'Item Workbench'
    },
    Editable: { 
      bg: 'bg-gradient-to-r from-orange-100 to-orange-200', 
      text: 'text-orange-700', 
      border: 'border-orange-300',
      label: 'Editable'
    }
  };

  const config = configs[system] || configs.Workbench;

  return (
    <span className={`source-tag ${config.bg} ${config.text} border ${config.border}`}>
      {config.label}
    </span>
  );
};

// Field component
const Field = ({ label, value, system, fullWidth = false }) => {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <SystemTag system={system} />
      </div>
      <div className="relative text-sm text-slate-900 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
        <span>{value || '-'}</span>
      </div>
    </div>
  );
};

// Editable field component
const EditableField = ({ label, value, coOpen = true, inAlice = false, fullWidth = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isEditable = coOpen && !inAlice;

  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <SystemTag system={inAlice ? 'EBS' : 'Editable'} />
      </div>
      <div
        className={`relative text-sm text-slate-900 px-3 py-2.5 rounded-xl transition-all ${
          isEditable
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 cursor-text border-2 border-orange-200 hover:border-orange-300 shadow-sm' 
            : 'bg-slate-50 border border-slate-200 shadow-sm'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={inAlice ? 'Data from ALICE ERP - Read Only' : !coOpen ? 'Read Only - CO Closed' : 'Editable (Pre-CO Closure)'}
      >
        <div className="flex items-center justify-between">
          <span className={!isEditable ? 'text-slate-700' : ''}>{value || '-'}</span>
          {isEditable && isHovered && (
            <Pencil className="w-3.5 h-3.5 text-orange-500" />
          )}
        </div>
      </div>
    </div>
  );
};

const ItemDetailDrawer = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState('bu-engineering');
  
  // Sample MPN data
  const [mpns] = useState([
    {
      id: 'mpn-1',
      manufacturer: 'Texas Instruments',
      mpn: 'TPS54340DDAR',
      status: 'Active',
      suppliers: [
        {
          id: 'sup-1',
          supplier: 'Arrow Electronics',
          coo: 'CCO-2024-001',
          bpa: true,
          bpaPrice: '$2.45',
          toolingCost: '$0',
          moq: '1000',
          leadTimePre: '2 days',
          leadTimeProcessing: '5 days',
          leadTimePost: '3 days',
          inAlice: true
        },
        {
          id: 'sup-2',
          supplier: 'Mouser Electronics',
          coo: 'CCO-2024-002',
          bpa: false,
          bpaPrice: '$2.67',
          toolingCost: '$0',
          moq: '500',
          leadTimePre: '1 day',
          leadTimeProcessing: '7 days',
          leadTimePost: '2 days',
          inAlice: false
        }
      ]
    }
  ]);

  const [expandedMPNs, setExpandedMPNs] = useState(new Set(['mpn-1']));
  const [expandedSuppliers, setExpandedSuppliers] = useState(new Set(['sup-1']));

  const toggleMPN = (id) => {
    const newSet = new Set(expandedMPNs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedMPNs(newSet);
  };

  const toggleSupplier = (id) => {
    const newSet = new Set(expandedSuppliers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSuppliers(newSet);
  };

  const tabs = [
    { id: 'bu-engineering', label: 'BU Engineering' },
    { id: 'procurement', label: 'Procurement' },
    { id: 'co', label: 'CO' },
    { id: 'ame-me', label: 'AME/ME' },
    { id: 'misc', label: 'Misc' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="drawer-overlay fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="drawer-modern fixed top-0 right-0 bottom-0 w-[560px] z-50 flex flex-col animate-slide-in-right" data-testid="item-detail-drawer">
        {/* Header */}
        <div className="border-b px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-slate-200 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Item Details – {item.itemNumber}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">System-level breakdown by function</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              data-testid="close-drawer-btn"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 font-semibold">Legend:</span>
            <SystemTag system="PD" />
            <SystemTag system="EBS" />
            <SystemTag system="Workbench" />
            <SystemTag system="Editable" />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-slate-900 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'bu-engineering' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Created By" value="John Smith" system="PD" />
              <Field label="Status" value={item.lifecycleStage} system="PD" />
              <Field label="Change Category" value="Standard" system="PD" />
              <Field label="Reason Code" value="New Product" system="PD" />
              <Field label="Project ID" value="PRJ-2024-001" system="PD" />
              <Field label="CO Release Date" value="2024-01-15" system="PD" />
              <Field label="Item Sequence" value="10" system="PD" />
              <Field label="Quantity" value="1 EA" system="PD" />
              <Field label="Line of Business" value="Power Systems" system="PD" />
              <Field label="Design Center" value="Columbus" system="PD" />
              <Field label="Destination ERP" value="ALICE" system="PD" />
              <Field label="RoHS Required" value="Yes" system="PD" />
              <Field label="Product Line" value="UPS" system="PD" />
              <Field label="Estimated Annual Usage" value="50,000" system="PD" />
              <Field label="Weight" value="0.05 lbs" system="PD" />
              <Field label="Item Notes" value={item.description} system="PD" fullWidth />
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Quantity" value="1 EA" system="PD" />
                <Field label="Sourcing Rule" value={item.makeBuy} system="EBS" />
              </div>

              {/* MPN Structure */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Approved Manufacturer Parts</h4>
                  <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200 font-semibold text-slate-600">
                    {mpns.length} MPN{mpns.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {mpns.map((mpn) => (
                    <div key={mpn.id} className="card-elevated overflow-hidden">
                      <button
                        onClick={() => toggleMPN(mpn.id)}
                        className="w-full px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {expandedMPNs.has(mpn.id) ? (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          )}
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{mpn.mpn}</span>
                              <SystemTag system="PD" />
                            </div>
                            <div className="text-xs text-slate-600 mt-1">{mpn.manufacturer}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${
                          mpn.status === 'Preferred' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {mpn.status}
                        </span>
                      </button>

                      {expandedMPNs.has(mpn.id) && (
                        <div className="bg-white">
                          <div className="px-5 py-3 bg-slate-100 border-t border-slate-200">
                            <span className="text-xs font-bold text-slate-700">Suppliers ({mpn.suppliers.length})</span>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {mpn.suppliers.map((supplier) => (
                              <div key={supplier.id}>
                                <button
                                  onClick={() => toggleSupplier(supplier.id)}
                                  className={`w-full px-6 py-3 flex items-center justify-between transition-colors ${
                                    supplier.inAlice ? 'hover:bg-emerald-50' : 'hover:bg-orange-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {expandedSuppliers.has(supplier.id) ? (
                                      <ChevronDown className="w-4 h-4 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-400" />
                                    )}
                                    <span className="text-sm font-semibold text-slate-900">{supplier.supplier}</span>
                                    <SystemTag system={supplier.inAlice ? 'EBS' : 'Editable'} />
                                  </div>
                                  {supplier.bpa && (
                                    <span className="text-xs px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-sm">BPA Active</span>
                                  )}
                                </button>

                                {expandedSuppliers.has(supplier.id) && (
                                  <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                      <EditableField label="Supplier" value={supplier.supplier} inAlice={supplier.inAlice} />
                                      <EditableField label="COO" value={supplier.coo} inAlice={supplier.inAlice} />
                                      <EditableField label="BPA" value={supplier.bpa ? 'Yes' : 'No'} inAlice={supplier.inAlice} />
                                      <EditableField label="BPA Price" value={supplier.bpaPrice} inAlice={supplier.inAlice} />
                                      <EditableField label="MOQ" value={supplier.moq} inAlice={supplier.inAlice} />
                                      <EditableField label="Tooling Cost" value={supplier.toolingCost} inAlice={supplier.inAlice} />
                                      <EditableField label="Lead Time – Pre" value={supplier.leadTimePre} inAlice={supplier.inAlice} />
                                      <EditableField label="Lead Time – Processing" value={supplier.leadTimeProcessing} inAlice={supplier.inAlice} />
                                      <EditableField label="Lead Time – Post" value={supplier.leadTimePost} inAlice={supplier.inAlice} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'co' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wide">Disposition (PD)</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="On Order" value="Use Up" system="PD" />
                  <Field label="Stock" value="Use Up" system="PD" />
                  <Field label="WIP" value="Use Up" system="PD" />
                  <Field label="FGI" value="Use Up" system="PD" />
                  <Field label="Hub" value="Use Up" system="PD" />
                  <Field label="Field" value="Use Up" system="PD" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wide">ERP Status</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="CCO #" value={item.ccoStatus !== 'N/A' ? 'CCO-2024-001' : '-'} system="EBS" />
                  <Field label="CCO Status" value={item.ccoStatus} system="EBS" />
                  <Field label="Planner" value="Sarah Chen" system="EBS" />
                  <Field label="Buyer" value="Mike Rodriguez" system="EBS" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ame-me' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Buy Type" value="External" system="Workbench" />
              <Field label="Template" value="Standard Buy" system="Workbench" />
              <Field label="User Item Type" value="Purchased" system="Workbench" />
              <Field label="WIP Supply" value="Push" system="Workbench" />
              <Field label="Serial Control" value="None" system="Workbench" />
              <Field label="ERP Notes" value="Standard procurement process" system="Workbench" fullWidth />
            </div>
          )}

          {activeTab === 'misc' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Preferred Part" value="Y" system="PD" />
              <Field label="Serialization Required" value="N" system="PD" />
              <Field label="FAI Required" value={item.ppapRequired ? 'Level 1' : '-'} system="PD" />
              <Field label="FAI Complete" value={item.ppapStatus === 'Complete' ? 'Y' : 'N'} system="PD" />
              <Field label="TAA Compliant" value="Yes" system="Workbench" />
              <Field label="BABA" value="N/A" system="Workbench" />
              <Field label="Receipt Routing" value="Direct" system="EBS" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemDetailDrawer;
