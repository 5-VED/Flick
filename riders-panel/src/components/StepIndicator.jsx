export default function StepIndicator({ total, current }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display transition-all ${
              done ? 'bg-primary text-black' :
              active ? 'bg-primary text-black ring-4 ring-primary/30' :
              'bg-white/10 text-muted'
            }`}>
              {done ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : step}
            </div>
            {i < total - 1 && (
              <div className={`h-0.5 w-8 transition-all ${step < current ? 'bg-primary' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
