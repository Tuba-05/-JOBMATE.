import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import "./LogSign.css";
// import { savecompanyDetails, savecandidateDetails , checkLoginCredentials } from "../firebase";
// If using Firebase for storing user data

function LogSign() {
  const location = useLocation(); // t
  const navigate = useNavigate(); // Initialize navigate hook
  const mode = location.state?.mode || "jobseeker"; // Retrieve mode from state or default to "jobseeker"
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [registerRole, setRegisterRole] = useState(mode === "hiring" ? "company" : "candidate");
  const isHiringDeskMode = registerRole === "company";

  // States for form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  // handling submit button for signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !username) {
      alert("Please fill all required fields.");
      return;
    }
    if (
      isHiringDeskMode &&
      (!companyAddress || !contactNumber || !companyWebsite)
    ) {
      alert("Please fill all company details.");
      return;
    }
    const userDetails = {
      isHiringDeskMode,
      role: registerRole,
      username,
      email,
      password,
      ...(isHiringDeskMode && {
        companyAddress,
        contactNumber,
        companyWebsite,
      }),
    };
    // saving user credentials to tables in database
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });
      const data = await response.json(); // <-- READ RESPONSE HERE

      if (response.ok && data.success) {
        alert("Account created successfully! Please sign in.");
        setIsSignupActive(false); // Switch to Sign In view after registration
      } else {
        alert(data.message || "Account creation failed.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Failed to create account. Please try again.");
    }
  };

  // Login for both Candidate and Company
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        const UserLoginDetailes = {
          email: email,
          password: password,
        };
        const response = await fetch("http://127.0.0.1:8000/api/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(UserLoginDetailes),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          if (data.tokens) {
            localStorage.setItem("accessToken", data.tokens.access);
            localStorage.setItem("refreshToken", data.tokens.refresh);
          }
          const userRole = data.role || data.user?.role;
          const userId = data.user_id || data.user?.id;
          const userEmail = data.user?.email || email;

          if (userId) localStorage.setItem("UserId", userId);
          if (userRole) localStorage.setItem("userRole", userRole);
          if (userEmail) localStorage.setItem("userEmail", userEmail);

          navigate("/"); // Redirect to Homepage upon login
        } else {
          alert(data.message || "Invalid email or password.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Error during login. Please try again.");
      }
    } else {
      alert("Please fill in your email and password.");
    }
  };
  // forgot password
  const trigger_verif_code = () =>{
    navigate("/veri-code");
  }
  return (
    <div
      className={`content justify-content-center align-items-center d-flex shadow-lg ${
                isSignupActive ? "active" : "" }`}
                id="content" >
      {/* SIGN UP FORM */}
      <div className="col-md-6 d-flex justify-content-center">
        <form onSubmit={handleSignupSubmit}>
          <div className="header-text mb-4">
            <h1
              className="glow-text"
              style={{ fontWeight: "bold", padding: "10px 0", color: "white" }}
            >
              Create Account
            </h1>
          </div>
          {/* Role Selector Tabs (Candidate vs Employer) */}
          <div className="role-selector-bar mb-3">
            <button
              type="button"
              className={`role-tab-btn ${registerRole === "candidate" ? "active-tab" : ""}`}
              onClick={() => setRegisterRole("candidate")}
            >
              👤 Job Seeker
            </button>
            <button
              type="button"
              className={`role-tab-btn ${registerRole === "company" ? "active-tab" : ""}`}
              onClick={() => setRegisterRole("company")}
            >
              🏢 Employer
            </button>
          </div>
          {/* Common fields */}
          <div className="input-group mb-3">
            {/* username */}
            <input
              type="text"
              className="form-control form-control-lg bg-white fs-6 text-gray"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-3">
            {/* email */}
            <input
              type="email"
              className="form-control form-control-lg bg-white fs-6"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-3">
            {/* passowrd */}
            <input
              type="password"
              className="form-control form-control-lg bg-white fs-6"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Additional fields for "Hiring Desk" mode */}
          {isHiringDeskMode && (
            <>
              <div className="input-group mb-3">
                {/* company address */}
                <input
                  type="text"
                  className="form-control form-control-lg bg-white fs-6"
                  placeholder="Company Address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-3">
                {/* company aontact no. */}
                <input
                  type="tel"
                  className="form-control form-control-lg bg-white fs-6"
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-3">
                {/* company website */}
                <input
                  type="url"
                  className="form-control form-control-lg bg-white fs-6"
                  placeholder="Company Website"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          {/* Signup form submit button */}
          <div className="input-group mb-3 justify-content-center">
            <button type="submit" className="btn signup-btn w-50 fs-6">
              Register
            </button>
          </div>
        </form>
      </div>

      {/* LOGIN FORM */}
      <div className="col-md-6 right-box">
        <form onSubmit={handleLoginSubmit}>
          <div className="header-text mb-4">
            <h1
              className="glow-text"
              style={{ fontWeight: "bold", padding: "10px 0", color: "white" }}
            >
              Sign In
            </h1>
          </div>
          <div className="input-group mb-3">
            {/* email */}
            <input
              type="email"
              className="form-control form-control-lg bg-light fs-6"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-3">
            {/* password */}
            <input
              type="password"
              className="form-control form-control-lg bg-light fs-6"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="forgot-password">
            <a href="#" className="forgot-link" onClick={trigger_verif_code}>
              forgot your passowrd?
            </a>
          </div>
          {/* login form submit button */}
          <div className="input-group mb-3 justify-content-center">
            <button type="submit" className="btn login-btn w-50 fs-6">
              Login
            </button>
          </div>
        </form>
      </div>
      {/* SWITCH */}
      <div className="switch-content">
        <div className="switch">
          {/* login for both*/}
          <div
            className={`switch-panel switch-left ${
              isSignupActive ? "hidden" : ""
            }`}
          >
            <h1 style={{ fontWeight: "bold", padding: "10px 0" }}>
              Hello Again
            </h1>
            <p>
              <strong>We are happy to see you back</strong>
            </p>
            <button
              className="btn switch-login-btn w-50 fs-6"
              onClick={() => setIsSignupActive(false)}
            >
              Login
            </button>
          </div>
          {/* sign up for both*/}
          <div
            className={`switch-panel switch-right ${
              isSignupActive ? "" : "hidden"
            }`}
          >
            <h1 style={{ fontWeight: "bold", padding: "10px 0" }}>Welcome</h1>
            <p>
              <strong>
                Join Our Unique Platform, Explore a New Experience
              </strong>
            </p>
            <button
              className="btn switch-signup-btn w-50 fs-6"
              onClick={() => setIsSignupActive(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogSign;
