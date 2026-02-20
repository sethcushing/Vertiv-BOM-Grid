from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="BOM Convergence Grid API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enums
class LifecycleStage(str, Enum):
    DRAFT = "Draft"
    READY_FOR_CO = "Ready for CO"
    CO_SUBMITTED = "CO Submitted"
    CO_APPROVED = "CO Approved"
    CCO_IN_PROGRESS = "CCO In Progress"
    ORDERABLE = "Orderable"

class MakeBuyType(str, Enum):
    MAKE = "Make"
    BUY = "Buy"
    TBD = "TBD"

class TradeComplianceStatus(str, Enum):
    CLEARED = "Cleared"
    PENDING = "Pending"
    FLAGGED = "Flagged"
    NA = "N/A"

class LifecycleState(str, Enum):
    DRAFT = "Draft"
    IN_REVIEW = "In Review"
    RELEASED = "Released"
    OBSOLETE = "Obsolete"

# Pydantic Models
class Blocker(BaseModel):
    category: str
    description: str
    owner: str
    agingDays: int
    notes: str
    severity: str
    org: Optional[str] = None

class OrgOrderability(BaseModel):
    org: str
    orderable: bool
    supplierSetup: bool
    blockers: List[str]

class ReadinessTimestamps(BaseModel):
    designToReadyToQuote: Optional[str] = None
    quoteToApproval: Optional[str] = None
    approvalToOrderable: Optional[str] = None

class DataSource(BaseModel):
    identity: str = "PLM"
    procurement: str = "ERP"
    governance: str = "PLM"

class BOMItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    level: int
    itemNumber: str
    revision: str
    description: str
    commodity: str
    plant: str
    
    # Governance
    isPreCO: bool = False
    lifecycleStage: str = "Draft"
    
    # Ownership
    engOwner: str = ""
    procurementOwner: str = ""
    ameOwner: str = ""
    qualityOwner: str = ""
    blockerOwner: str = ""
    
    # Design
    designStatus: str = ""
    designReadyToQuoteDate: str = ""
    
    # Procurement
    makeBuy: str = "TBD"
    potentialSupplier: str = ""
    approvedSupplier: str = ""
    supplier: str = ""
    quoteStatus: str = ""
    quoteReceivedDate: str = ""
    supplierSetupInERP: bool = False
    leadTime: int = 0
    hasBPA: bool = False
    aml: int = 0
    
    # Multi-org
    orgOrderability: List[OrgOrderability] = []
    supplierSetupByOrg: Dict[str, bool] = {}
    
    # Quality
    ppapRequired: bool = False
    ppapStatus: str = ""
    coo: str = ""
    tradeComplianceStatus: str = "N/A"
    
    # Manufacturing
    manufacturingReviewed: bool = False
    lltFlag: bool = False
    effectivityStartDate: str = ""
    effectivityEndDate: str = ""
    
    # Governance
    pendingCONumber: str = ""
    coStatus: str = ""
    ccoStatus: str = ""
    orderable: bool = False
    isSustainingCO: bool = False
    lifecycleState: str = "Draft"
    erpStatus: str = "Not Activated"
    
    # Risk
    blockers: List[Blocker] = []
    blockerAging: int = 0
    blockingCount: int = 0
    
    # Readiness
    designReadiness: int = 0
    procurementReadiness: int = 0
    manufacturingReadiness: int = 0
    qualityReadiness: int = 0
    overallReadiness: int = 0
    
    readinessTimestamps: ReadinessTimestamps = ReadinessTimestamps()
    
    # Metadata
    isAssembly: bool = False
    hasChildren: bool = False
    parentId: Optional[str] = None
    isExpanded: bool = False
    isNewPart: bool = False
    
    dataSource: DataSource = DataSource()
    fieldsUnderChangeControl: List[str] = []
    editableFields: List[str] = []
    lastUpdated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BOMItemCreate(BaseModel):
    level: int
    itemNumber: str
    revision: str
    description: str
    commodity: str
    plant: str
    parentId: Optional[str] = None

class BOMItemUpdate(BaseModel):
    description: Optional[str] = None
    commodity: Optional[str] = None
    plant: Optional[str] = None
    designStatus: Optional[str] = None
    makeBuy: Optional[str] = None
    supplier: Optional[str] = None
    quoteStatus: Optional[str] = None
    leadTime: Optional[int] = None
    ppapStatus: Optional[str] = None
    coo: Optional[str] = None
    lifecycleStage: Optional[str] = None

