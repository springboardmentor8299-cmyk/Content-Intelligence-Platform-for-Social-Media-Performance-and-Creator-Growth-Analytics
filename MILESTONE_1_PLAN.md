# CreatorIQ Milestone 1 Implementation Plan

## 1. Current State Assessment

### Repository shape

The workspace is a two-application scaffold:

```text
CreatorIQ/
  backend/
    main.py
    database/       empty
    models/         empty
    routers/        empty
    schemas/        empty
    services/       empty
    utils/          empty
    venv/           local Python virtual environment
  frontend/
    index.html
    package.json
    package-lock.json
    vite.config.js
    .oxlintrc.json
    README.md
    public/
    src/
      App.jsx
      App.css
      index.css
      main.jsx
      assets/
```

There is no Git repository at the workspace root. The frontend contains its own generated ignore file, but repository-level version control and contribution conventions have not yet been established.

### Existing implementation

The backend [main.py](backend/main.py) imports FastAPI, creates an application named `CreatorIQ API`, and exposes one `GET /` health-style response. It has no database connection, settings layer, authentication, routers, error handling, migrations, logging, or tests. The backend virtual environment exists locally and should remain uncommitted.

The frontend is the default React + Vite starter application. [App.jsx](frontend/src/App.jsx) renders the Vite/React demonstration page and a local counter. [main.jsx](frontend/src/main.jsx) mounts the app with React Strict Mode. The CSS and assets are starter-template styling and are not yet a CreatorIQ dashboard. No API client, routing, state management, authentication UI, protected route, charting, or dashboard shell exists.

The frontend [package.json](frontend/package.json) has React, React DOM, Vite, the React Vite plugin, and Oxlint. It does not yet include a router, HTTP client, Tailwind CSS, form validation, charting, or authentication support.

### What currently works

- The frontend can be run with Vite from the `frontend` directory after dependencies are installed.
- The backend can be run with Uvicorn using the existing `backend/venv` and returns a JSON response from `/`.
- FastAPI's generated OpenAPI page is available when the backend is running.

### Gaps and risks

- The two applications have no documented shared configuration or API contract.
- The backend is not structured for feature routers, dependency injection, database sessions, migrations, or service boundaries.
- PostgreSQL, MongoDB, and Redis are not configured or provisioned.
- There is no user, organization/tenant, role, credential, session, or OAuth connection model.
- Authentication and authorization are absent; no password hashing, JWT issuing/verification, OAuth state protection, or RBAC enforcement exists.
- Secrets would have to be added unsafely unless environment-based settings are introduced first.
- The frontend is still template code and has no application navigation, loading/error states, authentication flow, or backend integration.
- No automated tests, health/readiness checks, structured logging, API versioning, Docker baseline, CI checks, or architecture documentation exist.
- The requested enterprise integrations are too broad for one initial milestone. Milestone 1 should establish extensible foundations and a working local vertical slice, not implement social ingestion or analytics engines.

### Recommended cleanup and refactoring

1. Keep `backend/main.py` as a small application composition entry point and move routes, settings, database setup, and security logic into dedicated modules.
2. Treat the existing `backend/venv` as a local environment only; add dependency manifests and environment templates outside it.
3. Replace the generated frontend screen with a minimal CreatorIQ application shell while preserving Vite for the current milestone unless a deliberate Next.js migration is approved.
4. Add explicit API versioning, request/response schemas, consistent error responses, correlation/request IDs, and health/readiness endpoints.
5. Add tests before expanding feature scope and document all local startup commands.

## 2. Milestone 1 Technical Roadmap

### Backend blueprint

Recommended initial structure:

```text
backend/
  app/
    main.py
    core/
      config.py
      security.py
      logging.py
    api/
      deps.py
      v1/router.py
      v1/endpoints/
        health.py
        auth.py
        users.py
    db/
      postgres.py
      mongo.py
      redis.py
      base.py
    models/
      user.py
      organization.py
      role.py
      oauth_connection.py
    schemas/
      auth.py
      user.py
      common.py
    services/
      auth.py
      users.py
    repositories/
    middleware/
  alembic/
  tests/
  requirements.txt or pyproject.toml
  .env.example
```

#### PostgreSQL

Use PostgreSQL as the system of record for transactional identity and configuration data. The first schema should include:

