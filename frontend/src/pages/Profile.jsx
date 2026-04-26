import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const MenuItem = ({ icon, label, value, danger, onClick, rightEl }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full py-3.5 active:opacity-60 transition-opacity"
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
      style={{
        background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : '#2D2D2D'}`,
      }}
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

const Divider = () => <div className="border-t border-[#222] my-1" />;

export default function Profile() {
  const { user, walletBalance, navigate, MOCK_RIDE_HISTORY } = useApp();
  const [copied, setCopied] = useState(false);
  const REFERRAL_CODE = 'FLICK-ARJUN50';

  const completedRides = MOCK_RIDE_HISTORY.filter((r) => r.status === 'completed').length;
  const totalKm = MOCK_RIDE_HISTORY.filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + parseFloat(r.distance), 0)
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
    <div className="screen flex flex-col pb-20 overflow-y-auto">
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 pt-12 pb-6"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,215,0,0.06) 0%, transparent 100%)',
        }}
      >
        <h1
          className="text-3xl text-white tracking-wide mb-5"
          style={{ fontFamily: 'Bebas Neue' }}
        >
          Profile
        </h1>

        {/* User card */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-18 h-18 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #FFD700 0%, #E6A800 100%)',
                color: '#1A1A1A',
                boxShadow: '0 0 24px rgba(255,215,0,0.3)',
              }}
            >
              {initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: '#22C55E', border: '2px solid #1A1A1A' }}
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

      <div className="px-4 space-y-3 pb-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Rides', val: completedRides, icon: '🏍️' },
            { label: 'Km Travelled', val: totalKm, icon: '📍' },
            { label: 'Wallet', val: `₹${walletBalance}`, icon: '💰' },
          ].map(({ label, val, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              style={{ background: '#222', border: '1px solid #2D2D2D' }}
            >
              <span className="text-xl">{icon}</span>
              <span
                className="font-bold text-lg leading-none"
                style={{ fontFamily: 'Bebas Neue', color: '#FFD700', letterSpacing: '0.04em' }}
              >
                {val}
              </span>
              <span className="text-[#666] text-[10px] text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Wallet card */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, #222 0%, #1E1E1E 100%)',
            border: '1.5px solid #2D2D2D',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <span className="text-white font-bold text-base">Flick Wallet</span>
            </div>
            <span className="text-[#FFD700] font-bold text-xl">₹{walletBalance}</span>
          </div>
          <button
            className="w-full py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A]"
            style={{ background: '#FFD700', boxShadow: '0 2px 12px rgba(255,215,0,0.3)' }}
          >
            + Add Money
          </button>
        </div>

        {/* Referral card */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.02) 100%)',
            border: '1.5px solid rgba(255,215,0,0.2)',
          }}
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
              className="flex-1 py-2.5 px-3 rounded-xl text-center font-bold tracking-widest"
              style={{
                background: '#1A1A1A',
                color: '#FFD700',
                border: '1.5px solid rgba(255,215,0,0.3)',
                fontFamily: 'DM Sans',
                fontSize: '14px',
              }}
            >
              {REFERRAL_CODE}
            </div>
            <button
              onClick={handleCopyReferral}
              className="py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
              style={{ background: '#FFD700', color: '#1A1A1A' }}
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Menu sections */}
        <div
          className="rounded-2xl px-4"
          style={{ background: '#222', border: '1px solid #2D2D2D' }}
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
          className="rounded-2xl px-4"
          style={{ background: '#222', border: '1px solid #2D2D2D' }}
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
          className="rounded-2xl px-4"
          style={{ background: '#222', border: '1px solid #2D2D2D' }}
        >
          <MenuItem
            icon="🚪"
            label="Log Out"
            danger
            onClick={() => navigate('splash')}
          />
        </div>
      </div>
    </div>
  );
}