class ProjectSummary(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectName: str
    projectCode: str
    overallReadiness: int = 0
    totalItems: int = 0
    totalBlockers: int = 0
    itemsAtRisk: int = 0
    preCOItems: int = 0
    lastRefreshed: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    targetCOSubmission: str = ""
    targetOrderable: str = ""

class COData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    coNumber: str
    status: str
    createdDate: str
    targetDate: str
    items: List[str] = []

# Sample Data Initialization
async def init_sample_data():
    """Initialize sample BOM data if collection is empty"""
    count = await db.bom_items.count_documents({})
    if count == 0:
        logger.info("Initializing sample BOM data...")
        sample_items = [
            {
                "id": "1",
                "level": 0,
                "itemNumber": "ASM-12000",
                "revision": "A",
                "description": "Main Power Distribution Unit",
                "commodity": "Electrical Assembly",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "CO Approved",
                "engOwner": "Sarah Chen",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "Mike Johnson",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-15",
                "makeBuy": "Make",
                "potentialSupplier": "Multiple",
                "approvedSupplier": "",
                "supplier": "Multiple",
                "quoteStatus": "Partial",
                "quoteReceivedDate": "2026-01-22",
                "supplierSetupInERP": True,
                "leadTime": 84,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": True, "blockers": ["Missing component quotes"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": True, "blockers": ["Missing component quotes", "PPAP pending"]}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": True},
                "ppapRequired": True,
                "ppapStatus": "In Progress",
                "coo": "USA",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": True,
                "lltFlag": True,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Pending",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [
                    {
                        "category": "Procurement",
                        "description": "Missing quotes for 3 critical components",
                        "owner": "Mike Johnson",
                        "agingDays": 12,
                        "notes": "Supplier RFQ sent 2026-01-31, follow-up scheduled",
                        "severity": "high"
                    }
                ],
                "blockerAging": 12,
                "blockingCount": 245,
                "designReadiness": 100,
                "procurementReadiness": 65,
                "manufacturingReadiness": 90,
                "qualityReadiness": 70,
                "overallReadiness": 81,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-15",
                    "quoteToApproval": "2026-01-22"
                },
                "isAssembly": True,
                "hasChildren": True,
                "parentId": None,
                "isExpanded": True,
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": ["itemNumber", "revision", "commodity", "designStatus", "lifecycleStage"],
                "editableFields": [],
                "lastUpdated": "2026-02-12T08:30:00Z"
            },
            {
                "id": "2",
                "level": 1,
                "itemNumber": "ASM-12100",
                "revision": "B",
                "description": "Primary Circuit Board Assembly",
                "commodity": "PCB Assembly",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "Orderable",
                "engOwner": "Sarah Chen",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-10",
                "makeBuy": "Make",
                "potentialSupplier": "TechCircuits Inc",
                "approvedSupplier": "TechCircuits Inc",
                "supplier": "TechCircuits Inc",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-18",
                "supplierSetupInERP": True,
                "leadTime": 45,
                "hasBPA": False,
                "aml": 2,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": True, "supplierSetup": True, "blockers": []},
                    {"org": "Monterrey", "orderable": True, "supplierSetup": True, "blockers": []}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": True},
                "ppapRequired": True,
                "ppapStatus": "Approved",
                "coo": "USA",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": True,
                "lltFlag": False,
                "effectivityStartDate": "2026-03-01",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Complete",
                "orderable": True,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 100,
                "manufacturingReadiness": 100,
                "qualityReadiness": 100,
                "overallReadiness": 100,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-10",
                    "quoteToApproval": "2026-01-18",
                    "approvalToOrderable": "2026-02-11"
                },
                "isAssembly": True,
                "hasChildren": True,
                "parentId": "1",
                "isExpanded": True,
                "isNewPart": False,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": [],
                "lastUpdated": "2026-02-11T14:22:00Z"
            },
            {
                "id": "3",
                "level": 2,
                "itemNumber": "PCB-5500",
                "revision": "A",
                "description": "Bare PCB - Main Controller",
                "commodity": "PCB",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "Orderable",
                "engOwner": "David Park",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-08",
                "makeBuy": "Buy",
                "potentialSupplier": "PCB Dynamics",
                "approvedSupplier": "PCB Dynamics",
                "supplier": "PCB Dynamics",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-15",
                "supplierSetupInERP": True,
                "leadTime": 28,
                "hasBPA": True,
                "aml": 4,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": True, "supplierSetup": True, "blockers": []},
                    {"org": "Monterrey", "orderable": True, "supplierSetup": True, "blockers": []}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": True},
                "ppapRequired": True,
                "ppapStatus": "Approved",
                "coo": "Taiwan",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": True,
                "lltFlag": False,
                "effectivityStartDate": "2026-03-01",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Complete",
                "orderable": True,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 100,
                "manufacturingReadiness": 100,
                "qualityReadiness": 100,
                "overallReadiness": 100,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-08",
                    "quoteToApproval": "2026-01-15",
                    "approvalToOrderable": "2026-02-09"
                },
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "2",
                "isNewPart": False,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": [],
                "lastUpdated": "2026-02-09T10:15:00Z"
            },
            {
                "id": "4",
                "level": 2,
                "itemNumber": "IC-7720",
                "revision": "C",
                "description": "Microcontroller - ARM Cortex M4",
                "commodity": "Semiconductor",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "CO Approved",
                "engOwner": "David Park",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "Mike Johnson",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-12",
                "makeBuy": "Buy",
                "potentialSupplier": "Microchip Technology",
                "approvedSupplier": "",
                "supplier": "TBD",
                "quoteStatus": "Pending",
                "quoteReceivedDate": "",
                "supplierSetupInERP": False,
                "leadTime": 0,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Quote not received", "Supplier not set up"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Quote not received", "Supplier not set up", "PPAP not started"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": True,
                "ppapStatus": "Not Started",
                "coo": "TBD",
                "tradeComplianceStatus": "Pending",
                "manufacturingReviewed": True,
                "lltFlag": True,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Pending",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [
                    {
                        "category": "Procurement",
                        "description": "Quote not received from supplier",
                        "owner": "Mike Johnson",
                        "agingDays": 18,
                        "notes": "Critical semiconductor - supply constrained. Escalated to director level.",
                        "severity": "critical",
                        "org": "Columbus"
                    },
                    {
                        "category": "Procurement",
                        "description": "Supplier not set up in ERP",
                        "owner": "Mike Johnson",
                        "agingDays": 18,
                        "notes": "Waiting for quote confirmation before initiating setup",
                        "severity": "high",
                        "org": "Monterrey"
                    }
                ],
                "blockerAging": 18,
                "blockingCount": 245,
                "designReadiness": 100,
                "procurementReadiness": 20,
                "manufacturingReadiness": 80,
                "qualityReadiness": 0,
                "overallReadiness": 50,
                "readinessTimestamps": {"designToReadyToQuote": "2026-01-12"},
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "2",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "CPQ", "governance": "PLM"},
                "fieldsUnderChangeControl": ["itemNumber", "revision", "designStatus"],
                "editableFields": ["quoteStatus", "supplier", "leadTime"],
                "lastUpdated": "2026-02-12T07:45:00Z"
            },
            {
                "id": "5",
                "level": 2,
                "itemNumber": "RES-2210",
                "revision": "A",
                "description": "Resistor 10K 0805 1%",
                "commodity": "Passive Component",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "Orderable",
                "engOwner": "David Park",
                "procurementOwner": "Jennifer Lee",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-05",
                "makeBuy": "Buy",
                "potentialSupplier": "Vishay",
                "approvedSupplier": "Vishay",
                "supplier": "Vishay",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-12",
                "supplierSetupInERP": True,
                "leadTime": 14,
                "hasBPA": True,
                "aml": 5,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": True, "supplierSetup": True, "blockers": []},
                    {"org": "Monterrey", "orderable": True, "supplierSetup": False, "blockers": ["Supplier not approved for Monterrey"]}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": False},
                "ppapRequired": False,
                "ppapStatus": "N/A",
                "coo": "China",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": True,
                "lltFlag": False,
                "effectivityStartDate": "2026-03-01",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Complete",
                "orderable": True,
                "isSustainingCO": True,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 100,
                "manufacturingReadiness": 100,
                "qualityReadiness": 100,
                "overallReadiness": 100,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-05",
                    "quoteToApproval": "2026-01-12",
                    "approvalToOrderable": "2026-02-08"
                },
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "2",
                "isNewPart": False,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": [],
                "lastUpdated": "2026-02-08T16:30:00Z"
            },
            {
                "id": "6",
                "level": 1,
                "itemNumber": "ASM-12200",
                "revision": "A",
                "description": "Power Supply Module",
                "commodity": "Power Supply",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "CO Approved",
                "engOwner": "Robert Kim",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "Lisa Martinez",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-20",
                "makeBuy": "Buy",
                "potentialSupplier": "PowerTech Systems",
                "approvedSupplier": "PowerTech Systems",
                "supplier": "PowerTech Systems",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-28",
                "supplierSetupInERP": True,
                "leadTime": 56,
                "hasBPA": True,
                "aml": 1,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": True, "blockers": ["PPAP incomplete", "AME review pending"]},
                    {"org": "Monterrey", "orderable": True, "supplierSetup": True, "blockers": []}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": True},
                "ppapRequired": True,
                "ppapStatus": "Submitted",
                "coo": "Mexico",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": False,
                "lltFlag": False,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Pending",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [
                    {
                        "category": "Quality",
                        "description": "PPAP documentation incomplete",
                        "owner": "Lisa Martinez",
                        "agingDays": 8,
                        "notes": "Missing dimensional inspection report, supplier contacted",
                        "severity": "medium",
                        "org": "Columbus"
                    },
                    {
                        "category": "Manufacturing",
                        "description": "AME review not complete",
                        "owner": "Tom Williams",
                        "agingDays": 5,
                        "notes": "Scheduled for review 2026-02-14",
                        "severity": "low",
                        "org": "Columbus"
                    }
                ],
                "blockerAging": 8,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 100,
                "manufacturingReadiness": 50,
                "qualityReadiness": 60,
                "overallReadiness": 78,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-20",
                    "quoteToApproval": "2026-01-28"
                },
                "isAssembly": True,
                "hasChildren": True,
                "parentId": "1",
                "isExpanded": False,
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": ["itemNumber", "revision"],
                "editableFields": [],
                "lastUpdated": "2026-02-12T09:15:00Z"
            },
            {
                "id": "7",
                "level": 1,
                "itemNumber": "ENCL-8100",
                "revision": "A",
                "description": "Aluminum Enclosure - Custom",
                "commodity": "Sheet Metal",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "Orderable",
                "engOwner": "Sarah Chen",
                "procurementOwner": "Jennifer Lee",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-18",
                "makeBuy": "Buy",
                "potentialSupplier": "Precision Metalworks",
                "approvedSupplier": "Precision Metalworks",
                "supplier": "Precision Metalworks",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-25",
                "supplierSetupInERP": True,
                "leadTime": 42,
                "hasBPA": True,
                "aml": 3,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": True, "supplierSetup": True, "blockers": []},
                    {"org": "Monterrey", "orderable": True, "supplierSetup": True, "blockers": []}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": True},
                "ppapRequired": True,
                "ppapStatus": "Approved",
                "coo": "USA",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": True,
                "lltFlag": False,
                "effectivityStartDate": "2026-02-01",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Complete",
                "orderable": True,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 100,
                "manufacturingReadiness": 100,
                "qualityReadiness": 100,
                "overallReadiness": 100,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-18",
                    "quoteToApproval": "2026-01-25",
                    "approvalToOrderable": "2026-02-01"
                },
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": False,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": [],
                "lastUpdated": "2026-02-10T11:20:00Z"
            },
            {
                "id": "8",
                "level": 1,
                "itemNumber": "WIRE-4400",
                "revision": "A",
                "description": "Wire Harness - Main Power",
                "commodity": "Wire & Cable",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "Draft",
                "engOwner": "Robert Kim",
                "procurementOwner": "Jennifer Lee",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "Jennifer Lee",
                "designStatus": "Prototype",
                "designReadyToQuoteDate": "2026-02-20",
                "makeBuy": "TBD",
                "potentialSupplier": "Delphi Connection Systems",
                "approvedSupplier": "",
                "supplier": "TBD",
                "quoteStatus": "Not Started",
                "quoteReceivedDate": "",
                "supplierSetupInERP": False,
                "leadTime": 0,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Design not ready", "Supplier not identified"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Design not ready", "Supplier not identified"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": True,
                "ppapStatus": "Not Started",
                "coo": "TBD",
                "tradeComplianceStatus": "N/A",
                "manufacturingReviewed": False,
                "lltFlag": False,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-002",
                "coStatus": "Pending",
                "ccoStatus": "N/A",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Draft",
                "erpStatus": "Not Activated",
                "blockers": [
                    {
                        "category": "Design",
                        "description": "Design not ready for quoting",
                        "owner": "Robert Kim",
                        "agingDays": 3,
                        "notes": "Prototype testing in progress, release expected 2026-02-18",
                        "severity": "medium"
                    },
                    {
                        "category": "Procurement",
                        "description": "Supplier not identified",
                        "owner": "Jennifer Lee",
                        "agingDays": 3,
                        "notes": "Waiting for design freeze before sourcing",
                        "severity": "low"
                    }
                ],
                "blockerAging": 3,
                "blockingCount": 0,
                "designReadiness": 70,
                "procurementReadiness": 0,
                "manufacturingReadiness": 0,
                "qualityReadiness": 0,
                "overallReadiness": 18,
                "readinessTimestamps": {},
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "CPQ", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": ["quoteStatus", "supplier"],
                "lastUpdated": "2026-02-12T08:00:00Z"
            },
            {
                "id": "9",
                "level": 1,
                "itemNumber": "FAN-3300",
                "revision": "B",
                "description": "Cooling Fan 120mm 24VDC",
                "commodity": "Thermal Management",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "CO Approved",
                "engOwner": "Sarah Chen",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "Mike Johnson",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-14",
                "makeBuy": "Buy",
                "potentialSupplier": "Sunon",
                "approvedSupplier": "",
                "supplier": "Sunon",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-22",
                "supplierSetupInERP": False,
                "leadTime": 35,
                "hasBPA": False,
                "aml": 1,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Supplier not set up in ERP"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Supplier not set up in ERP", "PPAP not started"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": True,
                "ppapStatus": "Not Started",
                "coo": "Taiwan",
                "tradeComplianceStatus": "Pending",
                "manufacturingReviewed": True,
                "lltFlag": False,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Pending",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "In Review",
                "erpStatus": "Activated",
                "blockers": [
                    {
                        "category": "Procurement",
                        "description": "Supplier not set up in ERP",
                        "owner": "Mike Johnson",
                        "agingDays": 6,
                        "notes": "ERP setup request submitted 2026-02-06, pending finance approval",
                        "severity": "medium"
                    }
                ],
                "blockerAging": 6,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 80,
                "manufacturingReadiness": 100,
                "qualityReadiness": 30,
                "overallReadiness": 78,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-14",
                    "quoteToApproval": "2026-01-22"
                },
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": ["itemNumber", "revision"],
                "editableFields": [],
                "lastUpdated": "2026-02-11T15:40:00Z"
            },
            {
                "id": "10",
                "level": 1,
                "itemNumber": "CONN-6650",
                "revision": "A",
                "description": "Power Connector - IEC C14",
                "commodity": "Connector",
                "plant": "Columbus, OH",
                "isPreCO": False,
                "lifecycleStage": "Orderable",
                "engOwner": "David Park",
                "procurementOwner": "Jennifer Lee",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Released",
                "designReadyToQuoteDate": "2026-01-10",
                "makeBuy": "Buy",
                "potentialSupplier": "TE Connectivity",
                "approvedSupplier": "TE Connectivity",
                "supplier": "TE Connectivity",
                "quoteStatus": "Received",
                "quoteReceivedDate": "2026-01-17",
                "supplierSetupInERP": True,
                "leadTime": 21,
                "hasBPA": True,
                "aml": 3,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": True, "supplierSetup": True, "blockers": []},
                    {"org": "Monterrey", "orderable": True, "supplierSetup": True, "blockers": []}
                ],
                "supplierSetupByOrg": {"Columbus": True, "Monterrey": True},
                "ppapRequired": False,
                "ppapStatus": "N/A",
                "coo": "USA",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": True,
                "lltFlag": False,
                "effectivityStartDate": "2026-01-22",
                "effectivityEndDate": "",
                "pendingCONumber": "CO-2026-001",
                "coStatus": "Released",
                "ccoStatus": "Complete",
                "orderable": True,
                "isSustainingCO": False,
                "lifecycleState": "Released",
                "erpStatus": "Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 100,
                "procurementReadiness": 100,
                "manufacturingReadiness": 100,
                "qualityReadiness": 100,
                "overallReadiness": 100,
                "readinessTimestamps": {
                    "designToReadyToQuote": "2026-01-10",
                    "quoteToApproval": "2026-01-17",
                    "approvalToOrderable": "2026-01-22"
                },
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": False,
                "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": [],
                "lastUpdated": "2026-02-09T13:25:00Z"
            },
            {
                "id": "11",
                "level": 1,
                "itemNumber": "TEMP-001",
                "revision": "Draft",
                "description": "Battery Backup Module - New Design",
                "commodity": "Power Management",
                "plant": "Columbus, OH",
                "isPreCO": True,
                "lifecycleStage": "Draft",
                "engOwner": "Sarah Chen",
                "procurementOwner": "Jennifer Lee",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Draft",
                "designReadyToQuoteDate": "2026-02-25",
                "makeBuy": "TBD",
                "potentialSupplier": "PowerCell Inc",
                "approvedSupplier": "",
                "supplier": "TBD",
                "quoteStatus": "Not Started",
                "quoteReceivedDate": "",
                "supplierSetupInERP": False,
                "leadTime": 0,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": False,
                "ppapStatus": "N/A",
                "coo": "TBD",
                "tradeComplianceStatus": "N/A",
                "manufacturingReviewed": False,
                "lltFlag": False,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "",
                "coStatus": "Pre-CO",
                "ccoStatus": "N/A",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Draft",
                "erpStatus": "Not Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 45,
                "procurementReadiness": 0,
                "manufacturingReadiness": 0,
                "qualityReadiness": 0,
                "overallReadiness": 11,
                "readinessTimestamps": {},
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "CPQ", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": ["description", "commodity", "supplier", "quoteStatus", "leadTime", "ppapRequired", "designStatus", "designReadyToQuoteDate"],
                "lastUpdated": "2026-02-12T10:15:00Z"
            },
            {
                "id": "12",
                "level": 1,
                "itemNumber": "DRAFT-002",
                "revision": "Draft",
                "description": "LED Status Indicator Panel",
                "commodity": "Display",
                "plant": "Columbus, OH",
                "isPreCO": True,
                "lifecycleStage": "Draft",
                "engOwner": "David Park",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "In Review",
                "designReadyToQuoteDate": "2026-02-18",
                "makeBuy": "Buy",
                "potentialSupplier": "Adafruit Industries",
                "approvedSupplier": "",
                "supplier": "Adafruit Industries",
                "quoteStatus": "Requested",
                "quoteReceivedDate": "",
                "supplierSetupInERP": False,
                "leadTime": 21,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released", "Quote pending"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released", "Quote pending"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": True,
                "ppapStatus": "Not Started",
                "coo": "USA",
                "tradeComplianceStatus": "Cleared",
                "manufacturingReviewed": False,
                "lltFlag": False,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "",
                "coStatus": "Pre-CO",
                "ccoStatus": "N/A",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "In Review",
                "erpStatus": "Not Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 65,
                "procurementReadiness": 25,
                "manufacturingReadiness": 0,
                "qualityReadiness": 0,
                "overallReadiness": 23,
                "readinessTimestamps": {},
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "CPQ", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": ["description", "commodity", "supplier", "quoteStatus", "leadTime", "ppapRequired", "designStatus", "designReadyToQuoteDate", "coo"],
                "lastUpdated": "2026-02-12T09:45:00Z"
            },
            {
                "id": "13",
                "level": 1,
                "itemNumber": "TEMP-003",
                "revision": "Draft",
                "description": "EMI Filter Assembly",
                "commodity": "Electrical",
                "plant": "Columbus, OH",
                "isPreCO": True,
                "lifecycleStage": "Draft",
                "engOwner": "Robert Kim",
                "procurementOwner": "Jennifer Lee",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "Robert Kim",
                "designStatus": "Concept",
                "designReadyToQuoteDate": "2026-03-05",
                "makeBuy": "TBD",
                "potentialSupplier": "",
                "approvedSupplier": "",
                "supplier": "",
                "quoteStatus": "Not Started",
                "quoteReceivedDate": "",
                "supplierSetupInERP": False,
                "leadTime": 0,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released", "Design concept phase"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released", "Design concept phase"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": False,
                "ppapStatus": "N/A",
                "coo": "",
                "tradeComplianceStatus": "N/A",
                "manufacturingReviewed": False,
                "lltFlag": False,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "",
                "coStatus": "Pre-CO",
                "ccoStatus": "N/A",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Draft",
                "erpStatus": "Not Activated",
                "blockers": [
                    {
                        "category": "Design",
                        "description": "Design concept requires validation testing",
                        "owner": "Robert Kim",
                        "agingDays": 5,
                        "notes": "Lab testing scheduled for 2026-02-15. Awaiting EMC compliance review.",
                        "severity": "medium"
                    }
                ],
                "blockerAging": 5,
                "blockingCount": 0,
                "designReadiness": 25,
                "procurementReadiness": 0,
                "manufacturingReadiness": 0,
                "qualityReadiness": 0,
                "overallReadiness": 6,
                "readinessTimestamps": {},
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "1",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "CPQ", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": ["description", "commodity", "supplier", "quoteStatus", "leadTime", "ppapRequired", "designStatus", "designReadyToQuoteDate", "coo", "plant"],
                "lastUpdated": "2026-02-12T08:20:00Z"
            },
            {
                "id": "14",
                "level": 2,
                "itemNumber": "DRAFT-004",
                "revision": "Draft",
                "description": "Capacitor Array - High Voltage",
                "commodity": "Passive Component",
                "plant": "Columbus, OH",
                "isPreCO": True,
                "lifecycleStage": "Draft",
                "engOwner": "Robert Kim",
                "procurementOwner": "Mike Johnson",
                "ameOwner": "Tom Williams",
                "qualityOwner": "Lisa Martinez",
                "blockerOwner": "",
                "designStatus": "Draft",
                "designReadyToQuoteDate": "2026-02-22",
                "makeBuy": "TBD",
                "potentialSupplier": "Kemet Corp",
                "approvedSupplier": "",
                "supplier": "TBD",
                "quoteStatus": "Pending Supplier Selection",
                "quoteReceivedDate": "",
                "supplierSetupInERP": False,
                "leadTime": 0,
                "hasBPA": False,
                "aml": 0,
                "orgOrderability": [
                    {"org": "Columbus", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released", "Supplier not selected"]},
                    {"org": "Monterrey", "orderable": False, "supplierSetup": False, "blockers": ["Pre-CO item - not released", "Supplier not selected"]}
                ],
                "supplierSetupByOrg": {"Columbus": False, "Monterrey": False},
                "ppapRequired": True,
                "ppapStatus": "Not Started",
                "coo": "",
                "tradeComplianceStatus": "N/A",
                "manufacturingReviewed": False,
                "lltFlag": True,
                "effectivityStartDate": "",
                "effectivityEndDate": "",
                "pendingCONumber": "",
                "coStatus": "Pre-CO",
                "ccoStatus": "N/A",
                "orderable": False,
                "isSustainingCO": False,
                "lifecycleState": "Draft",
                "erpStatus": "Not Activated",
                "blockers": [],
                "blockerAging": 0,
                "blockingCount": 0,
                "designReadiness": 55,
                "procurementReadiness": 15,
                "manufacturingReadiness": 0,
                "qualityReadiness": 0,
                "overallReadiness": 18,
                "readinessTimestamps": {},
                "isAssembly": False,
                "hasChildren": False,
                "parentId": "13",
                "isNewPart": True,
                "dataSource": {"identity": "PLM", "procurement": "CPQ", "governance": "PLM"},
                "fieldsUnderChangeControl": [],
                "editableFields": ["description", "commodity", "supplier", "quoteStatus", "leadTime", "ppapRequired", "designStatus", "designReadyToQuoteDate", "coo", "lltFlag"],
                "lastUpdated": "2026-02-12T07:30:00Z"
            }
        ]
        
        await db.bom_items.insert_many(sample_items)
        logger.info(f"Inserted {len(sample_items)} sample BOM items")
        
        # Initialize project summary
        project = {
            "id": "proj-1",
            "projectName": "Enterprise BOM Convergence Grid",
            "projectCode": "PRJ-2026-PDU-NG",
            "overallReadiness": 72,
            "totalItems": 14,
            "totalBlockers": 8,
            "itemsAtRisk": 5,
            "preCOItems": 4,
            "lastRefreshed": datetime.now(timezone.utc).isoformat(),
            "targetCOSubmission": "2026-02-28",
            "targetOrderable": "2026-03-31"
        }
        await db.projects.insert_one(project)
        logger.info("Inserted project summary")

