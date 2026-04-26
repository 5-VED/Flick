import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';

const RadarRing = ({ delay, size }) => (
  <div
    className="absolute rounded-full border border-[#FFD700] radar-wave"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      top: '50%',
      left: '50%',
      marginLeft: `-${size / 2}px`,
      marginTop: `-${size / 2}px`,
      animationDelay: `${delay}s`,
      opacity: 0,
    }}
  />
);

export default function FindingCaptain() {
  const { navigate, selectedRide } = useApp();
  const [dots, setDots] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);

  const tips = [
    '🔍 Searching for captains near you...',
    '📍 Checking availability in your area...',
    '⚡ Almost there, connecting you...',
  ];

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    const tipTimer = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 2000);
    return () => {
      clearInterval(dotTimer);
      clearInterval(tipTimer);
    };
  }, []);

  return (
    <div className="screen">
      {/* Dimmed map in background (desktop: right panel owns map) */}
      <div className="absolute inset-0 opacity-30 lg:hidden">
        <MapView showBikes />
      </div>
      <div className="absolute inset-0 bg-[#1A1A1A]/75 lg:hidden" />

      {/* Top back button */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 lg:pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 bg-[#222] border border-[#333] rounded-2xl px-3 py-2"
          >
            <span className="text-lg">{selectedRide?.emoji || '🏍️'}</span>
            <span className="text-white text-sm font-semibold">{selectedRide?.label || 'Bike'}</span>
            <span className="text-[#888] text-sm mx-1">·</span>
            <span className="text-[#FFD700] font-bold text-sm">{selectedRide?.priceLabel || '₹89'}</span>
          </div>
        </div>
      </div>

      {/* Center radar animation */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-8">
          {/* Radar */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <RadarRing delay={0} size={80} />
            <RadarRing delay={0.6} size={130} />
            <RadarRing delay={1.2} size={180} />

            {/* Spinning arc */}
            <div
              className="absolute w-36 h-36 rounded-full animate-radar-spin"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 270deg, rgba(255,215,0,0.15) 290deg, rgba(255,215,0,0.4) 360deg)',
              }}
            />

            {/* Center icon */}
            <div
              className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#1E1E1E',
                border: '2px solid #FFD700',
                boxShadow: '0 0 30px rgba(255,215,0,0.35), 0 0 60px rgba(255,215,0,0.12)',
              }}
            >
              <span className="text-4xl">🏍️</span>
            </div>
          </div>

          {/* Status text */}
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-white text-2xl font-bold">
              Finding your captain
              <span className="text-[#FFD700]">{'.'.repeat(dots)}</span>
              <span className="opacity-0">{'.'.repeat(3 - dots)}</span>
            </h2>
            <p className="text-[#888] text-sm text-center px-8 transition-all duration-500">
              {tips[tipIdx]}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6">
            {[
              { label: 'Captains checked', value: '12+' },
              { label: 'ETA', value: '~4 min' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Bebas Neue', color: '#FFD700' }}
                >
                  {value}
                </span>
                <span className="text-[#666] text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom cancel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-10">
        <div className="bottom-sheet px-4 py-4">
          <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm font-semibold">Booking confirmed</p>
              <p className="text-[#888] text-xs">Looking for nearby captains</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" />
              <span className="text-[#FFD700] text-xs font-semibold">Live</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-[#FFD700] rounded-full"
              style={{
                animation: 'progressFill 4s linear forwards',
                width: '0%',
              }}
            >
              <style>{`
                @keyframes progressFill {
                  from { width: 0% }
                  to { width: 100% }
                }
              `}</style>
            </div>
          </div>

          <button
            className="btn-secondary"
            onClick={() => navigate('home')}
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
