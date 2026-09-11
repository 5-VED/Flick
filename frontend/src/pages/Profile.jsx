import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Profile.css';

const MenuItem = ({ icon, label, value, danger, onClick, rightEl }) => (
  <button
    onClick={onClick}
    className="profile-menu-item"
  >
    <div
      className={`profile-menu-icon${danger ? ' profile-menu-icon--danger' : ''}`}
    >
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-semibold" style={{ color: danger ? '#EF4444' : 'white' }}>
        {label}
      </p>
      {value && <p className="text-[#666] text-xs">{value}</p>}
    </div>
    {rightEl || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 18L15 12L9 6"
          stroke={danger ? '#EF4444' : '#444'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

const Divider = () => <div className="profile-menu-divider" />;

export default function Profile() {
  const { user, walletBalance, navigate, logout, rideHistory } = useApp();
  const [copied, setCopied] = useState(false);
  const REFERRAL_CODE = user ? `FLICK-${(user.name || 'USER').split(' ')[0].toUpperCase()}50` : 'FLICK-USER50';

  const completedRides = rideHistory.filter((r) => r.status === 'completed').length;
  const totalKm = rideHistory.filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0)
    .toFixed(1);

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const name = user?.name || 'Arjun Sharma';
  const phone = user?.phone || '+91 98765 43210';
  const initials = name.split(' ').map((n) => n[0]).join('');

  return (
    <div className="screen profile-scroll">
      {/* Header */}
      <div
        className="profile-header"
      >
        <h1
          className="profile-title"
        >
          Profile
        </h1>

        {/* User card */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="profile-avatar"
            >
              {initials}
            </div>
            <div
              className="profile-avatar-badge"
            >
              ✓
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl leading-tight">{name}</h2>
            <p className="text-[#888] text-sm">{phone}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="pill-badge text-[10px]">⭐ 4.9</span>
              <span className="text-[#555] text-xs">Member since 2024</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.5 2.50001C19.3284 1.67158 20.6716 1.67158 21.5 2.50001C22.3284 3.32844 22.3284 4.67158 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                stroke="#888"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="profile-body">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Rides', val: completedRides, icon: '🏍️' },
            { label: 'Km Travelled', val: totalKm, icon: '📍' },
            { label: 'Wallet', val: `₹${walletBalance}`, icon: '💰' },
          ].map(({ label, val, icon }) => (
            <div
              key={label}
              className="profile-stat-card"
            >
              <span className="text-xl">{icon}</span>
              <span
                className="profile-stat-val"
              >
                {val}
              </span>
              <span className="text-[#666] text-[10px] text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Wallet card */}
        <div
          className="profile-wallet-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <span className="text-white font-bold text-base">Flick Wallet</span>
            </div>
            <span className="text-[#FFD700] font-bold text-xl">₹{walletBalance}</span>
          </div>
          <button
            className="profile-wallet-add"
          >
            + Add Money
          </button>
        </div>

        {/* Referral card */}
        <div
          className="profile-referral-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎁</span>
            <span className="text-white font-bold text-sm">Refer & Earn</span>
          </div>
          <p className="text-[#888] text-xs mb-3">
            Share your code and earn ₹50 per referral
          </p>
          <div className="flex items-center gap-2">
            <div
              className="profile-referral-code"
            >
              {REFERRAL_CODE}
            </div>
            <button
              onClick={handleCopyReferral}
              className="profile-referral-copy"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Menu sections */}
        <div
          className="profile-menu-section"
        >
          <MenuItem icon="📋" label="Ride History" value="View all your past trips" onClick={() => navigate('history')} />
          <Divider />
          <MenuItem icon="💳" label="Payment Methods" value="Cards, UPI, Wallet" />
          <Divider />
          <MenuItem icon="🔔" label="Notifications" />
          <Divider />
          <MenuItem icon="📍" label="Saved Places" value="Home, Work & more" />
        </div>

        <div
          className="profile-menu-section"
        >
          <MenuItem icon="🛡️" label="Safety Center" />
          <Divider />
          <MenuItem icon="🎧" label="Help & Support" />
          <Divider />
          <MenuItem icon="⭐" label="Rate the App" />
          <Divider />
          <MenuItem
            icon="ℹ️"
            label="About Flick"
            value="v2.4.1"
            rightEl={
              <span className="text-[#555] text-xs font-medium">v2.4.1</span>
            }
          />
        </div>

        <div
          className="profile-menu-section"
        >
          <MenuItem
            icon="🚪"
            label="Log Out"
            danger
            onClick={logout}
          />
        </div>
      </div>
    </div>
  );
}
