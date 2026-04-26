import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const FlickLogo = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect width="72" height="72" rx="20" fill="#FFD700" />
    <path
      d="M42 12L24 36H36L30 60L50 32H38L42 12Z"
      fill="#1A1A1A"
      strokeLinejoin="round"
    />
  </svg>
);

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
    <div className="screen flex flex-col items-center justify-between px-6 py-12 overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(255,215,0,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Racing stripes */}
      <div className="absolute top-0 right-0 w-1 h-full bg-[#FFD700] opacity-5" />
      <div className="absolute top-0 right-4 w-0.5 h-full bg-[#FFD700] opacity-3" />

      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div
        className="flex flex-col items-center gap-8 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Logo */}
        <div className="animate-float">
          <div
            className="rounded-[28px] p-1"
            style={{ boxShadow: '0 0 60px rgba(255,215,0,0.45), 0 0 120px rgba(255,215,0,0.15)' }}
          >
            <FlickLogo />
          </div>
        </div>

        {/* App name */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-[72px] leading-none tracking-wider text-white"
            style={{ fontFamily: 'Bebas Neue' }}
          >
            FLICK
          </h1>
          <p className="text-[#888] text-base tracking-[0.2em] uppercase text-sm font-medium">
            Zip Through The City
          </p>
        </div>

        {/* Feature badges */}
        <div
          className="flex items-center gap-3 transition-all duration-500"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: '0.1s',
          }}
        >
          {['⚡ Fast', '🛡️ Safe', '💰 Affordable'].map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-[#888] bg-[#222] border border-[#333] px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="w-full flex flex-col gap-3 transition-all duration-600"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(24px)',
          transitionDelay: '0.3s',
        }}
      >
        <button className="btn-primary" onClick={() => navigate('auth')}>
          Get Started
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <p className="text-center text-[#555] text-sm">
          Already have an account?{' '}
          <button
            className="text-[#FFD700] font-semibold"
            onClick={() => navigate('auth')}
          >
            Log In
          </button>
        </p>

        <p className="text-center text-[#3D3D3D] text-xs mt-2">
          By continuing, you agree to our{' '}
          <span className="text-[#555]">Terms of Service</span> &amp;{' '}
          <span className="text-[#555]">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
