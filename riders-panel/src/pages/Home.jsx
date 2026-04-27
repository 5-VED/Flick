import { useApp } from '../AppContext'
import Toggle from '../components/Toggle'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Home() {
  const { rider, onDuty, toggleDuty, earningsData, navigate } = useApp()
  const maxBar = Math.max(...earningsData.week)
  const initials = (rider?.name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="w-full px-8 pt-8 pb-8 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center font-display text-black text-lg">
              {initials}
            </div>
            <div>
              <p className="text-white font-body font-semibold text-sm leading-tight">{rider?.name || 'Rider'}</p>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="#FFD700" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-muted text-xs">{rider?.rating || 4.8}</span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* On Duty Toggle */}
        <div className={`rounded-2xl p-5 transition-all duration-500 ${
          onDuty ? 'bg-primary/10 border border-primary/20' : 'bg-surface'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-display text-xl text-white tracking-wide">
                {onDuty ? 'ON DUTY' : 'OFF DUTY'}
              </p>
              <p className="text-muted text-xs font-body mt-0.5">
                {onDuty ? 'Waiting for ride requests…' : 'Toggle on to start earning'}
              </p>
            </div>
            <Toggle active={onDuty} onToggle={toggleDuty} />
          </div>
          {onDuty && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-body">Active — you appear to nearby passengers</span>
            </div>
          )}
        </div>

        {/* 2-column: Earnings + Weekly Chart */}
        <div className="grid grid-cols-2 gap-5">
          {/* Earnings Card */}
          <div className="bg-surface rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-widest mb-3 font-body">Today's Earnings</p>
            <p className="font-display text-5xl text-primary">₹{earningsData.today}</p>
            <div className="flex gap-6 mt-3">
              <div>
                <p className="font-display text-xl text-white">{earningsData.rides_today}</p>
                <p className="text-muted text-xs">Rides</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="font-display text-xl text-white">{earningsData.online_hours}h</p>
                <p className="text-muted text-xs">Online</p>
              </div>
            </div>
            <button onClick={() => navigate('earnings')} className="text-primary text-xs font-body underline underline-offset-2 mt-4 block">
              View all earnings
            </button>
          </div>

          {/* Weekly Bar Chart */}
          <div className="bg-surface rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-widest mb-4 font-body">This Week</p>
            <div className="flex items-end gap-2 h-24">
              {earningsData.week.map((val, i) => {
                const height = maxBar > 0 ? (val / maxBar) * 100 : 0
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm flex items-end" style={{ height: '88px' }}>
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${isToday ? 'bg-primary' : 'bg-white/10'}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className={`text-[9px] ${isToday ? 'text-primary font-semibold' : 'text-muted'}`}>{DAYS[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Rides', value: rider?.total_rides || 342 },
            { label: 'Rating', value: `★ ${rider?.rating || 4.8}` },
            { label: 'Acceptance', value: `${rider?.acceptance_rate || 94}%` },
          ].map(stat => (
            <div key={stat.label} className="bg-surface rounded-xl p-4 text-center">
              <p className="font-display text-3xl text-white">{stat.value}</p>
              <p className="text-muted text-xs font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
