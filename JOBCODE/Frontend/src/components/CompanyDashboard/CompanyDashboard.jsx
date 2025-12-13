import React, { useState,} from "react";
import VacancyForm from "./AddVacancyForm"; // Assuming this is a component for adding vacancies
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const compUser = localStorage.getItem("UserId");
  const handleAddVacancyClick = () => {
    setShowForm(!showForm);
  };
  // Add this line to define dynamic classes
  const dashboardClasses = `dashboard-3d-container ${showForm ? 'form-open' : 'form-closed'}`;
  return (
    // using the dynamic classes here
    <div className={dashboardClasses}>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">TalentHub</h1>
        </header>

        {/* Button Container for Flex Layout */}
        <div className="button-containerboth">
          {/* scoreboard */}
          <button
            className="leader-dashboard-btn">
          Scoreboard
          </button>
          {/* add vacancy */}
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
