import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';

const QuickDestination = ({ icon, name, subtitle, onSelect }) => (
  <button
    onClick={onSelect}
    className="flex items-center gap-3 p-3 rounded-2xl bg-[#2A2A2A] active:bg-[#333] transition-colors text-left w-full"
  >
    <div className="w-10 h-10 rounded-xl bg-[#333] flex items-center justify-center text-lg flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-white text-sm font-semibold truncate">{name}</p>
      <p className="text-[#666] text-xs truncate">{subtitle}</p>
    </div>
    <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18L15 12L9 6"
        stroke="#555"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

export default function Home() {
  const { user, pickup, setDestination, navigate, MOCK_SUGGESTIONS, walletBalance } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredSuggestions = searchQuery
    ? MOCK_SUGGESTIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_SUGGESTIONS;

  const handleDestinationSelect = (name) => {
    setDestination(name);
    navigate('booking');
  };

  const name = user?.name || 'Rider';
  const firstName = name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="screen">
      {/* Map - full background (desktop: right panel owns map) */}
      <div className="absolute inset-0 lg:hidden">
        <MapView showBikes />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 lg:pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-[#333] rounded-2xl px-3.5 py-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-[#FFD700] flex items-center justify-center">
              <span className="text-[#1A1A1A] text-xs font-bold">
                {firstName[0]}
              </span>
            </div>
            <div>
              <p className="text-[#888] text-[10px] leading-tight">{greeting}</p>
              <p className="text-white text-sm font-semibold leading-tight">{firstName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Wallet chip */}
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-[#FFD700]/30 rounded-2xl px-3 py-2">
              <span className="text-[#FFD700] text-xs">💰</span>
              <span className="text-[#FFD700] text-sm font-bold">₹{walletBalance}</span>
            </div>
            {/* Notification */}
            <button className="w-10 h-10 rounded-2xl bg-black/70 backdrop-blur-md border border-[#333] flex items-center justify-center relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                  fill="#888"
                />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFD700] rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-16 left-0 right-0 z-10">
        <div className="bottom-sheet px-4 pt-4 pb-2 mx-0">
          {/* Handle */}
          <div className="w-10 h-1 bg-[#3A3A3A] rounded-full mx-auto mb-4" />

          {/* Pickup location */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-[#FFD700] bg-[#FFD700]/20" />
              <div className="w-0.5 h-4 bg-[#333]" />
              <div className="w-3 h-3 rounded-full bg-[#888]" />
            </div>
            <div className="flex-1">
              <p className="text-[#888] text-[10px] font-semibold uppercase tracking-wide mb-0.5">
                Pickup
              </p>
              <p className="text-white text-sm font-medium truncate">{pickup}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                  fill="#888"
                />
              </svg>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#888" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="#888" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              className="input-field pl-10 text-sm"
              style={{ background: '#2A2A2A' }}
            />
          </div>

          {/* Quick destinations */}
          <div className="flex flex-col gap-2 mb-2">
            <p className="section-title mb-1">
              {searchQuery ? 'Search results' : 'Recent & Suggested'}
            </p>
            <div
              className="overflow-y-auto flex flex-col gap-2"
              style={{ maxHeight: searchFocused ? '220px' : '200px' }}
            >
              {filteredSuggestions.map((s) => (
                <QuickDestination
                  key={s.id}
                  icon={s.icon}
                  name={s.name}
                  subtitle={s.subtitle}
                  onSelect={() => handleDestinationSelect(s.name)}
                />
              ))}
              {filteredSuggestions.length === 0 && (
                <p className="text-[#555] text-sm text-center py-4">No results found</p>
              )}
            </div>
          </div>

          {/* Nearby bikes count */}
          <div className="flex items-center justify-between py-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏍️</span>
              <span className="text-[#888] text-xs font-medium">
                <span className="text-[#FFD700] font-bold">7 bikes</span> nearby
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
