import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const typeConfig = {
  bike: { emoji: '🏍️', color: '#FFD700' },
  auto: { emoji: '🛺', color: '#F97316' },
  cab: { emoji: '🚗', color: '#3B82F6' },
};

const RideCard = ({ ride }) => {
  const cfg = typeConfig[ride.type] || typeConfig.bike;
  const isCompleted = ride.status === 'completed';

  return (
    <div className="card mb-3 active:opacity-80 transition-opacity">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${cfg.color}15`, border: `1.5px solid ${cfg.color}30` }}
          >
            {cfg.emoji}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{ride.date}</p>
            <p className="text-[#666] text-xs">{ride.time}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-base">₹{ride.fare}</p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: isCompleted ? '#22C55E' : '#EF4444',
            }}
          >
            {isCompleted ? 'Completed' : 'Cancelled'}
          </span>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 py-2 px-3 bg-[#2A2A2A] rounded-xl">
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
          <div className="w-px h-4 bg-[#3A3A3A]" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{ride.from}</p>
          <div className="my-1" />
          <p className="text-[#888] text-xs truncate">{ride.to}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[#888] text-[10px]">{ride.distance}</span>
          <span className="text-[#666] text-[10px]">{ride.duration}</span>
        </div>
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#252525]">
          <button className="text-[#FFD700] text-xs font-semibold flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 14C19 18.4183 15.4183 22 11 22C6.58172 22 3 18.4183 3 14C3 9.58172 6.58172 6 11 6M22 6L16 12M22 6H17M22 6V11"
                stroke="#FFD700"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Rebook
          </button>
          <button className="text-[#666] text-xs font-semibold flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                stroke="#666"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <polyline points="14,2 14,8 20,8" stroke="#666" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Receipt
          </button>
        </div>
      )}
    </div>
  );
};

export default function RideHistory() {
  const { MOCK_RIDE_HISTORY } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? MOCK_RIDE_HISTORY
      : MOCK_RIDE_HISTORY.filter((r) => r.status === filter);

  const totalSpent = MOCK_RIDE_HISTORY.filter((r) => r.status === 'completed').reduce(
    (s, r) => s + r.fare,
    0
  );

  return (
    <div className="screen flex flex-col pb-20">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-3xl text-white tracking-wide"
            style={{ fontFamily: 'Bebas Neue' }}
          >
            My Rides
          </h1>
          <div
            className="px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}
          >
            <span className="text-[#FFD700] text-xs font-bold">₹{totalSpent} spent</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Total Rides', val: MOCK_RIDE_HISTORY.length, icon: '🏍️' },
            {
              label: 'Completed',
              val: MOCK_RIDE_HISTORY.filter((r) => r.status === 'completed').length,
              icon: '✅',
            },
            {
              label: 'Cancelled',
              val: MOCK_RIDE_HISTORY.filter((r) => r.status === 'cancelled').length,
              icon: '❌',
            },
          ].map(({ label, val, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl"
              style={{ background: '#222', border: '1px solid #2D2D2D' }}
            >
              <span className="text-base">{icon}</span>
              <span className="text-white font-bold text-lg leading-none">{val}</span>
              <span className="text-[#666] text-[10px]">{label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: filter === f.id ? '#FFD700' : '#222',
                color: filter === f.id ? '#1A1A1A' : '#666',
                border: `1.5px solid ${filter === f.id ? '#FFD700' : '#2D2D2D'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">🛵</span>
            <p className="text-[#555] text-sm">No rides here</p>
          </div>
        ) : (
          filtered.map((ride) => <RideCard key={ride.id} ride={ride} />)
        )}
      </div>
    </div>
  );
}
