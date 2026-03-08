# Pint Markets

London pint price tracker with a retro BBC Ceefax/Teletext theme.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase Postgres
- **Charts:** Recharts
- **Maps:** react-leaflet (dynamically imported with `ssr: false`)

## Design Rules

- Ceefax/Teletext aesthetic — black background, VT323 monospace font
- Bright block colours only: cyan, yellow, magenta, green, red, blue
- No rounded corners, no gradients, no modern UI patterns
- All components must use the `CeefaxLayout` wrapper (`src/components/CeefaxLayout.tsx`)
- Use the Ceefax colour palette (`ceefax-*` Tailwind classes) for all charts and UI elements

## Database

Supabase Postgres with tables:
- `pubs` — pub name, location, borough, coordinates
- `prices` — pub_id, brand, type, price_pence, date_recorded
- `price_snapshots` — daily aggregate snapshots

Prices are stored in **pence as integers** (e.g. 615 = £6.15). Use `penceToPounds()` helper to format.

## Project Structure

- `src/app/` — Pages and API routes (App Router)
- `src/app/api/` — All API routes
- `src/components/` — Shared components (CeefaxLayout, MapClient)
- `src/lib/supabase.ts` — Supabase client (`supabaseAdmin` with service role key)
- `scripts/` — Data population scripts

## Common Commands

```bash
npm run dev     # Start dev server
npm run build   # Production build
```

## Environment Variables

Set in `.env.local` (gitignored):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` (optional, defaults to https://pint-markets.vercel.app)
