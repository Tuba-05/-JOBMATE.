import React, { useState } from "react";
// import { getDatabase, ref, push } from "firebase/database"; // Firebase imports
import './AddVacancyForm.css';
import { useNavigate } from "react-router-dom";

const VacancyForm = () => {
  const navigate = useNavigate();  // Initialize navigate inside the component
  const compUser = localStorage.getItem("UserId");
  const [vacancyData, setVacancyData] = useState({
    title: "",
    requiredSkills: "",
    levelOfExperience: "",
    additionalRequirements: "",
    location: "",
    timing: "",  
  });

  // Handle input changes
  const handleInputChange = (e) => {
    setVacancyData({ ...vacancyData, [e.target.name]: e.target.value });
  };
  
  const dataToSend = {
    companyId: compUser,
    ...vacancyData
  }
  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // await AddVacancy(vacancyData); // Save vacancy data to Firebase
      const response = await fetch("http://127.0.0.1:8000/api/add-job-vacancy/",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      }); 
      const vacancyResponse = await response.json();
      if (vacancyResponse. success){
        alert("Vacancy submitted successfully!");
        // Navigate to the "add-test" page
        navigate("/add-test");
      }
      else{
        alert("Error from backend.");
      }    
      // Clear form fields
      setVacancyData({
        title: "",
        requiredSkills: "",
        levelOfExperience: "",
        additionalRequirements: "",
        location: "",
        timing: "",
      });
    } catch (error) {
      console.error("Error submitting vacancy:", error);
      alert("Failed to submit vacancy. Please try again.");
    }
  };
  return (
    <div className="form-container">
      <h3 className="form-title">Add a New Vacancy</h3>
      <form onSubmit={handleFormSubmit} className="vacancy-form">
        {/* Job Title */}
        <label className="form-label">
          <span className={`floating-label ${vacancyData.title ? "filled" : ""}`}>
            Job Title
          </span>
          <input
            type="text"
            name="title"
            value={vacancyData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., Software Engineer"
            className="form-input"
          />
        </label>
        {/* Skills Required */}
        <label className="form-label">
          <span className={`floating-label ${vacancyData.requiredSkills ? "filled" : ""}`}>
            Skills Required
          </span>
          <input
            type="text"
            name="requiredSkills"
            value={vacancyData.requiredSkills}
            onChange={handleInputChange}
            required
            placeholder="e.g., JavaScript, React, Node.js"
            className="form-input"
          />
        </label>
        {/* Level of Experience */}
        <label className="form-label">
          <span className={`floating-label ${vacancyData.levelOfExperience ? "filled" : ""}`}>
            Level of Experience
          </span>
          <select
            name="levelOfExperience"
            value={vacancyData.levelOfExperience}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Select Experience Level</option>
            <option value="Entry-Level">Entry-Level</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior-Level">Senior-Level</option>
            <option value="Expert-Level">Expert-Level</option>
          </select>
        </label>
        {/* Additional Requirements */}
        {/* <ul>
              {vacancyData.additionalRequirements
                .split("\n")
                .map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
            </ul> */}
        <label className="form-label">
          <span className={`floating-label ${vacancyData.additionalRequirements ? "filled" : ""}`}>
            Additional Requirements
          </span>
          <textarea
            name="additionalRequirements"
            value={vacancyData.additionalRequirements}
            onChange={handleInputChange}
            placeholder="e.g., Must have experience with Agile methodology"
            className="form-textarea"
          />
        </label>
        {/* Location */}
        <label className="form-label">
          <span className={`floating-label ${vacancyData.location ? "filled" : ""}`}>
            Location
          </span>
          <input
            type="text"
            name="location"
            value={vacancyData.location}
            onChange={handleInputChange}
            required
            placeholder="e.g., Karachi, Pakistan"
            className="form-input"
          />
        </label>
        {/* Timing */}
        <label className="form-label">
          <span className={`floating-label ${vacancyData.timing ? "filled" : ""}`}>
            Timing
          </span>
          <input
            type="text"
            name="timing"
            value={vacancyData.timing}
            onChange={handleInputChange}
            required
            placeholder="e.g., 9:00 AM - 5:00 PM (Mon-Fri)"
            className="form-input"
          />
        </label>
        <button
          type="submit"
          className="submit-btn"
        >
          Submit Vacancy
        </button>
      </form>
    </div>
  );
};

export default VacancyForm;
