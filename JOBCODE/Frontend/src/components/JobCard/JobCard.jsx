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

  // Job Details Modal state
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedDetailsJob, setSelectedDetailsJob] = useState(null);

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

  // Fetch Applied Jobs IDs from DB
  const fetchAppliedJobIds = async () => {
    if (!UserID) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/applied-to-jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ candidateId: UserID }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const ids = (data.applied_jobs || []).map((j) => String(j.id));
        setAppliedJobs(ids);
      }
    } catch (err) {
      console.error("Fetch Applied Job IDs Error:", err);
    }
  };

  // Fetch Live Vacancies from Database (Parallel Promise.all for 3X speed)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [savedRes, appliedRes, vacanciesRes] = await Promise.all([
        fetchSavedJobIds(),
        fetchAppliedJobIds(),
        fetch("http://127.0.0.1:8000/api/jobs-display/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then((r) => r.json()).catch(() => null),
      ]);

      if (vacanciesRes && vacanciesRes.success) {
        const formattedJobs = Object.entries(vacanciesRes.jobs || {}).map(([id, job_details]) => ({
          id: String(id),
          ...job_details,
        }));
        setJobList(formattedJobs);
      } else {
        throw new Error((vacanciesRes && vacanciesRes.message) || "Failed to retrieve job vacancies.");
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
  const handleSaveJob = async (job, e) => {
    if (e) e.stopPropagation();
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

  // Launch Readiness Modal on Apply Click
  const handleApplyClick = (job, e) => {
    if (e) e.stopPropagation();
    setSelectedJob(job);
    setShowReadinessModal(true);
  };

  // Open Job Details Modal
  const handleOpenDetails = (job, e) => {
    if (e) e.stopPropagation();
    setSelectedDetailsJob(job);
    setShowJobDetailsModal(true);
  };

  // Standard Application Submission (Saves application to employer DB)
  const confirmDirectApplication = async () => {
    if (!selectedJob || !UserID) return;

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
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAppliedJobs((prev) => [...prev, String(selectedJob.id)]);
        setShowReadinessModal(false);
        setShowJobDetailsModal(false);
      } else {
        setShowReadinessModal(false);
      }
    } catch (err) {
      console.error("Application failed:", err);
      setShowReadinessModal(false);
    }
  };

  // Launch Test Page (/take-test/:jobId)
  const startAssessmentTest = () => {
    if (!selectedJob) return;
    setShowReadinessModal(false);
    setShowJobDetailsModal(false);
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
            {isSavedView ? "CANDIDATE SAVED VAULT" : "LIVE OPPORTUNITIES"}
          </span>
          <h1 className={`job-page-title ${isSavedView ? "amber-title" : ""}`}>
            {isSavedView ? "Saved Job Collection" : "Explore Job Vacancies"}
          </h1>
          <p className="job-page-subtitle">
            {isSavedView
              ? "Your bookmarked job vacancies. Click 'View Details' to inspect full skills and specifications."
              : "Browse verified job vacancies posted by top employers. Click 'View Details' to inspect full specifications."}
          </p>
        </header>

        {/* Filter Search Bar */}
        <div className="job-filter-bar">
          <input
            type="text"
            placeholder={
              isSavedView
                ? "Search saved jobs by title, skills, or company name..."
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
                  You currently have 0 saved jobs in your collection.
                </p>
                <p style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "1.5rem" }}>
                  Browse live vacancies and click "Save" on any job card to bookmark it here!
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
        ) : isSavedView ? (
          /* SAVED VAULT - Compact Horizontal List Layout with View Details */
          <div className="saved-vault-list">
            <div className="vault-summary-bar">
              <span className="vault-count-tag">{filteredJobs.length} Saved Openings</span>
            </div>

            {filteredJobs.map((job) => {
              const jobIdStr = String(job.id);
              const isApplied = appliedJobs.includes(jobIdStr);
              const companyInitials = (job.CompanyName || "EP")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div key={job.id} className="saved-vault-item-card" onClick={(e) => handleOpenDetails(job, e)}>
                  {/* Left Column: Avatar + Details */}
                  <div className="vault-item-left">
                    <div className="company-avatar-badge">{companyInitials}</div>
                    <div className="vault-job-meta">
                      <div className="vault-title-row">
                        <h3 className="vault-job-title">{job.jobTitle}</h3>
                        <span className="vault-company-name">{job.CompanyName || "Enterprise Partner"}</span>
                      </div>
                      <div className="vault-details-pills">
                        <span className="v-pill">{job.location || "Remote / Onsite"}</span>
                        <span className="v-pill">{job.timings || "Full-time"}</span>
                        <span className="v-pill">Exp: {job.levelOfExperience || "Entry Level"}</span>
                        {job.hasTest && (
                          <span className="v-pill amber-test-pill">
                            Screening Test ({job.questionCount || 5} Qs, {job.testTimer || 5}m)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="vault-item-right">
                    <button
                      className="btn-vault-details"
                      onClick={(e) => handleOpenDetails(job, e)}
                    >
                      View Details
                    </button>
                    <button
                      className={`btn-vault-apply ${isApplied ? "applied-btn" : ""}`}
                      onClick={(e) => handleApplyClick(job, e)}
                      disabled={isApplied}
                    >
                      {isApplied ? "Applied" : "Apply Now"}
                    </button>
                    <button
                      className="btn-vault-remove"
                      onClick={(e) => handleSaveJob(job, e)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* STANDARD COMPACT JOB CARDS GRID (Clean, uncluttered, initial view) */
          <div className="job-cards-grid">
            {filteredJobs.map((job) => {
              const jobIdStr = String(job.id);
              const isApplied = appliedJobs.includes(jobIdStr);
              const isSaved = savedJobs.includes(jobIdStr);

              return (
                <div
                  key={job.id}
                  className="single-job-card compact-job-card"
                  onClick={(e) => handleOpenDetails(job, e)}
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
                        Test Required ({job.questionCount || 5} Qs, {job.testTimer || 5}m)
                      </span>
                    )}
                  </div>

                  {/* Card Action Row */}
                  <div className="card-actions-wrapper">
                    <button
                      className="btn-view-details"
                      onClick={(e) => handleOpenDetails(job, e)}
                    >
                      View Details
                    </button>

                    <button
                      className={`btn-apply-job ${isApplied ? "applied-btn" : ""}`}
                      onClick={(e) => handleApplyClick(job, e)}
                      disabled={isApplied}
                    >
                      {isApplied ? "Applied" : "Apply Now"}
                    </button>

                    <button
                      className={`btn-save-job ${isSaved ? "saved-active" : ""}`}
                      onClick={(e) => handleSaveJob(job, e)}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JOB DETAILS SPECIFICATION MODAL */}
      {showJobDetailsModal && selectedDetailsJob && (
        <div className="modal-overlay" onClick={() => setShowJobDetailsModal(false)}>
          <div className="modal-card-box details-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowJobDetailsModal(false)}>
              ✕
            </button>

            <span className="modal-badge">
              {selectedDetailsJob.CompanyName || "Enterprise Partner"}
            </span>

            <h3 className="modal-job-heading">{selectedDetailsJob.jobTitle}</h3>
            <p className="modal-company-sub">Posted: <strong>{selectedDetailsJob["posted at"] || "Recently"}</strong></p>

            <div className="details-meta-row">
              <span className="meta-pill">{selectedDetailsJob.location || "Remote / Onsite"}</span>
              <span className="meta-pill">{selectedDetailsJob.timings || "Full-time"}</span>
              <span className="meta-pill">Exp: {selectedDetailsJob.levelOfExperience || "Entry Level"}</span>
              {selectedDetailsJob.hasTest && (
                <span className="meta-pill amber-test-pill">
                  Test Required ({selectedDetailsJob.questionCount || 5} Qs, {selectedDetailsJob.testTimer || 5}m)
                </span>
              )}
            </div>

            {/* Required Skills */}
            <div className="details-section-box">
              <span className="details-section-label">Required Skills & Expertise:</span>
              <div className="skills-tags-grid">
                {(selectedDetailsJob.skillsRequired || "")
                  .split(/,(?![^(]*\))/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill, i) => (
                    <span key={i} className="skill-pill">
                      {skill}
                    </span>
                  ))}
              </div>
            </div>

            {/* Additional Requirements */}
            {selectedDetailsJob.additionalRequirements && (
              <div className="details-section-box">
                <span className="details-section-label">Role Description & Requirements:</span>
                <p className="details-text-content">{selectedDetailsJob.additionalRequirements}</p>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="modal-actions-row">
              <button
                className={`btn-save-job ${savedJobs.includes(String(selectedDetailsJob.id)) ? "saved-active" : ""}`}
                onClick={(e) => handleSaveJob(selectedDetailsJob, e)}
              >
                {savedJobs.includes(String(selectedDetailsJob.id)) ? "Saved in Collection" : "Save Job"}
              </button>

              <button
                className={`btn-modal-confirm ${appliedJobs.includes(String(selectedDetailsJob.id)) ? "applied-btn" : ""}`}
                onClick={(e) => {
                  setShowJobDetailsModal(false);
                  handleApplyClick(selectedDetailsJob, e);
                }}
                disabled={appliedJobs.includes(String(selectedDetailsJob.id))}
              >
                {appliedJobs.includes(String(selectedDetailsJob.id)) ? "Applied" : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <span>Duration: <strong>{selectedJob.testTimer || 5} Minutes</strong></span>
                  <span>Questions: <strong>{selectedJob.questionCount || 5} Questions</strong></span>
                </div>
                <div className="rules-list">
                  <p><strong>Screening Assessment Notice:</strong></p>
                  <ul>
                    <li>This position requires a technical screening assessment.</li>
                    <li>You can take the test now or save this job to take it whenever you are ready.</li>
                    <li>The 5-minute timer starts once you click "Start Screening Test".</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="modal-standard-desc">
                Your candidate profile and verified resume details will be submitted directly to {selectedJob.CompanyName}.
              </p>
            )}

            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={(e) => {
                  handleSaveJob(selectedJob, e);
                  setShowReadinessModal(false);
                }}
              >
                Save for Later
              </button>

              {selectedJob.hasTest ? (
                <button className="btn-modal-confirm" onClick={startAssessmentTest}>
                  Start Screening Test
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
