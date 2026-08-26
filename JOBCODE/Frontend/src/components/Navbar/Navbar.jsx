import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Help Query Form State
  const [queryForm, setQueryForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryAlert, setQueryAlert] = useState({ type: "", text: "" });

  // Sync Auth State from localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const email = localStorage.getItem("userEmail") || localStorage.getItem("email") || "";
    const role = localStorage.getItem("userRole") || "";
    setIsLoggedIn(Boolean(token));
    setUserEmail(email);
    setUserRole(role);
  }, [location]);

  // Hide Navbar on Login/Signup route
  if (location.pathname === "/login-signup") {
    return null;
  }

  // Handle Logout
  const handleLogout = async () => {
    const refresh = localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
    try {
      if (refresh) {
        await fetch("http://127.0.0.1:8000/api/logout/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("UserId");
      localStorage.removeItem("user_id");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      navigate("/login-signup");
    }
  };

  // Submit Query to Support Email (tubabintenaushad@gmail.com)
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!queryForm.email || !queryForm.message) {
      setQueryAlert({ type: "error", text: "Please enter your email and message text." });
      return;
    }

    setQueryLoading(true);
    setQueryAlert({ type: "", text: "" });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/send-query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryForm),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setQueryAlert({ type: "success", text: data.message });
        setQueryForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => {
          setShowHelpModal(false);
          setQueryAlert({ type: "", text: "" });
        }, 2000);
      } else {
        setQueryAlert({ type: "error", text: data.message || "Failed to send query." });
      }
    } catch (err) {
      console.error("Query Submit Error:", err);
      setQueryAlert({ type: "error", text: "Network error. Please try again." });
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <>
      {/* Single Line Glassmorphic Navigation Bar */}
      <nav className="global-navbar-single">
        <div className="navbar-single-container">
          {/* Left: Brand Logo */}
          <div className="nav-brand-single" onClick={() => navigate("/")}>
            <span className="brand-logo-icon">💼</span>
            <span className="brand-title">JOBMATE</span>
          </div>

          {/* Center: Navigation Links in 1 Line */}
          <div className="nav-links-center">
            <button
              className={`nav-menu-link ${location.pathname === "/" ? "active" : ""}`}
              onClick={() => navigate("/")}
            >
              HOME
            </button>

            <button className="nav-menu-link" onClick={() => setShowAboutModal(true)}>
              ABOUT US
            </button>

            <button className="nav-menu-link" onClick={() => setShowHelpModal(true)}>
              HELP / QUERY
            </button>

            {isLoggedIn && (
              <>
                {userRole !== "company" && (
                  <button
                    className={`nav-menu-link ${location.search.includes("view=saved") || location.pathname === "/saved-jobs" ? "active" : ""}`}
                    onClick={() => navigate("/JObcard?view=saved")}
                  >
                    SAVED JOBS ⭐
                  </button>
                )}
                <button
                  className={`nav-menu-link highlight-link ${location.pathname.includes("portal") || location.pathname.includes("Pf") ? "active" : ""}`}
                  onClick={() => navigate(userRole === "company" ? "/company-portal" : "/candidate-portal")}
                >
                  {userRole === "company" ? "HIRING DESK" : "MY CAREER PORTAL"}
                </button>
              </>
            )}
          </div>

          {/* Right: User Profile Chip & Logout Button */}
          <div className="nav-user-right">
            {isLoggedIn ? (
              <>
                <div className="user-profile-chip">
                  <span className="chip-avatar">{userEmail ? userEmail.charAt(0).toUpperCase() : "U"}</span>
                  <div className="chip-info">
                    <span className="chip-email">{userEmail || "User"}</span>
                    <span className="chip-role">{userRole === "company" ? "Employer" : "Job Seeker"}</span>
                  </div>
                </div>
                <button className="btn-nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn-nav-login" onClick={() => navigate("/login-signup")}>
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Help / Query Modal (Sends Query to tubabintenaushad@gmail.com) */}
      {showHelpModal && (
        <div className="nav-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="nav-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowHelpModal(false)}>
              ✕
            </button>

            <span className="modal-header-badge">Support & Assistance</span>
            <h2 className="modal-title">Help / Send Query</h2>
            <p className="modal-description">
              Have a question or feedback? Send your query directly to JobMate Support (<strong>tubabintenaushad@gmail.com</strong>) and our team will get back to you!
            </p>

            {queryAlert.text && (
              <div style={{
                padding: "0.75rem",
                borderRadius: "12px",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                textAlign: "center",
                background: queryAlert.type === "success" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)",
                border: queryAlert.type === "success" ? "1px solid #34d399" : "1px solid #f87171",
                color: "#ffffff"
              }}>
                {queryAlert.text}
              </div>
            )}

            <form className="query-form" onSubmit={handleQuerySubmit}>
              <div className="input-group">
                <label>Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tuba Naushad"
                  value={queryForm.name}
                  onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                  className="nav-input"
                />
              </div>

              <div className="input-group">
                <label>Your Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  required
                  value={queryForm.email}
                  onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
                  className="nav-input"
                />
              </div>

              <div className="input-group">
                <label>Subject / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Issue uploading resume / Question about candidate test"
                  value={queryForm.subject}
                  onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                  className="nav-input"
                />
              </div>

              <div className="input-group">
                <label>Your Query / Message *</label>
                <textarea
                  placeholder="Describe your query in detail..."
                  required
                  value={queryForm.message}
                  onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                  className="nav-textarea"
                />
              </div>

              <button type="submit" className="btn-send-query" disabled={queryLoading}>
                {queryLoading ? "Sending Query..." : "Send Query to tubabintenaushad@gmail.com"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="nav-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="nav-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAboutModal(false)}>
              ✕
            </button>

            <span className="modal-header-badge">About JobMate AI</span>
            <h2 className="modal-title">JobMate Career Platform</h2>
            <p className="modal-description">
              JobMate is an AI-powered enterprise job-matching and recruitment platform connecting skilled candidates with top employers through automated resume parsing, screening tests, and match scoring.
            </p>

            <div className="about-features-grid">
              <div className="about-feature-item">
                <h4>Smart Matching</h4>
                <p>Automated skill evaluation matching candidates with relevant job vacancies.</p>
              </div>

              <div className="about-feature-item">
                <h4>Resume Hub</h4>
                <p>Seamless CV upload, preview, and candidate career document management.</p>
              </div>

              <div className="about-feature-item">
                <h4>Employer Portal</h4>
                <p>TalentHub management to post vacancies and track candidate test scoreboards.</p>
              </div>

              <div className="about-feature-item">
                <h4>Secure JWT Auth</h4>
                <p>State-of-the-art token security and Supabase PostgreSQL integration.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
