import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TakeTest.css";

const TakeTest = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const UserID = localStorage.getItem("UserId") || localStorage.getItem("user_id");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  // Candidate Answers State (indexed by question number)
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultScore, setResultScore] = useState(null);

  // Timer State (in seconds)
  const [secondsLeft, setSecondsLeft] = useState(null);

  // Fetch Test Details from Backend
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/get-job-test/${jobId}/`);
        const data = await response.json();

        if (response.ok && data.success && data.test) {
          setTestData(data.test);
          if (data.test.isTimed && data.test.timer > 0) {
            setSecondsLeft(data.test.timer * 60);
          }
        } else {
          setError(data.message || "Screening test not found.");
        }
      } catch (err) {
        console.error("Fetch Test Error:", err);
        setError("Network error loading assessment test.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchTest();
    }
  }, [jobId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0 || resultScore !== null) return;

    const timerInterval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [secondsLeft, resultScore]);

  // Handle Answer Input
  const handleAnswerSelect = (qIndex, selectedValue) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: selectedValue,
    }));
  };

  // Calculate Marks & Submit to Backend
  const submitTest = async (userAnswers = answers) => {
    if (submitting || resultScore !== null) return;
    setSubmitting(true);

    const questions = testData.questions || [];
    let obtainedMarks = 0;
    const totalMarks = questions.length;

    questions.forEach((q, i) => {
      const candAnswer = (userAnswers[i] || "").toString().trim().toLowerCase();
      const expectedAnswer = (q.correctAnswer || "").toString().trim().toLowerCase();

      if (candAnswer && expectedAnswer && (candAnswer === expectedAnswer || expectedAnswer.includes(candAnswer))) {
        obtainedMarks += 1;
      }
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/save-test-scores/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          UserId: UserID,
          CompanyTestID: testData.id,
          TotalMarks: totalMarks,
          ObtainedMarks: obtainedMarks,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResultScore({
          obtained: obtainedMarks,
          total: totalMarks,
          percentage: roundPerc(obtainedMarks, totalMarks),
          passed: roundPerc(obtainedMarks, totalMarks) >= 50,
        });
      } else {
        setResultScore({
          obtained: obtainedMarks,
          total: totalMarks,
          percentage: roundPerc(obtainedMarks, totalMarks),
          passed: roundPerc(obtainedMarks, totalMarks) >= 50,
        });
      }
    } catch (err) {
      console.error("Submit Test Error:", err);
      setResultScore({
        obtained: obtainedMarks,
        total: totalMarks,
        percentage: roundPerc(obtainedMarks, totalMarks),
        passed: roundPerc(obtainedMarks, totalMarks) >= 50,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    submitTest(answers);
  };

  const roundPerc = (obtained, total) => {
    if (!total) return 0;
    return Math.round((obtained / total) * 100);
  };

  const formatTimer = (totalSeconds) => {
    if (totalSeconds === null) return "--:--";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="take-test-page-wrapper">
        <div className="test-loading-card">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="take-test-page-wrapper">
        <div className="test-error-card">
          <h2>Assessment Notice</h2>
          <p>{error || "Unable to load test details."}</p>
          <button className="btn-back" onClick={() => navigate("/JObcard")}>
            Return to Job Listings
          </button>
        </div>
      </div>
    );
  }

  const questions = testData.questions || [];
  const currentQ = questions[currentQIndex];

  // Result Summary & Answer Review View after Submission
  if (resultScore !== null) {
    return (
      <div className="take-test-page-wrapper">
        <div className="test-result-card">
          <span className="result-badge">Assessment Complete</span>
          <h1>Test Results & Answer Review</h1>
          <p className="test-name-sub">{testData.testTitle}</p>

          <div className={`score-display-box ${resultScore.passed ? "passed" : "failed"}`}>
            <span className="score-main">{resultScore.obtained} / {resultScore.total}</span>
            <span className="score-perc">{resultScore.percentage}% Overall Score</span>
            <span className="status-label">
              {resultScore.passed ? "PASSED ASSESSMENT" : "DID NOT MEET PASS THRESHOLD"}
            </span>
          </div>

          {/* Question & Answer Detailed Review Section */}
          <div className="answers-review-section">
            <h3 className="review-heading">Answer Breakdown</h3>
            <div className="review-list">
              {questions.map((q, idx) => {
                const userAns = (answers[idx] || "No answer provided").toString().trim();
                const correctAns = (q.correctAnswer || "").toString().trim();
                const isCorrect = userAns.toLowerCase() === correctAns.toLowerCase() || (correctAns !== "" && correctAns.toLowerCase().includes(userAns.toLowerCase()));

                return (
                  <div key={idx} className={`review-item ${isCorrect ? "correct-item" : "incorrect-item"}`}>
                    <div className="review-header">
                      <span className="review-q-num">Question {idx + 1} ({q.type === "mcq" ? "MCQ" : q.type === "true_false" ? "True/False" : "Short Answer"})</span>
                      <span className={`review-badge ${isCorrect ? "badge-success" : "badge-error"}`}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <p className="review-q-text">{q.question}</p>
                    <div className="review-details">
                      <p><strong>Your Answer:</strong> <span className={isCorrect ? "ans-correct" : "ans-wrong"}>{userAns}</span></p>
                      <p><strong>Correct Answer:</strong> <span className="ans-correct">{correctAns}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="result-info-text">
            Your evaluation results have been transmitted directly to <strong>{testData.companyName}</strong>'s Employer Scoreboard.
          </p>

          <div className="result-actions">
            <button className="btn-result-portal" onClick={() => navigate("/candidate-portal")}>
              Candidate Hub
            </button>
            <button className="btn-result-jobs" onClick={() => navigate("/JObcard")}>
              Explore More Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="take-test-page-wrapper">
      <div className="take-test-container">
        {/* Test Header Bar */}
        <header className="test-top-bar">
          <div className="header-info">
            <span className="company-tag">{testData.companyName}</span>
            <h2 className="test-title-text">{testData.testTitle}</h2>
          </div>

          {secondsLeft !== null && (
            <div className={`timer-badge ${secondsLeft < 60 ? "urgent" : ""}`}>
              Time Remaining: <strong>{formatTimer(secondsLeft)}</strong>
            </div>
          )}
        </header>

        {/* Progress Bar */}
        <div className="test-progress-strip">
          <div
            className="progress-fill"
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Panel */}
        {currentQ && (
          <div className="question-display-panel">
            <div className="q-number-bar">
              <span>Question {currentQIndex + 1} of {questions.length}</span>
              <span className="type-badge">
                {currentQ.type === "mcq"
                  ? "Multiple Choice"
                  : currentQ.type === "true_false"
                  ? "True / False"
                  : "Short Answer"}
              </span>
            </div>

            <h3 className="q-text">{currentQ.question}</h3>

            {/* Answer Options */}
            <div className="answers-container">
              {currentQ.type === "mcq" && (
                <div className="options-radio-list">
                  {currentQ.options.map((opt, optIndex) => (
                    <label key={optIndex} className={`option-radio-card ${answers[currentQIndex] === opt ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name={`q-${currentQIndex}`}
                        value={opt}
                        checked={answers[currentQIndex] === opt}
                        onChange={() => handleAnswerSelect(currentQIndex, opt)}
                      />
                      <span className="radio-text">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === "true_false" && (
                <div className="tf-options-row">
                  {["True", "False"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`btn-tf-choice ${answers[currentQIndex] === val ? "selected" : ""}`}
                      onClick={() => handleAnswerSelect(currentQIndex, val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === "text" && (
                <div className="text-answer-wrapper">
                  <textarea
                    className="cand-answer-textarea"
                    placeholder="Type your short answer here..."
                    value={answers[currentQIndex] || ""}
                    onChange={(e) => handleAnswerSelect(currentQIndex, e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Bottom Question Controls */}
            <div className="q-nav-controls">
              <button
                className="btn-q-nav"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
              >
                Previous
              </button>

              {currentQIndex < questions.length - 1 ? (
                <button
                  className="btn-q-nav btn-next"
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                >
                  Next Question
                </button>
              ) : (
                <button
                  className="btn-submit-final"
                  onClick={() => submitTest(answers)}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Assessment"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeTest;
