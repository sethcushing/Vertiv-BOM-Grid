# Enterprise BOM Convergence Grid - PRD

## Problem Statement
Build a full-stack "Enterprise BOM Convergence Grid" application from a GitHub prototype (`fifithrift-CompassX/Clickableprototypeforbomgrid`). No authentication. Modernized UI with glassmorphism. Includes Filter Panel, Column Settings, Export, and Dockerfile for Koyeb deployment.

## Architecture
- **Frontend**: React (CRA), Tailwind CSS, Radix UI, Recharts
- **Backend**: FastAPI + MongoDB (motor async driver)
- **Deployment**: Multi-stage Dockerfile (Node build -> Python production)
- **Data**: Sample data seeded into MongoDB on startup

## Completed Features
- [x] BOM Grid with hierarchical view
- [x] Item Detail Drawer
- [x] PM Dashboard with analytics
- [x] CO Readiness Review page
- [x] Filter Panel with advanced filtering
- [x] Column Settings modal (visibility/ordering)
- [x] Export to CSV/Excel
- [x] Modernized UI (glassmorphism, shadows)
- [x] Homepage navigation throughout app
- [x] Full REST API (CRUD for BOM items, projects, statistics)
- [x] Multi-stage Dockerfile for Koyeb deployment
- [x] Backend serves static frontend in production (Docker)

## Key Files
- `/app/Dockerfile` - Multi-stage production Dockerfile
- `/app/backend/server.py` - FastAPI API + static file serving
- `/app/frontend/src/App.js` - Main router/layout
- `/app/frontend/src/components/bom/BOMGrid.js` - Main grid
- `/app/frontend/src/components/core/FilterPanel.js` - Filter panel
- `/app/frontend/src/components/core/ColumnSettingsModal.js` - Column settings

## API Endpoints
- `GET /api/bom-items` - List BOM items (with filters)
- `GET /api/bom-items/{id}` - Get single item
- `POST /api/bom-items` - Create item
- `PATCH /api/bom-items/{id}` - Update item
- `DELETE /api/bom-items/{id}` - Delete item
- `GET /api/projects` - Project summaries
- `GET /api/statistics` - Aggregated stats
- `GET /api/co-data` - Change order data
- `GET /api/lifecycle-distribution` - Lifecycle stage counts

## Backlog (P2)
- Modal backdrop click should close modals
- Proper MongoDB seeding mechanism (currently inline in server.py)

## Deployment Notes
To deploy on Koyeb:
1. Build: `docker build -t bom-grid-app .`
2. Push to a container registry (Docker Hub, GHCR, etc.)
3. In Koyeb, create a new service pointing to the image
4. Set environment variables: `MONGO_URL`, `DB_NAME`, `PORT` (default 8000)
