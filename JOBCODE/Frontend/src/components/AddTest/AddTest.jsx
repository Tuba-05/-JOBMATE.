import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddTest.css";
import { storeTestData } from "../firebase"; 

const AddTest = () => {
  const [testTitle, setTestTitle] = useState("");
  const [isTimedTest, setIsTimedTest] = useState(false);
  const [timer, setTimer] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  const MAX_QUESTIONS = 10;

  const handleTestTitleChange = (e) => setTestTitle(e.target.value);
  const handleIsTimedTestChange = (e) => setIsTimedTest(e.target.checked);
  const handleTimerChange = (e) => setTimer(e.target.value);

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
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const testData = {
      testTitle,
      isTimedTest,
      timer,
      questions,
    };

    try {
      
      await storeTestData(testData);

      alert("Test added successfully!");
      setTestTitle("");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
      setIsTimedTest(false);
      setTimer("");
    } catch (error) {
      alert("Failed to submit test. Please try again.");
    }
  };

  return (
    <div className="add-test-container">
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
                min="0"
              />
            </div>
          )}

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 border rounded p-3 question-card">
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
                    <option key={optIndex} value={opt}>
                      Option {optIndex + 1}: {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="button-containers">
            <button
              type="button"
              className="btn btn-outline-primary mb-3 add-question-btn"
              onClick={addQuestion}
              disabled={questions.length >= MAX_QUESTIONS}
            >
              Add Question
            </button>
            <button
              type="submit"
              className="btn btn-outline-success submit-test-btn"
            >
              Submit Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTest;
