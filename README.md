# CreatorIQ

Milestone 1 currently provides a local FastAPI authentication API and a React dashboard shell.

## Run locally

### Backend

From the project root:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The API is available at `http://127.0.0.1:8000` and its docs at `/docs`.

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Local databases

Docker Desktop is optional for the current SQLite development default. To start the planned PostgreSQL, MongoDB, and Redis services:

```powershell
docker compose up -d
```

The database services are provisioned for local development. The backend verifies PostgreSQL, MongoDB, and Redis at startup; development mode logs a warning and continues when Docker services are not running.

### Migrations

From `backend`:

```powershell
python -m alembic upgrade head
python -m alembic check
```

The initial revision creates organizations, users, and platform accounts. Existing SQLite files created by the original demo were baselined and upgraded locally; fresh environments should use `upgrade head`.

## Current API flow

- `POST /api/v1/auth/register` creates a user and workspace.
- `POST /api/v1/auth/login` accepts OAuth2 form fields `username` and `password`.
- `GET /api/v1/auth/me` requires a bearer token.
- `GET /api/v1/health` and `GET /api/v1/ready` provide service checks.
- Milestone 2 provider configuration and worker commands are documented in [MILESTONE_2_PLAN.md](MILESTONE_2_PLAN.md).

Do not use real passwords or production secrets locally. Copy `backend/.env.example` to `backend/.env` when you need custom settings, and replace the development JWT secret before sharing the application.