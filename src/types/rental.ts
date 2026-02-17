export interface Rental {
  id: number
  bedrooms: number | null
  bedroom_category: string | null
  unit_or_number: string | null
  property_name: string | null
  rent_from_ZAR_per_day: string | null
  website: string | null
  max_persons: string | null
  wifi_included: string | null
  dstv_mentioned: string | null
  smart_tv_mentioned: string | null
  pool_mentioned: string | null
  braai_mentioned: string | null
  jetty_mentioned: string | null
  pets_policy: string | null
  linen_mentioned: string | null
  towels_mentioned: string | null
  beach_towels_mentioned: string | null
  garage_availability_note: string | null
  unavailability_note: string | null
  domestic_service_note: string | null
  description: string | null
  raw_text: string | null
}

export interface Review {
  id: number
  rental_id: number
  user_id: string
  rating: number | null
  comment: string | null
  created_at: string
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'rating-asc' | 'default'

export interface RentalWithStats extends Rental {
  average_rating: number | null
  review_count: number
}
