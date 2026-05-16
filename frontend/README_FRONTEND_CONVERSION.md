Frontend — Vue 3 (Vite)
=======================

Summary
-------
This `frontend/` folder is a Vue 3 + Vite application. It was converted from a Next.js (React) application; the React source files have been removed. The FastAPI backend in `../backend` was left completely unchanged — all API endpoints remain the same and are consumed by the Vue frontend.

Frontend structure
------------------
```
frontend/
├── src/
│   ├── main.js                        # App bootstrap
│   ├── App.vue                        # Root component (router-view)
│   ├── router/index.js                # Vue Router route definitions
│   ├── lib/api.js                     # Axios client, URL builders, helpers
│   ├── styles/globals.css             # Tailwind base + custom utilities
│   ├── pages/
│   │   ├── Dashboard.vue              # / — population stats
│   │   ├── Settings.vue               # /settings
│   │   └── patients/
│   │       ├── Index.vue              # /patients — searchable/paginated list
│   │       └── PatientDetail.vue      # /patients/:id — detail + glucose chart
│   └── components/
│       ├── Layout.vue                 # Page shell (header + NavBar slot)
│       ├── NavBar.vue                 # Fixed bottom navigation
│       ├── StatCard.vue               # Metric card (clickable when `to` set)
│       ├── PatientCard.vue            # Patient row in list
│       ├── PatientDetailSkeleton.vue  # Loading skeleton for detail page
│       ├── GlucoseChart.vue           # Chart.js line chart + target band
│       ├── HbA1cBadge.vue             # Colour-coded HbA1c label
│       ├── DiabetesTypeBadge.vue      # Diabetes type label
│       ├── MedicationList.vue         # Active medications list
│       ├── AppointmentList.vue        # Upcoming appointments list
│       └── LoadMoreButton.vue         # Pagination trigger
├── index.html                         # Vite HTML entry
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

Dependencies
------------
- Vue 3 + Vue Router 4
- Axios for API calls
- Tailwind CSS for styling
- Chart.js 4 + chartjs-plugin-annotation (glucose target band)

Development (how to run)
----------------------
1) Start the backend (from repo root). Follow the backend README for environment setup; example:

```bash
# in repo-to-convert/backend
uvicorn main:app --reload --port 8000
```

2) Start the frontend:

```bash
cd repo-to-convert/frontend
npm install
npm run dev
# open http://localhost:3000
```

Configuration
-------------
- The frontend reads `VITE_API_URL` for the backend base URL. Create `frontend/.env` with `VITE_API_URL=http://localhost:8000` if your backend runs at a different address.
- Tailwind is configured in `tailwind.config.js` to scan `src/**/*` so classes used in `.vue` files are included.

API endpoints used
------------------
- `GET /api/v1/stats/dashboard` — Dashboard metrics
- `GET /api/v1/patients?...` — Paginated patients listing (search/filter)
- `GET /api/v1/patients/{id}/summary` — Patient summary
- `GET /api/v1/patients/{id}/glucose` — Patient glucose readings (paginated)

Key implementation notes
------------------------
- Routing: `vue-router` with explicit routes in `src/router/index.js` (replaces Next.js filesystem routing).
- Data fetching: Axios calls with local component `ref` state (no external cache library required).
- Charts: Chart.js registered manually with the annotation plugin — no `vue-chartjs` wrapper needed.
- All `<script>` blocks use `<script setup>` (Vue 3 Composition API).

Testing & verification
----------------------
- Manual: run backend and `npm run dev` then visit `/` and `/patients` and `/patients/{id}`.
- Smoke check: ensure the browser console shows no fetch errors and network requests to `/api/v1/...` return 200.

Build for production
--------------------
Build the frontend bundle with:

```bash
cd repo-to-convert/frontend
npm run build
npm run preview
```

Troubleshooting
---------------
- 500/404 API errors: verify backend is running and `VITE_API_URL` matches its host/port.
- Tailwind classes missing: re-run the build so Tailwind picks up `src/` file usage.
- Chart blank: confirm `readings` passed to `GlucoseChart.vue` include `reading_datetime` and `value_mgdl`.

Optional enhancements (not yet implemented)
--------------------------------------------
1. `vue-query` for request caching and background revalidation.
2. Accessibility / keyboard navigation improvements.
3. Unit tests (Vitest) and E2E tests (Playwright or Cypress).

Quick file links to review
- Dashboard: [src/pages/Dashboard.vue](src/pages/Dashboard.vue#L1)
- Patients list: [src/pages/patients/Index.vue](src/pages/patients/Index.vue#L1)
- Patient detail: [src/pages/patients/PatientDetail.vue](src/pages/patients/PatientDetail.vue#L1)
- API helpers: [src/lib/api.js](src/lib/api.js#L1)

