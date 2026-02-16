import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import type { Rental } from '@/types/rental'

const CSV_PATH = path.join(process.cwd(), 'holiday_rentals_2026_2027.csv')

export async function GET() {
  try {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
    })

    const rentals: Rental[] = (parsed.data ?? [])
      .filter((row) => row?.property_name != null && row.property_name.trim() !== '')
      .map((row, index) => ({
        ...row,
        id: `rental-${index}-${(row.unit_or_number ?? '')}-${(row.property_name ?? '').replace(/\s/g, '-')}`,
      })) as Rental[]

    return NextResponse.json(rentals)
  } catch (err) {
    console.error('Failed to load CSV:', err)
    return NextResponse.json(
      { error: 'Failed to load rental data' },
      { status: 500 }
    )
  }
}
