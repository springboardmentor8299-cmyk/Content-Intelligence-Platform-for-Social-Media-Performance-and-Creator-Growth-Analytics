# CreatorIQ — Creator Analytics & Content Performance Dashboard
**Milestone 4 Complete: Testing, Responsive Optimization, Dockerization & Cloud Deployment Readiness**

CreatorIQ is a full-stack creator analytics and content performance platform engineered for digital creators, agencies, and marketing teams. Focused on the verified public channel of **Raw Talks With VK / Vamshi Kurapati**, the platform unifies cross-platform telemetry across **YouTube, Instagram, Facebook, X, and LinkedIn** (with TikTok strictly excluded).

The platform features:
- **Authentication & RBAC**: JWT Bearer tokens, salted BCrypt hashing, and 4 role personas (Creator, Agency, Marketing Team, Administrator).
- **Core Dashboard**: 8-dimension KPI monitoring, public performance curves, and supported platform matrices.
- **Content Analytics**: 26 verified episodes & shorts, multi-item comparison engine (2 to 4 items), format filters, and sorting.
- **Audience Analytics**: Honest telemetry status, public subscriber trajectory, and private studio access indicators.
- **Growth & Trends**: 30-day continuous view velocity trends and 3/6-month analytical projections.
- **Revenue Analytics**: Full CRUD pipeline for sponsorships and brand deals ($49,650 pipeline) with monthly breakdowns.
- **Notifications & Alerts**: Filterable notification center with unread count badges and mark-as-read workflows.
- **Reports & Exports**: Previews for 6 executive report types across 4 time periods, RFC-4180 CSV export, and styled OpenPyXL Excel (`.xlsx`) export.
- **Dockerization**: Production-ready `Dockerfile` for backend, multi-stage Nginx `Dockerfile` for frontend, and PostgreSQL `docker-compose.yml`.
- **System Optimization**: Code-split vendor chunks (`vendor-react`, `vendor-recharts`, `vendor-lucide`), responsive mobile drawer navigation, error boundaries, and connection pool resilience.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│              React 19 + Vite Frontend SPA                │
│    (Tailwind CSS, Recharts, Lucide Icons, Axios API)     │
└────────────────────────────┬─────────────────────────────┘
                             │ JWT Bearer Authentication
                             │ (REST API via /api/v1)
┌────────────────────────────▼─────────────────────────────┐
│                 FastAPI Backend Engine                   │
│   (OAuth2 Bearer, RBAC Middleware, Pydantic Validation)  │
└────────────────────────────┬─────────────────────────────┘
                             │ SQLAlchemy 2.0 ORM
┌────────────────────────────▼─────────────────────────────┐
│                 Relational Database                      │
│        (SQLite Default / PostgreSQL Supported)           │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide React, Axios
- **Backend**: FastAPI, Python 3.11+, Uvicorn, SQLAlchemy 2.0, Pydantic Settings, OpenPyXL
- **Authentication & Security**: JSON Web Tokens (JWT via Jose HS256), BCrypt password hashing, Granular RBAC
- **Database**: SQLite default (`creator_iq.db`) for zero-config local run, PostgreSQL supported via `DATABASE_URL`
- **Containers & Deployment**: Docker, Docker Compose, Nginx (Alpine), Multi-stage builds, Gzip compression

---

## 3. Truthful Social Integration Status

In strict adherence to data authenticity rules:

| Platform | Architectural Status | Connection State | Provenance / Implementation |
|---|---|---|---|
| **YouTube** | Public Channel Monitored | **LIVE / VERIFIED** | Verified public channel queries for `@RawTalksWithVK` (1.42M subscribers, 26 verified episodes/shorts, 11.54M views, 6.18% avg engagement). |
| **Instagram** | Connector Implemented | **CREDENTIAL MISSING** | Displays **Configuration Required / Not Connected**. Connectable via `RAPIDAPI_KEY` for Glavier Instagram API. |
| **X** | Connector Implemented | **CREDENTIAL MISSING** | Displays **Configuration Required / Not Connected**. Connectable via `X_BEARER_TOKEN` for X Developer API v2. |
| **LinkedIn** | Connector Implemented | **CREDENTIAL MISSING** | Displays **Configuration Required / Not Connected**. Connectable via `LINKEDIN_ACCESS_TOKEN` for LinkedIn Community API. |
| **Facebook** | Architecture Ready | **NOT LIVE** | Displays **Configuration Required / Not Connected**. Architecture prepared for Meta Graph API. |
| **TikTok** | **STRICTLY EXCLUDED** | **NONE** | Completely excluded from all endpoints, models, views, and schemas. |

