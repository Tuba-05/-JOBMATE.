import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddTest.css";

const AddTest = () => {
  const navigate = useNavigate();
  const JobId = localStorage.getItem("JobId");

  const [loading, setLoading] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [isTimedTest, setIsTimedTest] = useState(false);
  const [timer, setTimer] = useState("");

  // Questions state supporting multiple question types: MCQ, True/False, Short Text Answer
  const [questions, setQuestions] = useState([
    { type: "mcq", question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  const MAX_QUESTIONS = 10;

  // Handlers for metadata
  const handleTestTitleChange = (e) => setTestTitle(e.target.value);
  const handleIsTimedTestChange = (e) => setIsTimedTest(e.target.checked);
  const handleTimerChange = (e) => setTimer(e.target.value);

  // Handle Question Type Change
  const handleTypeChange = (index, newType) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = newType;

    if (newType === "true_false") {
      updatedQuestions[index].options = ["True", "False"];
      updatedQuestions[index].correctAnswer = "True";
    } else if (newType === "text") {
      updatedQuestions[index].options = ["Short Text Answer"];
      updatedQuestions[index].correctAnswer = updatedQuestions[index].correctAnswer || "Short Text Answer";
    } else {
      // Default MCQ
      updatedQuestions[index].options = ["", "", "", ""];
      updatedQuestions[index].correctAnswer = "";
    }

    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, selectedValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].correctAnswer = selectedValue;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (questions.length < MAX_QUESTIONS) {
      setQuestions([
        ...questions,
        { type: "mcq", question: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);
    }
  };

  const removeQuestion = (indexToRemove) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, index) => index !== indexToRemove);
      setQuestions(updatedQuestions);
    }
  };

  // Submit Screening Test to DB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testTitle.trim()) {
      alert("Please enter a test title.");
      return;
    }

    if (isTimedTest && (!timer || parseFloat(timer) <= 0)) {
      alert("Please enter a valid timer duration in minutes (e.g. 0.5 or 15).");
      return;
    }

    const incompleteQuestion = questions.find((q) => {
      if (!q.question.trim()) return true;
      if (q.type === "mcq" && (q.options.some((opt) => !opt.trim()) || !q.correctAnswer.trim())) return true;
      if (q.type === "true_false" && !q.correctAnswer.trim()) return true;
      if (q.type === "text" && !q.correctAnswer.trim()) return true;
      return false;
    });

    if (incompleteQuestion) {
      alert("Please complete all questions, options, and answers before submitting.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const testData = {
      jobId: JobId,
      testTitle,
      isTimedTest,
      timer: isTimedTest ? parseFloat(timer) : 0,
      questions,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/add-tests/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(testData),
      });

      const test_data = await response.json();

      if (response.ok && test_data.success) {
        if (test_data.companytest_id) {
          localStorage.setItem("CompanyTestId", test_data.companytest_id);
        }
        alert("✅ Screening Test created and saved successfully!");
        navigate("/company-portal");
      } else {
        alert("⚠️ " + (test_data.message || "Error adding test."));
      }
    } catch (error) {
      console.error("Test Submit Error:", error);
      alert("Failed to submit test. Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-test-page-wrapper">
      <div className="add-test-container">
        {/* Back Button */}
        <button className="btn-back-home" onClick={() => navigate("/company-portal")}>
          ← Back to Employer Portal
        </button>

        <header className="test-header">
          <span className="portal-badge">📝 ASSESSMENT DESIGNER</span>
          <h1 className="test-title">Design Your Test</h1>
          <p className="test-subtitle">
            Create screening assessments with Multiple Choice, True/False, or Short Text answer questions.
          </p>
        </header>

        {/* Questions Progress Bar */}
        <div className="test-progress-wrapper">
          <div className="progress-info">
            <span>Questions Added: <strong>{questions.length}/{MAX_QUESTIONS}</strong></span>
            <span>{Math.round((questions.length / MAX_QUESTIONS) * 100)}% Complete</span>
          </div>
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{ width: `${(questions.length / MAX_QUESTIONS) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Test Creation Form */}
        <form onSubmit={handleSubmit} className="test-form">
          {/* Test Metadata Box */}
          <div className="test-config-box">
            <div className="form-group mb-3">
              <label className="form-label">Test Title *</label>
              <input
                type="text"
                className="test-input"
                placeholder="Enter test title (e.g. Senior Developer Skill Test)"
                value={testTitle}
                onChange={handleTestTitleChange}
                required
              />
            </div>

            <div className="timed-test-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isTimedTest}
                  onChange={handleIsTimedTestChange}
                />
                <span className="checkmark"></span>
                <span className="label-text">This is a timed test</span>
              </label>

              {isTimedTest && (
                <div className="timer-input-wrapper">
                  <label className="form-label">Timer (Minutes) *</label>
                  <input
                    type="number"
                    className="test-input timer-input"
                    placeholder="Duration"
                    value={timer}
                    onChange={handleTimerChange}
                    required
                    min="0.1"
                    step="any"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="questions-list">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-card-box">
                <div className="question-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <span className="question-number-tag">Question #{qIndex + 1}</span>
                    <select
                      className="type-selector-select"
                      value={q.type}
                      onChange={(e) => handleTypeChange(qIndex, e.target.value)}
                    >
                      <option value="mcq">Multiple Choice (4 Options)</option>
                      <option value="true_false">True / False</option>
                      <option value="text">Short Text / Descriptive Answer</option>
                    </select>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-q"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remove ✕
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="form-group mb-3">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className="test-textarea"
                    placeholder={`Enter question #${qIndex + 1}...`}
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    required
                  />
                </div>

                {/* 1. Multiple Choice Options */}
                {q.type === "mcq" && (
                  <>
                    <div className="options-grid">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="form-group">
                          <label className="form-label">Option #{optIndex + 1} *</label>
                          <input
                            type="text"
                            className="test-input"
                            placeholder={`Enter option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-group mt-3">
                      <label className="form-label">Correct Answer Selection *</label>
                      <select
                        className="test-select"
                        value={q.correctAnswer}
                        onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                        required
                      >
                        <option value="">-- Select Correct Option --</option>
                        {q.options.map((opt, optIndex) => (
                          <option key={optIndex} value={opt || `Option ${optIndex + 1}`}>
                            {opt ? `Option ${optIndex + 1}: ${opt}` : `Option ${optIndex + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* 2. True / False Selection */}
                {q.type === "true_false" && (
                  <div className="form-group mt-3">
                    <label className="form-label">Correct Answer (True or False) *</label>
                    <select
                      className="test-select"
                      value={q.correctAnswer || "True"}
                      onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                      required
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  </div>
                )}

                {/* 3. Short Text / Descriptive Answer */}
                {q.type === "text" && (
                  <div className="form-group mt-3">
                    <label className="form-label">Expected Answer / Keyword Reference *</label>
                    <input
                      type="text"
                      className="test-input"
                      placeholder="Enter expected answer or reference keywords for grading"
                      value={q.correctAnswer}
                      onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Action Controls */}
          <div className="test-form-actions">
            {questions.length < MAX_QUESTIONS && (
              <button type="button" className="btn-add-question" onClick={addQuestion}>
                ➕ Add Another Question ({questions.length}/{MAX_QUESTIONS})
              </button>
            )}

            <button type="submit" className="btn-submit-test" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTest;
