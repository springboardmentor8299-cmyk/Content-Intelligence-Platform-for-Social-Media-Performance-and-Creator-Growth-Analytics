<<<<<<< HEAD
# CreatorIQ

### Creator Analytics & Content Performance Dashboard

CreatorIQ is a full-stack web application designed to help content creators
monitor and understand their content performance, audience engagement,
growth, and earnings through a centralized analytics dashboard.

The platform is being developed as a milestone-based project using
**React.js, FastAPI, and PostgreSQL**, with planned support for social media
platform integrations and advanced analytics.

---

## Overview

Managing content performance across multiple platforms can make it difficult
for creators to understand their overall growth and audience engagement.

CreatorIQ aims to solve this by providing a centralized dashboard for
monitoring key creator metrics and visualizing performance trends.

The platform is designed around the following analytics:

- Views
- Likes
- Comments
- Shares
- Saves
- Followers
- Reach
- Engagement Rate
- Audience Demographics
- Content Performance
- Earnings

---

## Key Features

### Authentication & Security

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected API endpoints
- Role-based authorization
- User profile retrieval

### Creator Dashboard

- Key Performance Indicator (KPI) cards
- Total views tracking
- Follower statistics
- Engagement statistics
- Earnings overview
- Performance trend visualization
- Audience distribution visualization
- Top-performing content
- Quick action controls
- Responsive dashboard layout

### User Roles

The system is designed to support multiple user roles:

- **Creator** – Monitor personal content and audience performance
- **Agency** – Manage and analyze multiple creators
- **Marketing Team** – Analyze creator and campaign performance
- **Administrator** – Manage users and system access

---

## System Architecture

