'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import type { Rental, RentalWithStats, Review, SortOption } from '@/types/rental'
import { createClient } from '@/lib/supabase/client'
import { RentalCard } from '@/components/RentalCard'
import { RentalListItem } from '@/components/RentalListItem'
import { SortControls } from '@/components/SortControls'
import { FilterControls, type ViewMode } from '@/components/FilterControls'
import { AuthUI } from '@/components/AuthUI'

function getPrice(rental: Rental): number {
  const raw = rental.rent_from_ZAR_per_day ?? ''
  const n = parseInt(String(raw).replace(/\D/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

function buildRentalsWithStats(
  rentals: Rental[],
  reviews: Review[]
): RentalWithStats[] {
  const byRental = new Map<number, { sum: number; count: number }>()
  for (const r of reviews) {
    if (r.rating == null) continue
    const cur = byRental.get(r.rental_id) ?? { sum: 0, count: 0 }
    cur.sum += r.rating
    cur.count += 1
    byRental.set(r.rental_id, cur)
  }
  return rentals.map((r) => {
    const stat = byRental.get(r.id)
    const review_count = stat?.count ?? 0
    const average_rating =
      review_count > 0 && stat ? Math.round((stat.sum / stat.count) * 10) / 10 : null
    return { ...r, average_rating, review_count }
  })
}

export default function Home() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReviews, setUserReviews] = useState<Map<number, { rating: number; comment: string }>>(new Map())
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('default')
  const [bedroomFilter, setBedroomFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [nights, setNights] = useState<number>(7)
  const [savingId, setSavingId] = useState<number | null>(null)
  const commentDebounceRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const userReviewsRef = useRef<Map<number, { rating: number; comment: string }>>(new Map())
  const supabase = createClient()

  userReviewsRef.current = userReviews

  // Fetch rentals
  useEffect(() => {
    let cancelled = false
    async function fetchRentals() {
      try {
        const { data, error: e } = await supabase
          .from('rentals')
          .select('*')
          .order('id')
        if (e) throw e
        if (!cancelled) setRentals((Array.isArray(data) ? data : []) as Rental[])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load rentals')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchRentals()
    return () => { cancelled = true }
  }, [supabase])

  // Auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ? { id: u.id } : null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Fetch all reviews (for averages) and current user's reviews
  useEffect(() => {
    async function load() {
      const { data: allReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rental_id, user_id, rating, comment, created_at')

      if (reviewsError) return
      const list = (allReviews ?? []) as Review[]
      setReviews(list)

      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        const mine = list.filter((r) => r.user_id === u.id)
        const map = new Map<number, { rating: number; comment: string }>()
        for (const r of mine) {
          map.set(r.rental_id, {
            rating: r.rating ?? 0,
            comment: r.comment ?? '',
          })
        }
        setUserReviews(map)
      }
    }
    load()
  }, [supabase])

  const upsertReview = useCallback(
    async (rentalId: number, rating: number, comment: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setSavingId(rentalId)
      const { error: e } = await supabase.from('reviews').upsert(
        {
          rental_id: rentalId,
          user_id: user.id,
          rating: rating || null,
          comment: comment.trim() || null,
        },
        { onConflict: 'rental_id,user_id' }
      )
      setSavingId(null)
      if (e) return
      // Refetch reviews to update averages
      const { data: list } = await supabase.from('reviews').select('id, rental_id, user_id, rating, comment, created_at')
      setReviews((list ?? []) as Review[])
      const mine = (list ?? []).filter((r: Review) => r.user_id === user.id)
      setUserReviews((prev) => {
        const next = new Map(prev)
        const r = mine.find((m: Review) => m.rental_id === rentalId)
        if (r) next.set(rentalId, { rating: r.rating ?? 0, comment: r.comment ?? '' })
        return next
      })
    },
    [supabase]
  )

  const handleRatingChange = useCallback(
    (rentalId: number, value: number) => {
      setUserReviews((prev) => {
        const next = new Map(prev)
        const cur = next.get(rentalId) ?? { rating: 0, comment: '' }
        next.set(rentalId, { ...cur, rating: value })
        return next
      })
      const cur = userReviews.get(rentalId) ?? { rating: 0, comment: '' }
      upsertReview(rentalId, value, cur.comment)
    },
    [upsertReview, userReviews]
  )

  const handleCommentChange = useCallback(
    (rentalId: number, value: string) => {
      setUserReviews((prev) => {
        const next = new Map(prev)
        const cur = next.get(rentalId) ?? { rating: 0, comment: '' }
        next.set(rentalId, { ...cur, comment: value })
        return next
      })
      const prev = commentDebounceRef.current.get(rentalId)
      if (prev) clearTimeout(prev)
      const t = setTimeout(() => {
        const latest = userReviewsRef.current.get(rentalId) ?? { rating: 0, comment: '' }
        upsertReview(rentalId, latest.rating, latest.comment)
        commentDebounceRef.current.delete(rentalId)
      }, 600)
      commentDebounceRef.current.set(rentalId, t)
    },
    [upsertReview]
  )

  const rentalsWithStats = useMemo(
    () => buildRentalsWithStats(rentals, reviews),
    [rentals, reviews]
  )

  const sortedRentals = useMemo(() => {
    const list = [...rentalsWithStats]
    if (sort === 'default') return list
    if (sort === 'price-asc') return list.sort((a, b) => getPrice(a) - getPrice(b))
    if (sort === 'price-desc') return list.sort((a, b) => getPrice(b) - getPrice(a))
    if (sort === 'rating-desc') {
      return list.sort(
        (a, b) =>
          (userReviews.get(b.id)?.rating ?? 0) - (userReviews.get(a.id)?.rating ?? 0)
      )
    }
    if (sort === 'rating-asc') {
      return list.sort(
        (a, b) =>
          (userReviews.get(a.id)?.rating ?? 0) - (userReviews.get(b.id)?.rating ?? 0)
      )
    }
    return list
  }, [rentalsWithStats, sort, userReviews])

  const bedroomOptions = useMemo(() => {
    const set = new Set<number>()
    rentalsWithStats.forEach((r) => {
      if (r.bedrooms != null) set.add(r.bedrooms)
    })
    return Array.from(set).sort((a, b) => a - b).map(String)
  }, [rentalsWithStats])

  const filteredRentals = useMemo(() => {
    if (!bedroomFilter) return sortedRentals
    const num = Number(bedroomFilter)
    return sortedRentals.filter((r) => r.bedrooms != null && r.bedrooms === num)
  }, [sortedRentals, bedroomFilter])

  const reviewsByRentalId = useMemo(() => {
    const map = new Map<number, Review[]>()
    for (const r of reviews) {
      const list = map.get(r.rental_id) ?? []
      list.push(r)
      map.set(r.rental_id, list)
    }
    return map
  }, [reviews])

  return (
    <div className="min-h-screen">
      <header className="border-b border-sand-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-sea-900">
                Holiday Rentals 2026–2027
              </h1>
              <p className="text-sea-600 mt-1">
                Compare and rank properties. Sign in to save your ratings and comments.
              </p>
              {!loading && rentals.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <SortControls value={sort} onChange={setSort} />
                  <FilterControls
                    bedroomOptions={bedroomOptions}
                    bedroomFilter={bedroomFilter}
                    onBedroomFilterChange={setBedroomFilter}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              )}
            </div>
            <div className="shrink-0">
              <AuthUI />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {!loading && filteredRentals.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-sand-200 bg-white px-4 py-3 shadow-sm">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-sea-700">Number of nights</span>
              <input
                type="number"
                min={1}
                max={365}
                value={nights}
                onChange={(e) => setNights(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                className="w-20 rounded-lg border border-sand-200 px-3 py-2 text-sm text-sea-900 focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500"
              />
            </label>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sea-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && rentals.length === 0 && (
          <p className="text-sea-600 text-center py-12">No rental data found.</p>
        )}

        {!loading && !error && filteredRentals.length > 0 && viewMode === 'card' && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {filteredRentals.map((rental) => (
              <li key={rental.id}>
                <RentalCard
                  rental={rental}
                  nights={nights}
                  reviews={reviewsByRentalId.get(rental.id) ?? []}
                  userRating={userReviews.get(rental.id)?.rating ?? 0}
                  userComment={userReviews.get(rental.id)?.comment ?? ''}
                  canReview={!!user}
                  onRatingChange={handleRatingChange}
                  onCommentChange={handleCommentChange}
                  isSaving={savingId === rental.id}
                />
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && filteredRentals.length > 0 && viewMode === 'list' && (
          <ul className="space-y-3">
            {filteredRentals.map((rental: RentalWithStats) => (
              <li key={rental.id}>
                <RentalListItem
                  rental={rental}
                  reviews={reviewsByRentalId.get(rental.id) ?? []}
                  userRating={userReviews.get(rental.id)?.rating ?? 0}
                  userComment={userReviews.get(rental.id)?.comment ?? ''}
                  canReview={!!user}
                  onRatingChange={handleRatingChange}
                  onCommentChange={handleCommentChange}
                  isSaving={savingId === rental.id}
                />
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && sortedRentals.length > 0 && filteredRentals.length === 0 && (
          <p className="text-sea-600 text-center py-12">
            No properties match the current bedroom filter. Try a different option.
          </p>
        )}
      </main>
    </div>
  )
}
