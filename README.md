# CreatorIQ Enterprise Analytics Platform

Unified multi-platform analytics, OAuth social data ingestion, and monetization intelligence platform.

## Directory Structure

```
infosys/
├── backend/                  # FastAPI Backend & OAuth Ingestion Pipeline
│   ├── app/
│   │   ├── config.py         # Pydantic Settings & Environment loader
│   │   ├── database.py       # SQLite / SQLAlchemy persistence engine
│   │   ├── models.py         # Connected accounts & analytics models
│   │   ├── schemas_extended.py # Pydantic response/request models
│   │   ├── routers/          # API endpoints (auth, analytics, social, monetization, etc.)
│   │   └── services/         # Social API clients (YouTube, Instagram, LinkedIn, TikTok, Twitter)
│   ├── .env.example          # OAuth API key configuration template
│   ├── pyproject.toml        # Python project & dependencies
│   └── creatoriq.db          # Local database
│
├── frontend/                 # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # UI, Charts & Dashboard Layouts
│   │   ├── contexts/         # AuthContext & RBAC
│   │   ├── pages/            # 9 Main Dashboard Pages & 7 Auth Portals
│   │   └── lib/              # Utility functions & sample metrics
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
│
└── docs/                     # Architecture & Workflow Documentation
    └── ARCHITECTURE_AND_WORKFLOWS.md
```

## Quick Start

### 1. Run the Backend (FastAPI)
```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 2. Run the Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Dashboard available at: `http://localhost:5173`
