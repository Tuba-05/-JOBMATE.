import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VCimg from '../../assets/vericode.png';
import './VeriCode.css';

const VeriCode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState(
    location.state?.email || localStorage.getItem('userEmail') || ''
  );
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes timer (120 seconds)
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto request OTP on load if email exists
  useEffect(() => {
    if (userEmail) {
      sendOtpRequest(userEmail);
    }
  }, []);

  // Live Countdown Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      setAlertMsg({ type: 'error', text: 'OTP verification code expired. Please click Resend Verification Code.' });
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper API call to request OTP
  const sendOtpRequest = async (emailToUse) => {
    if (!emailToUse) return;
    setLoading(true);
    setAlertMsg({ type: '', text: '' });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTimeLeft(120); // Reset to 2 minutes
        setIsExpired(false);
        setOtpCode(''); // Keep input empty for manual user entry!
        localStorage.setItem('userEmail', emailToUse.trim().toLowerCase());
        setAlertMsg({
          type: 'success',
          text: `📩 Verification code sent to ${emailToUse.trim().toLowerCase()}! Please check your email and enter the 6-digit code below.`,
        });
      } else {
        setAlertMsg({ type: 'error', text: data.message || 'Failed to send OTP code.' });
      }
    } catch (error) {
      setAlertMsg({ type: 'error', text: 'Network error. Please verify backend connection.' });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code Request Handler
  const handleResendCode = (e) => {
    e.preventDefault();
    if (!userEmail) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    sendOtpRequest(userEmail);
  };

  // Submit Verification & Reset Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      setAlertMsg({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    if (!otpCode || otpCode.length < 6) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid 6-digit OTP code.' });
      return;
    }

    if (isExpired) {
      setAlertMsg({ type: 'error', text: 'OTP code has expired. Please click Resend Code.' });
      return;
    }

    setLoading(true);
    setAlertMsg({ type: '', text: '' });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.trim().toLowerCase(),
          otp_code: otpCode,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAlertMsg({ type: 'success', text: 'Password reset successfully! Redirecting to login page...' });
        setTimeout(() => {
          navigate('/login-signup');
        }, 1500);
      } else {
        setAlertMsg({ type: 'error', text: data.message || 'Invalid or expired verification code.' });
      }
    } catch (error) {
      setAlertMsg({ type: 'error', text: 'Network error. Please verify server connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vericode-container">
      <div className="vericode-horizontal-card">
        {/* Left Hero Panel */}
        <div className="vericode-left-panel">
          <img src={VCimg} alt="JobMate Shield Icon" className="vericode-hero-img" />
          <h2 className="vericode-title">Verify Code</h2>
          <p className="vericode-subtitle">
            We sent a 6-digit verification code to
          </p>

          {isEditingEmail ? (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '280px' }}>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="otp-input-field"
                style={{ fontSize: '0.875rem', letterSpacing: 'normal', padding: '0.4rem 0.6rem', textAlign: 'left' }}
                placeholder="enter email"
              />
              <button
                type="button"
                className="btn-verify"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => {
                  localStorage.setItem('userEmail', userEmail);
                  setIsEditingEmail(false);
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="vericode-email-badge">{userEmail || 'No email specified'}</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                onClick={() => setIsEditingEmail(true)}
              >
                ✏️ Change
              </button>
            </div>
          )}
        </div>

        {/* Right Form Panel */}
        <div className="vericode-right-panel">
          {/* Alerts Banner */}
          {alertMsg.text && (
            <div className={`alert-box alert-${alertMsg.type}`}>
              {alertMsg.text}
            </div>
          )}

          {/* Verification Form */}
          <form className="vericode-form" onSubmit={handleSubmit}>
            <div className="otp-input-group">
              <label htmlFor="otpCode" className="otp-label">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                id="otpCode"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
                className="otp-input-field"
                disabled={loading || isExpired}
              />
            </div>

            <div className="otp-input-group">
              <label htmlFor="newPassword" className="otp-label">
                New Password
              </label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="otp-input-field"
                  style={{ fontSize: '1rem', letterSpacing: 'normal', textAlign: 'left', paddingRight: '45px' }}
                  disabled={loading || isExpired}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    zIndex: 10,
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="timer-container">
              <span>Code Expiration:</span>
              <span className={`timer-badge ${isExpired ? 'expired' : ''}`}>
                {isExpired ? '00:00 (Expired)' : formatTime(timeLeft)}
              </span>
            </div>

            {/* Actions */}
            <div className="vericode-actions">
              <button
                type="submit"
                className="btn-verify"
                disabled={loading || isExpired || !otpCode || otpCode.trim().length < 6}
              >
                {loading ? 'Verifying...' : 'Verify & Reset Password'}
              </button>

              <button
                type="button"
                className="btn-resend"
                onClick={handleResendCode}
                disabled={loading || (!isExpired && timeLeft > 60)}
              >
                Resend Verification Code
              </button>

              <button
                type="button"
                className="btn-back"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VeriCode;