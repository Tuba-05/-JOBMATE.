import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddTest.css";
import { useNavigate } from "react-router-dom";

const AddTest = () => {
  const navigate = useNavigate();  // Initialize navigate inside the component
  const JobId = localStorage.getItem("JobId");
  const [loading, setLoading] = useState(false); // disable submit btn while submitting
  const [buttonstate, setbuttonstate] = useState(false); // State for button toggle
  const [testTitle, setTestTitle] = useState(""); // State for test title
  const [isTimedTest, setIsTimedTest] = useState(false); // State for timed test checkbox
  const [timer, setTimer] = useState(""); // State for timer (if timed test is enabled)
  // Array of questions → each question contains text, 4 options, and a correct answer
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  
  const MAX_QUESTIONS = 10; // Maximum number of questions allowed

  // Handlers for input values
  const handleTestTitleChange = (e) => setTestTitle(e.target.value);
  const handleIsTimedTestChange = (e) => setIsTimedTest(e.target.checked);
  const handleTimerChange = (e) => setTimer(e.target.value);

  // Handles question text update
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };
  // Handles option text update
  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuestions(updatedQuestions);
  };
  // Handles correct answer dropdown update
  const handleCorrectAnswerChange = (qIndex, selectedValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].correctAnswer = selectedValue;
    setQuestions(updatedQuestions);
  };
  // Adds a new empty question if limit not reached
  const addQuestion = () => {
    if (questions.length < MAX_QUESTIONS) {
      setQuestions([
        ...questions,
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);
    }
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents page reload
    if (buttonstate){
      navigate("/company-dashboard");
      return; // early return to avoid submitting when going back
    }

     // --- basic validation ---
    if (!testTitle.trim()) {
        alert("Please enter a test title.");
        return;
    }
    if (isTimedTest && (!timer || parseInt(timer) <= 0)) {
        alert("Please enter a valid timer duration in minutes.");
        return;
    }
    // Check all questions for completeness , trim() to avoid spaces
    const incompleteQuestion = questions.find(q => 
        !q.question.trim() || 
        q.options.some(opt => !opt.trim()) || 
        !q.correctAnswer.trim()
    );
    if (incompleteQuestion) {
        alert("Please fill in all questions, options, and select a correct answer for each.");
        return;
    }
    // ----------------------------
    setLoading(true); // disable submit button during submission
      const testData = {
        jobId: JobId,
        testTitle,
        isTimedTest,
        timer,
        questions,
      };
      try {
          const response = await fetch("http://127.0.0.1:8000/api/add-tests/",{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        });
        const test_data = await response.json();

        if (test_data.success){
          localStorage.setItem("CompanyTestId", test_data.companytest_id); // Store TestId for later use
          alert("Test added successfully!");
          setLoading(false);
          setbuttonstate(true);
        }
        else{
          alert("Error adding test :( ");
        }
      } 
      catch (error) {
        alert("Failed to submit test. Please try again.");
        setLoading(false);
        console.error(error);
      }
      
  };

  return (
    <div className="add-test-container">

      {/* Progress Bar showing how many questions added */}
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${(questions.length / MAX_QUESTIONS) * 100}%`,
          }}
        >
          <span className="progress-text">
            {Math.round((questions.length / MAX_QUESTIONS) * 100)}%
          </span>
        </div>
      </div>

      <div className="neumorphism-card">
        <h1 className="text-center mb-4 animate__fadeIn">Design Your Test</h1>

        <p className="text-center text-white">
          <strong>Questions Added: {questions.length}/{MAX_QUESTIONS}</strong>
        </p>

        <form onSubmit={handleSubmit} className="animate__fadeInUp">

          {/* Test Title */}
          <div className="mb-3">
            <label className="form-label">Test Title</label>
            <input
              type="text"
              className="form-control neumorphic-input"
              placeholder="Enter test title"
              value={testTitle}
              onChange={handleTestTitleChange}
              required
            />
          </div>

          {/* Timed Test Checkbox */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="timedTest"
              checked={isTimedTest}
              onChange={handleIsTimedTestChange}
            />
            <label className="form-check-label" htmlFor="timedTest">
              This is a timed test
            </label>
          </div>

          {/* Timer input only if timed test is checked */}
          {isTimedTest && (
            <div className="mb-3">
              <label className="form-labeladd">Timer (in minutes)</label>
              <input
                type="number"
                className="form-control neumorphic-input"
                placeholder="Enter timer duration"
                value={timer}
                onChange={handleTimerChange}
                required
                min="1"
              />
            </div>
          )}

          {/* Question Listing */}
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 border rounded p-3 question-card">

              {/* Question Textarea */}
              <div className="mb-3">
                <label className="form-labeladd">Question {qIndex + 1}</label>
                <textarea
                  className="form-control neumorphic-input"
                  placeholder="Enter the question"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  required
                />
              </div>

              {/* Options (4 options) */}
              <div className="row">
                {q.options.map((opt, optIndex) => (
                  <div className="col-md-6 mb-3" key={optIndex}>
                    <label className="form-labeladd">Option {optIndex + 1}</label>
                    <input
                      type="text"
                      className="form-control neumorphic-input"
                      placeholder={`Enter option ${optIndex + 1}`}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(qIndex, optIndex, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer Dropdown */}
              <div className="mb-3">
                <label className="form-labeladd">Correct Answer</label>
                <select
                  className="form-select neumorphic-input"
                  value={q.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                  required
                >
                  <option value="">Select the correct answer</option>
                  {q.options.map((opt, optIndex) => (
                    <option
                      key={optIndex}
                      value={opt}
                      // disabled={!opt}   // disable if option is empty
                    >
                      Option {optIndex + 1}: {opt || "Empty"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {/* Buttons: Add Question & Submit */}
          <div className="button-containers">
            { (!buttonstate) && (
              <button
                type="button"
                className="btn btn-outline-primary mb-3 add-question-btn"
                onClick={addQuestion}
                disabled={questions.length >= MAX_QUESTIONS}
              >
                Add Question
              </button>
            ) }
            {/* button state */}
            <button 
              type="submit"
              className="btn btn-outline-success submit-test-btn"
              disabled={loading}>
                {loading ? "Submitting..." : buttonstate ? "Back" : "Submit Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTest;