```text
                    ┌─────────────────────────┐
                    │       React.js          │
                    │        Frontend         │
                    │                         │
                    │  Login / Registration   │
                    │  Creator Dashboard      │
                    │  KPIs & Visualizations  │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 │ HTTP
                                 ▼
                    ┌─────────────────────────┐
                    │        FastAPI          │
                    │         Backend         │
                    │                         │
                    │ Authentication          │
                    │ JWT Authorization       │
                    │ Business Logic          │
                    │ REST API Endpoints      │
                    └────────────┬────────────┘
                                 │
                                 │ SQLAlchemy
                                 ▼
                    ┌─────────────────────────┐
                    │       PostgreSQL        │
                    │        Database         │
                    │                         │
                    │ Users                   │
                    │ Creator Profiles        │
                    │ Analytics               │
                    └─────────────────────────┘


                         Future Integration
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Social Media APIs   │
                    │                         │
                    │  Platform Data Fetching │
                    │  Multi-platform Metrics │
                    └─────────────────────────┘

Technology Stack
Frontend
Technology	Purpose
React.js	User interface
Vite	Frontend development and build tool
React Router	Client-side routing
Axios	API communication
Recharts	Analytics visualizations
CSS	UI styling and responsive design
Backend
Technology	Purpose
Python	Backend programming language
FastAPI	REST API framework
SQLAlchemy	ORM and database interaction
Pydantic	Data validation
Alembic	Database migrations
JWT	Authentication and authorization
Passlib	Password hashing
Bcrypt	Secure password hashing
Database
PostgreSQL
Development Tools
Git
GitHub
pgAdmin
Postman
VS Code
Project Structure
CreatorIQ/
│
├── backend/
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── auth/
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── analytics.py
│   │   │   ├── creator_profile.py
│   │   │   └── user.py
│   │   │
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── alembic.ini
│   └── testdb.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── dashboard.jsx
│   │   │   ├── login.jsx
│   │   │   └── register.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── project_objectives.md
│   └── ui_wireframe.md
│
├── .gitignore
└── README.md
Application Workflow
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Register / Login│
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Authentication │
                   │   JWT Token     │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │    Dashboard    │
                   └────────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
       Content          Analytics        Audience
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                     Performance
                       Insights
Database Design

The current database contains the following core entities:

┌──────────────┐
│    Users     │
├──────────────┤
│ id           │
│ name         │
│ email        │
│ password     │
│ role         │
│ created_at   │
└──────┬───────┘
       │
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ Creator Profiles│   │    Analytics    │
├─────────────────┤   ├─────────────────┤
│ id              │   │ id              │
│ user_id         │   │ creator_id      │
│ bio             │   │ date            │
│ profile_image   │   │ views           │
└─────────────────┘   │ likes           │
                      │ comments        │
                      │ shares          │
                      │ followers       │
                      │ reach           │
                      │ engagement_rate │
                      └─────────────────┘

Database schema changes are managed using Alembic migrations.

Authentication Flow

CreatorIQ uses JWT-based authentication.

User Registration
       │
       ▼
Password Hashing
       │
       ▼
Store User in PostgreSQL
       │
       ▼
User Login
       │
       ▼
Verify Credentials
       │
       ▼
Generate JWT Token
       │
       ▼
Frontend Stores Token
       │
       ▼
Protected API Requests
Analytics Dashboard

The current dashboard includes:

KPI Metrics
KPI	Description
Total Views	Total content views
Followers	Current follower count
Engagement	Engagement generated by content
Earnings	Creator earnings
Visualizations

Performance Overview

Displays views and engagement trends over time using a line chart.

Audience Overview

Displays audience age distribution using a doughnut chart.

Top Performing Content

Displays content with the highest number of views.

The current Milestone 1 dashboard uses sample analytics data for UI and
visualization development. Live social media data integration is planned
for later milestones.

Getting Started
Prerequisites

Make sure the following are installed:

Python 3.x
Node.js
PostgreSQL
Git
1. Clone the Repository
git clone https://github.com/3109Jaswanth/CreatorIQ.git
cd CreatorIQ
2. Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install the required packages:

pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic python-jose[cryptography] passlib[bcrypt] bcrypt==4.0.1

Configure the PostgreSQL database connection in:

backend/app/database.py

Run the database migrations:

alembic upgrade head

Start the FastAPI server:

uvicorn app.main:app --reload

The backend will be available at:

http://127.0.0.1:8000

FastAPI Swagger documentation:

http://127.0.0.1:8000/docs
3. Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
Current Development Status
Milestone 1 — Project Initialization & Core Setup
 Project objectives defined
 Analytics workflow planned
 Dashboard architecture designed
 Database schema designed
 UI wireframes created
 React frontend initialized
 FastAPI backend initialized
 PostgreSQL database configured
 SQLAlchemy models implemented
 Alembic migrations configured
 User registration implemented
 Password hashing implemented
 JWT authentication implemented
 Protected API endpoints implemented
 Role-based authorization implemented
 Creator dashboard implemented
 KPI components implemented
 Analytics visualizations implemented
 Responsive dashboard styling implemented
Milestone 2 — Analytics & Platform Integration
 Engagement tracking
 Audience analytics
 Growth and trend analysis
 Social media API integration
 Real creator analytics data
 Multi-platform workflows
Milestone 3 — Monetization & Reporting
 Revenue analytics
 Monetization tracking
 Reporting system
 Notifications
 Data export
Milestone 4 — Testing & Deployment
 Comprehensive testing
 Performance optimization
 Responsive improvements
 Docker containerization
 Cloud deployment
 CI/CD pipeline
 Final documentation
Future Enhancements

Planned improvements include:

Social media platform integrations
Real-time analytics
Multi-platform performance comparison
Advanced audience insights
Content recommendations
Revenue and monetization analytics
Automated reporting
Notification system
Data export
Cloud deployment
Project Documentation

Additional project documentation is available in the docs/ directory:

project_objectives.md – Project objectives and analytics workflow
ui_wireframe.md – UI wireframes and dashboard workflow
License

This project is developed for academic and educational purposes.

Author

Jaswanth

CreatorIQ – Creator Analytics & Content Performance Dashboard

Built with React.js, FastAPI, and PostgreSQL.


Then commit it:

```bash
git add README.md
git commit -m "Add professional README"
git push
=======
# Content-Intelligence-Platform-for-Social-Media-Performance-and-Creator-Growth-Analytics
>>>>>>> collaborator/nazroom-creatoriq
