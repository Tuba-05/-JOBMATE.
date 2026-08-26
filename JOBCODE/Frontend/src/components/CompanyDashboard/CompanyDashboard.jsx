import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VacancyForm from "./AddVacancyForm";
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showVacancies, setShowVacancies] = useState(false);

  const [scoreboardData, setScoreboardData] = useState([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  const [vacanciesData, setVacanciesData] = useState([]);
  const [loadingVacancies, setLoadingVacancies] = useState(false);

  const handleAddVacancyClick = () => {
    setShowScoreboard(false);
    setShowVacancies(false);
    setShowForm(!showForm);
  };

  // Fetch Company Scoreboard
  const handleScoreboardClick = async () => {
    if (showScoreboard) {
      setShowScoreboard(false);
      return;
    }

    setShowForm(false);
    setShowVacancies(false);
    setShowScoreboard(true);
    setLoadingScoreboard(true);

    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const userId = localStorage.getItem("UserId") || localStorage.getItem("user_id");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/company-scoreboard/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ companyId: userId }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setScoreboardData(data.scores || []);
      } else {
        setScoreboardData([]);
      }
    } catch (err) {
      console.error("Fetch Scoreboard Error:", err);
      setScoreboardData([]);
    } finally {
      setLoadingScoreboard(false);
    }
  };

  // Fetch Company Posted Vacancies
  const handleViewVacanciesClick = async () => {
    if (showVacancies) {
      setShowVacancies(false);
      return;
    }

    setShowForm(false);
    setShowScoreboard(false);
    setShowVacancies(true);
    setLoadingVacancies(true);

    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const userId = localStorage.getItem("UserId") || localStorage.getItem("user_id");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/company-posted-vacancies/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ companyId: userId }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVacanciesData(data.vacancies || []);
      } else {
        setVacanciesData([]);
      }
    } catch (err) {
      console.error("Fetch Vacancies Error:", err);
      setVacanciesData([]);
    } finally {
      setLoadingVacancies(false);
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      {/* Main Glassmorphic Dashboard Card */}
      <div className="dashboard-container">
        {/* Back to Home Button Inside Container Top Left */}
        <button
          className="btn-back-home"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>

        <header className="dashboard-header">
          <div className="portal-badge">🏢 Employer Portal</div>
          <h1 className="dashboard-title">TalentHub Management</h1>
          <p className="dashboard-subtitle">
            Welcome to your hiring control center. Manage open vacancies, evaluate candidate screening test scores, and post new career opportunities.
          </p>
        </header>

        {/* Feature Cards Grid with Guidance */}
        <div className="dashboard-cards-grid">
          {/* Card 1: My Posted Vacancies */}
          <div className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3 className="card-title">My Posted Vacancies</h3>
            <p className="card-description">
              View all active job openings published by your company, attached screening tests, and live candidate application counts.
            </p>
            <button
              onClick={handleViewVacanciesClick}
              className={`leader-dashboard-btn ${showVacancies ? "active-btn" : ""}`}
            >
              {showVacancies ? "Close List ✕" : "View My Vacancies 📋"}
            </button>
          </div>

          {/* Card 2: Scoreboard */}
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3 className="card-title">Candidate Scoreboard</h3>
            <p className="card-description">
              View candidate screening test results, review automated skill assessments, and evaluate top applicants for your company.
            </p>
            <button
              onClick={handleScoreboardClick}
              className={`leader-dashboard-btn ${showScoreboard ? "active-btn" : ""}`}
            >
              {showScoreboard ? "Close Scoreboard ✕" : "View Scoreboard 📊"}
            </button>
          </div>

          {/* Card 3: Post Vacancy */}
          <div className="dashboard-card">
            <div className="card-icon">💼</div>
            <h3 className="card-title">Post New Vacancy</h3>
            <p className="card-description">
              Create and publish new job openings with required skills, experience levels, and optional candidate screening tests.
            </p>
            <button
              onClick={handleAddVacancyClick}
              className={`add-vacancy-btn ${showForm ? "active-btn" : ""}`}
            >
              {showForm ? "Close Form ✕" : "Add Vacancy ➕"}
            </button>
          </div>
        </div>

        {/* 1. Posted Vacancies Section */}
        {showVacancies && (
          <div className="scoreboard-section-box">
            <h3 className="scoreboard-section-title">📋 My Published Job Vacancies</h3>

            {loadingVacancies ? (
              <div className="scoreboard-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : vacanciesData.length > 0 ? (
              <div className="table-wrapper">
                <table className="scoreboard-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Location</th>
                      <th>Timings</th>
                      <th>Required Skills</th>
                      <th>Screening Test</th>
                      <th>Applicants</th>
                      <th>Posted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacanciesData.map((v) => (
                      <tr key={v.id}>
                        <td className="cand-name">{v.jobTitle}</td>
                        <td>{v.location}</td>
                        <td>{v.timings}</td>
                        <td>{v.skills}</td>
                        <td>
                          {v.hasTest ? (
                            <span className="status-badge status-passed">
                              📝 {v.testTitle} ({v.testTimer}m)
                            </span>
                          ) : (
                            <span className="status-badge status-failed">No Test</span>
                          )}
                        </td>
                        <td className="cand-score">{v.appliedCount} Candidates</td>
                        <td>{v.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="scoreboard-empty">
                <p>📋 No vacancies posted yet by your company account.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. Scoreboard Section */}
        {showScoreboard && (
          <div className="scoreboard-section-box">
            <h3 className="scoreboard-section-title">📊 Candidate Assessment Scoreboard</h3>

            {loadingScoreboard ? (
              <div className="scoreboard-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : scoreboardData.length > 0 ? (
              <div className="table-wrapper">
                <table className="scoreboard-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Job Vacancy</th>
                      <th>Test Title</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboardData.map((item) => (
                      <tr key={item.id}>
                        <td className="cand-name">{item.candidateName}</td>
                        <td>{item.candidateEmail}</td>
                        <td>{item.jobTitle}</td>
                        <td>{item.testTitle}</td>
                        <td className="cand-score">{item.obtainedMarks} / {item.totalMarks}</td>
                        <td className="cand-perc">{item.percentage}%</td>
                        <td>
                          <span
                            className={`status-badge ${
                              item.status === "PASSED" ? "status-passed" : "status-failed"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>{item.submittedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="scoreboard-empty">
                <p>📋 No candidate assessments recorded yet for your posted jobs.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. Add Vacancy Form Section */}
        {showForm && (
          <div className="vacancy-form-section-box">
            <VacancyForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
