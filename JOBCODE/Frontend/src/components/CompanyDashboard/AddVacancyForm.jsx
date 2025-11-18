import React, { useState } from "react";
// import { getDatabase, ref, push } from "firebase/database"; // Firebase imports
import './AddVacancyForm.css';
import { useNavigate } from "react-router-dom";

const VacancyForm = () => {
  const navigate = useNavigate();  // Initialize navigate inside the component
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

  // Save to Firebase
  // const AddVacancy = async (data) => {
  //   const database = getDatabase();
  //   const vacancyRef = ref(database, "Jobs"); // Path to Jobs in Firebase
  //   await push(vacancyRef, data); // Push data with auto-generated key
  // };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // await AddVacancy(vacancyData); // Save vacancy data to Firebase
      const response = await fetch("http://127.0.0.1:8000/api/add-job-vacancy/",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vacancyData),
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
