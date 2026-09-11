import React from 'react';
import { useApp } from '../context/AppContext';
import './BottomNav.css';

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
    id: 'chat',
    label: 'Chat',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
          fill={active ? '#FFD700' : 'none'}
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
      className="bottomnav-wrap"
    >
      <div className="bottomnav-row">
        {tabs.map((tab) => {
          const active = screen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`bottomnav-tab${active ? ' is-active' : ''}`}
            >
              {tab.icon(active)}
              <span
                className="bottomnav-label"
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
