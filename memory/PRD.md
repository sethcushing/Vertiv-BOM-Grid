# Vertiv BOM Grid - Product Requirements Document

## Original Problem Statement
Build a modern Vertiv BOM Grid - a Bill of Materials management tool based on an existing GitHub codebase. The app should have:
- Light mode with Orange and Gray accents
- Glassmorphism/modern enterprise style with blur effects and depth
- Industrial orange color theme
- Seed data for now, with future database integration for reading/enriching data

## Architecture & Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (ready for future integration)
- **Styling**: Industrial glassmorphism theme with Barlow Condensed, Inter, and JetBrains Mono fonts

## User Personas
1. **Manufacturing Engineers** - Track design readiness, manufacturing review status
2. **Procurement Specialists** - Manage supplier relationships, track quotes, ensure orderability
3. **Project Managers (PM)** - Complete project oversight, blocker management, CO readiness

## Core Requirements (Static)
1. Dashboard with KPI cards (Progress, Blockers, At Risk, Orderable)
2. BOM Grid with hierarchical tree structure
3. Pre-CO Workspace for draft items
4. CO Readiness Review with readiness distribution
5. Item Detail Drawer with tabs
6. Role-based column visibility (Engineering, Procurement, PM)
7. Multi-org orderability tracking

## What's Been Implemented (Feb 2026)
- [x] Dashboard with all KPI cards and Pre-CO Workspace summary
- [x] BOM Grid with 14 sample items (hierarchical structure)
- [x] Role-based view toggles (Engineering, Procurement, PM)
- [x] Pre-CO Workspace view mode
- [x] Item Detail Drawer with CO eligibility status
- [x] CO Readiness Review page with distribution visualization
- [x] Filter panel (basic filters)
- [x] Backend API endpoints for BOM data

## Prioritized Backlog
### P0 (Critical)
- [x] Core navigation flows - DONE
- [x] Data rendering - DONE

### P1 (High Priority)
- [ ] Database integration for reading production data
- [ ] Column sorting in BOM Grid
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

## Next Tasks
1. Integrate with database to receive production BOM data
2. Implement column sorting
3. Add search functionality
4. Implement export to Excel
5. Add more comprehensive filter options

## Design System
- **Primary Color**: Industrial Orange (#F97316)
- **Typography**: Barlow Condensed (headings), Inter (body), JetBrains Mono (data)
- **Style**: Glassmorphism with subtle blur effects
- **Theme**: Light mode with high contrast for data visibility
