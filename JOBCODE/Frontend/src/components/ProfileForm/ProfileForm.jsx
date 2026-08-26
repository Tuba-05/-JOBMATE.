import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfileForm.css";

const ProfileForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({ type: "", text: "" });

  // Fetch Candidate Profile Info
  const fetchProfile = async () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const userId = localStorage.getItem("UserId") || localStorage.getItem("user_id");

    if (!token && !userId) {
      navigate("/login-signup");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/display-profile-info/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ UserId: userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResumeUrl(data.resume_url);
        setShowUploader(false);
      } else if (response.status === 401 && !userId) {
        navigate("/login-signup");
      } else {
        setResumeUrl(null);
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setError("Network error while loading candidate portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadMsg({ type: "error", text: "Invalid file format. Please upload a PDF, DOC, or DOCX file." });
        return;
      }
      setFile(selectedFile);
      setUploadMsg({ type: "", text: "" });
    }
  };

  // Handle Resume Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMsg({ type: "error", text: "Please select a resume file first." });
      return;
    }

    const userId = localStorage.getItem("UserId") || localStorage.getItem("user_id") || "1";
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");

    const fd = new FormData();
    fd.append("UserId", userId);
    fd.append("resume", file);

    setUploading(true);
    setUploadMsg({ type: "info", text: "Uploading and verifying resume..." });

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload-resume/", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.data && res.data.success) {
        setResumeUrl(res.data.resume_url);
        setShowUploader(false);
        setFile(null);
        setUploadMsg({ type: "success", text: "Resume uploaded successfully!" });
      } else {
        setUploadMsg({ type: "error", text: res.data.message || "Failed to upload resume." });
      }
    } catch (err) {
      console.error("Resume Upload Error:", err);
      setUploadMsg({ type: "error", text: err.response?.data?.message || "Upload failed. Network error." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Top Back Navigation */}
        <button className="btn-back-home" onClick={() => navigate("/")}>
          ← Back to Home
        </button>

        <header className="profile-header">
          <div className="portal-badge">CANDIDATE CAREER DASHBOARD</div>
          <h1 className="portal-title">Career Control Center</h1>
          <p className="portal-subtitle">
            Manage your verified resume document, review AI-assisted skill matches, and take employer screening assessments.
          </p>
        </header>

        {loading ? (
          <div className="profile-loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="profile-error-state">
            <p>{error}</p>
            <button className="btn-action-primary" onClick={fetchProfile}>
              Retry
            </button>
          </div>
        ) : (
          /* 2-Column Side-by-Side Executive Dashboard Grid */
          <div className="profile-content-grid">
            {/* Left Card: Verified Resume Hub */}
            <div className="profile-card resume-card">
              <div className="card-top-row">
                <span className="card-category-tag">DOCUMENT HUB</span>
                {resumeUrl && !showUploader && (
                  <span className="status-pill-green">
                    <span className="status-dot"></span> Active & Verified
                  </span>
                )}
              </div>

              <h3 className="card-heading">Verified Resume Document</h3>

              {uploadMsg.text && (
                <div className={`profile-alert ${uploadMsg.type === "success" ? "alert-success" : uploadMsg.type === "info" ? "alert-info" : "alert-error"}`}>
                  {uploadMsg.text}
                </div>
              )}

              {resumeUrl && !showUploader ? (
                <div className="resume-preview-box">
                  <div className="doc-meta-info">
                    <h4>Verified Candidate Resume</h4>
                    <p>Format: PDF / Word Document • Verified for Automated Job Matching</p>
                  </div>

                  <div className="resume-button-grid">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary-cyan"
                    >
                      View & Download Resume
                    </a>
                    <button
                      className="btn-glass-secondary"
                      onClick={() => setShowUploader(true)}
                    >
                      Replace CV
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="portal-uploader-box">
                  <div
                    className="portal-dropzone"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <p className="dropzone-title">
                      {file ? file.name : "Click or Drag & Drop your Resume PDF here"}
                    </p>
                    <p className="dropzone-info">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="uploader-button-group">
                    <button
                      type="submit"
                      className="btn-primary-cyan"
                      disabled={uploading || !file}
                    >
                      {uploading ? "Uploading..." : "Upload Resume Document"}
                    </button>
                    {resumeUrl && (
                      <button
                        type="button"
                        className="btn-glass-secondary"
                        onClick={() => {
                          setShowUploader(false);
                          setFile(null);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Right Card: Job Opportunities & Skill Matching */}
            <div className="profile-card jobs-card">
              <div className="card-top-row">
                <span className="card-category-tag">OPPORTUNITIES</span>
                <span className={`status-pill-badge ${resumeUrl ? "unlocked-badge" : "locked-badge"}`}>
                  {resumeUrl ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>

              <h3 className="card-heading">Live Vacancies & Skill Matching</h3>
              <p className="card-description">
                {resumeUrl
                  ? "Your candidate profile is verified and active. Explore published openings, take candidate screening tests, and track scoreboards."
                  : "Upload your verified resume in the left panel to unlock job listings, employer tests, and automated match scores."}
              </p>

              <div className="stats-row-box">
                <div className="stat-pill-item">
                  <span className="stat-pill-label">Profile Status</span>
                  <span className="stat-pill-val">{resumeUrl ? "Verified" : "Pending Upload"}</span>
                </div>
                <div className="stat-pill-item">
                  <span className="stat-pill-label">Screening Tests</span>
                  <span className="stat-pill-val">Ready</span>
                </div>
              </div>

              <button
                className={`btn-primary-cyan full-width-action ${!resumeUrl ? "disabled-btn" : ""}`}
                onClick={() => {
                  if (resumeUrl) {
                    navigate("/JObcard");
                  }
                }}
                disabled={!resumeUrl}
              >
                {resumeUrl ? "Explore Vacancies & Take Tests" : "Explore Jobs (Upload Resume First)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;