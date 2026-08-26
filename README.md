# 🤝 JobMate

<p align="center">
  <img src="https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django REST" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT Auth" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

JobMate is an AI-powered enterprise job-matching and recruitment platform (inspired by LinkedIn) connecting skilled candidates with hiring companies. The platform features **JWT Authentication**, **Role-Based Access Control (RBAC)**, **Timed Screening Tests (5-Minute Assessments)**, **Candidate Saved Jobs Collection**, **Live Applicant Scoreboards**, **Supabase PostgreSQL Cloud Integration**, and an **Executive Glassmorphic UI**.

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [API Route & Security Matrix](#-api-route--security-matrix)
4. [Technologies Used](#%EF%B8%8F-technologies-used)
5. [Folder Structure](#-folder-structure)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
7. [Completed Roadmap](#-completed-roadmap)
8. [Author](#-author)

---

## 🎯 Overview
JobMate is built with a modern decoupled architecture utilizing **React (Vite)** on the frontend and **Django REST Framework (DRF)** on the backend. Cloud persistence is powered by **Supabase PostgreSQL 17.6** with connection pooling (`CONN_MAX_AGE`) and **Supabase Storage** for PDF/Word candidate resume management.

---

## ✨ Key Features

### 🔐 Security & Authentication
- **Enterprise JWT Authorization:** Issues signed `access` (60 mins) and `refresh` (7 days) JWT tokens upon Login/Registration.
- **Token Rotation & Blacklisting:** Server-side refresh token invalidation on logout (`/api/logout/`).
- **5-Minute Timed OTP Password Reset:** Sends 6-digit verification codes via SMTP (`/api/forgot-password/`) with a strict 5-minute expiry timer.
- **Password Show/Hide Toggle:** Interactive eye icon toggle across all authentication forms.

### 👤 For Candidates (Job Seekers)
- **Executive Career Control Center:** 2-column glassmorphic candidate portal displaying verified CV status, resume view/download, and job match opportunities.
- **Candidate Saved Jobs Vault:** Single-line top Navbar access (`SAVED JOBS ⭐`) allowing candidates to bookmark vacancies and manage saved collections.
- **Timed Screening Assessments:** Take 5-minute technical screening assessments (MCQs, True/False, Short Answer) with live countdown timer.
- **Answer Breakdown Review:** Instant post-submission evaluation showing question breakdown, candidate answers, and correct answers.

### 🏢 For Companies (Employers)
- **TalentHub Employer Portal:** Clean 3-card control desk displaying **My Posted Vacancies**, **Candidate Scoreboard**, and **Post New Vacancy**.
- **My Posted Vacancies Section:** Overview table of published job openings, attached screening tests, created dates, and candidate application counts.
- **Interactive Test Designer:** Create 5-minute technical screening tests with custom question types (MCQ, True/False, Short Answer) and decimal timers (e.g. 0.5 mins).
- **Automated Scoreboard:** Real-time applicant scoreboard listing candidate names, scores, percentages, and pass/fail statuses.

### 🎨 Design Aesthetics & Performance
- **Clean Standard UI:** Zero emoji clutter, crisp typography, and standard corporate glassmorphic buttons.
- **Connection Pooling & Latency Optimization:** Configured `CONN_MAX_AGE = 600` and TCP keepalives to eliminate database connection lag.
- **Smooth Loading Indicators:** Animated glassmorphic spinners (`Loading...`) across all database operations.

---

## 🛡️ API Route & Security Matrix

| Endpoint | Method | Access Type | Description |
| :--- | :--- | :--- | :--- |
| `/api/register/` | `POST` | Public | User registration (Candidate / Company) & JWT issue |
| `/api/login/` | `POST` | Public | Authenticates credentials & returns JWT tokens |
| `/api/token/refresh/` | `POST` | Public | Refreshes expired Access Token using Refresh Token |
| `/api/forgot-password/` | `POST` | Public | Sends 5-minute timed 6-digit OTP code |
| `/api/reset-password/` | `POST` | Public | Verifies OTP code & updates hashed password |
| `/api/jobs-display/` | `GET / POST` | Public | Feed of active job vacancies with test metadata |
| `/api/get-job-test/<job_id>/`| `GET / POST` | Public | Fetches screening test questions & duration for job |
| `/api/user-session/` | `GET` | Protected (Any Role) | Returns logged-in user session & profile |
| `/api/logout/` | `POST` | Protected (Any Role) | Blacklists JWT refresh token |
| `/api/upload-resume/` | `POST` | Protected (`candidate`) | Resume document upload to Supabase Storage |
| `/api/display-profile-info/`| `POST` | Protected (`candidate`) | Fetches candidate profile & verified resume URL |
| `/api/toggle-jobs/` | `POST` | Protected (`candidate`) | Toggles jobs in candidate saved collection |
| `/api/candidate-saved-jobs/`| `POST` | Protected (`candidate`) | Returns candidate's saved job vacancies |
| `/api/applied-to-jobs/` | `POST` | Protected (`candidate`) | Submits application & lists applied jobs |
| `/api/save-test-scores/` | `POST` | Protected (`candidate`) | Records candidate screening test score in DB |
| `/api/company-posted-vacancies/`| `POST`| Protected (`company`) | Lists vacancies published by employer with counts |
| `/api/company-scoreboard/`| `POST` | Protected (`company`) | Fetches candidate test score results for employer |
| `/api/add-job-vacancy/` | `POST` | Protected (`company`) | Creates a new job vacancy posting |
| `/api/add-tests/` | `POST` | Protected (`company`) | Creates and attaches screening tests to vacancies |

---

## 🛠️ Technologies Used

- **Frontend:** React.js (Vite), JavaScript (ES6+), HTML5, Vanilla CSS3 (Glassmorphism, Flexbox, Micro-animations)
- **Backend:** Python 3.11+, Django 5.1.15, Django REST Framework (DRF), PyJWT / SimpleJWT
- **Database & Cloud:** Supabase PostgreSQL 17.6 (Connection Pooling), Supabase Storage (Resumes Bucket)
- **Authentication & Security:** JWT Access & Refresh Tokens, PBKDF2 SHA-256 Hashing, CORS Headers, Role-Based Access Control (RBAC)

---

## 📁 Folder Structure

```text
JobMate/
├── .env.example
├── README.md
├── requirements.txt
└── JOBCODE/
    ├── manage.py
    ├── JOBCODE/               # Project Configuration
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── Backend/               # Django App Modules
    │   ├── config/            # Supabase & Firebase Configs
    │   ├── utils/             # JWT & Email Utilities
    │   ├── views/             # Modular Endpoint Handlers
    │   └── models.py          # Relational Database Models
    └── Frontend/              # React Application
        └── src/
            ├── components/
            │   ├── AddTest/
            │   ├── CompanyDashboard/
            │   ├── JobCard/
            │   ├── LogSign/
            │   ├── Navbar/
            │   ├── ProfileForm/
            │   ├── TakeTest/
            │   └── VeriCode/
            └── App.jsx
```

---

## 🚀 Getting Started & Local Setup

### 1. Environment Configuration
Create a `.env` file in the `JOBCODE/` directory:

```env
SECRET_KEY=your_django_secret_key
DEBUG=True

# Supabase PostgreSQL Credentials
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
- [x] **Candidate Saved Jobs Vault:** Single-line top Navbar access (`SAVED JOBS ⭐`) with distinct Amber/Gold collection theme.
- [x] **Interactive 5-Minute Screening Tests:** Implemented candidate assessment interface with live countdown timer, question navigation, score calculation, and post-submission Answer Breakdown Review.
- [x] **Assessment Readiness & Instructions Modal:** Pre-test modal with duration, question count, rules, and "Save for Later" / "Start Screening Test" options.
- [x] **Employer TalentHub Control Center:** Clean 3-card dashboard with **My Posted Vacancies** section and live candidate **Scoreboard**.
- [x] **Clean Standard UI:** Removed emoji clutter across buttons, modals, cards, and navigation bars for executive-grade aesthetics.
- [x] **JWT Authentication & RBAC:** Implemented Access/Refresh token rotation, logout revocation, and Role-Based Access Control (`candidate` vs `company`).

---

## 🎓 Academic Context
This project is developed as part of the **Computer & Information Systems Engineering** curriculum at **NED University of Engineering and Technology** to demonstrate practical mastery of:
* Full-Stack Decoupled Web Architecture.
* Enterprise Relational Database Schemas & Cloud Storage Systems.
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
