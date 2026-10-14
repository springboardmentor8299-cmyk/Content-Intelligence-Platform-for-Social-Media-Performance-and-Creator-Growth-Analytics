# CreatorIQ — Creator Analytics Dashboard

A full-stack web application that helps content creators track social media performance, audience engagement, and revenue — all in one centralized dashboard.

---

## Features

- Authentication — Email/Password + Google OAuth 2.0
- Content Analytics — Views, likes, comments, engagement
- Audience Insights — Demographics, growth, activity
- Revenue Tracking — Sponsorships, ads, affiliates
- Multi-Platform — YouTube, Instagram, Facebook, X, LinkedIn
- PDF Reports — Auto-generated downloadable reports
- Real-Time — Auto-refresh every 5 seconds

---

## Tech Stack

Frontend: React.js, Vite, Tailwind CSS, Recharts, Axios

Backend: Python, FastAPI, SQLAlchemy, Pydantic, ReportLab

Database: MySQL 8.0

APIs: Google OAuth 2.0, YouTube Data API v3

Deployment: Docker, AWS/Azure ready

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend: http://127.0.0.1:8000/docs

Frontend: http://localhost:3000

---

## Environment Variables

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=creatoriq

SECRET_KEY=your_secret_key
ALGORITHM=HS256

YOUTUBE_API_KEY=your_api_key
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_secret
YOUTUBE_REFRESH_TOKEN=your_token
```

---

## Structure

```
CreatorIQ/
├── backend/          # FastAPI + MySQL
│   ├── app/
│   │   ├── api/      # Endpoints
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── requirements.txt
│
├── frontend/         # React + Tailwind
│   ├── src/
│   │   ├── pages/    # Route pages
│   │   ├── components/
│   │   └── context/
│   └── package.json
│
└── docker-compose.yml
```

---

## How It Works

```
Login → Connect YouTube (OAuth) → Fetch real data → Save to MySQL → Display on Dashboard → Generate PDF
```

---

## Design

- Dark-themed UI with gradient accents
- Responsive design (mobile, tablet, desktop)
- Color palette: #4A7CF7, #00D4FF, #00C897, #0A0E1A

---

## Author

Goutham S

GitHub: https://github.com/sgoutham001

Email: sgouthambhat672005@gmail.com

---

## License

MIT License

---

Built with React, FastAPI, and MySQL
