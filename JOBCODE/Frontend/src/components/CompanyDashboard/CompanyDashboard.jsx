import React, { useState } from "react";
import VacancyForm from "./AddVacancyForm"; // Assuming this is a component for adding vacancies
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAddVacancyClick = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="dashboard-3d-container">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">TalentHub</h1>
        </header>

        {/* Button Container for Flex Layout */}
        <div className="button-containerboth">
        <button
          className="leader-dashboard-btn">
        Scoreboard
        </button>


          <button
            onClick={handleAddVacancyClick}
            className="add-vacancy-btn"
            data-tooltip={showForm ? "Close Vacancy Form" : "Add a New Vacancy"}
          >
            {showForm ? "Close Vacancy Form" : "Add Vacancy"}
          </button>
        </div>

        {showForm && (
          <div className="vacancy-form-container">
            <VacancyForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
