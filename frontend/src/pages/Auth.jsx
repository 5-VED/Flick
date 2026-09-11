import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth.service';
import './Auth.css';

const FlickLogoSmall = () => (
  <svg width="36" height="36" viewBox="0 0 72 72" fill="none">
    <rect width="72" height="72" rx="20" fill="#FFD700" />
    <path d="M42 12L24 36H36L30 60L50 32H38L42 12Z" fill="#1A1A1A" />
  </svg>
);

export default function Auth() {
  const { navigate, login } = useApp();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await authService.sendOtp(phone);
      if (result.success) {
        setStep('otp');
        setCountdown(30);
        if (result.data?.otp) setDevOtp(result.data.otp); // Dev mode
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 4) {
      setError('Enter the 4-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await authService.verifyOtp(phone, otpString);
      if (result.success) {
        const u = result.data.user;
        login(
          {
            phone: `+91 ${phone}`,
            name: `${u.first_name} ${u.last_name}`,
            initials: `${u.first_name[0]}${u.last_name[0]}`,
            email: u.email,
            id: u._id,
          },
          result.data.token
        );
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '']);
    setDevOtp('');
    setError('');
    await handleSendOtp();
  };

  const filledOtp = otp.filter(Boolean).length;

  return (
    <div className="screen auth-screen flex flex-col px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none auth-bg-glow"
      />

      <div className="flex items-center gap-3 pt-14 lg:pt-8 pb-10">
        <button
          onClick={() => (step === 'otp' ? setStep('phone') : navigate('splash'))}
          className="auth-back-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <FlickLogoSmall />
      </div>

      {step === 'phone' && (
        <div className="flex flex-col gap-6 animate-slide-down">
          <div className="flex flex-col gap-1">
            <h2 className="auth-title">What's your</h2>
            <h2 className="auth-title auth-title--accent">phone number?</h2>
            <p className="auth-subtitle">We'll send you a one-time verification code</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="auth-phone-prefix">
                <span className="text-base">🇮🇳</span>
                <span className="text-white font-medium text-sm">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => { setError(''); setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                className="input-field flex-1 auth-phone-input"
                autoFocus
              />
            </div>
            {error && <p className="auth-error"><span>⚠️</span> {error}</p>}
          </div>

          <button className="btn-primary mt-4" onClick={handleSendOtp} disabled={loading || phone.length < 10}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="auth-spinner" />
                Sending OTP...
              </span>
            ) : 'Continue'}
          </button>

          <p className="auth-hint">Standard messaging rates may apply</p>
        </div>
      )}

      {step === 'otp' && (
        <div className="flex flex-col gap-6 animate-slide-down">
          <div className="flex flex-col gap-1">
            <h2 className="auth-title">Enter OTP</h2>
            <p className="auth-subtitle">
              Sent to <span className="text-white font-semibold">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
            </p>
            {devOtp && (
              <div className="auth-dev-banner">
                <p>Dev mode — OTP: {devOtp}</p>
              </div>
            )}
          </div>

          <div className="auth-otp-row">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={otpRefs[idx]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className={`auth-otp-box${digit ? ' is-filled' : ''}`}
              />
            ))}
          </div>

          <div className="auth-otp-progress">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`auth-otp-dot${i < filledOtp ? ' is-on' : ''}`} />
            ))}
          </div>

          {error && <p className="auth-error auth-error--center"><span>⚠️</span> {error}</p>}

          <button className="btn-primary mt-2" onClick={handleVerify} disabled={loading || filledOtp < 4}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="auth-spinner" />
                Verifying...
              </span>
            ) : 'Verify & Continue'}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="auth-resend-count">Resend OTP in <span className="text-[#888] font-semibold">{countdown}s</span></p>
            ) : (
              <button className="auth-resend" onClick={handleResend}>
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
