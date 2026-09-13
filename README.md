# CreatorIQ — Creator Analytics & Content Performance Dashboard
**Milestone 1 + Milestone 2 Complete**

CreatorIQ is a full-stack creator analytics and content performance platform engineered for digital creators, agencies, and marketing teams. It unifies cross-platform telemetry across **YouTube, Instagram, TikTok, Facebook, X (Twitter), and LinkedIn** into a clean, modern, light-themed analytics dashboard featuring content metrics, multi-post comparison, audience demographics, growth trends, and role-based access control (RBAC).

---

## 1. System Architecture

CreatorIQ follows a clean, decoupled client-server architecture:

```
┌──────────────────────────────────────────────────────────┐
│             React 19 + Vite Frontend SPA                │
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
- **Backend**: FastAPI, Python 3.11+, Uvicorn, SQLAlchemy 2.0, Pydantic Settings
- **Authentication & Security**: JSON Web Tokens (JWT via Jose HS256), Direct BCrypt salted password hashing, Bearer Token authorization, Strict 401 Unauthenticated enforcement, Granular RBAC
- **Database**: SQLite default (`creator_iq.db`), with PostgreSQL support via `DATABASE_URL` environment variable

---

## 3. Scope: Milestone 1 + Milestone 2 Only

### Milestone 1 — User Management & Core Dashboard
- **Authentication**: User Registration, Login, Logout, JWT tokens, Protected routes.
- **Security**: BCrypt password hashing, session expiration handling, strict 401 on unauthenticated access (no insecure fallbacks).
- **Role-Based Access Control (RBAC)**:
  1. Creator (Channel analytics & studio)
  2. Agency (Talent management & cross-channel oversight)
  3. Marketing Team (Campaign ROI & reach benchmarks)
  4. Administrator (Full platform oversight)
- **Profiles & Settings**: Creator profile, agency roster, account settings, password change.
- **Creator Dashboard**:
  - Exactly 4 primary KPI cards: **Total Followers**, **Total Views**, **Total Reach**, **Avg Engagement Rate** (no Revenue KPI).
  - Performance Trends chart (views & engagement over 7D/14D/30D).
  - Supported Platforms breakdown (6 platforms).
  - Top Performing Content table.

### Milestone 2 — Content, Audience, Trends & Multi-Platform Integration
- **Content Analytics**:
  - Full metrics summary: Views, Likes, Comments, Shares, Saves, Watch Time, Reach, Engagement Rate.
  - Performance and engagement trends.
  - Filterable, sortable content table.
  - Side-by-side **Content Comparison** workflow (compare 2 to 4 items).
- **Audience Analytics**:
  - Follower growth trajectory.
  - Age distribution (18–24, 25–34, 35–44, 45–54, 55+).
  - Gender split (Male, Female, Non-binary / Other).
  - Geographic distribution (Regional & global diaspora).
  - Device usage (Mobile, Desktop, Tablet).
  - Active audience hours (peak engagement windows).
  - Reach & impressions overview.
- **Growth & Trends**:
  - Follower, content, reach, and engagement trend tracking.
  - Simple forward projection labeled **Demo Forecast (Sample Trajectory)**.
  - Hashtag and discovery performance analysis.
- **Social Integrations (6 platforms only)**:
  - YouTube, Instagram, TikTok, Facebook, X (Twitter), LinkedIn.
  - Clear **Demo Connector / Demo Sync** workflow.
  - Connect / Disconnect and Sync actions that simulate live telemetry updates.

*(Milestone 3 & 4 features such as revenue pipeline, sponsorship contracts, notifications, reports export, and complex AI engines are omitted from the showcase).*

---

## 4. Sample Demo Creator Identity

- **Channel Identity**: **Raw Talks With VK**
- **Format**: Telugu podcast discussions, long-form interviews, startup journeys, and viral short-form clips.
- **Honesty Note**: Data is realistic sample/demo data engineered for project demonstration. Simulated connectors are clearly labeled as "Demo Connector" and "Demo Forecast".

---

## 5. Seeded Demo Accounts

| Role | Email | Password | Primary Demonstration Focus |
|---|---|---|---|
| **Creator** | `creator@creatoriq.io` | `Creator@123` | Full creator dashboard, content studio, comparisons & profile edit |
| **Agency** | `agency@creatoriq.io` | `Agency@123` | Talent management view, multi-creator roster |
| **Marketing Team** | `marketing@creatoriq.io` | `Marketing@123` | Campaign reach analytics, audience benchmarks |
| **Administrator** | `admin@creatoriq.io` | `Admin@123` | Superuser platform privileges & session inspection |

*All passwords are encrypted with salted BCrypt hashes before database persistence.*

---

## 6. How to Run Locally

### 1. Backend Startup

```powershell
# Open terminal in backend directory
cd CreatorIQ/backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run Uvicorn server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Root: `http://127.0.0.1:8000/`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Startup

