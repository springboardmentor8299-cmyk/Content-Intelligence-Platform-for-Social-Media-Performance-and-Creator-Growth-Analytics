# CreatorIQ — Social Media API Integration Setup & Architecture Guide

**Project:** CreatorIQ: Creator Analytics & Content Performance Dashboard  
**Creator:** Raw Talks With VK (@RawTalksWithVK)  
**Document Version:** 1.0 (Milestone 3 Presentation Release)  

---

## 1. Overview & Current Integration Status

CreatorIQ is engineered as a **Multi-Platform Creator Intelligence Platform** supporting exactly 5 platforms (TikTok is strictly excluded):

| Platform | Current Operational Status | Data Provenance | Credentials Configured Today |
| :--- | :--- | :--- | :--- |
| **YouTube** | **Public Data Available** | Public YouTube channel observation (@RawTalksWithVK) | Public telemetry monitored; live query active when `YOUTUBE_API_KEY` is present |
| **Instagram** | **Integration Ready** | Glavier Instagram API on RapidAPI | Configuration Required / Not Connected (Set `RAPIDAPI_KEY`) |
| **Facebook** | **Integration Ready** | Facebook Graph API staged | Configuration Required / Not Connected |
| **X** | **Integration Ready** | X Developer API v2 staged | Configuration Required / Not Connected |
| **LinkedIn** | **Integration Ready** | LinkedIn Community API staged | Configuration Required / Not Connected |

---

## 2. Integration Architecture

The software architecture is decoupled so that connecting live APIs requires zero architectural rewrites or breaking database schema changes.

All service boundaries reside in:
```
backend/app/integrations/
    ├── __init__.py
    ├── youtube.py       # YouTubeIntegrationService (YouTube Data API v3 live queries)
    ├── instagram.py     # InstagramIntegrationService (RapidAPI Glavier Instagram API scraper)
    ├── facebook.py      # FacebookIntegrationService (Facebook Graph API)
    ├── x.py             # XIntegrationService (X Developer API v2)
    └── linkedin.py      # LinkedInIntegrationService (LinkedIn Marketing API)
```

---

## 3. Environment Variables & Secret Management

### Critical Security Rule
**NO SECRETS BELONG IN GITHUB.**  
API keys, OAuth client secrets, and access tokens must **never** be committed to version control. They must be supplied via local `.env` files or secure production environment variables.

### Required Environment Variable Schema

Configure these keys in your `backend/.env` file:

```env
# ============================================================
# CREATORIQ PRODUCTION API INTEGRATION KEYS
# (Do NOT commit actual values to Git repository)
# ============================================================

# 1. Google Cloud / YouTube Data & Analytics API
YOUTUBE_API_KEY=your_google_api_key_here
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:5173/auth/youtube/callback

# 2. Instagram Integration (RapidAPI — Glavier Instagram API)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=instagram-bulk-profile-scrapper.p.rapidapi.com

# 3. Facebook Graph API
FACEBOOK_CLIENT_ID=your_facebook_client_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:5173/auth/facebook/callback

# 4. X (Twitter) Developer API v2
X_CLIENT_ID=your_x_client_id_here
X_CLIENT_SECRET=your_x_client_secret_here
X_API_KEY=your_x_api_key_here
X_API_SECRET=your_x_api_secret_here
X_REDIRECT_URI=http://localhost:5173/auth/x/callback

# 5. LinkedIn Developer Portal (Community Management & Pages API)
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
```

---

## 4. Setup Instructions per Platform

### A. YouTube Data & Analytics API
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your project and enable the **YouTube Data API v3**.
3. Create an API Key for public data calls (`YOUTUBE_API_KEY`).
4. (Optional for Studio Analytics) Configure an OAuth 2.0 Client ID with redirect URI `http://localhost:5173/auth/youtube/callback`.

### B. Instagram (RapidAPI — Glavier Instagram API)
1. Navigate to [RapidAPI](https://rapidapi.com/) and subscribe to the Glavier Instagram API (`instagram-bulk-profile-scrapper.p.rapidapi.com`).
2. Copy your RapidAPI Key into `RAPIDAPI_KEY` in `backend/.env`.
3. Set `RAPIDAPI_HOST=instagram-bulk-profile-scrapper.p.rapidapi.com`.
4. When configured, CreatorIQ resolves `@rawtalkswithvk`, obtains the user ID, retrieves public posts, and normalizes the metrics without fabricating private telemetry.

### C. Facebook Graph API
1. Go to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Create an App with Business use case and add **Facebook Login for Business**.
3. Supply `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` in `backend/.env`.

### D. X (Twitter) Developer API v2
1. Go to the [X Developer Portal](https://developer.x.com/).
2. Create a Project and App with Read permissions.
3. Configure OAuth 2.0 PKCE settings.
4. Supply `X_CLIENT_ID` and `X_CLIENT_SECRET` in `backend/.env`.

### E. LinkedIn Community Management API
1. Go to the [LinkedIn Developer Portal](https://developer.linkedin.com/).
2. Create an app associated with the Raw Talks Media Page.
3. Supply `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` in `backend/.env`.

---

## 5. Data Integrity & Verification Standard

CreatorIQ follows strict data provenance guidelines:
- **Public Data**: Clearly labeled with observation provenance (`Source: Public YouTube channel observation (@RawTalksWithVK)` or `Instagram public data — RapidAPI`).
- **Private Analytics**: Metrics requiring authenticated studio access (Saves, Impressions, Retention Curves, Watch Time, Demographics) explicitly display:
  `"Requires creator access"` or `"Configuration required"`.
- **Demo Revenue**: Clearly designated as `"Demo Revenue Data / Manually Entered Revenue"`.
