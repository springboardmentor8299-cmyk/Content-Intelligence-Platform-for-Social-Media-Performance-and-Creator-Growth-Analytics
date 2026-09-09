# Milestone 2 Plan

## Implemented

- Added modular YouTube Data API v3 and Instagram Graph API connector clients.
- Added signed OAuth state, callback token persistence, linked-account listing, and on-demand sync routes.
- Added Celery configuration using Redis and scheduled six-hourly account sync tasks.
- Raw sync payloads are written to MongoDB `raw_social_feeds` when MongoDB is available.
- Added `ContentAnalyticsService`, `AudienceAnalyticsService`, and `GrowthTrendService`.
- Added range-aware overview, content, audience, and growth analytics routes.
- Connected the React dashboard to live analytics requests with 7, 30, and 90 day filters.
- Added YouTube and Instagram connect/sync actions to the Platforms page.

## Provider configuration

Copy `backend/.env.example` to `backend/.env` and set the values below when using real APIs:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/youtube
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=http://127.0.0.1:8000/api/v1/social/callback/instagram
FRONTEND_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379/0
MONGO_URL=mongodb://creatoriq:creatoriq@localhost:27017
```

Without Google or Meta credentials, connector URLs and callbacks use deterministic synthetic data. This keeps local development and charts functional without external API access.

For real YouTube OAuth, add the exact value of `GOOGLE_REDIRECT_URI` to Google Cloud Console under **Authorized redirect URIs**. The `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must belong to that same Google OAuth client. Do not use `local-development` or another placeholder value.

## Running workers

Start Redis, MongoDB, and PostgreSQL with `docker compose up -d`. From `backend`, run the Windows-safe worker and Beat processes in separate PowerShell terminals:

```powershell
docker compose up -d redis
celery -A app.core.celery_app.celery_app worker --loglevel=info -P solo
celery -A app.core.celery_app.celery_app beat --loglevel=info
```

The API can trigger an on-demand sync with `POST /api/v1/social/sync/{account_id}` and inspect it with `GET /api/v1/social/sync/status/{task_id}`. Both routes require the existing bearer-token authentication. Platform-name sync requests such as `POST /api/v1/social/sync/youtube` remain supported for compatibility. If Redis or Celery is unavailable in development, the platform route returns a synthetic response and account tasks return `PENDING` until a worker is installed and running.

## Verification

```powershell
cd backend
python -m compileall app
pytest
cd ..\frontend
npm run build
```
