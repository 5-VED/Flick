import { useState } from 'react'

export default function StarRating({ value = 0, onChange, size = 'md', readonly = false }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  const sz = size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 active:scale-95' : ''}`}
        >
          <svg viewBox="0 0 24 24" className={sz} fill={star <= display ? '#FFD700' : 'none'} stroke={star <= display ? '#FFD700' : '#4B5563'} strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
