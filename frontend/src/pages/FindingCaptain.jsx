import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';
import './FindingCaptain.css';

const RadarRing = ({ delay, size }) => (
  <div
    className="finding-radar-ring radar-wave"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      marginLeft: `-${size / 2}px`,
      marginTop: `-${size / 2}px`,
      animationDelay: `${delay}s`,
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
      <div className="finding-map-dim lg:hidden">
        <MapView showBikes />
      </div>
      <div className="finding-overlay lg:hidden" />

      {/* Top back button */}
      <div className="finding-topbar">
        <div className="flex items-center gap-3">
          <div
            className="finding-ride-chip"
          >
            <span className="text-lg">{selectedRide?.emoji || '🏍️'}</span>
            <span className="text-white text-sm font-semibold">{selectedRide?.label || 'Bike'}</span>
            <span className="text-[#888] text-sm mx-1">·</span>
            <span className="text-[#FFD700] font-bold text-sm">{selectedRide?.priceLabel || '₹89'}</span>
          </div>
        </div>
      </div>

      {/* Center radar animation */}
      <div className="finding-center">
        <div className="flex flex-col items-center gap-8">
          {/* Radar */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <RadarRing delay={0} size={80} />
            <RadarRing delay={0.6} size={130} />
            <RadarRing delay={1.2} size={180} />

            {/* Spinning arc */}
            <div
              className="finding-radar-sweep animate-radar-spin"
            />

            {/* Center icon */}
            <div
              className="finding-radar-core"
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
                  className="finding-stat-val"
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
      <div className="finding-sheet">
        <div className="bottom-sheet px-4 py-4">
          <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm font-semibold">Booking confirmed</p>
              <p className="text-[#888] text-xs">Looking for nearby captains</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="finding-live-dot" />
              <span className="text-[#FFD700] text-xs font-semibold">Live</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="finding-progress-track">
            <div
              className="finding-progress-fill"
            >
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
