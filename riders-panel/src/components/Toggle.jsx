export default function Toggle({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none active:animate-bounce-scale ${
        active ? 'bg-primary shadow-[0_0_16px_rgba(255,215,0,0.4)]' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
          active ? 'left-9' : 'left-1'
        }`}
      />
      {active && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse-green" />
      )}
    </button>
  )
}
