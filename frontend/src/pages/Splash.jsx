import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './Splash.css';

const FlickLogo = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
    <rect width="72" height="72" rx="20" fill="var(--splash-gold)" />
    <path
      d="M42 12L24 36H36L30 60L50 32H38L42 12Z"
      fill="#1A1A1A"
      strokeLinejoin="round"
    />
  </svg>
);

const BADGES = ['⚡ Fast', '🛡️ Safe', '💰 Affordable'];

export default function Splash() {
  const { navigate } = useApp();
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setShowContent(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="screen splash">
      {/* Background texture */}
      <div className="splash__bg" aria-hidden="true" />

      {/* Racing stripes */}
      <div className="splash__stripe splash__stripe--main" aria-hidden="true" />
      <div className="splash__stripe splash__stripe--sub" aria-hidden="true" />

      {/* Top spacer */}
      <div className="splash__spacer" />

      {/* Center content */}
      <main className={`splash__main ${visible ? 'is-visible' : ''}`}>
        {/* Logo */}
        <div className="splash__logo">
          <div className="splash__logo-glow">
            <FlickLogo />
          </div>
        </div>

        {/* App name */}
        <div className="splash__brand">
          <h1 className="splash__title">FLICK</h1>
          <p className="splash__subtitle">Zip Through The City</p>
        </div>

        {/* Feature badges */}
        <div className={`splash__badges ${showContent ? 'is-visible' : ''}`}>
          {BADGES.map((tag) => (
            <span key={tag} className="splash__badge">
              {tag}
            </span>
          ))}
        </div>
      </main>

      {/* Bottom CTA */}
      <div className={`splash__cta ${showContent ? 'is-visible' : ''}`}>
        <button className="splash__btn" onClick={() => navigate('auth')}>
          Get Started
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <p className="splash__login">
          Already have an account?{' '}
          <button className="splash__login-btn" onClick={() => navigate('auth')}>
            Log In
          </button>
        </p>

        <p className="splash__legal">
          By continuing, you agree to our <strong>Terms of Service</strong> &amp;{' '}
          <strong>Privacy Policy</strong>
        </p>
      </div>
    </div>
  );
}
