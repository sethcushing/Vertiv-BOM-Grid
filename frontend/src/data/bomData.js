// Vertiv BOM Grid - V23 Data Model with Lifecycle Stages
// All items are mastered in PLM - no Pre-CO workspace concept

export const sampleBOMData = [
  // Top-level assembly
  {
    id: '1',
    level: 0,
    itemNumber: 'ASM-12000',
    revision: 'A',
    description: 'Main Power Distribution Unit',
    commodity: 'Electrical Assembly',
    plant: 'Columbus, OH',
    
    // V23: Lifecycle Stage replaces isPreCO
    lifecycleStage: 'CO Approved',
    isNewPart: true,
    aml: 0, // Approved Manufacturer List count
    
    engOwner: 'Sarah Chen',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: 'Mike Johnson',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-15',
    
    makeBuy: 'Make',
    potentialSupplier: 'Multiple',
    approvedSupplier: '',
    supplier: 'Multiple',
    quoteStatus: 'Partial',
    quoteReceivedDate: '2026-01-22',
    supplierSetupInERP: true,
    leadTime: 84,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: true, blockers: ['Missing component quotes'] },
      { org: 'Monterrey', orderable: false, supplierSetup: true, blockers: ['Missing component quotes', 'PPAP pending'] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': true },
    
    ppapRequired: true,
    ppapStatus: 'In Progress',
    coo: 'USA',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: true,
    lltFlag: true,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Pending',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [
      {
        category: 'Procurement',
        description: 'Missing quotes for 3 critical components',
        owner: 'Mike Johnson',
        agingDays: 12,
        notes: 'Supplier RFQ sent 2026-01-31, follow-up scheduled',
        severity: 'high'
      }
    ],
    blockerAging: 12,
    blockingCount: 245,
    
    designReadiness: 100,
    procurementReadiness: 65,
    manufacturingReadiness: 90,
    qualityReadiness: 70,
    overallReadiness: 81,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-15',
      quoteToApproval: '2026-01-22'
    },
    
    isAssembly: true,
    hasChildren: true,
    parentId: null,
    isExpanded: true,
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: ['itemNumber', 'revision', 'commodity', 'designStatus', 'lifecycleStage'],
    editableFields: [],
    lastUpdated: '2026-02-12 08:30:00'
  },
  
  // Level 1 - Sub-assembly 1
  {
    id: '2',
    level: 1,
    itemNumber: 'ASM-12100',
    revision: 'B',
    description: 'Primary Circuit Board Assembly',
    commodity: 'PCB Assembly',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Orderable',
    isNewPart: false,
    aml: 2,
    
    engOwner: 'Sarah Chen',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-10',
    
    makeBuy: 'Make',
    potentialSupplier: 'TechCircuits Inc',
    approvedSupplier: 'TechCircuits Inc',
    supplier: 'TechCircuits Inc',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-18',
    supplierSetupInERP: true,
    leadTime: 45,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: true, supplierSetup: true, blockers: [] },
      { org: 'Monterrey', orderable: true, supplierSetup: true, blockers: [] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': true },
    
    ppapRequired: true,
    ppapStatus: 'Approved',
    coo: 'USA',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: true,
    lltFlag: false,
    effectivityStartDate: '2026-03-01',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Complete',
    orderable: true,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 100,
    manufacturingReadiness: 100,
    qualityReadiness: 100,
    overallReadiness: 100,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-10',
      quoteToApproval: '2026-01-18',
      approvalToOrderable: '2026-02-11'
    },
    
    isAssembly: true,
    hasChildren: true,
    parentId: '1',
    isExpanded: true,
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: [],
    lastUpdated: '2026-02-11 14:22:00'
  },
  
  // Level 2 - Component under ASM-12100
  {
    id: '3',
    level: 2,
    itemNumber: 'PCB-5500',
    revision: 'A',
    description: 'Bare PCB - Main Controller',
    commodity: 'PCB',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Orderable',
    isNewPart: false,
    aml: 4,
    
    engOwner: 'David Park',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-08',
    
    makeBuy: 'Buy',
    potentialSupplier: 'PCB Dynamics',
    approvedSupplier: 'PCB Dynamics',
    supplier: 'PCB Dynamics',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-15',
    supplierSetupInERP: true,
    leadTime: 28,
    hasBPA: true,
    orgOrderability: [
      { org: 'Columbus', orderable: true, supplierSetup: true, blockers: [] },
      { org: 'Monterrey', orderable: true, supplierSetup: true, blockers: [] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': true },
    
    ppapRequired: true,
    ppapStatus: 'Approved',
    coo: 'Taiwan',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: true,
    lltFlag: false,
    effectivityStartDate: '2026-03-01',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Complete',
    orderable: true,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 100,
    manufacturingReadiness: 100,
    qualityReadiness: 100,
    overallReadiness: 100,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-08',
      quoteToApproval: '2026-01-15',
      approvalToOrderable: '2026-02-09'
    },
    
    isAssembly: false,
    hasChildren: false,
    parentId: '2',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: [],
    lastUpdated: '2026-02-09 10:15:00'
  },
  
  {
    id: '4',
    level: 2,
    itemNumber: 'IC-7720',
    revision: 'C',
    description: 'Microcontroller - ARM Cortex M4',
    commodity: 'Semiconductor',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'CO Approved',
    isNewPart: true,
    aml: 0,
    
    engOwner: 'David Park',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: 'Mike Johnson',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-12',
    
    makeBuy: 'Buy',
    potentialSupplier: 'Microchip Technology',
    approvedSupplier: '',
    supplier: 'TBD',
    quoteStatus: 'Pending',
    quoteReceivedDate: '',
    supplierSetupInERP: false,
    leadTime: 0,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Quote not received', 'Supplier not set up'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Quote not received', 'Supplier not set up', 'PPAP not started'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: true,
    ppapStatus: 'Not Started',
    coo: 'TBD',
    tradeComplianceStatus: 'Pending',
    
    manufacturingReviewed: true,
    lltFlag: true,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Pending',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [
      {
        category: 'Procurement',
        description: 'Quote not received from supplier',
        owner: 'Mike Johnson',
        agingDays: 18,
        notes: 'Critical semiconductor - supply constrained. Escalated to director level.',
        severity: 'critical',
        org: 'Columbus'
      },
      {
        category: 'Procurement',
        description: 'Supplier not set up in ERP',
        owner: 'Mike Johnson',
        agingDays: 18,
        notes: 'Waiting for quote confirmation before initiating setup',
        severity: 'high',
        org: 'Monterrey'
      }
    ],
    blockerAging: 18,
    blockingCount: 245,
    
    designReadiness: 100,
    procurementReadiness: 20,
    manufacturingReadiness: 80,
    qualityReadiness: 0,
    overallReadiness: 50,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-12'
    },
    
    isAssembly: false,
    hasChildren: false,
    parentId: '2',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'CPQ',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: ['itemNumber', 'revision', 'designStatus'],
    editableFields: ['quoteStatus', 'supplier', 'leadTime'],
    lastUpdated: '2026-02-12 07:45:00'
  },
  
  {
    id: '5',
    level: 2,
    itemNumber: 'RES-2210',
    revision: 'A',
    description: 'Resistor 10K 0805 1%',
    commodity: 'Passive Component',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Orderable',
    isNewPart: false,
    aml: 5,
    
    engOwner: 'David Park',
    procurementOwner: 'Jennifer Lee',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-05',
    
    makeBuy: 'Buy',
    potentialSupplier: 'Vishay',
    approvedSupplier: 'Vishay',
    supplier: 'Vishay',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-12',
    supplierSetupInERP: true,
    leadTime: 14,
    hasBPA: true,
    orgOrderability: [
      { org: 'Columbus', orderable: true, supplierSetup: true, blockers: [] },
      { org: 'Monterrey', orderable: true, supplierSetup: false, blockers: ['Supplier not approved for Monterrey'] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': false },
    
    ppapRequired: false,
    ppapStatus: 'N/A',
    coo: 'China',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: true,
    lltFlag: false,
    effectivityStartDate: '2026-03-01',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Complete',
    orderable: true,
    isSustainingCO: true,
    lifecycleState: 'Released',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 100,
    manufacturingReadiness: 100,
    qualityReadiness: 100,
    overallReadiness: 100,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-05',
      quoteToApproval: '2026-01-12',
      approvalToOrderable: '2026-02-08'
    },
    
    isAssembly: false,
    hasChildren: false,
    parentId: '2',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: [],
    lastUpdated: '2026-02-08 16:30:00'
  },
  
  // Level 1 - Sub-assembly 2
  {
    id: '6',
    level: 1,
    itemNumber: 'ASM-12200',
    revision: 'A',
    description: 'Power Supply Module',
    commodity: 'Power Supply',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'CCO In Progress',
    isNewPart: true,
    aml: 1,
    
    engOwner: 'Robert Kim',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: 'Lisa Martinez',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-20',
    
    makeBuy: 'Buy',
    potentialSupplier: 'PowerTech Systems',
    approvedSupplier: 'PowerTech Systems',
    supplier: 'PowerTech Systems',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-28',
    supplierSetupInERP: true,
    leadTime: 56,
    hasBPA: true,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: true, blockers: ['PPAP incomplete', 'AME review pending'] },
      { org: 'Monterrey', orderable: true, supplierSetup: true, blockers: [] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': true },
    
    ppapRequired: true,
    ppapStatus: 'Submitted',
    coo: 'Mexico',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: false,
    lltFlag: false,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'In Progress',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [
      {
        category: 'Quality',
        description: 'PPAP documentation incomplete',
        owner: 'Lisa Martinez',
        agingDays: 8,
        notes: 'Missing dimensional inspection report, supplier contacted',
        severity: 'medium',
        org: 'Columbus'
      },
      {
        category: 'Manufacturing',
        description: 'AME review not complete',
        owner: 'Tom Williams',
        agingDays: 5,
        notes: 'Scheduled for review 2026-02-14',
        severity: 'low',
        org: 'Columbus'
      }
    ],
    blockerAging: 8,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 100,
    manufacturingReadiness: 50,
    qualityReadiness: 60,
    overallReadiness: 78,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-20',
      quoteToApproval: '2026-01-28'
    },
    
    isAssembly: true,
    hasChildren: false,
    parentId: '1',
    isExpanded: false,
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: ['itemNumber', 'revision'],
    editableFields: [],
    lastUpdated: '2026-02-12 09:15:00'
  },
  
  {
    id: '7',
    level: 1,
    itemNumber: 'ENCL-8100',
    revision: 'A',
    description: 'Aluminum Enclosure - Custom',
    commodity: 'Sheet Metal',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Orderable',
    isNewPart: false,
    aml: 3,
    
    engOwner: 'Sarah Chen',
    procurementOwner: 'Jennifer Lee',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-18',
    
    makeBuy: 'Buy',
    potentialSupplier: 'Precision Metalworks',
    approvedSupplier: 'Precision Metalworks',
    supplier: 'Precision Metalworks',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-25',
    supplierSetupInERP: true,
    leadTime: 42,
    hasBPA: true,
    orgOrderability: [
      { org: 'Columbus', orderable: true, supplierSetup: true, blockers: [] },
      { org: 'Monterrey', orderable: true, supplierSetup: true, blockers: [] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': true },
    
    ppapRequired: true,
    ppapStatus: 'Approved',
    coo: 'USA',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: true,
    lltFlag: false,
    effectivityStartDate: '2026-02-01',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Complete',
    orderable: true,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 100,
    manufacturingReadiness: 100,
    qualityReadiness: 100,
    overallReadiness: 100,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-18',
      quoteToApproval: '2026-01-25',
      approvalToOrderable: '2026-02-01'
    },
    
    isAssembly: false,
    hasChildren: false,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: [],
    lastUpdated: '2026-02-10 11:20:00'
  },
  
  {
    id: '8',
    level: 1,
    itemNumber: 'WIRE-4400',
    revision: 'A',
    description: 'Wire Harness - Main Power',
    commodity: 'Wire & Cable',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Draft',
    isNewPart: true,
    aml: 0,
    
    engOwner: 'Robert Kim',
    procurementOwner: 'Jennifer Lee',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: 'Jennifer Lee',
    
    designStatus: 'Prototype',
    designReadyToQuoteDate: '2026-02-20',
    
    makeBuy: 'TBD',
    potentialSupplier: 'Delphi Connection Systems',
    approvedSupplier: '',
    supplier: 'TBD',
    quoteStatus: 'Not Started',
    quoteReceivedDate: '',
    supplierSetupInERP: false,
    leadTime: 0,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Design not ready', 'Supplier not identified'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Design not ready', 'Supplier not identified'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: true,
    ppapStatus: 'Not Started',
    coo: 'TBD',
    tradeComplianceStatus: 'N/A',
    
    manufacturingReviewed: false,
    lltFlag: false,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: '',
    coStatus: 'Draft',
    ccoStatus: 'N/A',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Draft',
    
    blockers: [
      {
        category: 'Design',
        description: 'Design not ready for quoting',
        owner: 'Robert Kim',
        agingDays: 3,
        notes: 'Prototype testing in progress, release expected 2026-02-18',
        severity: 'medium'
      },
      {
        category: 'Procurement',
        description: 'Supplier not identified',
        owner: 'Jennifer Lee',
        agingDays: 3,
        notes: 'Waiting for design freeze before sourcing',
        severity: 'low'
      }
    ],
    blockerAging: 3,
    blockingCount: 0,
    
    designReadiness: 70,
    procurementReadiness: 0,
    manufacturingReadiness: 0,
    qualityReadiness: 0,
    overallReadiness: 18,
    
    readinessTimestamps: {},
    
    isAssembly: false,
    hasChildren: false,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'CPQ',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: ['quoteStatus', 'supplier'],
    lastUpdated: '2026-02-12 08:00:00'
  },
  
  {
    id: '9',
    level: 1,
    itemNumber: 'FAN-3300',
    revision: 'B',
    description: 'Cooling Fan 120mm 24VDC',
    commodity: 'Thermal Management',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'CO Submitted',
    isNewPart: true,
    aml: 1,
    
    engOwner: 'Sarah Chen',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: 'Mike Johnson',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-14',
    
    makeBuy: 'Buy',
    potentialSupplier: 'Sunon',
    approvedSupplier: '',
    supplier: 'Sunon',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-22',
    supplierSetupInERP: false,
    leadTime: 35,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Supplier not set up in ERP'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Supplier not set up in ERP', 'PPAP not started'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: true,
    ppapStatus: 'Not Started',
    coo: 'Taiwan',
    tradeComplianceStatus: 'Pending',
    
    manufacturingReviewed: true,
    lltFlag: false,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Submitted',
    ccoStatus: 'Pending',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'In Review',
    
    blockers: [
      {
        category: 'Procurement',
        description: 'Supplier not set up in ERP',
        owner: 'Mike Johnson',
        agingDays: 6,
        notes: 'ERP setup request submitted 2026-02-06, pending finance approval',
        severity: 'medium'
      }
    ],
    blockerAging: 6,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 80,
    manufacturingReadiness: 100,
    qualityReadiness: 30,
    overallReadiness: 78,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-14',
      quoteToApproval: '2026-01-22'
    },
    
    isAssembly: false,
    hasChildren: false,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: ['itemNumber', 'revision'],
    editableFields: [],
    lastUpdated: '2026-02-11 15:40:00'
  },
  
  {
    id: '10',
    level: 1,
    itemNumber: 'CONN-6650',
    revision: 'A',
    description: 'Power Connector - IEC C14',
    commodity: 'Connector',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Orderable',
    isNewPart: false,
    aml: 3,
    
    engOwner: 'David Park',
    procurementOwner: 'Jennifer Lee',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Released',
    designReadyToQuoteDate: '2026-01-10',
    
    makeBuy: 'Buy',
    potentialSupplier: 'TE Connectivity',
    approvedSupplier: 'TE Connectivity',
    supplier: 'TE Connectivity',
    quoteStatus: 'Received',
    quoteReceivedDate: '2026-01-17',
    supplierSetupInERP: true,
    leadTime: 21,
    hasBPA: true,
    orgOrderability: [
      { org: 'Columbus', orderable: true, supplierSetup: true, blockers: [] },
      { org: 'Monterrey', orderable: true, supplierSetup: true, blockers: [] }
    ],
    supplierSetupByOrg: { 'Columbus': true, 'Monterrey': true },
    
    ppapRequired: false,
    ppapStatus: 'N/A',
    coo: 'USA',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: true,
    lltFlag: false,
    effectivityStartDate: '2026-01-22',
    effectivityEndDate: '',
    
    pendingCONumber: 'CO-2026-001',
    coStatus: 'Released',
    ccoStatus: 'Complete',
    orderable: true,
    isSustainingCO: false,
    lifecycleState: 'Released',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 100,
    procurementReadiness: 100,
    manufacturingReadiness: 100,
    qualityReadiness: 100,
    overallReadiness: 100,
    
    readinessTimestamps: {
      designToReadyToQuote: '2026-01-10',
      quoteToApproval: '2026-01-17',
      approvalToOrderable: '2026-01-22'
    },
    
    isAssembly: false,
    hasChildren: false,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'ERP',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: [],
    lastUpdated: '2026-02-09 13:25:00'
  },
  
  // V23: Items previously marked as "Pre-CO" now have lifecycleStage: 'Draft' or 'Ready for CO'
  // All items come from PLM - no more TEMP-xxx item numbers in production
  {
    id: '11',
    level: 1,
    itemNumber: '100-0045-00',
    revision: 'A',
    description: 'Battery Backup Module - New Design',
    commodity: 'Power Management',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Draft',
    isNewPart: true,
    aml: 0,
    
    engOwner: 'Sarah Chen',
    procurementOwner: 'Jennifer Lee',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Draft',
    designReadyToQuoteDate: '2026-02-25',
    
    makeBuy: 'TBD',
    potentialSupplier: 'PowerCell Inc',
    approvedSupplier: '',
    supplier: 'TBD',
    quoteStatus: 'Not Started',
    quoteReceivedDate: '',
    supplierSetupInERP: false,
    leadTime: 0,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Draft item - not released'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Draft item - not released'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: false,
    ppapStatus: 'N/A',
    coo: 'TBD',
    tradeComplianceStatus: 'N/A',
    
    manufacturingReviewed: false,
    lltFlag: false,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: '',
    coStatus: 'Draft',
    ccoStatus: 'N/A',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Draft',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 45,
    procurementReadiness: 0,
    manufacturingReadiness: 0,
    qualityReadiness: 0,
    overallReadiness: 11,
    
    readinessTimestamps: {},
    
    isAssembly: false,
    hasChildren: false,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'CPQ',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: ['description', 'commodity', 'supplier', 'quoteStatus', 'leadTime', 'ppapRequired', 'designStatus', 'designReadyToQuoteDate'],
    lastUpdated: '2026-02-12 10:15:00'
  },
  
  {
    id: '12',
    level: 1,
    itemNumber: '100-0046-00',
    revision: 'A',
    description: 'LED Status Indicator Panel',
    commodity: 'Display',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Ready for CO',
    isNewPart: true,
    aml: 0,
    
    engOwner: 'David Park',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'In Review',
    designReadyToQuoteDate: '2026-02-18',
    
    makeBuy: 'Buy',
    potentialSupplier: 'Adafruit Industries',
    approvedSupplier: '',
    supplier: 'Adafruit Industries',
    quoteStatus: 'Requested',
    quoteReceivedDate: '',
    supplierSetupInERP: false,
    leadTime: 21,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Quote pending'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Quote pending'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: true,
    ppapStatus: 'Not Started',
    coo: 'USA',
    tradeComplianceStatus: 'Cleared',
    
    manufacturingReviewed: false,
    lltFlag: false,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: '',
    coStatus: 'Ready',
    ccoStatus: 'N/A',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'In Review',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 65,
    procurementReadiness: 25,
    manufacturingReadiness: 0,
    qualityReadiness: 0,
    overallReadiness: 23,
    
    readinessTimestamps: {},
    
    isAssembly: false,
    hasChildren: false,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'CPQ',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: ['description', 'commodity', 'supplier', 'quoteStatus', 'leadTime', 'ppapRequired', 'designStatus', 'designReadyToQuoteDate', 'coo'],
    lastUpdated: '2026-02-12 09:45:00'
  },
  
  {
    id: '13',
    level: 1,
    itemNumber: '100-0047-00',
    revision: 'A',
    description: 'EMI Filter Assembly',
    commodity: 'Electrical',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Draft',
    isNewPart: true,
    aml: 0,
    
    engOwner: 'Robert Kim',
    procurementOwner: 'Jennifer Lee',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: 'Robert Kim',
    
    designStatus: 'Concept',
    designReadyToQuoteDate: '2026-03-05',
    
    makeBuy: 'TBD',
    potentialSupplier: '',
    approvedSupplier: '',
    supplier: '',
    quoteStatus: 'Not Started',
    quoteReceivedDate: '',
    supplierSetupInERP: false,
    leadTime: 0,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Draft item - not released', 'Design concept phase'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Draft item - not released', 'Design concept phase'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: false,
    ppapStatus: 'N/A',
    coo: '',
    tradeComplianceStatus: 'N/A',
    
    manufacturingReviewed: false,
    lltFlag: false,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: '',
    coStatus: 'Draft',
    ccoStatus: 'N/A',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Draft',
    
    blockers: [
      {
        category: 'Design',
        description: 'Design concept requires validation testing',
        owner: 'Robert Kim',
        agingDays: 5,
        notes: 'Lab testing scheduled for 2026-02-15. Awaiting EMC compliance review.',
        severity: 'medium'
      }
    ],
    blockerAging: 5,
    blockingCount: 0,
    
    designReadiness: 25,
    procurementReadiness: 0,
    manufacturingReadiness: 0,
    qualityReadiness: 0,
    overallReadiness: 6,
    
    readinessTimestamps: {},
    
    isAssembly: true,
    hasChildren: true,
    parentId: '1',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'CPQ',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: ['description', 'commodity', 'supplier', 'quoteStatus', 'leadTime', 'ppapRequired', 'designStatus', 'designReadyToQuoteDate', 'coo', 'plant'],
    lastUpdated: '2026-02-12 08:20:00'
  },
  
  {
    id: '14',
    level: 2,
    itemNumber: '100-0048-00',
    revision: 'A',
    description: 'Capacitor Array - High Voltage',
    commodity: 'Passive Component',
    plant: 'Columbus, OH',
    
    lifecycleStage: 'Draft',
    isNewPart: true,
    aml: 0,
    
    engOwner: 'Robert Kim',
    procurementOwner: 'Mike Johnson',
    ameOwner: 'Tom Williams',
    qualityOwner: 'Lisa Martinez',
    blockerOwner: '',
    
    designStatus: 'Draft',
    designReadyToQuoteDate: '2026-02-22',
    
    makeBuy: 'TBD',
    potentialSupplier: 'Kemet Corp',
    approvedSupplier: '',
    supplier: 'TBD',
    quoteStatus: 'Pending Supplier Selection',
    quoteReceivedDate: '',
    supplierSetupInERP: false,
    leadTime: 0,
    hasBPA: false,
    orgOrderability: [
      { org: 'Columbus', orderable: false, supplierSetup: false, blockers: ['Draft item - not released', 'Supplier not selected'] },
      { org: 'Monterrey', orderable: false, supplierSetup: false, blockers: ['Draft item - not released', 'Supplier not selected'] }
    ],
    supplierSetupByOrg: { 'Columbus': false, 'Monterrey': false },
    
    ppapRequired: true,
    ppapStatus: 'Not Started',
    coo: '',
    tradeComplianceStatus: 'N/A',
    
    manufacturingReviewed: false,
    lltFlag: true,
    effectivityStartDate: '',
    effectivityEndDate: '',
    
    pendingCONumber: '',
    coStatus: 'Draft',
    ccoStatus: 'N/A',
    orderable: false,
    isSustainingCO: false,
    lifecycleState: 'Draft',
    
    blockers: [],
    blockerAging: 0,
    blockingCount: 0,
    
    designReadiness: 55,
    procurementReadiness: 15,
    manufacturingReadiness: 0,
    qualityReadiness: 0,
    overallReadiness: 18,
    
    readinessTimestamps: {},
    
    isAssembly: false,
    hasChildren: false,
    parentId: '13',
    
    dataSource: {
      identity: 'PLM',
      procurement: 'CPQ',
      governance: 'PLM'
    },
    
    fieldsUnderChangeControl: [],
    editableFields: ['description', 'commodity', 'supplier', 'quoteStatus', 'leadTime', 'ppapRequired', 'designStatus', 'designReadyToQuoteDate', 'coo', 'lltFlag'],
    lastUpdated: '2026-02-12 07:30:00'
  }
];

export const projectSummary = {
  projectName: 'Vertiv BOM Grid',
  projectCode: 'PRJ-2026-PDU-NG',
  overallReadiness: 72,
  totalItems: 14,
  totalBlockers: 8,
  itemsAtRisk: 4,
  draftItems: 4,
  cycleTime: {
    designToQuote: 12,
    quoteToApproval: 8,
    approvalToOrderable: 15
  },
  lastRefreshed: '2026-02-19 09:30:15',
  targetCOSubmission: '2026-02-28',
  targetOrderable: '2026-03-31'
};

// V23 KPI Data
export const bomKPIs = {
  notYetInERP: {
    percentage: 29,
    count: 4,
    total: 14
  },
  pendingCOs: {
    count: 3,
    avgAging: 12
  },
  notOrderable: {
    percentage: 43,
    count: 6,
    total: 14
  },
  clearToBuild: {
    forecastedDate: '2026-03-15',
    requiredDate: '2026-03-10',
    gapDays: 5,
    status: 'late'
  }
};
