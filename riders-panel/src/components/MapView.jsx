export default function MapView({ phase = 'OnTheWay' }) {
  return (
    <div className="w-full h-full bg-[#111] relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {/* Grid streets */}
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#2A2A2A" strokeWidth="12" />
        ))}
        {[40, 80, 120, 160, 200, 240, 280].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#2A2A2A" strokeWidth="12" />
        ))}
        {/* Diagonal road */}
        <line x1="0" y1="150" x2="400" y2="80" stroke="#2A2A2A" strokeWidth="10" />

        {/* Park */}
        <rect x="200" y="100" width="80" height="60" rx="4" fill="#1A2E1A" />
        <circle cx="230" cy="125" r="10" fill="#1E3A1E" />
        <circle cx="260" cy="118" r="8" fill="#1E3A1E" />

        {/* Route line */}
        <polyline
          points="60,240 60,160 160,160 160,80 280,80"
          fill="none"
          stroke="#FFD700"
          strokeWidth="3"
          strokeDasharray="8 4"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Rider (current position) */}
        <g transform="translate(60,240)">
          <circle cx="0" cy="0" r="14" fill="#FFD700" opacity="0.2" />
          <circle cx="0" cy="0" r="8" fill="#FFD700" />
          <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#000">🏍</text>
        </g>

        {/* Pickup */}
        <g transform="translate(160,160)">
          <circle cx="0" cy="0" r="12" fill="#22C55E" opacity="0.2" />
          <circle cx="0" cy="0" r="7" fill="#22C55E" />
          <path d="M0,-18 Q5,-12 0,-6 Q-5,-12 0,-18z" fill="#22C55E" transform="translate(0,-2)" />
        </g>

        {/* Drop */}
        <g transform="translate(280,80)">
          <circle cx="0" cy="0" r="12" fill="#EF4444" opacity="0.2" />
          <circle cx="0" cy="0" r="7" fill="#EF4444" />
          <path d="M0,-18 Q5,-12 0,-6 Q-5,-12 0,-18z" fill="#EF4444" transform="translate(0,-2)" />
        </g>
      </svg>

      {/* Phase overlay label */}
      <div className="absolute top-3 left-3">
        <span className={`px-3 py-1.5 rounded-full text-xs font-display tracking-wider text-black ${
          phase === 'Started' ? 'bg-green-400' : 'bg-primary'
        }`}>
          {phase === 'OnTheWay' && 'HEAD TO PICKUP'}
          {phase === 'Arrived' && 'AT PICKUP'}
          {phase === 'Started' && 'PASSENGER ON BOARD'}
        </span>
      </div>
    </div>
  )
}