- `organizations`: tenant identity, name, status, timestamps.
- `users`: organization membership, email, display name, password hash when local login is enabled, status, timestamps.
- `roles` and `user_roles`: extensible role assignment rather than hard-coded UI-only permissions.
- `oauth_connections`: provider, provider subject, encrypted token references/metadata, scopes, expiry, ownership, and timestamps. Raw access tokens must not be logged or returned to the frontend.

Use UUID primary keys, UTC timestamps, uniqueness constraints for tenant-scoped email/provider identities, foreign keys, indexes for lookup fields, and soft deactivation/status fields where operational recovery requires them. SQLAlchemy models should be separate from Pydantic API schemas.

#### Alembic

Configure Alembic against the SQLAlchemy metadata and environment-based PostgreSQL URL. Create an initial migration for organizations, users, roles, user-role assignments, and OAuth connections. Migrations must be deterministic, reversible where practical, and run explicitly in local setup and CI.

#### MongoDB

Provision MongoDB in the local baseline and create a connection abstraction, but keep raw social payload collections out of the initial identity migration. Define collection naming, tenant ownership fields, indexes, retention expectations, and serialization boundaries before adding ingestion data.

#### Redis

Provision Redis and add a small client/dependency abstraction for health checks, short-lived authentication/session support, rate limiting, and future real-time counters. Do not use Redis as the source of truth for users or permissions.

#### Authentication and OAuth2

Implement a local authentication foundation first:

- Register a user within an organization with normalized email and a strong password hash.
- Authenticate credentials and issue short-lived JWT access tokens.
- Support refresh-token rotation or a documented initial alternative; store revocation/session state server-side when required.
- Verify JWT signature, expiry, issuer, audience, and token type through FastAPI dependencies.
- Return a minimal `/auth/me` representation without secrets.
- Add OAuth provider abstractions and protected state/PKCE handling as the foundation for later YouTube, Instagram, TikTok, Facebook, X, LinkedIn, and Twitch connectors. Provider-specific API ingestion is outside Milestone 1.

#### RBAC

Define initial roles such as `creator`, `agency`, `marketing_team`, and `administrator`, with explicit permissions and tenant scoping. Enforce authorization in backend dependencies/services, never only in React. Add tests proving that users cannot access another organization and that insufficient roles receive a consistent `403` response.

#### API baseline

Expose versioned routes under `/api/v1`, including health/readiness, authentication, and current-user endpoints. Add CORS configuration restricted to the configured frontend origin, request validation through Pydantic, consistent error envelopes, OpenAPI tags, and readiness checks for configured dependencies.

### Frontend blueprint

Keep React + Vite for Milestone 1 to avoid an unnecessary framework migration. Recommended structure:

```text
frontend/src/
  app/
    App.jsx
    router.jsx
    providers.jsx
  components/
    layout/
    forms/
    feedback/
  features/
    auth/
    dashboard/
  pages/
    LoginPage.jsx
    DashboardPage.jsx
    NotFoundPage.jsx
  services/
    apiClient.js
    authApi.js
  state/
  styles/
  test/
```

Use React Router for public/protected routes. Create an API service layer with a single configured base URL, JSON/error normalization, and an auth-aware request path. Keep tokens out of arbitrary component state; choose and document the storage/refresh strategy with XSS and CSRF implications considered. Add an auth provider or equivalent state boundary, route guards, login/logout behavior, loading states, expired-session handling, and accessible error messages.

Build the first dashboard shell with a responsive navigation/sidebar, tenant/user context, page title area, empty/loading/error states, and placeholder KPI regions that are clearly ready for later analytics modules. Add Tailwind only after deciding whether its utility conventions fit the project; configure it consistently if approved. Add Recharts or Chart.js only when the first real metric contract exists.

### Environment and local infrastructure

Use typed Pydantic settings loaded from environment variables. Provide `.env.example` values for application mode, JWT settings, CORS origins, PostgreSQL, MongoDB, Redis, and OAuth placeholders. Never commit real secrets.

Add a Docker Compose development baseline for PostgreSQL, MongoDB, and Redis with named volumes, health checks, non-default application credentials supplied through environment variables, and isolated local networking. The backend and frontend may run natively during Milestone 1, while containerizing the application services can follow once the local contracts stabilize.

Add dependency lock/manifests, a root or documented command convention, and a README covering setup, migrations, startup, test, lint, and health-check commands.

## 3. Ordered Task Breakdown and Acceptance Criteria

### Phase 1: Baseline and decisions

Tasks:

- Confirm React + Vite versus Next.js for this milestone.
- Establish repository-level ignore/configuration conventions and dependency manifests.
- Record API versioning, tenant model, initial roles, token policy, and local service ports.
- Add root documentation and `.env.example` without real credentials.

