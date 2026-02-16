# Holiday Rentals 2026–2027 — Rank & Compare

A Next.js app that loads holiday rental data from CSV and lets you rate and sort properties.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure `holiday_rentals_2026_2027.csv` is in the project root (same folder as `package.json`).

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Features

- **Card layout** — Each property is shown in a card with name, price, bedrooms, short description, and amenities (Wi‑Fi, pool, braai, Smart TV).
- **Star rating (1–5)** — Click stars to rate; click again to clear. Ratings are stored in your browser (localStorage).
- **Sort by** — Default order, price (low/high), or your rating (high/low).
- **Listing link** — “View listing” opens the property’s website in a new tab.

## Tech

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- PapaParse for CSV parsing (API route)

## Build

```bash
npm run build
npm start
```
