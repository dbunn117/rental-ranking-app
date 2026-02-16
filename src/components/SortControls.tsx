'use client'

import type { SortOption } from '@/types/rental'

interface SortControlsProps {
  value: SortOption
  onChange: (option: SortOption) => void
}

const options: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default order' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'My rating: high to low' },
  { value: 'rating-asc', label: 'My rating: low to high' },
]

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-sea-700">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sea-900 shadow-sm focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
