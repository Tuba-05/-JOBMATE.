

import { useEffect, useState } from "react";
import "./JobCard.css";

const JobCard = () => {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetching the job data from localStorage (which contains the uploaded resume data)
    const storedData = localStorage.getItem('cvData');
    if (storedData) {
      setJobData(JSON.parse(storedData));  // Parse and set the job data
    }

    // Simulating a job data fetch (from a file, API, etc.)
    fetch("/src/assets/jobalert.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch job data.");
        }
        return response.json();
      })
      .then((jsonData) => {
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const renderJobDetails = () => {
    if (!jobData || Object.keys(jobData).length === 0) {
      return <p>No job data available.</p>;
    }

    return (
      <div>
        {jobData.skills && (
          <div>
            <h3>Extracted Skills:</h3>
            <ul>
              {jobData.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {jobData.predicted_category && (
          <div>
            <h3>Predicted Job Category:</h3>
            <p>{jobData.predicted_category}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="profileForm-loadingText">Loading...</p>;
  if (error) return <p className="profileForm-errorText">Error: {error}</p>;

  return (
    <div className="job-section">
      <h1 className="profileForm-title">Job Listings</h1>

      <div className="job-container">
        {renderJobDetails()}
      </div>
    </div>
  );
};

export default JobCard;
