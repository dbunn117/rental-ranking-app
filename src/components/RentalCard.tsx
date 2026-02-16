'use client'

import type { RentalWithStats } from '@/types/rental'
import { StarRating } from './StarRating'

interface RentalCardProps {
  rental: RentalWithStats
  userRating: number
  userComment: string
  canReview: boolean
  onRatingChange: (rentalId: number, value: number) => void
  onCommentChange: (rentalId: number, value: string) => void
  isSaving?: boolean
}

function formatPrice(raw: string | null): string {
  if (raw == null) return '—'
  const n = parseInt(String(raw).replace(/\D/g, ''), 10)
  if (Number.isNaN(n)) return raw
  return `R ${n.toLocaleString()}`
}

function boolLabel(value: string | null): boolean {
  return String(value ?? '').toLowerCase() === 'true'
}

function Amenity({ label, value }: { label: string; value: boolean }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center rounded-full bg-sea-600/10 px-2.5 py-0.5 text-xs font-medium text-sea-700">
      {label}
    </span>
  )
}

export function RentalCard({
  rental,
  userRating,
  userComment,
  canReview,
  onRatingChange,
  onCommentChange,
  isSaving,
}: RentalCardProps) {
  const price = formatPrice(rental.rent_from_ZAR_per_day)
  const description = rental.description?.trim().split('\n')[0] ?? ''
  const wifi = boolLabel(rental.wifi_included)
  const pool = boolLabel(rental.pool_mentioned)
  const braai = boolLabel(rental.braai_mentioned)
  const smartTv = boolLabel(rental.smart_tv_mentioned)
  const avg = rental.average_rating
  const count = rental.review_count

  return (
    <article className="group relative rounded-2xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-sea-900">
              {rental.unit_or_number ? `${rental.unit_or_number} ` : ''}
              {rental.property_name ?? 'Property'}
            </h2>
            <p className="text-sm text-sea-700 mt-0.5">
              {rental.bedrooms} bed{rental.bedroom_category ? ` · ${rental.bedroom_category}` : ''}
              {rental.max_persons ? ` · up to ${rental.max_persons} guests` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display font-semibold text-sea-600 text-lg">{price}</span>
            <span className="text-sm text-sand-300">/ day</span>
          </div>
        </div>

        {description && (
          <p className="text-sm text-sea-800/90 line-clamp-3 mb-4">{description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Amenity label="Wi‑Fi" value={wifi} />
          <Amenity label="Pool" value={pool} />
          <Amenity label="Braai" value={braai} />
          <Amenity label="Smart TV" value={smartTv} />
        </div>

        {count > 0 && avg != null && (
          <p className="text-sm text-sea-600 mb-3">
            ★ {avg.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-sand-100">
          <div className="flex-1 min-w-0">
            {canReview ? (
              <>
                <p className="text-xs font-medium text-sea-600 mb-1">Your rating</p>
                <StarRating
                  value={userRating}
                  onChange={(v) => onRatingChange(rental.id, v)}
                />
                <label className="mt-2 block">
                  <span className="text-xs font-medium text-sea-600">Comment (optional)</span>
                  <textarea
                    value={userComment}
                    onChange={(e) => onCommentChange(rental.id, e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-sand-200 px-3 py-2 text-sm text-sea-900 placeholder:text-sand-400 focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500 resize-none"
                  />
                </label>
                {isSaving && (
                  <p className="text-xs text-sand-500 mt-1">Saving…</p>
                )}
              </>
            ) : (
              <p className="text-sm text-sand-500">Sign in to rate and review.</p>
            )}
          </div>
          {rental.website && (
            <a
              href={rental.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sea-600 hover:text-sea-700 underline underline-offset-2 shrink-0"
            >
              View listing →
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
