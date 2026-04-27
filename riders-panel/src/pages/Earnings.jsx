import { useState } from 'react'
import { useApp } from '../AppContext'

const STATUS_COLORS = {
  Completed: 'bg-green-500/10 text-green-400',
  Cancelled: 'bg-red-500/10 text-red-400',
}

export default function Earnings() {
  const { earningsData, rideHistory } = useApp()
  const [period, setPeriod] = useState('today')
  const [expanded, setExpanded] = useState(null)

  const totalMap = { today: earningsData.today, week: earningsData.week.reduce((a, b) => a + b, 0), month: earningsData.month }
  const total = totalMap[period]
  const ridesCount = period === 'today' ? earningsData.rides_today : period === 'week' ? 18 : 74
  const avg = ridesCount > 0 ? Math.round(total / ridesCount) : 0

  const { cash, upi, wallet } = earningsData.breakdown
  const donut = [
    { label: 'Cash', pct: cash, color: '#FFD700' },
    { label: 'UPI', pct: upi, color: '#22C55E' },
    { label: 'Wallet', pct: wallet, color: '#A78BFA' },
  ]

  const circumference = 2 * Math.PI * 36
  let offset = 0
  const arcs = donut.map(seg => {
    const dash = (seg.pct / 100) * circumference
    const arc = { ...seg, offset, dash }
    offset += dash
    return arc
  })

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="w-full px-8 pt-8 pb-8 flex flex-col gap-5">

        {/* Header + Period Tabs */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-white">EARNINGS</h1>
          <div className="flex gap-2">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${
                  period === t.key ? 'bg-primary text-black' : 'bg-surface text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-column: Total + Donut */}
        <div className="grid grid-cols-2 gap-5">
          {/* Total */}
          <div className="bg-surface rounded-2xl p-6">
            <p className="text-muted text-xs uppercase tracking-widest font-body mb-2">Total Earned</p>
            <p className="font-display text-6xl text-primary">₹{total.toLocaleString()}</p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="font-display text-2xl text-white">{ridesCount}</p>
                <p className="text-muted text-xs font-body">Rides</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="font-display text-2xl text-white">₹{avg}</p>
                <p className="text-muted text-xs font-body">Avg Fare</p>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-surface rounded-2xl p-6">
            <p className="text-muted text-xs uppercase tracking-widest font-body mb-4">Payment Split</p>
            <div className="flex items-center gap-8">
              <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                <circle cx="48" cy="48" r="36" fill="none" stroke="#1A1A1A" strokeWidth="14" />
                {arcs.map(seg => (
                  <circle
                    key={seg.label}
                    cx="48" cy="48" r="36"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                    strokeDashoffset={-seg.offset}
                  />
                ))}
              </svg>
              <div className="flex flex-col gap-3">
                {donut.map(seg => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-muted text-sm font-body">{seg.label}</span>
                    <span className="text-white text-sm font-body font-medium">{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ride List */}
        <div>
          <p className="text-muted text-xs uppercase tracking-widest font-body mb-3">Recent Rides</p>
          {rideHistory.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl">
              <svg viewBox="0 0 80 80" className="w-16 h-16 mx-auto mb-3 opacity-20">
                <circle cx="40" cy="40" r="38" fill="none" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M25 40h30M40 25v30" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-muted text-sm font-body">No rides yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rideHistory.map(ride => (
                <div key={ride.id} className="bg-surface rounded-xl overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                    onClick={() => setExpanded(expanded === ride.id ? null : ride.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-white text-sm font-body font-medium">
                          {ride.pickup} → {ride.drop}
                        </span>
                        <span className="text-primary font-display text-lg">₹{ride.fare}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-xs font-body">{ride.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-body ${STATUS_COLORS[ride.status] || 'bg-white/5 text-muted'}`}>
                          {ride.status}
                        </span>
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className={`w-4 h-4 transition-transform ${expanded === ride.id ? 'rotate-180' : ''}`}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {expanded === ride.id && (
                    <div className="px-5 pb-4 border-t border-white/5 pt-3 flex gap-6 animate-fade-in">
                      <div>
                        <p className="text-muted text-[10px] font-body">Payment</p>
                        <p className="text-white text-xs font-body">{ride.payment}</p>
                      </div>
                      <div>
                        <p className="text-muted text-[10px] font-body">Fare</p>
                        <p className="text-primary text-xs font-display">₹{ride.fare}</p>
                      </div>
                      <div>
                        <p className="text-muted text-[10px] font-body">Status</p>
                        <p className="text-white text-xs font-body">{ride.status}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
