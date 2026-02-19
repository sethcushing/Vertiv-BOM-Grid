# Vertiv BOM Grid - Product Requirements Document

## Original Problem Statement
Build a modern Vertiv BOM Grid - a Bill of Materials management tool based on an existing GitHub codebase. The app should have:
- Light mode with Orange and Gray accents
- Glassmorphism/modern enterprise style with blur effects and depth
- Industrial orange color theme
- Seed data for now, with future database integration for reading/enriching data

## V23 Lifecycle Refactoring (Feb 2026)
Major conceptual shift to eliminate Pre-CO Workspace concept:

### ❌ Old Model (V22 and earlier)
- Pre-CO Workspace: Separate workspace for items "not yet in PLM/ERP"
- Dual Item Creation: Items could be created in the tool OR pulled from PLM
- Shadow System Risk: Tool appeared to be a system of record

### ✅ New Model (V23)
- **Single Source of Truth**: ALL items are mastered in PLM (PD Cloud)
- **Lifecycle Stage Column**: Draft | Ready for CO | CO Submitted | CO Approved | CCO In Progress | Orderable
- **Visibility Layer Only**: Tool shows readiness status, does NOT create items
- **System-of-Record Badges**: Clear PLM/ERP indicators showing data mastery

## Architecture & Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (ready for future integration)
- **Fonts**: Roboto Slab (headings), Inter (body), JetBrains Mono (data)

## User Personas
1. **Manufacturing Engineers** - Track design readiness, manufacturing review status
2. **Procurement Specialists** - Manage supplier relationships, track quotes, ensure orderability
3. **Project Managers (PM)** - Complete project oversight, blocker management, CO readiness

## Core Requirements
1. Dashboard with KPI cards (Progress, Blockers, At Risk, Orderable)
2. BOM Grid with hierarchical tree structure
3. **V23: Lifecycle Stage column** (replaces Pre-CO Workspace)
4. CO Readiness Review with readiness distribution
5. Item Detail Drawer with tabs
6. Role-based column visibility (Engineering, Procurement, PM)
7. Multi-org orderability tracking
8. **V23: KPI Analytics Bar** (Not Yet in ERP, Pending COs, Not Orderable, Clear-to-Build)
9. **V23: Column Sorting** on all grid columns
10. **V23: Data Source Legend** (PLM, ERP, Editable indicators)

## What's Been Implemented

### Feb 14, 2026 - V23 Update
- [x] **Lifecycle Stage Column** - 6 stages with color-coded badges
- [x] **KPI Analytics Bar** - 4 key metrics at top of grid
- [x] **Column Sorting** - Click any header to sort ascending/descending
- [x] **Data Source Legend** - PLM (Read Only), ERP (Read Only), Editable indicators
- [x] **AML Column** - Approved Manufacturer List with color-coded counts
- [x] **New Part Badges** - Green badges on newly added parts
- [x] **PLM/ERP Icons** - Database icons showing data mastery
- [x] **Removed Pre-CO Workspace** - Replaced with Lifecycle Stage filtering
- [x] **Updated Data Model** - Added lifecycleStage, aml, isNewPart, fieldsUnderChangeControl
- [x] **Updated Item Numbers** - Changed TEMP-xxx to proper PLM numbers (100-xxxx-xx)
- [x] Testing: 100% pass rate

### Feb 14, 2026 - Alignment Fix
- [x] **BOM Grid alignment fix** - All items collapse by default
- [x] Tree indentation moved to expand/collapse column for proper alignment

### Earlier Implementation
- [x] Dashboard with all KPI cards
- [x] BOM Grid with 14 sample items (hierarchical structure)
- [x] Role-based view toggles (Engineering, Procurement, PM)
- [x] Item Detail Drawer with CO eligibility status (750px width)
- [x] CO Readiness Review page with distribution visualization
- [x] Filter panel with Lifecycle Stage filter
- [x] Backend API endpoints for BOM data
- [x] Modern rounded design with Roboto Slab font

## Prioritized Backlog

### P0 (Critical) - COMPLETE
- [x] Core navigation flows
- [x] Data rendering
- [x] Modern design updates
- [x] BOM Grid alignment fix
- [x] V23 Lifecycle Refactoring
- [x] Column Sorting

### P1 (High Priority)
- [ ] Database integration for reading production data
- [ ] Quick search functionality
- [ ] Excel export functionality

### P2 (Medium Priority)
- [ ] Saved filter sets
- [ ] Readiness trends dashboard
- [ ] Owner workload dashboard
- [ ] Scheduled reports

### P3 (Future)
- [ ] PLM system integration
- [ ] ERP system integration
- [ ] Real-time data sync

## V23 Lifecycle Stages

| Stage | Definition | Badge Color |
|-------|-----------|-------------|
| **Draft** | Item mastered in PLM but CO not yet submitted | Gray |
| **Ready for CO** | All gating criteria passed, eligible for CO submission | Cyan |
| **CO Submitted** | Change order submitted to governance board | Orange |
| **CO Approved** | CO approved by governance, awaiting CCO | Blue |
| **CCO In Progress** | AME executing CCO in Item Workbench | Purple |
| **Orderable** | Fully activated in ERP, supplier setup complete | Green |

## Design System
- **Primary Color**: Industrial Orange (#F97316)
- **Typography**: Roboto Slab (headings), Inter (body), JetBrains Mono (data)
- **Border Radius**: 2xl (16px) for cards, xl (12px) for buttons
- **Shadows**: Subtle depth with hover effects
- **Theme**: Light mode with high contrast for data visibility

## Key Files
- `/app/frontend/src/components/BOMGrid.js` - V23 grid with sorting, KPIs, lifecycle stages
- `/app/frontend/src/data/bomData.js` - V23 data model with lifecycle stages
- `/app/frontend/src/components/Dashboard.js` - Dashboard view
- `/app/frontend/src/components/ItemDetailDrawer.js` - Item detail panel
