# 🤝 JobMate

<p align="center">
  <img src="https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django REST" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT Auth" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

JobMate is a modern, full-stack job portal application (inspired by LinkedIn) designed to connect job seekers and hiring companies. The platform features enterprise **JWT authentication**, **5-minute timed OTP verification**, **Role-Based Access Control (RBAC)**, **Timed Screening Tests (5-Minute Technical Assessments)**, **Candidate Saved Jobs Collection**, **Employer TalentHub Scoreboards**, **Supabase PostgreSQL 17.6** cloud database integration, and an **executive glassmorphic React UI**.

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [API Route & Security Matrix](#-api-route--security-matrix)
4. [Technologies Used](#%EF%B8%8F-technologies-used)
5. [Project Folder Structure](#-project-folder-structure)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
7. [Completed Roadmap](#-completed-roadmap)
8. [Academic Context](#-academic-context)
9. [Author](#-author)

---

## 🎯 Overview
This project is built with a decoupled architecture utilizing **React (Vite)** for the frontend and **Django REST Framework (DRF)** for the backend. Data persistence is managed via **Supabase PostgreSQL 17.6** with connection pooling (`CONN_MAX_AGE`) and **Supabase Storage** for PDF/Word candidate resume uploads.

---

## ✨ Key Features

### 🔐 Security & Authentication
- **Enterprise JWT Tokens:** Issues short-lived `access` (60 mins) and long-lived `refresh` (7 days) JWT tokens upon Login/Registration.
- **Token Rotation & Blacklisting:** Logout invalidates the refresh token server-side (`/api/logout/`).
- **5-Minute Timed OTP Password Reset:** Sends 6-digit OTP code via SMTP (`/api/forgot-password/`) with a strict 5-minute expiry timer (`OTPVerification` model).
- **Password Show/Hide Toggle:** Interactive eye icon (`👁️` / `🙈`) toggle across all login, signup, and reset password inputs.

### 👤 For Candidates (Job Seekers)
- **Role Registration & Login:** Create candidate profiles with encrypted passwords (`PBKDF2 SHA-256`).
- **Minimal Drag & Drop Resume Uploader:** Upload PDF, DOC, or DOCX resumes to Supabase Storage with real-time progress indicator and signed URLs.
- **Executive Career Control Center:** 2-column glassmorphic candidate portal displaying verified CV status, resume view/download, and job match opportunities.
- **Candidate Saved Jobs Vault:** Single-line top Navbar access (`SAVED JOBS ⭐`) allowing candidates to bookmark vacancies and manage saved collections.
- **Timed Screening Assessments:** Take 5-minute technical screening assessments (MCQs, True/False, Short Answer) with live countdown timer.
- **Answer Breakdown Review:** Instant post-submission evaluation showing question breakdown, candidate answers, and correct answers.

### 🏢 For Companies (Employers)
- **Corporate Account Setup:** Hiring Desk Mode with company address, contact, and website details.
- **Job Vacancy Posting:** Post detailed job vacancies (skills required, experience level, location, timings).
- **TalentHub Employer Portal:** Clean 3-card control desk displaying **My Posted Vacancies**, **Candidate Scoreboard**, and **Post New Vacancy**.
- **Interactive Screening Test Creator:** Create 5-minute technical screening tests with custom question types (MCQ, True/False, Short Answer) and decimal timers (e.g. 0.5 mins).
- **Automated Scoreboard:** Real-time applicant scoreboard listing candidate names, scores, percentages, and pass/fail statuses.

### 🎨 Glassmorphic UI / UX & Performance
- **Theme Consistency:** Translucent glass containers (`backdrop-filter: blur()`), glowing cyan accents, clean standard buttons, and responsive card layouts.
- **Intuitive Back Navigation:** Dedicated `← Back` buttons across all authentication and portal pages.
- **Connection Pooling & Latency Optimization:** Configured `CONN_MAX_AGE = 600` and TCP keepalives to eliminate database connection lag.

---

## 🛡️ API Route & Security Matrix

| Endpoint | Method | Access Type | Description |
| :--- | :--- | :--- | :--- |
| `/api/register/` | `POST` | Unprotected (Public) | User signup (Candidate / Company) & JWT issue |
| `/api/login/` | `POST` | Unprotected (Public) | Authenticates user & returns JWT tokens + profile |
| `/api/token/refresh/` | `POST` | Unprotected (Public) | Refreshes expired Access Token using Refresh Token |
| `/api/forgot-password/` | `POST` | Unprotected (Public) | Generates & sends 5-minute timed 6-digit OTP code |
| `/api/reset-password/` | `POST` | Unprotected (Public) | Verifies OTP code & updates hashed password |
| `/api/jobs-display/` | `GET / POST` | Unprotected (Public) | Public feed of active job vacancies |
| `/api/get-job-test/<job_id>/`| `GET / POST` | Unprotected (Public) | Fetches screening test questions & duration for job |
| `/api/user-session/` | `GET` | Protected (Any Role) | Returns current logged-in user session / JWT profile |
| `/api/logout/` | `POST` | Protected (Any Role) | Flushes session & blacklists JWT refresh token |
| `/api/upload-resume/` | `POST` | Protected (`candidate`) | Drag-and-drop resume upload to Supabase Storage |
| `/api/check-resume/` | `POST` | Protected (`candidate`) | Checks candidate resume upload status |
| `/api/display-profile-info/`| `POST` | Protected (`candidate`) | Fetches candidate profile & signed resume URL |
| `/api/toggle-jobs/` | `POST` | Protected (`candidate`) | Save or remove jobs from saved list |
| `/api/candidate-saved-jobs/`| `POST` | Protected (`candidate`) | Returns candidate's saved job vacancies |
| `/api/applied-to-jobs/` | `POST` | Protected (`candidate`) | Lists jobs candidate applied for |
| `/api/save-test-scores/` | `POST` | Protected (`candidate`) | Records candidate screening test score in DB |
| `/api/company-posted-vacancies/`| `POST`| Protected (`company`) | Lists vacancies published by employer with counts |
| `/api/company-scoreboard/`| `POST` | Protected (`company`) | Fetches candidate test score results for employer |
| `/api/add-job-vacancy/` | `POST` | Protected (`company`) | Creates a new job vacancy posting |
| `/api/add-tests/` | `POST` | Protected (`company`) | Creates company screening tests |

---

## 🛠️ Technologies Used

- **Frontend:** React.js (Vite), JavaScript (ES6+), HTML5, Vanilla CSS3 (Glassmorphism, Flexbox, Micro-animations)
- **Backend:** Django 5.1+, Django REST Framework (DRF), PyJWT / SimpleJWT
- **Cloud Database & Storage:** Supabase PostgreSQL 17.6 (Connection Pooling), Supabase Storage (`resumes` bucket)
- **Email Server:** SMTP (Gmail App Passwords / Django `send_mail`)
- **Version Control:** Git, GitHub

---

## 📂 Project Folder Structure

### 🌐 1. Root Directory Structure
```text
JobMate/
├── .env                       # Environment variables (DB, Supabase & SMTP credentials)
├── .env.example               # Template for environment variables
├── .gitignore                 # Consolidated Git ignore rules
├── requirements.txt           # Python library dependencies (Django, JWT, PostgreSQL, DRF)
├── README.md                  # Main documentation
└── JOBCODE/                   # Core application workspace directory
```

### ⚙️ 2. Backend Directory Structure (`JOBCODE/Backend/`)
```text
JOBCODE/
├── manage.py                  # Django administrative CLI script
├── JOBCODE/                   # Django Core Configuration Package
│   ├── settings.py            # Global settings (Supabase DB, SimpleJWT, SMTP, CORS)
│   ├── urls.py                # Main URL routing + API root health-check handler
│   ├── wsgi.py                # WSGI deployment entry point
│   └── asgi.py                # ASGI deployment entry point
└── Backend/                   # Main Django REST Application
    ├── config/                # Cloud & External Service Clients
    │   ├── supabase_client.py # Supabase client initialization
    │   └── firebase_config.py # Firebase storage client configuration
    ├── utils/                 # Application Helper Modules
    │   ├── email_utils.py     # OTP Generator & Django SMTP send_mail wrapper
    │   └── jwt_utils.py       # JWT Signer, Verifier & @protected_route RBAC decorator
    ├── views/                 # Modular Controller Views
    │   ├── register_views.py  # Signup validation & session initialization
    │   ├── login_views.py     # User authentication & profile payload
    │   ├── session_views.py   # User session check & token refresh endpoint
    │   ├── password_views.py  # 5-minute timed OTP generation & reset password
    │   ├── cv_profile_views.py# Candidate resume uploads & signed URLs
    │   ├── jobs_views.py      # Job vacancies display & applications
    │   ├── watchlist_views.py # Saved jobs toggling
    │   └── tests_views.py    # Company screening tests & test scores
    ├── samples_data/           # Sample Reference Datasets & Database Seeder
    │   ├── companies_sample.json # Sample company registration payloads & job vacancies
    │   ├── candidates_sample.json # Sample candidate registration payloads & skills
    │   └── seed_data.py       # Python script to automatically seed DB with sample data
    ├── models.py              # Relational schemas (CustomUser, Candidate, Company, OTPVerification)
    ├── urls.py                # Sub-router mapping API endpoints (/api/*)
    └── admin.py               # Django Admin configuration
```

### 💻 3. Frontend Directory Structure (`JOBCODE/Frontend/`)
```text
Frontend/
├── public/                    # Static public assets (favicons, logos)
├── src/                       # React Source Code
│   ├── assets/                # Images, icons, and media files
│   ├── components/            # Modular React Components
│   │   ├── LogSign/           # Authentication UI (Login & Sign Up with Password Toggle)
│   │   ├── VeriCode/          # 2-Column Glassmorphic OTP Verification & Password Reset
│   │   ├── Cv/                # Drag-and-Drop Minimal Modern Resume Uploader
│   │   ├── HomePg/            # Landing Homepage
│   │   ├── CompanyDashboard/  # Employer Dashboard
│   │   ├── AddTest/           # Screening Test Creator
│   │   ├── ProfileForm/       # Profile builder form
│   │   ├── TakeTest/          # Candidate Screening Test & Answer Breakdown Review
│   │   ├── Navbar/            # Navigation bar & Help / Query Modal
│   │   └── JobCard/           # Job vacancy cards & Saved Collection Vault
│   ├── App.jsx                # Root Application Component & Routes
│   ├── main.jsx               # React DOM Rendering Entry point
│   ├── App.css                # Global App styles
│   └── index.css              # Base styling & Design tokens
├── index.html                 # Single Page Application HTML shell
├── package.json               # NPM scripts and React dependencies
└── vite.config.js             # Vite build configuration
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Python 3.12+
- Node.js (v18+)
- Supabase PostgreSQL Database

### 🖥️ 1. Environment Configuration

Create a `.env` file in the root directory:

```env
# Django Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True

# Supabase / PostgreSQL Credentials
DB_ENGINE=django.db.backends.postgresql
DB_NAME=postgres
DB_USER=postgres.dxyladzpvlqwmmwfxxik
DB_PASSWORD=your_db_password
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=6543

# Supabase Storage Credentials
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# SMTP Email Credentials
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_16_character_app_password
```

### ⚙️ 2. Backend Setup (Django)

```bash
cd JOBCODE

# Activate Virtual Environment (Windows)
..\venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r ../requirements.txt

# Run Migrations
python manage.py migrate

# Start Development Server (http://127.0.0.1:8000)
python manage.py runserver
```

### 💻 3. Frontend Setup (React / Vite)

```bash
cd Frontend

# Install Dependencies
npm install

# Run Frontend Dev Server (http://localhost:5173)
npm run dev
```

---

## ✅ Completed Roadmap

- [x] **Supabase PostgreSQL Integration:** Connected Django to live PostgreSQL 17.6 DB on Supabase with persistent connection pooling (`CONN_MAX_AGE`).
- [x] **Project Folder Reorganization:** Organized modular config, utils, views, and single root `.gitignore`.
- [x] **JWT Authentication:** Implemented signed Access Tokens (60m) & Refresh Tokens (7d).
- [x] **Refresh Token Rotation & Blacklisting:** Token revocation on `/api/logout/`.
- [x] **5-Minute Timed OTP Password Reset:** OTP code creation with 5-minute expiration timer and Gmail SMTP email dispatch.
- [x] **Protected & Unprotected Routes:** Created `@protected_route` decorator with Role-Based Access Control (`candidate` vs `company`).
- [x] **Password Visibility Toggle:** Show/Hide password toggle (`👁️` / `🙈`) across all forms.
- [x] **Modern Drag & Drop Resume Uploader:** Redesigned `Cv.jsx` with cloud dropzone, file badge, and progress bar.
- [x] **Candidate Saved Jobs Vault:** Single-line top Navbar access (`SAVED JOBS ⭐`) with distinct Amber/Gold collection theme.
- [x] **Interactive 5-Minute Screening Tests:** Implemented candidate assessment interface with live countdown timer, question navigation, score calculation, and post-submission Answer Breakdown Review.
- [x] **Assessment Readiness & Instructions Modal:** Pre-test modal with duration, question count, rules, and "Save for Later" / "Start Screening Test" options.
- [x] **Employer TalentHub Control Center:** Clean 3-card dashboard with **My Posted Vacancies** section and live candidate **Scoreboard**.
- [x] **UI/UX Aesthetics Polish:** Glassmorphic 2-column horizontal card layouts with intuitive `← Back` buttons and clean standard UI.

---

## 🎓 Academic Context
This project is developed as part of the **Computer & Information Systems Engineering** curriculum at **NED University of Engineering and Technology** to demonstrate practical mastery of:
* Full-Stack Decoupled Web Architecture.
* Enterprise Relational Database Schemas & Storage Systems.
* RESTful API Security, JWT Authorization, and Session Management.

---

## 🤝 Author

<p align="left">
  <b>Tuba Naushad</b><br>
  <i>CIS Engineering Student @ NEDUET</i>
</p>

<p align="left">
  <a href="https://linkedin.com/in/tuba-naushad-6a4552253" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  &nbsp;
  <a href="mailto:tubabintenaushad@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white" alt="Email" />
  </a>
</p>
