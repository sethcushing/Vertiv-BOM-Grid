from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Vertiv BOM Grid API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
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
    identity: str
    procurement: str
    governance: str

class BOMItem(BaseModel):
    id: str
    level: int
    itemNumber: str
    revision: str
    description: str
    commodity: str
    plant: str
    isPreCO: bool
    engOwner: str
    procurementOwner: str
    ameOwner: str
    qualityOwner: str
    blockerOwner: str
    designStatus: str
    designReadyToQuoteDate: str
    makeBuy: str
    potentialSupplier: str
    approvedSupplier: str
    supplier: str
    quoteStatus: str
    quoteReceivedDate: str
    supplierSetupInERP: bool
    leadTime: int
    hasBPA: bool
    orgOrderability: List[OrgOrderability]
    ppapRequired: bool
    ppapStatus: str
    coo: str
    tradeComplianceStatus: str
    manufacturingReviewed: bool
    lltFlag: bool
    effectivityStartDate: str
    effectivityEndDate: str
    pendingCONumber: str
    coStatus: str
    ccoStatus: str
    orderable: bool
    isSustainingCO: bool
    lifecycleState: str
    blockers: List[Blocker]
    blockerAging: int
    blockingCount: int
    designReadiness: int
    procurementReadiness: int
    manufacturingReadiness: int
    qualityReadiness: int
    overallReadiness: int
    readinessTimestamps: ReadinessTimestamps
    isAssembly: bool
    hasChildren: bool
    parentId: Optional[str] = None
    dataSource: DataSource
    editableFields: List[str]
    lastUpdated: str

class ProjectSummary(BaseModel):
    projectName: str
    projectCode: str
    overallReadiness: int
    totalItems: int
    totalBlockers: int
    itemsAtRisk: int
    preCOItems: int
    cycleTime: dict
    lastRefreshed: str
    targetCOSubmission: str
    targetOrderable: str

# Sample seed data (will be loaded into MongoDB on first request)
SEED_DATA = [
    {
        "id": "1",
        "level": 0,
        "itemNumber": "ASM-12000",
        "revision": "A",
        "description": "Main Power Distribution Unit",
        "commodity": "Electrical Assembly",
        "plant": "Columbus, OH",
        "isPreCO": False,
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
        "orgOrderability": [
            {"org": "Columbus", "orderable": False, "supplierSetup": True, "blockers": ["Missing component quotes"]},
            {"org": "Monterrey", "orderable": False, "supplierSetup": True, "blockers": ["Missing component quotes", "PPAP pending"]}
        ],
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
        "dataSource": {"identity": "PLM", "procurement": "ERP", "governance": "PLM"},
        "editableFields": [],
        "lastUpdated": "2026-02-12 08:30:00"
    }
]

PROJECT_SUMMARY = {
    "projectName": "Vertiv BOM Grid",
    "projectCode": "PRJ-2026-PDU-NG",
    "overallReadiness": 72,
    "totalItems": 245,
    "totalBlockers": 8,
    "itemsAtRisk": 23,
    "preCOItems": 4,
    "cycleTime": {
        "designToQuote": 12,
        "quoteToApproval": 8,
        "approvalToOrderable": 15
    },
    "lastRefreshed": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
    "targetCOSubmission": "2026-02-28",
    "targetOrderable": "2026-03-31"
}

# Routes
@api_router.get("/")
async def root():
    return {"message": "Vertiv BOM Grid API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/bom/items", response_model=List[BOMItem])
async def get_bom_items():
    """Get all BOM items - for future database integration"""
    items = await db.bom_items.find({}, {"_id": 0}).to_list(1000)
    if not items:
        # Seed data if empty
        await db.bom_items.insert_many(SEED_DATA)
        items = await db.bom_items.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/bom/items/{item_id}", response_model=BOMItem)
async def get_bom_item(item_id: str):
    """Get a specific BOM item by ID"""
    item = await db.bom_items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        return {"error": "Item not found"}
    return item

@api_router.get("/bom/summary", response_model=ProjectSummary)
async def get_project_summary():
    """Get project summary statistics"""
    summary = await db.project_summary.find_one({}, {"_id": 0})
    if not summary:
        await db.project_summary.insert_one(PROJECT_SUMMARY)
        summary = PROJECT_SUMMARY
    return summary

@api_router.get("/bom/preco")
async def get_preco_items():
    """Get all Pre-CO workspace items"""
    items = await db.bom_items.find({"isPreCO": True}, {"_id": 0}).to_list(100)
    return {"items": items, "count": len(items)}

@api_router.get("/bom/blockers")
async def get_blocked_items():
    """Get all items with blockers"""
    items = await db.bom_items.find({"blockers": {"$ne": []}}, {"_id": 0}).to_list(100)
    return {"items": items, "count": len(items)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
