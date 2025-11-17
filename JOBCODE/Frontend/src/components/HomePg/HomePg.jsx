import "./HomePg.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import wavingHand from "../../assets/waving-hand.png";

const HomePg = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [showImage, setShowImage] = useState(false); // waving hand
    const [showTagline, setShowTagline] = useState(false); // tag line
    const [showOverlayAndButtons, setShowOverlayAndButtons] = useState(false); // hiring desk & job seekers buttons

    useEffect(() => {
    // first image will appear
    const imageTimer = setTimeout(() => {
      setShowImage(true);
    }, 2900);
    // second tagline will appear
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 5000);
    // third job seeker & hiring desk buttons will appear
    const overlayAndButtonsTimer = setTimeout(() => {
      setShowOverlayAndButtons(true);
    }, 8000);

    return () => {
      clearTimeout(imageTimer);
      clearTimeout(taglineTimer);
      clearTimeout(overlayAndButtonsTimer);
    };
    }, []);

    // Functions to handle button clicks and navigate to the LoginSignup page
    const handleHiringDeskClick = () => {
        navigate("/login-signup", { state: { mode: "hiring" } }); // Pass "hiring" mode
    };

    const handleFindJobsClick = () => {
        navigate("/login-signup", { state: { mode: "jobseeker" } }); // Pass "jobseeker" mode
    };

    return (
    <>
      <div className="home-page">
        {/* animated background */}
        <video autoPlay loop muted className="background-video">
          <source src="./src/assets/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* welcome tag */}
        <h1 className="home-page-title">
            {[
                "W", "e", "l", "c", "o", "m", "e", " ", "t", "o", " ", "@", "j", "o", "b", "m", "a", "t", "e", ".",
            ].map((letter, index) => (
            <span key={index} className="letter" style={{ animationDelay: `${index * 0.2}s` }}>
            {letter === " " ? "\u00A0" : letter}
            </span>
            ))}
        </h1>
        <div className="image-container">
            {/* waving hand with animation */}
            {showImage && (
                <img
                src={wavingHand}
                alt="Waving Hand"
                className="animated-image"
                />
            )}
        </div>
        {/* tagline */}
        {showTagline && (
            <h2 className="home-page-title2">
                {[
                "W", "h", "e", "r", "e", " ", "t", "a", "l", "e", "n", "t", " ", "m", "e", "e", "t", "s", " ", "o", "p", "p", "o", "r", "t", "u", "n", "i", "t", "i", "e", "s", "!"
                ].map((letter, index) => (
                <span key={index} className="letter" style={{ animationDelay: `${index * 0.1}s` }}>
                    {letter === " " ? "\u00A0" : letter}
                </span>
                ))}
            </h2>
        )}
        </div>
        {/* hiring desk & find jobs buttons */}
        {showOverlayAndButtons && (
        <>
            <div className="container home-page-container">
                <div className="overlay-text">
                <p>
                    <strong>Hi Job Seekers!</strong>
                    <br />
                    Ready to kickstart your career? Click on **Find Jobs!** to explore tailored job listings that match your skills.
                    Upload your resume and discover the perfect opportunities waiting for you at JobMate. Your next career adventure starts here!
                </p>
                </div>

                <div className="overlay-text">
                <p>
                    <strong>Welcome Employers!</strong>
                    <br />
                    Looking to strengthen your team? Head to the **Hiring Desk** to post job openings and set up custom screening tests.
                    Efficiently review candidates and find the right fit for your company with JobMate. Streamline your hiring process today!
                </p>
                </div>
            </div>

            <div className="home-page-button-container">
                {/* handling hiring desk button  */}
                <span className="btn1">
                <button className="home-page-btn" onClick={handleHiringDeskClick}>Hiring Desk</button>
                </span>
                {/* handling find job button  */}
                <span className="btn2">
                <button className="home-page-btn" onClick={handleFindJobsClick}>Find Jobs!!</button>
                </span>
            </div>
        </>
        )}
    </>
  );
};

export default HomePg;
