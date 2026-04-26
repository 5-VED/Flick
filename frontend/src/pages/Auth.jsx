import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const FlickLogoSmall = () => (
  <svg width="36" height="36" viewBox="0 0 72 72" fill="none">
    <rect width="72" height="72" rx="20" fill="#FFD700" />
    <path d="M42 12L24 36H36L30 60L50 32H38L42 12Z" fill="#1A1A1A" />
  </svg>
);

export default function Auth() {
  const { navigate, setUser } = useApp();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
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
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('otp');
    setCountdown(30);
    setTimeout(() => otpRefs[0].current?.focus(), 100);
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
    if (otp.join('').length < 4) {
      setError('Enter the 4-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setUser({ phone: `+91 ${phone}`, name: 'Arjun Sharma', initials: 'AS' });
    navigate('home');
  };

  const filledOtp = otp.filter(Boolean).length;

  return (
    <div className="screen flex flex-col px-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,215,0,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 pt-14 lg:pt-8 pb-10">
        <button
          onClick={() => (step === 'otp' ? setStep('phone') : navigate('splash'))}
          className="w-10 h-10 rounded-full bg-[#222] border border-[#333] flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L11 6M5 12L11 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <FlickLogoSmall />
      </div>

      {step === 'phone' && (
        <div className="flex flex-col gap-6 animate-slide-down">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-white">What's your</h2>
            <h2 className="text-3xl font-bold" style={{ color: '#FFD700' }}>
              phone number?
            </h2>
            <p className="text-[#666] text-sm mt-1">
              We'll send you a one-time verification code
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-3.5 min-w-[76px]">
                <span className="text-base">🇮🇳</span>
                <span className="text-white font-medium text-sm">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => {
                  setError('');
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                }}
                className="input-field flex-1 text-lg font-medium tracking-widest"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              className="btn-primary"
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </div>

          <p className="text-[#555] text-xs text-center mt-2">
            Standard messaging rates may apply
          </p>
        </div>
      )}

      {step === 'otp' && (
        <div className="flex flex-col gap-6 animate-slide-down">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-white">Enter OTP</h2>
            <p className="text-[#666] text-sm mt-1">
              Sent to{' '}
              <span className="text-white font-semibold">
                +91 {phone.slice(0, 5)} {phone.slice(5)}
              </span>
            </p>
          </div>

          {/* OTP boxes */}
          <div className="flex gap-3 justify-center my-2">
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
                className="w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-200 bg-[#2A2A2A] text-white focus:outline-none"
                style={{
                  borderColor: digit ? '#FFD700' : '#3A3A3A',
                  boxShadow: digit ? '0 0 12px rgba(255,215,0,0.2)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i < filledOtp ? '24px' : '8px',
                  background: i < filledOtp ? '#FFD700' : '#333',
                }}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-2 justify-center">
              <span>⚠️</span> {error}
            </p>
          )}

          <button
            className="btn-primary mt-2"
            onClick={handleVerify}
            disabled={loading || filledOtp < 4}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Continue'
            )}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-[#555] text-sm">
                Resend OTP in{' '}
                <span className="text-[#888] font-semibold">{countdown}s</span>
              </p>
            ) : (
              <button
                className="text-[#FFD700] font-semibold text-sm"
                onClick={() => {
                  setOtp(['', '', '', '']);
                  setCountdown(30);
                  setTimeout(() => otpRefs[0].current?.focus(), 100);
                }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
