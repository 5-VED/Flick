import React from 'react';
import { useApp } from '../context/AppContext';

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? '#FFD700' : 'none'}
          stroke={active ? '#FFD700' : '#666'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Rides',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={active ? '#FFD700' : '#666'}
          strokeWidth="2"
        />
        <path
          d="M12 7V12L15.5 14.5"
          stroke={active ? '#FFD700' : '#666'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke={active ? '#FFD700' : '#666'}
          strokeWidth="2"
        />
        <path
          d="M4 20C4 17 7.58172 15 12 15C16.4183 15 20 17 20 20"
          stroke={active ? '#FFD700' : '#666'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { screen, navigate } = useApp();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top, #1A1A1A 60%, transparent)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 pb-2 pt-3">
        {tabs.map((tab) => {
          const active = screen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 active:scale-90"
              style={{
                background: active ? 'rgba(255,215,0,0.08)' : 'transparent',
              }}
            >
              {tab.icon(active)}
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{ color: active ? '#FFD700' : '#666' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
