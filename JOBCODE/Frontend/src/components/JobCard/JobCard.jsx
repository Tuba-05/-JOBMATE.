import { useEffect, useState } from "react";
import "./JobCard.css";

const JobCard = () => {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetching the job data
    fetch("/src/assets/jobalert.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch job data.");
        }
        return response.json();
      })
      .then((jsonData) => {
        setJobData(jsonData.jobs || []);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // const renderJobDetails = (job) => {
  //   // Iterate over the keys of the job object to create a div for each key-value pair
  //   return Object.keys(job).map((key, index) => (
  //     <>
  //     <div key={index} className="job-detail">
  //       <div className="job-key">{key}</div>
  //       <div className="job-value">
  //         {Array.isArray(job[key]) ? (
  //           <ul>
  //             {job[key].map((item, idx) => (
  //               <li key={idx}>{item}</li>
  //             ))}
  //           </ul>
  //         ) : (
  //           <p>{job[key]}</p>
  //         )}
  //       </div>
  //     </div>
  //     </>
  //   ));
  // };

  const renderJobDetails = (job) => {
    return (
      <>
        {Object.keys(job).map((key, index) => (
          <div key={index} className="job-detail">
            <div className="job-key">{key}</div>
            <div className="job-value">
              {Array.isArray(job[key]) ? (
                <ul>
                  {job[key].map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{job[key]}</p>
              )}
            </div>
          </div>
        ))}
        {/* Add buttons inline */}
        <div className="job-buttons">
          <button className="job-btn">Apply Now</button>
          <button className="job-btn">Save Job</button>
        </div>
      </>
    );
  };
  
  if (loading) return <p className="profileForm-loadingText">Loading...</p>;
  if (error) return <p className="profileForm-errorText">Error: {error}</p>;

  return (
    <div className="job-section">
      <h1 className="profileForm-title">Job Listings</h1>
      <div className="job-container">
        {jobData.length > 0 ? (
          jobData.map((job, index) => (
            <div key={index} className="job-card">
              {renderJobDetails(job)}
            </div>
          ))
        ) : (
          <p>No job data available.</p>
        )}
      </div>
    </div>
  );
};

export default JobCard;

