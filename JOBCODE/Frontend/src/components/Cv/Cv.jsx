import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cv.css";

function Cv() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState({ started: false, pc: 0 });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [isDragOver, setIsDragOver] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [loading, setLoading] = useState(false);

  // File Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/html",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setMsg({ type: "error", text: "Invalid file type. Please upload a PDF, DOC, or DOCX file." });
      return;
    }

    setFile(selectedFile);
    setMsg({ type: "", text: "" });
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg({ type: "error", text: "Please select a resume file first." });
      return;
    }

    const userId = localStorage.getItem("UserId") || localStorage.getItem("user_id") || "1";
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");

    const fd = new FormData();
    fd.append("UserId", userId);
    fd.append("resume", file);

    setLoading(true);
    setMsg({ type: "info", text: "Uploading resume..." });
    setProgress({ started: true, pc: 0 });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress({ started: true, pc: percentCompleted });
      },
    };

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload-resume/", fd, config);
      if (res.data.success) {
        setMsg({ type: "success", text: res.data.message || "Resume uploaded successfully!" });
        if (res.data.resume_link) {
          localStorage.setItem("resume_url", res.data.resume_link);
        }
        setShowNextBtn(true);
      } else {
        setMsg({ type: "error", text: res.data.message || "Upload failed. Please try again." });
      }
    } catch (err) {
      console.error("Upload Resume Error:", err);
      const errMsg = err.response?.data?.message || "Upload failed. Please check your connection.";
      setMsg({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
      setProgress({ started: false, pc: 0 });
    }
  };

  return (
    <div className="cv-body">
      <div className="cv-container">
        {/* Heading */}
        <div className="cv-heading">
          <h1 className="heading-text">Upload Resume / CV</h1>
          <p className="heading-subtext">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
        </div>

        {/* Status Alerts */}
        {msg.text && (
          <div className={msg.type === "success" ? "alert-cv-success" : "alert-cv-error"}>
            {msg.text}
          </div>
        )}

        {/* Drag & Drop Zone */}
        {!file ? (
          <div
            className={`cv-dropzone ${isDragOver ? "active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="upload-icon-wrapper">☁️</div>
            <p className="dropzone-title">
              Drag & Drop your CV here, or <span>Browse</span>
            </p>
            <p className="dropzone-info">PDF, DOCX or DOC files supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden-file-input"
            />
          </div>
        ) : (
          /* Selected File Badge */
          <div className="selected-file-badge">
            <span className="file-name-text">📄 {file.name}</span>
            <button
              type="button"
              className="remove-file-btn"
              onClick={() => setFile(null)}
              disabled={loading}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {progress.started && (
          <div className="cv-progress-section">
            <div className="progress-bar-fill">
              <div
                className="progress-bar-inner"
                style={{ width: `${progress.pc}%` }}
              ></div>
            </div>
            <span className="msg1">Uploading {progress.pc}%</span>
          </div>
        )}

        {/* Actions */}
        <div className="cv-actions">
          {file && !showNextBtn && (
            <button
              onClick={handleUpload}
              className="upload-btn"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
          )}

          {showNextBtn && (
            <button className="jobs-btn" onClick={() => navigate("/Pf")}>
              See Your Profile & Resume →
            </button>
          )}

          <button
            type="button"
            className="btn-back-cv"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cv;
