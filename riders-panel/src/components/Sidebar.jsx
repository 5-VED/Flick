import { useApp } from '../AppContext'

const tabs = [
  {
    id: 'home', label: 'Home',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#FFD700' : 'none'} stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-5 h-5">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: 'chat', label: 'Chat',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#FFD700' : 'none'} stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-5 h-5">
        <path d="M21 15c0 .53-.21 1.04-.59 1.41-.37.37-.88.59-1.41.59H7l-4 4V5c0-.53.21-1.04.59-1.41C3.96 3.21 4.47 3 5 3h14c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41v10z" />
      </svg>
    ),
  },
  {
    id: 'earnings', label: 'Earnings',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v1m0 8v1M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-.9 1.5-2.5 2-2.5.9-2.5 2 .9 2 2.5 2 2.5-.9 2.5-2" />
      </svg>
    ),
  },
  {
    id: 'profile', label: 'Profile',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#FFD700' : 'none'} stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { currentScreen, navigate, onDuty } = useApp()

  return (
    <nav className="fixed left-0 top-0 h-screen w-56 bg-surface border-r border-white/5 flex flex-col z-40">
      <div className="px-6 py-7 border-b border-white/5">
        <h1 className="font-display text-3xl text-primary tracking-wider">FLICK</h1>
        <p className="text-muted text-xs font-body mt-0.5 tracking-widest uppercase">Riders Panel</p>
      </div>

      <div className="flex-1 px-3 py-5 flex flex-col gap-1">
        {tabs.map(tab => {
          const active = currentScreen === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon(active)}
              <span className="font-body font-medium text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="px-4 pb-6">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-body ${
          onDuty ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted'
        }`}>
          <div className={`w-2 h-2 rounded-full ${onDuty ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
          {onDuty ? 'Online' : 'Offline'}
        </div>
      </div>
    </nav>
  )
}
