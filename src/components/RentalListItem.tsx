'use client'

import type { RentalWithStats, Review } from '@/types/rental'
import { StarRating } from './StarRating'

interface RentalListItemProps {
  rental: RentalWithStats
  reviews: Review[]
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

function formatReviewDate(created_at: string): string {
  try {
    const d = new Date(created_at)
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export function RentalListItem({
  rental,
  reviews,
  userRating,
  userComment,
  canReview,
  onRatingChange,
  onCommentChange,
  isSaving,
}: RentalListItemProps) {
  const price = formatPrice(rental.rent_from_ZAR_per_day)
  const description = rental.description?.trim().split('\n')[0] ?? ''
  const wifi = boolLabel(rental.wifi_included)
  const pool = boolLabel(rental.pool_mentioned)
  const braai = boolLabel(rental.braai_mentioned)
  const smartTv = boolLabel(rental.smart_tv_mentioned)
  const avg = rental.average_rating
  const count = rental.review_count
  const amenities = [wifi && 'Wi‑Fi', pool && 'Pool', braai && 'Braai', smartTv && 'Smart TV'].filter(Boolean).join(' · ')

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 shadow-sm hover:shadow-card transition-shadow sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display font-semibold text-sea-900">
            {rental.unit_or_number ? `${rental.unit_or_number} ` : ''}
            {rental.property_name ?? 'Property'}
          </h2>
          <span className="font-display font-semibold text-sea-600 shrink-0">
            {price}
            <span className="text-sand-400 font-normal">/day</span>
          </span>
        </div>
        <p className="text-sm text-sea-600 mt-0.5">
          {rental.bedrooms} bed{rental.bedroom_category ? ` · ${rental.bedroom_category}` : ''}
          {rental.max_persons ? ` · ${rental.max_persons} guests` : ''}
          {amenities ? ` · ${amenities}` : ''}
        </p>
        {description && (
          <p className="text-sm text-sea-700/90 line-clamp-1 mt-1">{description}</p>
        )}
        {count > 0 && avg != null && (
          <p className="text-sm text-sea-600 mt-1">
            ★ {avg.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})
          </p>
        )}
        {reviews.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-sea-700">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id}>
                {review.rating != null && (
                  <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                )}
                {review.comment && <span className="ml-1">{review.comment}</span>}
                {review.created_at && (
                  <span className="text-sand-500 text-xs ml-1">({formatReviewDate(review.created_at)})</span>
                )}
              </li>
            ))}
            {reviews.length > 3 && (
              <li className="text-sand-500 text-xs">+{reviews.length - 3} more</li>
            )}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0 border-t border-sand-100 pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:border-sand-200 sm:pl-4">
        {canReview && (
          <div className="flex items-center gap-2">
            <StarRating
              value={userRating}
              onChange={(v) => onRatingChange(rental.id, v)}
            />
            {isSaving && <span className="text-xs text-sand-500">Saving…</span>}
          </div>
        )}
        {canReview && (
          <input
            type="text"
            value={userComment}
            onChange={(e) => onCommentChange(rental.id, e.target.value)}
            placeholder="Add a note..."
            className="w-40 rounded-lg border border-sand-200 px-2 py-1.5 text-sm text-sea-900 placeholder:text-sand-400 focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500"
          />
        )}
        {rental.website && (
          <a
            href={rental.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sea-600 hover:text-sea-700 underline underline-offset-2"
          >
            View listing →
          </a>
        )}
      </div>
    </article>
  )
}
