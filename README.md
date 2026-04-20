# Time Tracker (AI Developer Test Task)

## Submission Links

- Live URL: `https://time-tracker-app-psi.vercel.app`
- Repository URL: `https://github.com/kerberos-y/time-tracker-app`

Working web app for time tracking with:
- Start/Stop timer
- Task name autocomplete
- Project/client selection
- Always visible active timer
- Today's entries with edit/delete/manual duration correction (`hh:mm`)
- Grouping by projects with total time
- Projects management (add/edit + color)
- Reports (day/week/month) + CSV export

## Tech Stack

- Frontend: `Next.js 16` (App Router) + React + Tailwind CSS
- Backend/API: Next.js Route Handlers (`/api/...`)
- Data layer: SQLite (`node:sqlite`) with repository abstraction
- Architecture split:
  - `src/components` - UI/presentation
  - `src/lib/client` - client-side API/helpers
  - `src/lib/server/repositories` - data access
  - `src/lib/server/services` - domain logic/services
  - `src/lib/domain` - domain types

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build Check

```bash
npm run lint
npm run build
```

## Data Storage

- SQLite file is created automatically at `data/time-tracker.db`
- Default projects are auto-seeded on first run

## API Endpoints

- `GET/POST /api/projects`
- `PATCH /api/projects/:id`
- `GET/POST /api/time-entries`
- `PATCH/DELETE /api/time-entries/:id`
- `POST /api/time-entries/:id/stop`
- `GET /api/reports?period=day|week|month`
- `GET /api/reports/export?period=day|week|month` (CSV)
