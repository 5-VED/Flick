import { useEffect, useState } from 'react'

const RADIUS = 44
const CIRC = 2 * Math.PI * RADIUS

export default function CountdownRing({ seconds = 15, onExpire }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, onExpire])

  const progress = remaining / seconds
  const dashoffset = CIRC * (1 - progress)

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={RADIUS} fill="none" stroke="#2A2A2A" strokeWidth="6" />
        <circle
          cx="56" cy="56" r={RADIUS}
          fill="none"
          stroke="#FFD700"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="font-display text-4xl text-primary leading-none">{remaining}</span>
        <span className="text-muted text-[10px] font-body uppercase tracking-widest">sec</span>
      </div>
    </div>
  )
}
