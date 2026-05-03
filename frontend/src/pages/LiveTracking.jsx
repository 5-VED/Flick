import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';

const StarRating = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= value ? '#FFD700' : '#333'}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ))}
    <span className="text-[#FFD700] text-xs font-bold ml-1">{value}</span>
  </div>
);

const ActionBtn = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{
        background: danger ? 'rgba(239,68,68,0.12)' : '#2A2A2A',
        border: `1.5px solid ${danger ? 'rgba(239,68,68,0.3)' : '#333'}`,
      }}
    >
      {icon}
    </div>
    <span className="text-xs font-medium" style={{ color: danger ? '#EF4444' : '#888' }}>
      {label}
    </span>
  </button>
);

export default function LiveTracking() {
  const { captain, selectedRide, completeRide, navigate, setPendingChatUser } = useApp();
  const [eta, setEta] = useState(captain?.eta || 4);
  const [status, setStatus] = useState('arriving'); // 'arriving' | 'onboard'
  const [showSOS, setShowSOS] = useState(false);

  useEffect(() => {
    if (eta <= 0) {
      setStatus('onboard');
      return;
    }
    const t = setInterval(() => setEta((e) => Math.max(0, e - 1)), 60000);
    // For demo: faster countdown
    const demo = setTimeout(() => setStatus('onboard'), 8000);
    return () => {
      clearInterval(t);
      clearTimeout(demo);
    };
  }, []);

  const cap = captain || {
    name: 'Ravi Kumar',
    initials: 'RK',
    rating: 4.8,
    vehicleNumber: 'KA 05 AB 1234',
    vehicleModel: 'Honda Activa 6G',
    phone: '+91 98765 43210',
  };

  return (
    <div className="screen">
      {/* Map (desktop: right panel owns map) */}
      <div className="absolute inset-0 lg:hidden" style={{ bottom: '300px' }}>
        <MapView showRoute showDestination showCaptain captainMoving />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 lg:pt-6">
        <div className="flex items-center justify-between">
          {/* ETA chip */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{
              background: '#1A1A1A',
              border: '1.5px solid #FFD700',
              boxShadow: '0 0 20px rgba(255,215,0,0.2)',
            }}
          >
            <span className="text-base">⏱️</span>
            <div>
              <p className="text-[#888] text-[10px] leading-tight">ETA</p>
              <p className="text-[#FFD700] font-bold text-base leading-tight">
                {status === 'onboard' ? 'On the way' : `${eta} min`}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ background: '#1A1A1A', border: '1.5px solid #333' }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: status === 'onboard' ? '#22C55E' : '#FFD700' }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: status === 'onboard' ? '#22C55E' : '#FFD700' }}
            >
              {status === 'onboard' ? 'In Ride' : 'Captain Arriving'}
            </span>
          </div>
        </div>
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-end">
          <div className="w-full bottom-sheet px-4 pt-6 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-6" />
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                <span className="text-3xl">🆘</span>
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-xl">Emergency SOS</h3>
                <p className="text-[#888] text-sm mt-1">
                  Your location will be shared with emergency contacts
                </p>
              </div>
            </div>
            <button
              className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold text-base mb-3"
              style={{ boxShadow: '0 4px 24px rgba(239,68,68,0.4)' }}
            >
              🚨 Call Emergency Services
            </button>
            <button className="btn-secondary" onClick={() => setShowSOS(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Captain bottom card */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bottom-sheet px-4 pt-4 pb-8">
          <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-4" />

          {/* Captain info */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #E6A800 100%)',
                  color: '#1A1A1A',
                }}
              >
                {cap.initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ background: status === 'onboard' ? '#22C55E' : '#FFD700' }}
                />
              </div>
            </div>

            {/* Name & rating */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-base">{cap.name}</p>
                <StarRating value={cap.rating} />
              </div>
              <p className="text-[#888] text-sm">{cap.vehicleModel}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="font-bold text-sm tracking-wider"
                  style={{ color: '#FFD700', fontFamily: 'DM Sans' }}
                >
                  {cap.vehicleNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#252525] mb-4" />

          {/* Action buttons */}
          <div className="flex items-center justify-around mb-4">
            <ActionBtn
              label="Call"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                    fill="#22C55E"
                  />
                </svg>
              }
            />
            <ActionBtn
              label="Message"
              onClick={() => {
                if (cap?._id) setPendingChatUser({ _id: cap._id, name: cap.name });
                navigate('chat');
              }}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM9 11H7V9H9V11ZM13 11H11V9H13V11ZM17 11H15V9H17V11Z"
                    fill="#3B82F6"
                  />
                </svg>
              }
            />
            <ActionBtn
              label="Share"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="#888" strokeWidth="2" />
                  <circle cx="6" cy="12" r="3" stroke="#888" strokeWidth="2" />
                  <circle cx="18" cy="19" r="3" stroke="#888" strokeWidth="2" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#888" strokeWidth="2" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#888" strokeWidth="2" />
                </svg>
              }
            />
            <ActionBtn
              label="SOS"
              danger
              onClick={() => setShowSOS(true)}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L12 17.77L7.82 21.02L9 14.14L4 9.27L10.91 8.26L12 2Z"
                    fill="#EF4444"
                  />
                </svg>
              }
            />
          </div>

          {/* End ride button */}
          {status === 'onboard' && (
            <button
              className="btn-primary animate-slide-up"
              onClick={completeRide}
            >
              End Ride
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#1A1A1A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
