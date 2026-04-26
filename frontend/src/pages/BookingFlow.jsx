import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';

const RIDE_TYPES = [
  {
    id: 'bike',
    label: 'Bike',
    emoji: '🏍️',
    tagline: 'Fastest',
    eta: '3 min',
    price: 89,
    priceLabel: '₹89',
    capacity: 1,
    description: 'Quick & Affordable',
    badge: 'POPULAR',
    badgeColor: '#FFD700',
  },
  {
    id: 'auto',
    label: 'Auto',
    emoji: '🛺',
    tagline: 'Comfortable',
    eta: '6 min',
    price: 134,
    priceLabel: '₹134',
    capacity: 3,
    description: 'Budget Friendly',
    badge: null,
  },
  {
    id: 'cab',
    label: 'Cab',
    emoji: '🚗',
    tagline: 'Premium',
    eta: '8 min',
    price: 198,
    priceLabel: '₹198',
    capacity: 4,
    description: 'Air-conditioned',
    badge: 'AC',
    badgeColor: '#3B82F6',
  },
];

export default function BookingFlow() {
  const { navigate, pickup, destination, setDestination, selectedRide, setSelectedRide, startRide } = useApp();
  const [searchValue, setSearchValue] = useState(destination);
  const [routeReady, setRouteReady] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'confirm'

  useEffect(() => {
    const t = setTimeout(() => setRouteReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handleSelectRide = (ride) => {
    setSelectedRide(ride);
    setStep('confirm');
  };

  const handleBook = () => {
    if (!selectedRide) return;
    startRide(selectedRide);
  };

  const distanceKm = (Math.random() * 4 + 3).toFixed(1);
  const durationMin = Math.floor(distanceKm * 3.5);

  return (
    <div className="screen">
      {/* Map (desktop: right panel owns map) */}
      <div className="absolute inset-0 lg:hidden" style={{ bottom: step === 'confirm' ? '320px' : '380px' }}>
        <MapView showRoute={routeReady} showDestination />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 lg:pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step === 'confirm' ? setStep('select') : navigate('home'))}
            className="w-10 h-10 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md border border-[#333] flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M5 12L11 6M5 12L11 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Route summary pill */}
          <div className="flex-1 flex items-center gap-2 bg-[#1A1A1A]/80 backdrop-blur-md border border-[#333] rounded-2xl px-3 py-2">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
              <div className="w-0.5 h-3 bg-[#444]" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{pickup}</p>
              <p className="text-[#888] text-[10px] truncate">→ {destination}</p>
            </div>
            <div className="text-right">
              <p className="text-[#FFD700] text-xs font-bold">{distanceKm} km</p>
              <p className="text-[#666] text-[10px]">{durationMin} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bottom-sheet px-4 pt-4 pb-8">
          <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-4" />

          {step === 'select' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-base font-bold">Choose a ride</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">Captains nearby</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mb-4">
                {RIDE_TYPES.map((ride) => (
                  <button
                    key={ride.id}
                    onClick={() => handleSelectRide(ride)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-98 text-left"
                    style={{
                      borderColor: selectedRide?.id === ride.id ? '#FFD700' : '#2D2D2D',
                      background:
                        selectedRide?.id === ride.id
                          ? 'rgba(255,215,0,0.06)'
                          : '#222',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: '#2A2A2A' }}
                    >
                      {ride.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-base">{ride.label}</span>
                        {ride.badge && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{
                              background: `${ride.badgeColor}20`,
                              color: ride.badgeColor,
                              border: `1px solid ${ride.badgeColor}40`,
                            }}
                          >
                            {ride.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#888] text-xs">{ride.description}</span>
                        <span className="text-[#555] text-xs">•</span>
                        <span className="text-[#888] text-xs">👤 {ride.capacity}</span>
                      </div>
                    </div>

                    {/* Price & ETA */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-lg leading-none">{ride.priceLabel}</p>
                      <p className="text-[#FFD700] text-xs font-semibold mt-1">
                        {ride.eta} away
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-[#555] text-xs text-center">Tap any ride to confirm booking</p>
            </>
          )}

          {step === 'confirm' && selectedRide && (
            <div className="animate-slide-down">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#2A2A2A] flex items-center justify-center text-3xl">
                  {selectedRide.emoji}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{selectedRide.label}</p>
                  <p className="text-[#888] text-sm">{selectedRide.description}</p>
                </div>
                <button
                  onClick={() => setStep('select')}
                  className="ml-auto text-[#FFD700] text-sm font-semibold"
                >
                  Change
                </button>
              </div>

              {/* Fare breakdown */}
              <div className="bg-[#2A2A2A] rounded-2xl p-4 mb-4">
                <p className="section-title mb-3">Fare Estimate</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Base fare', val: '₹30' },
                    { label: `Distance (${distanceKm} km)`, val: `₹${Math.floor(selectedRide.price * 0.6)}` },
                    { label: 'Platform fee', val: '₹5' },
                    { label: 'GST (5%)', val: `₹${Math.floor(selectedRide.price * 0.05)}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[#888] text-sm">{label}</span>
                      <span className="text-white text-sm font-medium">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#3A3A3A] my-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-base">Total</span>
                    <span className="text-[#FFD700] font-bold text-xl">
                      {selectedRide.priceLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-2xl p-3.5 mb-4">
                <span className="text-lg">💵</span>
                <span className="text-white text-sm font-medium">Cash</span>
                <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#555"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <button className="btn-primary" onClick={handleBook}>
                Book {selectedRide.label} · {selectedRide.priceLabel}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