Acceptance criteria:

- A new developer can identify the backend, frontend, required runtimes, and startup commands from documentation.
- Configuration has one documented source per environment and no secrets are committed.
- The architecture decisions and out-of-scope work are recorded.

### Phase 2: Backend application foundation

Tasks:

- Create the application package and composition entry point.
- Add Pydantic settings, structured logging basics, CORS, API v1 router registration, and health/readiness endpoints.
- Add SQLAlchemy engine/session handling, MongoDB client abstraction, Redis client abstraction, and dependency lifecycle management.
- Add baseline exception handling and request correlation IDs.

Acceptance criteria:

- The backend starts from a clean environment using documented commands.
- `GET /api/v1/health` reports application health and readiness reports dependency status accurately.
- Configuration errors fail clearly at startup and secrets are absent from logs.
- Backend unit tests cover settings validation, health behavior, and error responses.

### Phase 3: Data model and migrations

Tasks:

- Implement organization, user, role, user-role, and OAuth connection SQLAlchemy models.
- Add Pydantic schemas and repository/service boundaries.
- Configure Alembic and generate the initial migration.
- Add database indexes and tenant-scoping constraints.

Acceptance criteria:

- A fresh PostgreSQL database can be migrated up from zero.
- The migration creates the documented tables, constraints, and indexes.
- Model and schema tests verify required validation and tenant relationships.
- Database sessions are closed correctly on success and failure.

### Phase 4: Authentication and RBAC

Tasks:

- Implement registration, login, token verification, current-user, logout/revocation strategy, and password hashing.
- Implement role/permission dependencies and organization scoping.
- Add OAuth provider interface with secure state/PKCE placeholders, without real provider ingestion.
- Add security-focused tests.

Acceptance criteria:

- Valid credentials can obtain a token and access `/api/v1/auth/me`.
- Invalid, expired, malformed, and revoked tokens are rejected consistently.
- Passwords and tokens are never returned or logged.
- Cross-tenant access is rejected and role restrictions return `403`.
- OpenAPI documents authentication requirements for protected routes.

### Phase 5: Frontend application shell

Tasks:

- Replace the starter screen with the CreatorIQ app shell and route structure.
- Add API client, auth state boundary, login form, protected dashboard route, logout, and session-expiry behavior.
- Add responsive navigation, user/tenant context, loading, empty, error, and not-found states.
- Add the chosen styling foundation and accessible component conventions.

Acceptance criteria:

- The frontend builds and lints from a clean install.
- Unauthenticated users are redirected to login; authenticated users can reach the dashboard shell.
- Login errors, API failures, loading states, and logout are visible and usable.
- The layout works at mobile and desktop widths without overlapping content.
- Browser tests cover the login-to-dashboard and logout flows against a test API.

### Phase 6: Local infrastructure and integration

Tasks:

- Add Docker Compose services and health checks for PostgreSQL, MongoDB, and Redis.
- Wire backend readiness to those services and document migration order.
- Add integration test configuration and a minimal end-to-end smoke test.
- Add CI checks for backend tests, frontend lint/build, migration validation, and secret scanning.

Acceptance criteria:

- A clean machine with Docker and documented runtimes can start the local dependencies reproducibly.
- Backend readiness changes correctly when a dependency is unavailable.
- CI fails on test, lint, build, migration, or secret-handling regressions.
- The documented Milestone 1 demo proves: register/login, protected dashboard access, role/tenant enforcement, logout, and dependency health.

### Phase 7: Milestone review and handoff

Tasks:

- Review threat model, API contracts, database indexes, operational logs, and test coverage.
- Record known limitations and decisions for Milestone 2 social ingestion and analytics.
- Tag the milestone only after all acceptance criteria pass.

Acceptance criteria:

- A review checklist is signed off by the project owner.
- Open risks have owners or explicit mitigation plans.
- Milestone 2 has stable interfaces for ingestion connectors, raw payload storage, and analytics events without prematurely implementing them in Milestone 1.

## Explicit Milestone 1 Non-Goals

The following should remain out of Milestone 1 unless scope is deliberately re-approved: production social-platform connectors, Kafka/RabbitMQ, Celery workers, Flink/Spark streaming, forecasting/ML, monetization calculations, report generation, production cloud deployment, and full real-time WebSocket metrics. Milestone 1 should make those future capabilities possible through clean boundaries while delivering a secure, testable identity and dashboard foundation.