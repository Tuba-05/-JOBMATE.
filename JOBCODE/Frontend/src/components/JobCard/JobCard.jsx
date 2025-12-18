import { useEffect, useState } from "react";
import "./JobCard.css";

const JobCard = () => {
  const [jobList, setJobList] = useState([]); // Initialize as array to simplify
  const [jobDict, setJobDict] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0); // no. of candiates applied

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/jobs-display/", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        
        if (jsonData.success) {
          // Transform dictionary to array ONCE when data is fetched
          const formattedJobs = Object.entries(jsonData.jobs || {}).map(([id, job_details]) => ({
            id,
            ...job_details
          }));
          /* Result:
          [
            { "id": "user123", "name": "Alice", "role": "Admin" },
            { "id": "user456", "name": "Bob", "role": "User" }
          ]
          */
          setJobList(formattedJobs); // storing array of jobs in state var
          setJobDict(jsonData.jobs); // keeping original dict for other uses
        } else {
          throw new Error(jsonData.message || "Failed to retrieve jobs");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);
    // checking purpose
    console.log("Job Data:", jobList); 
    console.log("Job Data Dict:", jobDict); 

  // Component to display individual job details
  const JobDetails = ({ job }) => {
  const hiddenKeys = ["id", "companyId"];

  return (
    <>
      {
        <div key={job.id} className="job-details">
            {Object.entries(job)
            .filter(([key]) => !hiddenKeys.includes(key)) // filter out hidden keys
            .map(([key, value]) =>{ 
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1') // insert space before capital letters
                .replace(/^./, str => str.toUpperCase()); // capitalize first letter
                 return (
            <div key={key} className="job-row">
              {/* job headings */}
              <span className="job-key">
                <strong>{formattedKey}: </strong>
              </span>
              {/* job details */}
              <span className="job-value">
                {/* 1. Logic for Skills: Multi-column display */}
                {key === "skillsRequired" ? (
                  <div className="skills-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '5px' 
                  }}>
                    {value
                    .split(/,(?![^(]*\))/) // Split by comma NOT followed by a closing ')'
                    .map((skill, i) => (
                      <span key={i}>. {skill.trim()}</span>
                    ))}
                  </div>
                ) : 
                /* 2. Logic for Requirements: Split by period for list display */
                key === "additionalRequirements" ? (
                  <div className="requirements-list">
                    {value
                    // 1. Regex logic: Split only at a period followed by a space and Capital letter
                    // This prevents splitting technical terms like Vue.js or Node.js
                    .split(/\.(?=\s[A-Z])/) 
                    .filter(s => s.trim() !== "")
                    .map((req, i) => (
                      <p key={i} style={{ margin: '4px 0' }}>
                        . {req.trim()}{!req.trim().endsWith('.') && '.'}
                      </p>
                    ))}
                  </div>
                ) : 
                /* 3. Logic for everything else  */
                (
                  <p>{value ?? "—"}</p>
                )}
              </span>
            </div>
          );
        })}
        </div>
    }
      <div className="job-buttons">
          <button className="job-btn apply">Apply Now</button>
          <button className="job-btn save">Save Job</button>
      </div>
      <p> <strong> {count} candidates applied! </strong> </p>
    </>
    );
  };

  if (loading) return <p className="profileForm-loadingText">Loading...</p>;
  if (error) return <p className="profileForm-errorText">Error: {error}</p>;

  // Now you can use jobData directly as an array in your return
  return (
    <>
    <div className="job-section">
      <h1>Job Listings</h1>
      <div className="job-container">
        {jobList.length > 0 ? (
          jobList.map((job) => (
            <div key={job.id} className="job-card">
              <JobDetails job={job} />
            </div>
          ))
        ) : (
          <p>No job data available.</p>
        )}
      </div>
    </div>
</>

  );
};
export default JobCard;