# Routes
@api_router.get("/")
async def root():
    return {"message": "BOM Convergence Grid API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# BOM Items CRUD
@api_router.get("/bom-items", response_model=List[BOMItem])
async def get_bom_items(
    lifecycleStage: Optional[str] = None,
    makeBuy: Optional[str] = None,
    plant: Optional[str] = None,
    hasBlockers: Optional[bool] = None,
    orderable: Optional[bool] = None,
    parentId: Optional[str] = None
):
    query = {}
    if lifecycleStage:
        query["lifecycleStage"] = lifecycleStage
    if makeBuy:
        query["makeBuy"] = makeBuy
    if plant:
        query["plant"] = plant
    if hasBlockers is not None:
        if hasBlockers:
            query["blockers"] = {"$ne": []}
        else:
            query["blockers"] = []
    if orderable is not None:
        query["orderable"] = orderable
    if parentId:
        query["parentId"] = parentId
        
    items = await db.bom_items.find(query, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/bom-items/{item_id}", response_model=BOMItem)
async def get_bom_item(item_id: str):
    item = await db.bom_items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@api_router.post("/bom-items", response_model=BOMItem)
async def create_bom_item(item: BOMItemCreate):
    new_item = BOMItem(**item.model_dump())
    doc = new_item.model_dump()
    await db.bom_items.insert_one(doc)
    return new_item

@api_router.patch("/bom-items/{item_id}", response_model=BOMItem)
async def update_bom_item(item_id: str, updates: BOMItemUpdate):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid update fields provided")
    
    update_data["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.bom_items.update_one(
        {"id": item_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = await db.bom_items.find_one({"id": item_id}, {"_id": 0})
    return item

@api_router.delete("/bom-items/{item_id}")
async def delete_bom_item(item_id: str):
    result = await db.bom_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# Project Summary
@api_router.get("/projects")
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Statistics endpoint
@api_router.get("/statistics")
async def get_statistics():
    total_items = await db.bom_items.count_documents({})
    orderable_items = await db.bom_items.count_documents({"orderable": True})
    items_with_blockers = await db.bom_items.count_documents({"blockers": {"$ne": []}})
    draft_items = await db.bom_items.count_documents({"lifecycleStage": "Draft"})
    erp_activated = await db.bom_items.count_documents({"erpStatus": "Activated"})
    
    # Calculate avg readiness
    pipeline = [
        {"$group": {"_id": None, "avgReadiness": {"$avg": "$overallReadiness"}}}
    ]
    result = await db.bom_items.aggregate(pipeline).to_list(1)
    avg_readiness = result[0]["avgReadiness"] if result else 0
    
    return {
        "totalItems": total_items,
        "orderableItems": orderable_items,
        "itemsWithBlockers": items_with_blockers,
        "draftItems": draft_items,
        "erpActivated": erp_activated,
        "notInERP": total_items - erp_activated,
        "averageReadiness": round(avg_readiness, 1),
        "lastUpdated": datetime.now(timezone.utc).isoformat()
    }

# Lifecycle distribution
@api_router.get("/lifecycle-distribution")
async def get_lifecycle_distribution():
    pipeline = [
        {"$group": {"_id": "$lifecycleStage", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    results = await db.bom_items.aggregate(pipeline).to_list(100)
    return {item["_id"]: item["count"] for item in results}

# CO Data
@api_router.get("/co-data")
async def get_co_data():
    items = await db.bom_items.find({}, {"_id": 0, "pendingCONumber": 1, "coStatus": 1}).to_list(1000)
    
    co_map = {}
    for item in items:
        co_num = item.get("pendingCONumber", "")
        if co_num:
            if co_num not in co_map:
                co_map[co_num] = {"coNumber": co_num, "status": item.get("coStatus", ""), "itemCount": 0}
            co_map[co_num]["itemCount"] += 1
    
    return list(co_map.values())

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_sample_data()
    logger.info("BOM Convergence Grid API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
