import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Pencil } from 'lucide-react';

// System source tag component
const SystemTag = ({ system }) => {
  const colors = {
    PD: 'bg-blue-100 text-blue-700 border-blue-300',
    EBS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    DataZen: 'bg-purple-100 text-purple-700 border-purple-300',
    Workbench: 'bg-slate-100 text-slate-700 border-slate-300',
    Editable: 'bg-orange-100 text-orange-700 border-orange-300'
  };

  const labels = {
    PD: 'PD',
    EBS: 'ALICE ERP',
    DataZen: 'Data Zen',
    Workbench: 'Item Workbench',
    Editable: 'Editable (Pre-CO)'
  };

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${colors[system]}`}>
      {labels[system]}
    </span>
  );
};

// Field component
const Field = ({ label, value, system, fullWidth = false }) => {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs font-medium text-slate-700">{label}</label>
        <SystemTag system={system} />
      </div>
      <div className="relative text-sm text-slate-900 px-2 py-1.5 rounded bg-slate-50 border border-slate-200">
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
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs font-medium text-slate-700">{label}</label>
        <SystemTag system={inAlice ? 'EBS' : 'Editable'} />
      </div>
      <div
        className={`relative text-sm text-slate-900 px-2 py-1.5 rounded ${
          isEditable
            ? 'bg-orange-50 hover:bg-orange-100 cursor-text border border-orange-200' 
            : 'bg-slate-50 border border-slate-200'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={inAlice ? 'Data from ALICE ERP - Read Only' : !coOpen ? 'Read Only - CO Closed' : 'Editable (Pre-CO Closure)'}
      >
        <div className="flex items-center justify-between">
          <span className={!isEditable ? 'text-slate-700' : ''}>{value || '-'}</span>
          {isEditable && isHovered && (
            <Pencil className="w-3 h-3 text-orange-600" />
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
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[520px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right" data-testid="item-detail-drawer">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-slate-50 border-slate-200 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Item Details – {item.itemNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-1">System-level breakdown by function</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-1"
              data-testid="close-drawer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-600 font-medium mr-1">Legend:</span>
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
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'bu-engineering' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Quantity" value="1 EA" system="PD" />
                <Field label="Sourcing Rule" value={item.makeBuy} system="EBS" />
              </div>

              {/* MPN Structure */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Approved Manufacturer Parts</h4>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                    {mpns.length} MPN{mpns.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {mpns.map((mpn) => (
                    <div key={mpn.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleMPN(mpn.id)}
                        className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedMPNs.has(mpn.id) ? (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )}
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{mpn.mpn}</span>
                              <SystemTag system="PD" />
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">{mpn.manufacturer}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          mpn.status === 'Preferred' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {mpn.status}
                        </span>
                      </button>

                      {expandedMPNs.has(mpn.id) && (
                        <div className="bg-white">
                          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
                            <span className="text-xs font-semibold text-slate-700">Suppliers ({mpn.suppliers.length})</span>
                          </div>

                          <div className="divide-y divide-slate-200">
                            {mpn.suppliers.map((supplier) => (
                              <div key={supplier.id}>
                                <button
                                  onClick={() => toggleSupplier(supplier.id)}
                                  className={`w-full px-6 py-2.5 flex items-center justify-between transition-colors ${
                                    supplier.inAlice ? 'hover:bg-emerald-50' : 'hover:bg-orange-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {expandedSuppliers.has(supplier.id) ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                    <span className="text-sm font-medium text-slate-900">{supplier.supplier}</span>
                                    <SystemTag system={supplier.inAlice ? 'EBS' : 'Editable'} />
                                  </div>
                                  {supplier.bpa && (
                                    <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded">BPA Active</span>
                                  )}
                                </button>

                                {expandedSuppliers.has(supplier.id) && (
                                  <div className="px-6 py-4 bg-slate-50">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Disposition (PD)</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="On Order" value="Use Up" system="PD" />
                  <Field label="Stock" value="Use Up" system="PD" />
                  <Field label="WIP" value="Use Up" system="PD" />
                  <Field label="FGI" value="Use Up" system="PD" />
                  <Field label="Hub" value="Use Up" system="PD" />
                  <Field label="Field" value="Use Up" system="PD" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">ERP Status</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="CCO #" value={item.ccoStatus !== 'N/A' ? 'CCO-2024-001' : '-'} system="EBS" />
                  <Field label="CCO Status" value={item.ccoStatus} system="EBS" />
                  <Field label="Planner" value="Sarah Chen" system="EBS" />
                  <Field label="Buyer" value="Mike Rodriguez" system="EBS" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ame-me' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Buy Type" value="External" system="Workbench" />
              <Field label="Template" value="Standard Buy" system="Workbench" />
              <Field label="User Item Type" value="Purchased" system="Workbench" />
              <Field label="WIP Supply" value="Push" system="Workbench" />
              <Field label="Serial Control" value="None" system="Workbench" />
              <Field label="ERP Notes" value="Standard procurement process" system="Workbench" fullWidth />
            </div>
          )}

          {activeTab === 'misc' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