```powershell
# Open terminal in frontend directory
cd CreatorIQ/frontend

# Install dependencies (if needed)
npm install

# Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173/`

### 3. Production Build Validation

```powershell
npm run build
```
*(Build executes cleanly with 0 errors).*

---

## 7. Step-by-Step Mentor Demonstration Flow (5–10 Minutes)

1. **Open CreatorIQ**: Open `http://127.0.0.1:5173/`.
2. **Show Login Page**: Observe the clean, light, pastel-accented interface with 1-click mentor login tiles.
3. **Login as Creator**: Click the **Creator** 1-click tile (or enter `creator@creatoriq.io` / `Creator@123`) and click **Sign In to Dashboard**.
4. **Show Dashboard**:
   - Header shows **Raw Talks With VK** with **Demo Channel** badge.
   - Explain the 4 primary KPIs: **Total Followers (1.52M)**, **Total Views (1.87M)**, **Total Reach (2.46M)**, **Avg Engagement Rate (7.68%)**. (Note absence of revenue clutter).
   - Explain the **Performance Trends** area chart with 7D/14D/30D toggles.
   - Show the **Supported Platforms** breakdown cards.
   - Inspect the **Top Performing Content** list.
5. **Open Content Analytics**:
   - Click **Content Analytics** in the sidebar.
   - Review the 8-metric summary strip (Views, Likes, Comments, Shares, Saves, Watch Time, Reach, Eng. Rate).
   - Filter the table by content type (`video`, `reel`, `post`) or platform.
   - Click the **Compare** icon on two different episodes.
   - Scroll down to the **Content Comparison** section: explain the side-by-side metric rows, top performer identification, and retention takeaways.
6. **Open Audience Analytics**:
   - Click **Audience Analytics** in the sidebar.
   - Explain the **Follower Growth Trajectory** chart.
   - Review the demographic distributions: Age (core 18–34), Gender split, Device usage (76.5% Mobile), Geographic distribution (India 74.2%, US 12.4%, etc.), and Peak Active Hours (6 PM – 8:30 PM).
7. **Open Growth & Trends**:
   - Click **Growth & Trends** in the sidebar.
   - Review the 90-day / 180-day **Demo Forecast (Sample Trajectory)** chart and upcoming milestones.
   - Inspect the topic and hashtag performance table (`#RawTalksWithVK`, `#TeluguPodcast`, etc.).
8. **Open Social Integrations**:
   - Click **Social Integrations** in the sidebar.
   - Review the 6 required platforms: YouTube, Instagram, TikTok, Facebook, X, LinkedIn.
   - Click **Demo Sync** on YouTube: observe the sync spinner, updated timestamp, and green success banner.
   - Demonstrate the **Connect / Disconnect** toggle.
9. **Open Account Settings**:
   - Click **Account Settings** in the sidebar or navbar.
   - Review the **Creator Profile** (Raw Talks With VK bio, niche, website).
   - Switch to **Roles & Permissions** to demonstrate RBAC personas.
10. **Logout**:
    - Click **Sign Out**. The JWT token is wiped from client storage and the user is redirected to the login page.
