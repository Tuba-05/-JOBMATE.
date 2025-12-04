import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./ProfileForm.css";

const ProfileForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [URL, setURL] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/display-profile-info/", {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ UserId: localStorage.getItem('UserId') })
                });

                const info_to_be_displayed = await response.json(); // await here too

                if (info_to_be_displayed.success) { 
                    setURL(info_to_be_displayed.resume_url);
                    console.log("API Response:", info_to_be_displayed);
                    console.log(info_to_be_displayed.message);
                } else {
                    alert(info_to_be_displayed.message || "failed to fetch profile info");
                }

            } catch (error) {
                alert(error);
                console.log(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []); // empty dependency array, runs once


    const handleFindJobs = () => {
        navigate("/JObcard"); // Pass "jobseeker" mode
      };

    if (loading) return <p className="profileForm-loadingText">Loading...</p>;
    if (error) return <p className="profileForm-errorText">Error: {error}</p>;

    return (
        <>
        {/* 
for open in new tab:-
<a href={URL} target="_blank">View Resume</a>
        */}
        <div className="profile_row"> 
        <div className="profile_body">
            {URL ? (
            <iframe src={URL} width="100%" height="600px"></iframe>
            ) : (
            <p>No resume uploaded yet :( </p>
            )}
            </div>
            <div className="profileForm-buttonContainer">
                <button className="profileForm-leftButton" onClick={handleFindJobs}>See Results <br /> For JOB</button>
            </div>
        </div>
        </>
    );
};

export default ProfileForm;