import { useState } from 'react'
import { useApp } from '../AppContext'
import StarRating from '../components/StarRating'

export default function TripSummary() {
  const { activeRide, completeTrip } = useApp()
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const ride = activeRide || {
    pickup: '14, Carter Road, Bandra West',
    drop: 'Phoenix Palladium, Lower Parel',
    fare: 187,
    passenger: { name: 'Priya Mehta' },
  }

  const baseFare = Math.round(ride.fare * 0.55)
  const distFare = Math.round(ride.fare * 0.35)
  const surge = ride.fare - baseFare - distFare

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(completeTrip, 1500)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-lg">

        {/* Checkmark animation */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-0 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" className="w-10 h-10">
                <path d="M5 13l4 4L19 7" strokeDasharray="100" strokeDashoffset="0" style={{ animation: 'checkmark 0.6s ease-out forwards' }} />
              </svg>
            </div>
          </div>
          <h1 className="font-display text-5xl text-white">RIDE COMPLETE</h1>
          <p className="text-muted text-sm mt-1 font-body">Great job, {ride.passenger?.name?.split(' ')[0] || 'passenger'} has arrived safely!</p>
        </div>

        {/* Total Earned */}
        <div className="bg-primary rounded-2xl p-5 mb-4 text-center">
          <p className="text-black/60 text-xs uppercase tracking-widest font-body">You Earned</p>
          <p className="font-display text-6xl text-black">₹{ride.fare}</p>
          <span className="bg-black/10 text-black text-xs px-3 py-1 rounded-full font-body">Cash • Received</span>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-surface rounded-2xl p-5 mb-4">
          <p className="text-muted text-xs uppercase tracking-widest mb-3 font-body">Fare Breakdown</p>
          {[
            { label: 'Base Fare', val: baseFare },
            { label: 'Distance Fare', val: distFare },
            { label: 'Surge', val: surge },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
              <span className="text-muted text-sm font-body">{row.label}</span>
              <span className="text-white text-sm font-body">₹{row.val}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1">
            <span className="text-white font-body font-semibold text-sm">Total</span>
            <span className="text-primary font-display text-xl">₹{ride.fare}</span>
          </div>
        </div>

        {/* Route recap */}
        <div className="bg-surface rounded-2xl p-4 mb-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="w-0.5 h-6 bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <p className="text-white text-xs font-body">{ride.pickup}</p>
              <p className="text-white text-xs font-body">{ride.drop}</p>
            </div>
          </div>
        </div>

        {/* Rate Passenger */}
        {!submitted && (
          <div className="bg-surface rounded-2xl p-5 mb-6">
            <p className="text-white font-body font-semibold mb-1">Rate your passenger</p>
            <p className="text-muted text-xs mb-3 font-body">How was {ride.passenger?.name?.split(' ')[0] || 'the passenger'}?</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-5 bg-primary text-black font-display text-2xl tracking-wider rounded-2xl active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.25)]"
        >
          {submitted ? 'DONE!' : 'NEXT RIDE'}
        </button>
      </div>
    </div>
  )
}