### Private Telemetry Honesty:
Private creator-only metrics remain strictly unavailable unless connected via creator-authenticated OAuth:
- Reach & Impressions: Clearly labeled "Creator access required" / 0
- Saves & Watch Time: Labeled "Private" (Creator Studio access required)
- Demographics (Age, Gender, Geography, Device): Labeled "Configuration Required / Requires YouTube Studio OAuth"

---

## 4. Seeded Demo Accounts

| Role | Email | Password | Primary Demonstration Focus |
|---|---|---|---|
| **Creator** | `creator@creatoriq.io` | `Creator@123` | Full creator dashboard, content studio, comparisons & profile edit |
| **Agency** | `agency@creatoriq.io` | `Agency@123` | Talent management view, multi-channel portfolio oversight |
| **Marketing Team** | `marketing@creatoriq.io` | `Marketing@123` | Campaign reach analytics, audience benchmarks |
| **Administrator** | `admin@creatoriq.io` | `Admin@123` | Superuser platform privileges & session inspection |

*All passwords are encrypted with salted BCrypt hashes before database persistence.*

---

## 5. Prerequisites & Environment Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Docker and Docker Compose (optional for containerized deployment)

### Environment Configuration
Copy environment templates and configure values as needed:
```bash
# Root
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```
*(No secrets are committed to version control; `.env` files are tracked in `.gitignore`).*

---

## 6. How to Run Locally

### Option A: Local Development Server

#### 1. Backend Startup
```powershell
cd backend
.\venv\Scripts\Activate.ps1   # Or source venv/bin/activate on Unix
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Root: `http://127.0.0.1:8000/`
- API Health Check: `http://127.0.0.1:8000/health`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend Startup
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173/`

---

### Option B: Docker Compose (Full Stack + PostgreSQL)

```bash
docker compose up --build
```
- Frontend Application: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

---

## 7. Running the Automated Test Suites

From the `backend` directory:
```powershell
cd backend

# Run Milestone 3 verification suite
.\venv\Scripts\python test_m3_verification.py

# Run Milestone 4 comprehensive workflow & health suite
.\venv\Scripts\python test_m4_verification.py
```
*(Both test suites achieve 100% pass rate).*

---

## 8. Cloud Deployment Readiness

CreatorIQ is configured for containerized cloud deployment on AWS ECS, Google Cloud Run, Render, Railway, or DigitalOcean:
- **Host & Port**: Backend binds dynamically to `0.0.0.0` and reads `$PORT`.
- **CORS Configuration**: Dynamically handles `FRONTEND_URL` while preserving localhost defaults.
- **Database Resilience**: PostgreSQL connection pool pre-ping enabled (`pool_pre_ping=True`) to handle cloud connection drops.
- **Health Endpoint**: Dedicated `/health` probe for cloud load balancer health checks.

> [!NOTE]
> Cloud deployment requires external cloud account/configuration and credentials; the project is deployment-ready.

---

## 9. Complete 14-Step Final Demo Workflow

1. **Login**: Sign in at `http://localhost:5173` using `creator@creatoriq.io` / `Creator@123`.
2. **Creator Dashboard**: View personalized welcome banner for *Vamshi Kurapati (VK)* with verified channel provenance badge.
3. **KPI Overview**: Examine the 3 core public KPI cards (1.42M Subscribers, 11.5M Views, 6.18% Engagement) and toggle the 8-dimension KPI monitoring strip.
4. **Content Analytics**: Navigate to Content Analytics tab to review the 26 verified episodes/shorts catalog and aggregated engagement summary.
5. **Content Performance / Comparison**: Sort content by views or engagement rate; select 2 to 4 episodes and trigger the side-by-side comparison engine.
6. **Audience Analytics**: Review public subscriber baseline and honest indicators explaining creator studio telemetry requirements.
7. **Growth / Trend Analytics**: Review 30-day continuous view velocity trends and switch between 90-day and 6-month forward analytical estimates.
8. **Revenue Analytics**: Inspect tracked sponsorships and deals ($49,650 pipeline); demonstrate adding, updating, and filtering a deal.
9. **Notifications & Alerts**: View system alerts across milestone, velocity, and sponsorship categories; demonstrate marking notifications as read.
10. **Reports & Exports**: Preview the 6 executive report types across 7D, 30D, 90D, and all-time periods.
11. **CSV & XLSX Download**: Click "Download CSV" and "Download Excel (.xlsx)" to verify instantaneous file generation and download.
12. **Social Integrations / Status**: Review the multi-platform hub verifying YouTube public channel monitoring and honest "Configuration Required" states for Instagram, X, LinkedIn, and Facebook (with zero TikTok references).
13. **Settings / Profile & RBAC**: Open Account Settings modal to edit bio/details; switch roles to Agency or Marketing Team to demonstrate RBAC persona tailoring.
14. **Logout**: Click the Logout button in the header to securely clear session tokens and return to the login interface.

---
*Documentation maintained for CreatorIQ.*
