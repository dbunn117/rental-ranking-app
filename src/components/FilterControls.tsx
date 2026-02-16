'use client'

export type ViewMode = 'card' | 'list'

interface FilterControlsProps {
  bedroomOptions: string[]
  bedroomFilter: string
  onBedroomFilterChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function FilterControls({
  bedroomOptions,
  bedroomFilter,
  onBedroomFilterChange,
  viewMode,
  onViewModeChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-sea-700">Bedrooms</span>
        <select
          value={bedroomFilter}
          onChange={(e) => onBedroomFilterChange(e.target.value)}
          className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sea-900 shadow-sm focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500"
        >
          <option value="">All</option>
          {bedroomOptions.map((n) => (
            <option key={n} value={n}>
              {n} {n === '1' ? 'bedroom' : 'bedrooms'}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1 rounded-lg border border-sand-200 bg-white p-1">
        <button
          type="button"
          onClick={() => onViewModeChange('card')}
          aria-pressed={viewMode === 'card'}
          aria-label="Card view"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'card'
              ? 'bg-sea-600 text-white'
              : 'text-sea-600 hover:bg-sand-100'
          }`}
        >
          Card
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          aria-pressed={viewMode === 'list'}
          aria-label="List view"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-sea-600 text-white'
              : 'text-sea-600 hover:bg-sand-100'
          }`}
        >
          List
        </button>
      </div>
    </div>
  )
}
