import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PAYMENT_OPTIONS = [
  { id: 'cash', label: 'Cash', icon: '💵', sub: 'Pay to captain' },
  { id: 'upi', label: 'UPI', icon: '📱', sub: 'GPay / PhonePe / Paytm' },
  { id: 'wallet', label: 'Flick Wallet', icon: '💛', sub: 'Balance: ₹250' },
];

export default function RideSummary() {
  const { rideData, resetRide, walletBalance, submitRating } = useApp();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [paid, setPaid] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);

  const data = rideData || {
    from: 'Koramangala 5th Block',
    to: 'Phoenix MarketCity',
    distance: '5.2 km',
    duration: '18 min',
    fare: 89,
    fareBreakdown: { baseFare: 30, distanceFare: 49, platformFee: 5, gst: 5 },
    captain: { name: 'Ravi Kumar', initials: 'RK', rating: 4.8, vehicleNumber: 'KA 05 AB 1234' },
  };

  const tips = [0, 10, 20, 30];

  const handlePay = async () => {
    setPaid(true);
    if (rating > 0 && submitRating) {
      await submitRating(rating, null, tipAmount, selectedPayment).catch(() => {});
    }
    setTimeout(resetRide, 2200);
  };

  if (paid) {
    return (
      <div className="screen flex flex-col items-center justify-center px-6 gap-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center animate-float"
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '2px solid #22C55E',
            boxShadow: '0 0 40px rgba(34,197,94,0.25)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#22C55E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">Payment Successful!</h2>
          <p className="text-[#888] text-sm mt-1">Thanks for riding with Flick 🏍️</p>
        </div>
        <div
          className="px-5 py-2 rounded-full text-[#1A1A1A] font-bold text-lg"
          style={{ background: '#FFD700' }}
        >
          ₹{data.fare + tipAmount} paid
        </div>
      </div>
    );
  }

  return (
    <div className="screen flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 pt-12 pb-4"
        style={{
          background: 'linear-gradient(180deg, #1A1A1A 60%, transparent)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white text-xl font-bold">Ride Complete</h2>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400 text-xs font-bold">Completed</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">
        {/* Route card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
              <div className="w-0.5 h-8 bg-[#333]" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1">
              <div className="mb-2.5">
                <p className="text-[#888] text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                  Pickup
                </p>
                <p className="text-white text-sm font-semibold">{data.from}</p>
              </div>
              <div>
                <p className="text-[#888] text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                  Drop
                </p>
                <p className="text-white text-sm font-semibold">{data.to}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#2D2D2D]">
            {[
              { label: 'Distance', val: data.distance, icon: '📍' },
              { label: 'Duration', val: data.duration, icon: '⏱️' },
              { label: 'Fare', val: `₹${data.fare}`, icon: '💰' },
            ].map(({ label, val, icon }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-base">{icon}</span>
                <span className="text-white font-bold text-sm">{val}</span>
                <span className="text-[#666] text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fare breakdown */}
        <div className="card">
          <p className="section-title mb-3">Fare Breakdown</p>
          <div className="space-y-2.5">
            {[
              { label: 'Base fare', val: data.fareBreakdown?.baseFare || 30 },
              { label: 'Distance charges', val: data.fareBreakdown?.distanceFare || 49 },
              { label: 'Platform fee', val: data.fareBreakdown?.platformFee || 5 },
              { label: 'GST (5%)', val: data.fareBreakdown?.gst || 5 },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[#888] text-sm">{label}</span>
                <span className="text-white text-sm font-medium">₹{val}</span>
              </div>
            ))}
            {tipAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#888] text-sm">Tip for captain 💛</span>
                <span className="text-[#FFD700] text-sm font-medium">₹{tipAmount}</span>
              </div>
            )}
            <div className="border-t border-[#2D2D2D] pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-[#FFD700] font-bold text-xl">₹{data.fare + tipAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip captain */}
        <div className="card">
          <p className="section-title mb-3">Add a tip for {data.captain?.name?.split(' ')[0]}</p>
          <div className="flex gap-2">
            {tips.map((t) => (
              <button
                key={t}
                onClick={() => setTipAmount(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
                style={{
                  background: tipAmount === t ? '#FFD700' : '#2A2A2A',
                  color: tipAmount === t ? '#1A1A1A' : '#888',
                  border: `1.5px solid ${tipAmount === t ? '#FFD700' : '#333'}`,
                }}
              >
                {t === 0 ? 'No tip' : `₹${t}`}
              </button>
            ))}
          </div>
        </div>

        {/* Rate captain */}
        <div className="card">
          <p className="section-title mb-3">Rate your captain</p>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold"
              style={{ background: 'linear-gradient(135deg, #FFD700, #E6A800)', color: '#1A1A1A' }}
            >
              {data.captain?.initials || 'RK'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{data.captain?.name || 'Ravi Kumar'}</p>
              <p className="text-[#666] text-xs">{data.captain?.vehicleNumber || 'KA 05 AB 1234'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(s)}
                className="transition-transform duration-100 active:scale-90"
              >
                <svg width="36" height="36" viewBox="0 0 24 24">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={s <= (hoveredStar || rating) ? '#FFD700' : '#2A2A2A'}
                    stroke={s <= (hoveredStar || rating) ? '#FFD700' : '#333'}
                    strokeWidth="1.5"
                    style={{
                      transition: 'fill 0.15s',
                      filter: s <= (hoveredStar || rating) ? 'drop-shadow(0 0 6px rgba(255,215,0,0.5))' : 'none',
                    }}
                  />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-[#888] text-sm animate-fade-in">
              {['', 'Poor ride 😞', 'Below average', 'Good ride 👍', 'Great ride! 😊', 'Excellent! 🌟'][rating]}
            </p>
          )}
        </div>

        {/* Payment method */}
        <div className="card">
          <p className="section-title mb-3">Payment Method</p>
          <div className="flex flex-col gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedPayment(opt.id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 active:scale-98 text-left"
                style={{
                  background: selectedPayment === opt.id ? 'rgba(255,215,0,0.06)' : 'transparent',
                  border: `1.5px solid ${selectedPayment === opt.id ? '#FFD700' : '#2D2D2D'}`,
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{opt.label}</p>
                  <p className="text-[#666] text-xs">{opt.sub}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: selectedPayment === opt.id ? '#FFD700' : '#444' }}
                >
                  {selectedPayment === opt.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pay button */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, #1A1A1A 70%, transparent)' }}
      >
        <button className="btn-primary" onClick={handlePay}>
          Pay ₹{data.fare + tipAmount}
          <span className="text-sm font-normal opacity-70">
            via {PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.label}
          </span>
        </button>
      </div>
    </div>
  );
}
