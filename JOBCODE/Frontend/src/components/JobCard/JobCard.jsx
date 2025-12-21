import { useEffect, useState } from "react";
import "./JobCard.css";

const JobCard = () => {
  const UserID = localStorage.getItem('UserId');
  const [jobList, setJobList] = useState([]); // Initialize as array to simplify
  const [jobDict, setJobDict] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [jobId, setJobId] = useState(null);
  // Track applied jobs by ID so buttons act independently
  const [appliedJobs, setAppliedJobs] = useState([]); 
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // ------------- FETCH JOB DATA ---------------------
        setLoading(true);
        const response_two = await fetch("http://127.0.0.1:8000/api/jobs-display/", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
        });

        if (!response_two.ok) throw new Error(`HTTP error! status: ${response_two.status}`);
        
        const jsonData = await response_two.json();
        
        if (jsonData.success) {
          // Transform dictionary to array ONCE when data is fetched
          const formattedJobs = Object.entries(jsonData.jobs || {}).map(([id, job_details]) => ({
            id,
            ...job_details
          }));
          /* Result: [ { "id": "user123", "name": "Alice", "role": "Admin" },
                       { "id": "user456", "name": "Bob", "role": "User" } ]  */
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

  //Triggered inside the Pop-up Modal when they click "Confirm"
  const confirmApplication = async () => {

    try {
      const response = await fetch("http://127.0.0.1:8000/api/applied-to-jobs/", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({candidateId: localStorage.getItem('UserId'), jobId: jobId, state: "applied" })
      });
      // Parse the JSON body from the response
      const data = await response.json();
      if (response.ok && data.success) {
        // FIX: Add this specific ID to the appliedJobs list
        setAppliedJobs((prev) => [...prev, jobId]);
        alert("Applied successfully!");
        setShowModal(false);
        alert(data.message);
      } else {
        // Use the message from the server if available, otherwise a default
        alert("Failed to apply: " + (data.message || "Unknown error"));
      }
      } catch (error) {
        // This catches network errors (like the server being down)
        console.error("Application failed:", error);
        alert("A network error occurred. Please try again later.");
      }
  };

  // Component to display individual job details
  const JobDetails = ({ job }) => {
  
    const hiddenKeys = ["id", "companyId"];
    const [count, setCount] = useState(0); // no. of candiates applied
    const isThisJobApplied = appliedJobs.includes(job.id);

    // Function to get no. of candidates applied for each job
    useEffect(() => {
    //Defining the async function inside the effect
    const getCount = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/candidate-count/", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id, candidateId: UserID }) 
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCount(data.count); // Update state with the actual result
      } catch (error) {
        console.error("Error fetching applied count:", error);
      }    
    };
    getCount(); // Call it immediately
    }, [job.id]); // Runs every time the job ID changes
     
    // Function to apply for job
    const applyJobs = async (id) => {
      setJobId(id);
      setShowModal(true);
    };

    // Function to save job
    const saveJobs = async(id) => {
      try{
        const savedjobres = await fetch("http://127.0.0.1:8000/api/toggle-jobs/",{
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({candidateId: localStorage.getItem('UserId'), jobId: id, state:"saved" }) 
        });
        const response = await savedjobres.json();
        if (response.success && savedjobres.ok) {
          alert("Job saved successfully!");
        } else {
          alert("Failed to save job: " + response.message);
        }
      } catch (error) {
        console.error("Save job error:", error);
        alert("A network error occurred while saving the job. Please try again later.");
      }
    };

  return (
    <> { <>
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
        
        <div className="job-buttons">
          <button className={isThisJobApplied ? "btn-disabled" : "btn-primary"} 
          onClick={() => applyJobs(job.id)}
          disabled={isThisJobApplied} > 
            {isThisJobApplied ? "Applied" : "Apply Now"} </button>
          <button className="job-btn save" onClick={() => saveJobs(job.id)}> Save Job </button>
      </div>
      <p> <strong> {count} candidates applied. </strong> </p> 
      </> } </>
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

      {/* Pop-up Window (Modal) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Application</h3>
            <p>Are you sure you want to apply for this position? Your profile will be shared with the employer.</p>
            
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={confirmApplication} className="bg-green-600 text-white">
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
</>
  );
};
export default JobCard;
