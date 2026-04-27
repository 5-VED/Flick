import { useApp } from '../AppContext'
import CountdownRing from '../components/CountdownRing'

export default function RideRequest() {
  const { pendingRequest, acceptRide, rejectRide, showToast, setPendingRequest } = useApp()
  if (!pendingRequest) return null

  const handleExpire = () => {
    setPendingRequest(null)
    showToast('Request expired', 'info')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-surface rounded-3xl p-6 animate-fade-in shadow-[0_0_60px_rgba(0,0,0,0.5)] mx-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full font-body font-medium">
              {pendingRequest.vehicle_type}
            </span>
            <h2 className="font-display text-3xl text-white mt-2">NEW RIDE REQUEST</h2>
          </div>
          <CountdownRing seconds={15} onExpire={handleExpire} />
        </div>

        {/* Route */}
        <div className="bg-bg rounded-2xl p-4 mb-5">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="w-0.5 h-8 bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-red-400" />
            </div>
            <div className="flex-1 flex flex-col justify-between gap-3">
              <div>
                <p className="text-muted text-[10px] uppercase tracking-widest">Pickup</p>
                <p className="text-white text-sm font-body font-medium">{pendingRequest.pickup}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] uppercase tracking-widest">Drop</p>
                <p className="text-white text-sm font-body font-medium">{pendingRequest.drop}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Info */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-bg rounded-xl p-3 text-center">
            <p className="font-display text-2xl text-white">{pendingRequest.distance}</p>
            <p className="text-muted text-xs font-body">Distance</p>
          </div>
          <div className="flex-1 bg-bg rounded-xl p-3 text-center">
            <p className="font-display text-2xl text-white">{pendingRequest.duration}</p>
            <p className="text-muted text-xs font-body">Est. Time</p>
          </div>
          <div className="flex-1 bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
            <p className="font-display text-2xl text-primary">₹{pendingRequest.fare}</p>
            <p className="text-muted text-xs font-body">Fare</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={rejectRide}
            className="flex-1 py-4 border border-white/20 text-white font-display text-xl tracking-wider rounded-2xl hover:bg-white/5 transition-colors"
          >
            REJECT
          </button>
          <button
            onClick={acceptRide}
            className="flex-[2] py-4 bg-primary text-black font-display text-xl tracking-wider rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:bg-primary/90 transition-colors"
          >
            ACCEPT RIDE
          </button>
        </div>
      </div>
    </div>
  )
}
