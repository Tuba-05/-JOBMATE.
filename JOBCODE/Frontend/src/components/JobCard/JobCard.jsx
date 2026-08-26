import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./JobCard.css";

const JobCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const UserID = localStorage.getItem("UserId") || localStorage.getItem("user_id");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  const isSavedView = searchParams.get("view") === "saved" || location.pathname === "/saved-jobs";

  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Assessment Readiness Modal states
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  // Fetch Candidate Saved Job IDs
  const fetchSavedJobIds = async () => {
    if (!UserID) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/candidate-saved-jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ candidateId: UserID }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const ids = (data.savedJobs || []).map((j) => String(j.id));
        setSavedJobs(ids);
      }
    } catch (err) {
      console.error("Fetch Saved Job IDs Error:", err);
    }
  };

  // Fetch Live Vacancies from Database
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchSavedJobIds();

      const response = await fetch("http://127.0.0.1:8000/api/jobs-display/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const jsonData = await response.json();
      if (response.ok && jsonData.success) {
        const formattedJobs = Object.entries(jsonData.jobs || {}).map(([id, job_details]) => ({
          id: String(id),
          ...job_details,
        }));
        setJobList(formattedJobs);
      } else {
        throw new Error(jsonData.message || "Failed to retrieve job vacancies.");
      }
    } catch (err) {
      console.error("Fetch Jobs Error:", err);
      setError(err.message || "Failed to load job listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [location.search, location.pathname]);

  // Silent Optimistic Save/Unsave Toggle
  const handleSaveJob = async (job) => {
    if (!UserID) return;

    const jobIdStr = String(job.id);
    const currentlySaved = savedJobs.includes(jobIdStr);

    if (currentlySaved) {
      setSavedJobs((prev) => prev.filter((id) => id !== jobIdStr));
    } else {
      setSavedJobs((prev) => [...prev, jobIdStr]);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/toggle-jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          candidateId: UserID,
          jobId: job.id,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.isSaved === false) {
          setSavedJobs((prev) => prev.filter((id) => id !== jobIdStr));
        } else if (data.isSaved === true) {
          setSavedJobs((prev) => (prev.includes(jobIdStr) ? prev : [...prev, jobIdStr]));
        }
      } else {
        if (currentlySaved) {
          setSavedJobs((prev) => [...prev, jobIdStr]);
        } else {
          setSavedJobs((prev) => prev.filter((id) => id !== jobIdStr));
        }
      }
    } catch (err) {
      console.error("Save Job Error:", err);
      if (currentlySaved) {
        setSavedJobs((prev) => [...prev, jobIdStr]);
      } else {
        setSavedJobs((prev) => prev.filter((id) => id !== jobIdStr));
      }
    }
  };

  // Launch Readiness Modal
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowReadinessModal(true);
  };

  // Standard Application Submission
  const confirmDirectApplication = async () => {
    if (!selectedJob) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/applied-to-jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          candidateId: UserID,
          jobId: selectedJob.id,
          state: "applied",
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAppliedJobs((prev) => [...prev, String(selectedJob.id)]);
        setShowReadinessModal(false);
      } else {
        setShowReadinessModal(false);
      }
    } catch (err) {
      console.error("Application failed:", err);
    }
  };

  // Launch Test Page (/take-test/:jobId)
  const startAssessmentTest = () => {
    if (!selectedJob) return;
    setShowReadinessModal(false);
    navigate(`/take-test/${selectedJob.id}`);
  };

  // Filter Jobs by Search Query & Saved View Mode
  const filteredJobs = jobList.filter((job) => {
    if (isSavedView && !savedJobs.includes(String(job.id))) {
      return false;
    }

    const query = searchFilter.toLowerCase();
    const title = (job.jobTitle || "").toLowerCase();
    const company = (job.CompanyName || "").toLowerCase();
    const skills = (job.skillsRequired || "").toLowerCase();
    return title.includes(query) || company.includes(query) || skills.includes(query);
  });

  return (
    <div className={`job-card-page-wrapper ${isSavedView ? "saved-theme-page" : ""}`}>
      <div className={`job-card-container ${isSavedView ? "saved-theme-container" : ""}`}>
        {/* Top Navigation */}
        <button className="btn-back-home" onClick={() => navigate("/candidate-portal")}>
          ← Back to Candidate Hub
        </button>

        <header className="job-page-header">
          <span className={`portal-badge ${isSavedView ? "amber-badge" : ""}`}>
            {isSavedView ? "CANDIDATE SAVED COLLECTION" : "LIVE OPPORTUNITIES"}
          </span>
          <h1 className={`job-page-title ${isSavedView ? "amber-title" : ""}`}>
            {isSavedView ? "My Saved Jobs" : "Explore Job Vacancies"}
          </h1>
          <p className="job-page-subtitle">
            {isSavedView
              ? "Your bookmarked career openings ready for instant assessment and application."
              : "Browse verified job vacancies posted by top employers. Take skill assessments or save openings to your candidate profile."}
          </p>
        </header>

        {/* Filter Search Bar */}
        <div className="job-filter-bar">
          <input
            type="text"
            placeholder={
              isSavedView
                ? "Filter your saved jobs by title, skills, or company..."
                : "Filter vacancies by title, skills, or company name..."
            }
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className={`job-search-input ${isSavedView ? "amber-search-input" : ""}`}
          />
          {searchFilter && (
            <button className="clear-search-btn" onClick={() => setSearchFilter("")}>
              Clear
            </button>
          )}
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="job-loading-box">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="job-error-box">
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchJobs}>
              Retry Fetching Vacancies
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-jobs-box">
            {isSavedView ? (
              <div className="empty-saved-jobs-content">
                <p style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fbbf24", marginBottom: "0.75rem" }}>
                  You currently have 0 saved jobs.
                </p>
                <p style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "1.5rem" }}>
                  Browse active vacancies and click "Save" on any job listing to bookmark it here!
                </p>
                <button
                  className="btn-retry amber-btn"
                  onClick={() => navigate("/JObcard")}
                >
                  Browse All Job Vacancies
                </button>
              </div>
            ) : (
              <p>No job vacancies found matching your search query.</p>
            )}
          </div>
        ) : (
          /* Job Cards Grid */
          <div className="job-cards-grid">
            {filteredJobs.map((job) => {
              const jobIdStr = String(job.id);
              const isApplied = appliedJobs.includes(jobIdStr);
              const isSaved = savedJobs.includes(jobIdStr);
              const skillsArray = (job.skillsRequired || "").split(/,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean);

              return (
                <div
                  key={job.id}
                  className={`single-job-card ${isSavedView ? "saved-card-amber" : ""}`}
                >
                  <div className="card-top-header">
                    <span className="company-badge">{job.CompanyName || "Enterprise Partner"}</span>
                    <span className="posted-date">{job["posted at"] || "Recently Posted"}</span>
                  </div>

                  <h3 className="job-title-text">{job.jobTitle}</h3>

                  <div className="job-meta-row">
                    <span className="meta-tag">{job.location || "Remote / Onsite"}</span>
                    <span className="meta-tag">{job.timings || "Full-time"}</span>
                    <span className="meta-tag">Exp: {job.levelOfExperience || "Entry Level"}</span>
                    {job.hasTest && (
                      <span className="meta-tag test-badge-pill">
                        Test: {job.questionCount} Questions ({job.testTimer}m)
                      </span>
                    )}
                  </div>

                  {/* Required Skills Tags */}
                  <div className="job-skills-section">
                    <span className="section-label">Required Skills:</span>
                    <div className="skills-tags-grid">
                      {skillsArray.map((skill, i) => (
                        <span key={i} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.additionalRequirements && (
                    <div className="job-requirements-box">
                      <span className="section-label">Requirements:</span>
                      <p className="requirements-text">{job.additionalRequirements}</p>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="card-actions-wrapper">
                    <button
                      className={`btn-apply-job ${isApplied ? "applied-btn" : ""}`}
                      onClick={() => handleApplyClick(job)}
                      disabled={isApplied}
                    >
                      {isApplied
                        ? "Applied"
                        : job.hasTest
                        ? "Take Screening Test"
                        : "Apply Now"}
                    </button>

                    <button
                      className={`btn-save-job ${
                        isSavedView ? "btn-remove-saved" : isSaved ? "saved-active" : ""
                      }`}
                      onClick={() => handleSaveJob(job)}
                    >
                      {isSavedView ? "Unsave" : isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Readiness & Pre-Test Instructions Modal */}
      {showReadinessModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowReadinessModal(false)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowReadinessModal(false)}>
              ✕
            </button>

            <span className="modal-badge">
              {selectedJob.hasTest ? "Screening Assessment Required" : "Confirm Application"}
            </span>

            <h3 className="modal-job-heading">{selectedJob.jobTitle}</h3>
            <p className="modal-company-sub">Employer: <strong>{selectedJob.CompanyName}</strong></p>

            {selectedJob.hasTest ? (
              <div className="test-instructions-box">
                <div className="test-detail-pills">
                  <span>Duration: <strong>{selectedJob.testTimer} Minutes</strong></span>
                  <span>Questions: <strong>{selectedJob.questionCount} Questions</strong></span>
                </div>
                <div className="rules-list">
                  <p><strong>Assessment Rules:</strong></p>
                  <ul>
                    <li>The countdown timer starts immediately once you click "I am Ready".</li>
                    <li>Questions include MCQs, True/False, and Short Text answers.</li>
                    <li>Your final score will be automatically transmitted to the employer's Hiring Scoreboard.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="modal-standard-desc">
                Your candidate profile and resume details will be submitted directly to {selectedJob.CompanyName}.
              </p>
            )}

            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => {
                  handleSaveJob(selectedJob);
                  setShowReadinessModal(false);
                }}
              >
                Save for Later
              </button>

              {selectedJob.hasTest ? (
                <button className="btn-modal-confirm" onClick={startAssessmentTest}>
                  I am Ready, Start Test
                </button>
              ) : (
                <button className="btn-modal-confirm" onClick={confirmDirectApplication}>
                  Confirm & Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
