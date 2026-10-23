# CreatorIQ - Comprehensive Platform & Social Media OAuth Setup Guide

This guide walks you through setting up **CreatorIQ** from scratch, including Google Cloud Platform (YouTube Data API), LinkedIn Developer Portal, Instagram (Meta / Graph API & SerpApi), database initialization, and running both backend and frontend environments locally.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Configuration](#3-environment-configuration)
4. [Google Cloud Platform (GCP) & YouTube Setup](#4-google-cloud-platform-gcp--youtube-setup)
5. [LinkedIn Developer Portal Setup](#5-linkedin-developer-portal-setup)
6. [Instagram (Meta for Developers & SerpApi) Setup](#6-instagram-setup)
7. [Local Installation & Running](#7-local-installation--running)
8. [Role-Based Access Control (RBAC) Accounts](#8-role-based-access-control-rbac-accounts)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)

---

## 1. Architecture Overview

CreatorIQ is a modern enterprise social media analytics and intelligence platform consisting of:
- **Backend**: FastAPI (Python 3.10+) with SQLAlchemy ORM, SQLite database, and OAuth2 ingestion pipelines.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, and Vite.
- **Social Connectors**:
  - **YouTube**: Google OAuth 2.0 + YouTube Data API v3.
  - **LinkedIn**: LinkedIn OpenID Connect OAuth 2.0.
  - **Instagram**: Meta Graph API / SerpApi public creator engine.

---

## 2. Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (bundled with Node.js)
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
- **uv** (Recommended for fast Python dependency management) or standard `pip`
- **Git** ([Download Git](https://git-scm.com/))

---

## 3. Environment Configuration

### A. Backend Environment Setup
Create a file named `.env` in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Populate `backend/.env` with your credentials:

```ini
# ========================================================
# CreatorIQ Backend Environment Configuration
# ========================================================

# Base URL of your Frontend (used for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# --- 1. YouTube / Google Cloud Platform (GCP) ---
YOUTUBE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/youtube

# --- 2. LinkedIn Developer Portal ---
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/linkedin

# --- 3. Instagram (Meta Developer / Graph API) ---
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/instagram

# --- 4. TikTok (Optional) ---
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/tiktok

# --- 5. Twitter / X (Optional) ---
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/twitter
```

### B. Frontend Environment Setup
Create a file named `.env` in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Ensure `frontend/.env` contains:
```ini
VITE_API_URL=http://localhost:8000
```

---

## 4. Google Cloud Platform (GCP) & YouTube Setup

To authenticate with YouTube and pull channel analytics, subscriber counts, views, and videos:

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top and select **New Project**.
3. Name your project (e.g., `CreatorIQ Analytics`) and click **Create**.

### Step 2: Enable YouTube Data API v3
1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**.
2. Search for **YouTube Data API v3**.
3. Click on **YouTube Data API v3** and click **Enable**.

### Step 3: Configure the OAuth Consent Screen
1. In the left navigation, click **APIs & Services** > **OAuth consent screen**.
2. Select User Type: **External** (or Internal if using Google Workspace) and click **Create**.
3. Fill in the App Information:
   - **App name**: `CreatorIQ`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and add:
   - `.../auth/youtube.readonly`
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`
   - `openid`
6. Click **Save and Continue**.
7. Under **Test Users**, click **+ Add Users** and add your Google/YouTube account email address (e.g. `yourname@gmail.com`).
8. Click **Save and Continue**.

### Step 4: Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. In **Application type**, choose **Web application**.
4. In **Name**, enter `CreatorIQ Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://localhost:8000`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:8000/api/v1/social/callback/youtube`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret** and paste them into your `backend/.env`:
   ```ini
   YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   YOUTUBE_CLIENT_SECRET=GOCSPX-your_secret
   YOUTUBE_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/youtube
   ```

---

## 5. LinkedIn Developer Portal Setup

To authenticate LinkedIn and fetch member profile stats, impressions, and track activity:

### Step 1: Create a LinkedIn Developer App
1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
2. Sign in with your LinkedIn account.
3. Click **Create App**.
4. Fill in:
   - **App name**: `CreatorIQ Analytics`
   - **LinkedIn Page**: Link your LinkedIn company page or personal creator page URL.
   - **App logo**: Upload a 100x100px square logo.
5. Review the legal terms and click **Create app**.

### Step 2: Add OpenID Connect Products
1. In your App dashboard, go to the **Products** tab.
2. Find **Sign In with LinkedIn using OpenID Connect** and click **Request Access**.
3. (Optional) Request access to **Share on LinkedIn** if you want write access.

### Step 3: Configure Auth & Redirect URLs
1. Go to the **Auth** tab.
2. Under **Application credentials**, you will find your:
   - **Client ID**
   - **Client Secret** (click the eye icon to reveal)
3. Under **OAuth 2.0 settings**, click the edit pencil icon next to **Authorized redirect URLs for your app**.
4. Add:
   ```
   http://localhost:8000/api/v1/social/callback/linkedin
   ```
5. Click **Update**.
6. Under **OAuth 2.0 scopes**, ensure `openid`, `profile`, and `email` are active.
7. Copy your credentials into `backend/.env`:
   ```ini
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   LINKEDIN_REDIRECT_URI=http://localhost:8000/api/v1/social/callback/linkedin
   ```

---

## 6. Instagram Setup

CreatorIQ supports two methods for Instagram integration:

### Option A: Meta for Developers (Official Graph API)
1. Go to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Click **My Apps** > **Create App**.
3. Select **Other** > **Business** (or Consumer).
4. Add the **Instagram Graph API** product to your app.
5. In your App Settings > Basic:
   - Copy **App ID** into `INSTAGRAM_CLIENT_ID`.
   - Copy **App Secret** into `INSTAGRAM_CLIENT_SECRET`.
6. Under Instagram settings, configure Valid OAuth Redirect URIs:
   ```
   http://localhost:8000/api/v1/social/callback/instagram
   ```

### Option B: Fast Public Creator Profiling (SerpApi / Scraper Mode)
- For public creator benchmarking and competitive analytics without requiring Meta App Review, CreatorIQ includes a built-in scraper and SerpApi fallback.
- In `backend/app/services/instagram.py`, public profiles (like `@serpapicom`) can be inspected instantly for follower metrics, engagement rate, and recent reels.

---

## 7. Local Installation & Running

### Step 1: Clone the Repository
```bash
git clone https://github.com/springboardmentor8299-cmyk/Content-Intelligence-Platform-for-Social-Media-Performance-and-Creator-Growth-Analytics.git
cd Content-Intelligence-Platform-for-Social-Media-Performance-and-Creator-Growth-Analytics
```

### Step 2: Start the Backend (FastAPI)
Open a terminal window:

```bash
cd backend

# Using uv (fastest):
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# OR using standard python venv:
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Backend API: `http://localhost:8000`
- Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Step 3: Start the Frontend (Vite + React)
Open a second terminal window:

```bash
cd frontend

# Install node dependencies:
npm install

# Start Vite development server:
npm run dev
```

- Frontend Application: `http://localhost:5173`

---

## 8. Role-Based Access Control (RBAC) Accounts

CreatorIQ features a complete Role-Based Access Control system with dedicated portals and permission levels:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Admin** | `admin@creatoriq.com` | `admin123` | Full system control, User Management, Global OAuth Settings, Role switching |
| **Manager** | `manager@creatoriq.com` | `manager123` | Multi-creator oversight, Content performance, Campaign ROI, Exporting reports |
| **Creator** | `creator@creatoriq.com` | `creator123` | Personal connected channels (YouTube, LinkedIn, IG), Audience metrics, Earnings |
| **Viewer** | `viewer@creatoriq.com` | `viewer123` | Read-only access to published analytics and public dashboards |

*Tip: You can also use the Admin Dashboard at `http://localhost:5173/admin` to modify user roles, delete accounts, or inspect connected social accounts in real time.*

---

## 9. Troubleshooting & FAQ

### 1. YouTube returns `Error 400: redirect_uri_mismatch`
- **Cause**: The redirect URI in Google Cloud Console does not match `YOUTUBE_REDIRECT_URI` in `.env`.
- **Solution**: Ensure `http://localhost:8000/api/v1/social/callback/youtube` is added under **Authorized redirect URIs** in Google Cloud Console > Credentials > OAuth 2.0 Client ID. Note that trailing slashes matter (`/youtube` not `/youtube/`).

### 2. YouTube returns `Access blocked: App has not completed the Google verification process`
- **Cause**: The GCP project is in "Testing" mode and your email is not in the Test Users list.
- **Solution**: Go to **OAuth consent screen** > **Test users** > click **+ Add users** > enter the Google email you are signing in with.

### 3. LinkedIn OAuth redirects to `https://www.linkedin.com/feed/` instead of Activity
- **Fixed**: Post links and the "Open Post" buttons in CreatorIQ route to `https://www.linkedin.com/my-items/posted-activity/`, taking authenticated users directly to their real personal activity stream (`Activity | Kumar V | LinkedIn`).

### 4. Port 8000 or Port 5173 already in use
- Check and terminate existing processes:
  ```bash
  # Check port 8000:
  lsof -i :8000
  kill -9 <PID>

  # Check port 5173:
  lsof -i :5173
  kill -9 <PID>
  ```

---

## Contributing
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "feat: describe your change"`
3. Push to origin: `git push origin feature/your-feature-name`
4. Open a Pull Request on GitHub.
