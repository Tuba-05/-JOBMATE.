# 🤝 JobMate

<p align="center">
  <img src="https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django REST" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

JobMate is a modern job portal web application (inspired by LinkedIn) designed to bridge the gap between job seekers and companies. The platform allows users to build profiles, upload resumes, search/apply for jobs, and lets companies post and manage job vacancies.

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Technologies Used](#%EF%B8%8F-technologies-used)
4. [Folder Structure](#-folder-structure)
5. [Getting Started & Local Setup](#-getting-started--local-setup)
6. [Interface Preview](#-interface-preview)
7. [Future Enhancements](#-future-enhancements)
8. [Author](#-author)

---

## 🎯 Overview
This project was developed as an academic and skill-building initiative focusing on **full-stack web development**, **RESTful API design**, and **relational database integration**. It models complex relational schemas under PostgreSQL to handle user roles (Job Seekers vs. Company Representatives).

---

## ✨ Key Features

### 👤 For Job Seekers
- **Authentication:** Secure user registration and login.
- **Profile Builder:** Resume and interactive profile creation.
- **Resume Uploads:** Upload PDF/doc resumes for job applications.
- **Job Matching:** Intelligent job results and recommendations based on user profiles.

### 🏢 For Companies
- **Corporate Registration:** Company account setup and validation.
- **Job Postings:** Seamless posting of job vacancies.
- **Listing Management:** Dashboard to view, edit, and manage posted job listings.

### ⚙️ General Layout
- **Responsive UI:** Clean black-and-white themed responsive interface.
- **Architecture:** Decoupled architecture using React for frontend and Django REST Framework (DRF) for backend.

---

## 🛠️ Technologies Used

- **Frontend:** React.js, JavaScript (ES6+), HTML5, CSS3 (with custom transitions)
- **Backend:** Django, Django REST Framework (DRF)
- **Database:** PostgreSQL
- **Tools & APIs:** Postman, Git/GitHub, VS Code

---

## 📂 Folder Structure
```text
JobMate/
├── backend/            # Django Backend Server
│   ├── manage.py
│   ├── jobmate/        # Main configuration folder
│   └── api/            # Apps handling models, views & serializers
├── frontend/           # React Frontend Application
│   ├── package.json
│   ├── public/
│   └── src/            # Components, pages, and assets
└── README.md
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Python 3.8+
- Node.js (v16+)
- PostgreSQL

### 🖥️ 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up database configurations in `settings.py` (or `.env` file) and run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Run the local development server:
   ```bash
   python manage.py runserver
   ```

### 💻 2. Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```

---

## 📸 Interface Preview

<p align="center">
  <i>(UI will be displayed soon!)</i>
</p>

---

## 🔮 Future Enhancements
- [ ] Implement JWT-based secure authentication and token refresh.
- [ ] Add advanced search and multi-criteria job filtering.
- [ ] Integrate automatic Resume Parsing using NLP/Regex to prefill profiles.
- [ ] Add real-time email notifications for application status updates.
- [ ] Build a comprehensive admin dashboard for platform moderation.
- [ ] Containerize the app using Docker and deploy on AWS/Azure.

---

## 🎓 Academic Context
This project was developed as part of the **Computer & Information Systems Engineering** curriculum at **NED University of Engineering and Technology** to demonstrate practical knowledge of:
* Relational database design & optimization.
* Client-Server state management.
* Enterprise application architecture.

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
```
