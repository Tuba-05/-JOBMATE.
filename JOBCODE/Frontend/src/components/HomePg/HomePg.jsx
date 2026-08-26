import "./HomePg.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import wavingHand from "../../assets/waving-hand.png";

const HomePg = () => {
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showOverlayAndButtons, setShowOverlayAndButtons] = useState(false);

  useEffect(() => {
    const imageTimer = setTimeout(() => {
      setShowImage(true);
    }, 1500);

    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 2500);

    const overlayAndButtonsTimer = setTimeout(() => {
      setShowOverlayAndButtons(true);
    }, 3800);

    return () => {
      clearTimeout(imageTimer);
      clearTimeout(taglineTimer);
      clearTimeout(overlayAndButtonsTimer);
    };
  }, []);

  // Functions to handle button clicks based on User Auth & Role
  const handleHiringDeskClick = () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const role = localStorage.getItem("userRole");

    if (token) {
      if (role === "candidate") {
        navigate("/candidate-portal");
      } else {
        navigate("/company-portal");
      }
    } else {
      navigate("/login-signup", { state: { mode: "hiring" } });
    }
  };

  const handleFindJobsClick = () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const role = localStorage.getItem("userRole");

    if (token) {
      if (role === "company") {
        navigate("/company-portal");
      } else {
        navigate("/candidate-portal");
      }
    } else {
      navigate("/login-signup", { state: { mode: "jobseeker" } });
    }
  };

  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  const rawRole = (localStorage.getItem("userRole") || localStorage.getItem("role") || "").toLowerCase();

  const isLoggedIn = Boolean(token);
  const isCandidate = isLoggedIn && (rawRole === "candidate" || rawRole === "jobseeker");
  const isCompany = isLoggedIn && (rawRole === "company" || rawRole === "employer" || rawRole === "hiring");

  return (
    <div className="home-page">
      {/* Blended Background Video Overlay */}
      <video autoPlay loop muted className="background-video">
        <source src="./src/assets/background.mp4" type="video/mp4" />
      </video>

      {/* 2-Column Grid Container */}
      <div className="home-grid-container">
        {/* LEFT COLUMN: Animated Welcome & Tagline */}
        <div className="home-left-column">
          <h1 className="home-page-title">
            {[
              "W", "e", "l", "c", "o", "m", "e", " ", "t", "o", " ", "@", "j", "o", "b", "m", "a", "t", "e", ".", "c", "o", "m"
            ].map((letter, index) => (
              <span key={index} className="letter" style={{ animationDelay: `${index * 0.08}s` }}>
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h1>

          {/* Waving Hand Image: Shown ONLY when user session is NOT connected/saved */}
          {!isLoggedIn && showImage && (
            <div className="image-container">
              <img
                src={wavingHand}
                alt="Waving Hand"
                className="animated-image"
              />
            </div>
          )}

          {showTagline && (
            <div className="tagline-container">
              <h2 className="home-page-title2">
                {[
                  "W", "h", "e", "r", "e", " ", "t", "a", "l", "e", "n", "t", " ", "m", "e", "e", "t", "s"
                ].map((letter, index) => (
                  <span key={index} className="letter" style={{ animationDelay: `${index * 0.05}s` }}>
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </h2>
              <h2 className="home-page-title2 tagline-line2">
                {[
                  "o", "p", "p", "o", "r", "t", "u", "n", "i", "t", "i", "e", "s", "!"
                ].map((letter, index) => (
                  <span key={index} className="letter" style={{ animationDelay: `${(18 + index) * 0.05}s` }}>
                    {letter}
                  </span>
                ))}
              </h2>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Buttons on top, cards right below according to user mode */}
        {showOverlayAndButtons && (
          <div className="home-right-column">
            {/* Buttons Section */}
            <div className="home-page-button-container">
              {/* Hiring Desk Button: Shown if visitor OR if company */}
              {(!isLoggedIn || isCompany) && (
                <span className="btn1">
                  <button className="home-page-btn" onClick={handleHiringDeskClick}>
                    Hiring Desk
                  </button>
                </span>
              )}

              {/* Find Jobs Button: Shown if visitor OR if candidate */}
              {(!isLoggedIn || isCandidate) && (
                <span className="btn2">
                  <button className="home-page-btn" onClick={handleFindJobsClick}>
                    Find Jobs!!
                  </button>
                </span>
              )}
            </div>

            {/* Mode Description Cards (Placed Right Below Buttons) */}
            <div className="home-page-cards-wrapper">
              {/* Candidate Card: Shown if visitor OR if candidate */}
              {(!isLoggedIn || isCandidate) && (
                <div className="overlay-text">
                  <p>
                    <strong>Hi Job Seekers!</strong>
                    <br />
                    Ready to kickstart your career? Click on <strong>Find Jobs!!</strong> to explore tailored job listings that match your skills.
                    Upload your resume and discover the perfect opportunities waiting for you at JobMate. Your next career adventure starts here!
                  </p>
                </div>
              )}

              {/* Employer Card: Shown if visitor OR if company */}
              {(!isLoggedIn || isCompany) && (
                <div className="overlay-text">
                  <p>
                    <strong>Welcome Employers!</strong>
                    <br />
                    Looking to strengthen your team? Head to the <strong>Hiring Desk</strong> to post job openings and set up custom screening tests.
                    Efficiently review candidates and find the right fit for your company with JobMate. Streamline your hiring process today!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePg;
