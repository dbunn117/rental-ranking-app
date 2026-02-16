'use client'

import { useCallback } from 'react'

const STAR = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const STAR_EMPTY = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const handleClick = useCallback(
    (star: number) => {
      onChange(value === star ? 0 : star)
    },
    [value, onChange]
  )

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rate this property">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className="p-0.5 rounded text-sea-300 hover:text-amber-400 focus:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-1 transition-colors"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value >= star}
        >
          {value >= star ? (
            <span className="text-amber-400">{STAR}</span>
          ) : (
            <span className="text-sand-300">{STAR_EMPTY}</span>
          )}
        </button>
      ))}
    </div>
  )
}
