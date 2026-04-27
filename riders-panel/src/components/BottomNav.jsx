import { useApp } from '../AppContext'

const tabs = [
  {
    id: 'home', label: 'Home',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#FFD700' : 'none'} stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-6 h-6">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: 'earnings', label: 'Earnings',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v1m0 8v1M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-.9 1.5-2.5 2-2.5.9-2.5 2 .9 2 2.5 2 2.5-.9 2.5-2" />
      </svg>
    ),
  },
  {
    id: 'profile', label: 'Profile',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#FFD700' : 'none'} stroke={active ? '#FFD700' : '#9CA3AF'} strokeWidth="2" className="w-6 h-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { currentScreen, navigate } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 flex z-40">
      {tabs.map(tab => {
        const active = currentScreen === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all active:scale-95"
          >
            {tab.icon(active)}
            <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
