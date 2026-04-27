import { useState } from 'react'
import { useApp } from '../AppContext'
import MapView from '../components/MapView'

export default function OnTrip() {
  const { activeRide, ridePhase, advancePhase, navigate, showToast } = useApp()
  const [sosVisible, setSosVisible] = useState(false)

  const phaseConfig = {
    OnTheWay: { label: 'HEAD TO PICKUP', btn: "I'VE ARRIVED", color: 'bg-primary', textColor: 'text-black' },
    Arrived: { label: 'AT PICKUP', btn: 'START RIDE', color: 'bg-green-500', textColor: 'text-white' },
    Started: { label: 'PASSENGER ON BOARD', btn: 'END RIDE', color: 'bg-red-500', textColor: 'text-white' },
  }

  const cfg = phaseConfig[ridePhase] || phaseConfig.OnTheWay
  const ride = activeRide || {
    pickup: '14, Carter Road, Bandra West',
    drop: 'Phoenix Palladium, Lower Parel',
    fare: 187,
    passenger: { name: 'Priya Mehta', phone: '+91 91234 56789' },
  }

  return (
    <div className="h-screen flex bg-bg relative overflow-hidden">

      {/* SOS Modal */}
      {sosVisible && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center px-6">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚨</span>
            </div>
            <h2 className="font-display text-3xl text-red-400 mb-2">EMERGENCY SOS</h2>
            <p className="text-muted text-sm mb-6">This will alert emergency services and Flick support immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setSosVisible(false)} className="flex-1 py-3 border border-white/20 text-white font-display text-lg rounded-xl">CANCEL</button>
              <button onClick={() => { showToast('SOS sent — help is on the way', 'error'); setSosVisible(false) }} className="flex-1 py-3 bg-red-500 text-white font-display text-lg rounded-xl">SEND SOS</button>
            </div>
          </div>
        </div>
      )}

      {/* Map — left 60% */}
      <div className="flex-1 relative">
        <MapView phase={ridePhase} />
        <button
          onClick={() => setSosVisible(true)}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-red-500 shadow-lg flex items-center justify-center text-white font-display text-sm z-10 hover:bg-red-600 transition-colors"
        >
          SOS
        </button>
        {/* Phase badge overlay */}
        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-display tracking-wider z-10 ${cfg.color} ${cfg.textColor}`}>
          {cfg.label}
        </div>
      </div>

      {/* Right panel — trip details */}
      <div className="w-96 flex-shrink-0 bg-bg border-l border-white/5 flex flex-col px-6 py-6 gap-4 overflow-y-auto scrollbar-hide">

        {/* Passenger Card */}
        <div className="bg-surface rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-display text-primary text-xl">
            {(ride.passenger?.name || 'P')[0]}
          </div>
          <div className="flex-1">
            <p className="text-white font-body font-semibold">{ride.passenger?.name || 'Passenger'}</p>
            <p className="text-muted text-xs">{ride.passenger?.phone || '+91 XXXXX XXXXX'}</p>
          </div>
          <a
            href={`tel:${ride.passenger?.phone}`}
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" className="w-5 h-5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.1 12 19.79 19.79 0 011.06 3.4a2 2 0 012-2.18h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 9.1a16 16 0 006.29 6.29l1.17-1.17a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7a2 2 0 011.72 2.05z"/>
            </svg>
          </a>
        </div>

        {/* Route */}
        <div className="bg-surface rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="w-0.5 flex-1 bg-white/10 min-h-6" />
              <div className="w-3 h-3 rounded-full bg-red-400" />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <p className="text-muted text-[10px] uppercase tracking-widest">Pickup</p>
                <p className="text-white text-sm font-body">{ride.pickup}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] uppercase tracking-widest">Drop</p>
                <p className="text-white text-sm font-body">{ride.drop}</p>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center">
              <p className="font-display text-2xl text-primary">₹{ride.fare}</p>
              <p className="text-muted text-xs">Fare</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={advancePhase}
          className={`w-full py-5 font-display text-2xl tracking-wider rounded-2xl transition-colors shadow-lg ${cfg.color} ${cfg.textColor}`}
        >
          {cfg.btn}
        </button>
      </div>
    </div>
  )
}
