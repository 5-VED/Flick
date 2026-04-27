import { useApp } from '../AppContext'

export default function Splash() {
  const { navigate } = useApp()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-12 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,215,0,0.3)]">
          <svg viewBox="0 0 40 40" className="w-12 h-12">
            <path d="M8 28 C8 28 12 14 20 14 C28 14 32 28 32 28" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="12" r="4" fill="#1A1A1A" />
            <path d="M14 28 L26 28" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="12" cy="30" r="3" fill="#1A1A1A" />
            <circle cx="28" cy="30" r="3" fill="#1A1A1A" />
          </svg>
        </div>
        <h1 className="font-display text-7xl text-primary tracking-wider">FLICK</h1>
        <p className="font-body text-muted text-lg tracking-widest uppercase mt-1">Riders Panel</p>
      </div>

      <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="font-display text-5xl text-white leading-tight">
          RIDE.<br />EARN.<br />REPEAT.
        </h2>
        <p className="text-muted mt-4 font-body text-sm">Your city, your schedule, your earnings.</p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => navigate('auth')}
          className="w-full py-4 bg-primary text-black font-display text-2xl tracking-wider rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.3)] active:scale-95 transition-transform"
        >
          LOGIN
        </button>
        <button
          onClick={() => navigate('auth')}
          className="w-full py-4 bg-transparent border border-white/20 text-white font-display text-2xl tracking-wider rounded-2xl active:scale-95 transition-transform"
        >
          REGISTER AS RIDER
        </button>
      </div>

      <p className="text-muted text-xs mt-8 font-body animate-fade-in" style={{ animationDelay: '0.3s' }}>
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  )
}
