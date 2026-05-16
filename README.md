# Diabetes EMR — Developer Guide

A mobile-first Electronic Medical Record (EMR) focused on diabetes care.
Built with FastAPI (Python) + Vue 3 (Vite), heavily commented for maintainability.

---

## Stack

| Layer      | Technology                             | Version  |
|------------|----------------------------------------|----------|
| Backend    | FastAPI + Uvicorn                      | 0.111.0  |
| ORM        | SQLAlchemy                             | 2.0.30   |
| Database   | SQLite (dev) / any SQL in prod         | —        |
| Validation | Pydantic v2                            | 2.7.1    |
| Frontend   | Vue 3 + Vite                           | 3.3 / 5  |
| Routing    | Vue Router 4                           | 4.2.2    |
| Data fetch | Axios                                  | 1.4.0    |
| Charts     | Chart.js + chartjs-plugin-annotation   | 4.x      |
| Styling    | Tailwind CSS                           | 3.4.3    |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- `pip` and `npm`

### Option A — One-command start (recommended)

```bash
chmod +x start.sh
./start.sh
```

This starts both backend and frontend in parallel.

### Option B — Manual start

**Terminal 1 — Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Open in browser

| URL                              | Purpose                           |
|----------------------------------|-----------------------------------|
| http://localhost:3000            | Mobile EMR app                    |
| http://localhost:8000/docs       | Auto-generated API docs (Swagger) |
| http://localhost:8000/redoc      | ReDoc API documentation           |

---

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI app, startup, CORS, routers
│   ├── database.py          # SQLAlchemy engine, session factory
│   ├── models.py            # ORM models: Patient, GlucoseReading, etc.
│   ├── schemas.py           # Pydantic v2 request/response schemas
│   ├── sample_data.py       # 15 realistic diabetes patients + seeder
│   ├── requirements.txt     # Python dependencies
│   └── routers/
│       ├── patients.py      # GET/POST /patients, /patients/{id}/summary
│       ├── glucose.py       # GET/POST /patients/{id}/glucose + hba1c
│       ├── medications.py   # GET/POST /patients/{id}/medications
│       ├── appointments.py  # GET/POST /patients/{id}/appointments
│       └── stats.py         # GET /stats/dashboard
│
└── frontend/
    ├── src/
    │   ├── main.js              # App bootstrap (createApp + router)
    │   ├── App.vue              # Root component (<router-view>)
    │   ├── router/index.js      # Route definitions
    │   ├── lib/api.js           # Axios client, URL builders, classifiers
    │   ├── styles/globals.css   # Tailwind base + custom classes
    │   ├── pages/
    │   │   ├── Dashboard.vue        # / — population stats
    │   │   ├── Settings.vue         # /settings
    │   │   └── patients/
    │   │       ├── Index.vue        # /patients — search + filter + load more
    │   │       └── PatientDetail.vue# /patients/:id — vitals, meds, glucose chart
    │   └── components/
    │       ├── Layout.vue           # Page shell (header + NavBar)
    │       ├── NavBar.vue           # Fixed bottom navigation
    │       ├── StatCard.vue         # Metric card (clickable when `to` set)
    │       ├── PatientCard.vue      # Patient list row card
    │       ├── PatientDetailSkeleton.vue # Loading skeleton
    │       ├── GlucoseChart.vue     # Chart.js line chart + 70-180 target band
    │       ├── HbA1cBadge.vue       # HbA1c value with classification colour
    │       ├── DiabetesTypeBadge.vue# Colour-coded type pill
    │       ├── MedicationList.vue   # Active/inactive medication list
    │       ├── AppointmentList.vue  # Appointment history rows
    │       └── LoadMoreButton.vue   # Paginated "load more" control
    ├── index.html               # Vite HTML entry point
    ├── vite.config.js           # Vite config (proxy /api → :8000)
    ├── tailwind.config.js
    └── package.json
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

### Patients

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | /patients                       | List patients (paginated, searchable)    |
| GET    | /patients/{id}                  | Get single patient                       |
| GET    | /patients/{id}/summary          | Patient + latest vitals + meds + appts  |
| POST   | /patients                       | Create new patient                       |

**Query params for GET /patients:**
- `skip` (int, default 0) — pagination offset
- `limit` (int, default 20, max 100) — page size
- `search` (string) — partial match on first_name or last_name
- `diabetes_type` (string) — filter by exact type

### Glucose & HbA1c

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | /patients/{id}/glucose          | List glucose readings (paginated)        |
| POST   | /patients/{id}/glucose          | Add glucose reading                      |
| GET    | /patients/{id}/hba1c            | List HbA1c readings                      |
| POST   | /patients/{id}/hba1c            | Add HbA1c reading                        |

### Medications

| Method | Endpoint                                       | Description             |
|--------|------------------------------------------------|-------------------------|
| GET    | /patients/{id}/medications                     | All medications         |
| GET    | /patients/{id}/medications/active              | Active only             |
| POST   | /patients/{id}/medications                     | Add medication          |
| PATCH  | /patients/{id}/medications/{med_id}/discontinue| Discontinue medication  |

### Appointments

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | /patients/{id}/appointments     | List appointments (paginated)            |
| POST   | /patients/{id}/appointments     | Create appointment                       |

### Statistics

| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | /stats/dashboard       | Population-level stats             |

---

## Sample Data

15 patients are seeded automatically on first run:

| Patient              | Condition                              |
|----------------------|----------------------------------------|
| Maria Garcia         | Type 2, moderate control               |
| James Washington     | Type 2 + CKD, GFR declining           |
| Emily Chen           | Type 1, insulin pump user              |
| Robert Johnson       | Type 2, newly diagnosed                |
| Sarah Williams       | Gestational diabetes                   |
| David Kim            | Type 2 with complications              |
| Lisa Thompson        | LADA (Type 1.5)                        |
| Michael Brown        | Type 2 + Heart failure                 |
| Jennifer Martinez    | Type 2, well-controlled on metformin   |
| Thomas Anderson      | Prediabetes                            |
| Ashley Davis         | Type 1, A1c improving                  |
| Carlos Rodriguez     | Type 2, adherence challenges           |
| Patricia Wilson      | Type 2, insulin-dependent              |
| Kevin Taylor         | Type 1, endurance athlete              |
| Sandra Lee           | Type 2, post-bariatric remission       |

**Reset sample data:**
```bash
rm backend/diabetes_emr.db
# Restart backend — it will recreate and reseed the database
```

---

## Development Notes

### Adding a new API endpoint

1. Add model fields to `backend/models.py` if needed
2. Add Pydantic schema to `backend/schemas.py`
3. Add route to the appropriate router in `backend/routers/`
4. Register the router in `backend/main.py` if it's a new file

### Adding a new page

1. Create `frontend/src/pages/YourPage.vue` with `<Layout title="Your Page">` as the wrapper
2. Add a route in `frontend/src/router/index.js`:
   ```js
   { path: '/your-page', component: () => import('../pages/YourPage.vue') }
   ```
3. Use Axios via `src/lib/api.js` inside `onMounted` for data fetching

### Changing the database (for production)

Set the `DATABASE_URL` environment variable:
```bash
# PostgreSQL
export DATABASE_URL="postgresql://user:password@localhost:5432/diabetes_emr"
# MySQL
export DATABASE_URL="mysql+pymysql://user:password@localhost/diabetes_emr"
```

The `connect_args={"check_same_thread": False}` in `database.py` is automatically
skipped for non-SQLite databases.

### Glucose classification thresholds

Defined in `frontend/src/lib/api.js` (`classifyGlucose()`):

| Range (mg/dL) | Label           | Color  |
|---------------|-----------------|--------|
| < 54          | Critical Low    | Red    |
| 54–69         | Low             | Orange |
| 70–130        | Normal          | Green  |
| 131–180       | Slightly High   | Amber  |
| 181–250       | High            | Orange |
| > 250         | Very High       | Red    |

---

## Environment Variables

### Backend
| Variable       | Default                        | Description               |
|----------------|--------------------------------|---------------------------|
| DATABASE_URL   | sqlite:///./diabetes_emr.db    | Database connection string |

### Frontend (`frontend/.env`)
| Variable       | Default | Description                                          |
|----------------|---------|------------------------------------------------------|
| VITE_API_URL   | *(empty — Vite proxy forwards `/api/*` to `:8000`)* | Override backend base URL for production builds |

---

## Extending the App

Ideas for future development:

- **Authentication**: Add JWT auth to FastAPI; add login page in Next.js
- **Real-time alerts**: WebSocket endpoint for critical glucose alerts
- **PDF reports**: Generate PDF patient summaries using `reportlab` or `weasyprint`
- **CGM data import**: Parse LibreView/Dexcom CSV exports
- **Medication reminders**: Schedule reminders via Twilio or push notifications
- **A1c estimator**: Calculate estimated A1c from average glucose readings

---

## Production Deployment (DigitalOcean Droplet)

The `deploy/` folder contains everything needed to run this on a Linux server.

### Live URLs

| URL | Purpose |
|-----|---------|
| http://142.93.62.131 | Mobile EMR app |
| http://142.93.62.131/docs | Swagger API docs |
| http://142.93.62.131/redoc | ReDoc API docs |

### Architecture on the droplet

```
Browser (port 80)
      │
   nginx          ← reverse proxy / static asset cache
    ├── /api/*  → uvicorn :8000   (FastAPI)
    └── /*      → next start :3000 (Next.js production build)
```

Both services run as systemd units under the `sam` user (never root).

### Deploy files

| File | Purpose |
|------|---------|
| `deploy/deploy.sh` | Server-side script: installs deps, clones repo, builds app, configures nginx + systemd |
| `deploy/diabetes-api.service` | Systemd unit for the FastAPI/uvicorn backend |
| `deploy/diabetes-frontend.service` | Systemd unit for the Next.js frontend |
| `deploy/nginx-diabetes-emr` | Nginx site config (reverse proxy) |
| `deploy-remote.sh` | Local helper: SSHs into the droplet and runs `deploy.sh` |

### First-time setup

```bash
# 1. Ensure SSH access to the droplet
ssh sam@142.93.62.131

# 2. From your local machine, run:
./deploy-remote.sh
```

### Redeploying after code changes

```bash
git add -A && git commit -m "your change" && git push
./deploy-remote.sh   # pulls latest, rebuilds, restarts services
```

`deploy.sh` is **idempotent** — safe to run multiple times.

### Managing services on the server

```bash
# Status
sudo systemctl status diabetes-api
sudo systemctl status diabetes-frontend

# Restart
sudo systemctl restart diabetes-api
sudo systemctl restart diabetes-frontend

# Live logs
sudo journalctl -u diabetes-api -f
sudo journalctl -u diabetes-frontend -f

# Nginx
sudo nginx -t                     # test config
sudo systemctl reload nginx       # apply config changes
sudo tail -f /var/log/nginx/diabetes-emr.error.log
```

### Environment on the server

| Variable | Value | Set in |
|----------|-------|--------|
| `DATABASE_URL` | `sqlite:////home/sam/app/backend/diabetes_emr.db` | `diabetes-api.service` |
| `NEXT_PUBLIC_API_URL` | *(empty — nginx proxies /api/*)* | `frontend/.env.local` (written by deploy.sh) |
| `PORT` | `3000` | `diabetes-frontend.service` |

---

## Technical Specification

### Overview

Diabetes EMR is a mobile-first Electronic Medical Records system for diabetes care teams. It provides a practitioner-facing interface to view patient populations, track glycemic control over time, manage medications, and review appointment history.

**Scope:** MVP — read-heavy clinical viewer with light data-entry (add glucose readings, medications, appointments). Authentication, audit logs, and multi-provider support are deferred.

---

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser / Mobile                │
│                                                     │
│   Next.js 14 (Pages Router)  ←  SWR cache layer    │
│   Tailwind CSS  |  Recharts  |  date-fns            │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP/JSON  (/api/v1/*)
┌───────────────────▼─────────────────────────────────┐
│               FastAPI  (Python 3.10+)               │
│                                                     │
│   Pydantic v2 validation  →  SQLAlchemy ORM         │
│   5 routers: patients, glucose, medications,        │
│              appointments, stats                    │
└───────────────────┬─────────────────────────────────┘
                    │ SQLAlchemy sessions
┌───────────────────▼─────────────────────────────────┐
│      SQLite (dev)  /  PostgreSQL or MySQL (prod)    │
│      File: diabetes_emr.db                         │
└─────────────────────────────────────────────────────┘
```

**Production (DigitalOcean):**
```
Browser :80
    │
  nginx  ──── /api/*  →  uvicorn :8000  (FastAPI)
         └──  /*      →  next start :3000
```

---

### Backend Components

#### `database.py` — Connection layer
- Creates the SQLAlchemy `engine` from `DATABASE_URL` (env var; falls back to `sqlite:///./diabetes_emr.db`)
- Exports `SessionLocal` (session factory) and `Base` (ORM declarative base)
- `get_db()` FastAPI dependency: yields a DB session per request, closes on exit

#### `models.py` — ORM / Database schema
Six tables with cascade-delete relationships anchored on `Patient`:

| Model | Table | Key columns |
|-------|-------|-------------|
| `Patient` | `patients` | id, first/last name, DOB, gender, diabetes_type, provider, height_cm, weight_kg |
| `GlucoseReading` | `glucose_readings` | patient_id (FK), value_mgdl, reading_type, reading_datetime |
| `HbA1cReading` | `hba1c_readings` | patient_id (FK), value_pct, test_date, lab_name |
| `BloodPressureReading` | `blood_pressure_readings` | patient_id (FK), systolic, diastolic, recorded_at |
| `Medication` | `medications` | patient_id (FK), name, dose, frequency, start_date, end_date |
| `Appointment` | `appointments` | patient_id (FK), appointment_datetime, type, status, notes |

**Enumerations** (stored as strings for JSON compatibility):
- `DiabetesType`: Type 1, Type 2, Gestational, LADA, Prediabetes, Other
- `GlucoseReadingType`: Fasting, Post-meal, Pre-meal, Bedtime, Random
- `AppointmentStatus`: Scheduled, Completed, Cancelled, No-show
- `AppointmentType`: Routine Follow-up, Diabetes Management, Lab Review, Urgent Visit, Telehealth, Dietitian Consult, Ophthalmology, Podiatry, Nephrology
- `Gender`: Male, Female, Other, Prefer not to say

#### `schemas.py` — Pydantic request/response models
Follows a `*Base / *Create / *Response / *List` naming pattern. `ORMBase` (inherits `ConfigDict(from_attributes=True)`) is the parent for all response schemas, enabling direct construction from SQLAlchemy ORM objects.

Key computed fields:
- `PatientResponse.bmi` — computed from `height_cm` / `weight_kg`
- `GlucoseReadingResponse.level_label` — ADA classification string (Critical Low → Very High)
- `MedicationResponse.is_active` — `True` when `end_date` is `None`

#### `main.py` — Application entry point
- Registers `CORSMiddleware` (allows `localhost:3000` and `localhost:3001` in dev; configurable for prod)
- Mounts all routers under prefix `/api/v1`
- `lifespan` handler: runs `Base.metadata.create_all()` and `seed_database()` on startup

#### `sample_data.py` — Seed data
Seeds 15 realistic patients with diabetes-specific profiles plus associated glucose readings, HbA1c history, medications, blood pressure readings, and appointments. Checks for existing data before inserting (idempotent).

#### Routers

| File | Prefix | Endpoints |
|------|--------|-----------|
| `patients.py` | `/api/v1` | `GET /patients`, `GET /patients/{id}`, `GET /patients/{id}/summary`, `POST /patients` |
| `glucose.py` | `/api/v1` | `GET /patients/{id}/glucose`, `POST /patients/{id}/glucose`, `GET /patients/{id}/hba1c`, `POST /patients/{id}/hba1c` |
| `medications.py` | `/api/v1` | `GET /patients/{id}/medications`, `GET /patients/{id}/medications/active`, `POST /patients/{id}/medications`, `PATCH /patients/{id}/medications/{med_id}/discontinue` |
| `appointments.py` | `/api/v1` | `GET /patients/{id}/appointments`, `POST /patients/{id}/appointments` |
| `stats.py` | `/api/v1` | `GET /stats/dashboard` |

All list endpoints use `skip` / `limit` offset pagination and return `total` + `has_more` for frontend "Load More" controls.

---

### Frontend Components

#### Pages

| Page | Route | Data source | Description |
|------|-------|-------------|-------------|
| `index.js` | `/` | `GET /api/v1/stats/dashboard` | Population dashboard — patient counts by diabetes type, avg HbA1c, high-HbA1c alert, recent hypoglycemia alert, active medication count |
| `patients/index.js` | `/patients` | `GET /api/v1/patients` | Searchable, filterable patient list with Load More pagination |
| `patients/[id].js` | `/patients/:id` | `GET /api/v1/patients/:id/summary` + `GET /api/v1/patients/:id/glucose` | Full patient detail view: header, clinical alerts, latest vitals, HbA1c trend, medications, appointments, glucose history chart |

#### UI Components

| Component | Purpose |
|-----------|---------|
| `Layout.js` | Page shell: safe-area-aware header, back button, bottom padding for NavBar |
| `NavBar.js` | Fixed bottom navigation bar (Dashboard / Patients) |
| `PatientCard.js` | Patient row card for the list view (name, age, type badge, last HbA1c) |
| `DiabetesTypeBadge.js` | Color-coded pill for diabetes classification |
| `HbA1cBadge.js` | HbA1c value with ADA risk-level color (green / amber / red) |
| `GlucoseChart.js` | Recharts `LineChart` rendered client-side only (`dynamic(..., {ssr:false})`) — plots glucose readings over time with reference bands |
| `MedicationList.js` | Grouped active / inactive medication rows |
| `AppointmentList.js` | Appointment history rows with status badge |
| `LoadMoreButton.js` | Button that triggers the next page fetch; shows spinner while loading |

#### `lib/api.js` — API client
- `BASE_URL`: reads `NEXT_PUBLIC_API_URL` env var; empty string in production (relative URL, nginx proxies)
- `apiFetch(path, options)`: wraps `fetch()` with base URL, JSON headers, and structured error extraction from FastAPI `{ detail: ... }` responses
- `fetcher(url)`: thin wrapper passed to SWR as the global fetcher
- `post(path, body)` / `patch(path, body)`: convenience mutation helpers
- Utility functions: `calculateAge(dob)`, `classifyGlucose(mgdl)`, `buildGlucoseUrl(id, skip, limit)`, `formatDate(d)`, `formatDateTime(dt)`

---

### Data Flow

#### Dashboard load
```
Browser
  └─ useSWR('/api/v1/stats/dashboard')
       └─ FastAPI GET /stats/dashboard
            └─ SQL aggregates (COUNT, AVG, GROUP BY) on patients, hba1c_readings,
               glucose_readings, medications
                 └─ DashboardStats response → rendered as stat cards + alerts
```

#### Patient list with search
```
User types in search box
  └─ debounced URL update: /api/v1/patients?search=chen&skip=0&limit=20
       └─ FastAPI: ILIKE filter on first_name | last_name → PatientListResponse
            └─ PatientCard grid + "Load More" (increments skip by 20)
```

#### Patient detail load
```
/patients/42
  ├─ useSWR('/api/v1/patients/42/summary')    ← single call: all vitals + meds + appts
  │    └─ PatientSummaryResponse
  │         ├─ Patient info + BMI
  │         ├─ Latest HbA1c, glucose, blood pressure
  │         ├─ HbA1c trend (last 4 readings)
  │         ├─ Active medications
  │         └─ Upcoming appointments
  │
  └─ useEffect → fetchGlucose(skip=0, limit=20)   ← separate paginated call
       └─ GlucoseListResponse → GlucoseChart + timeline list
            └─ "Load More" → fetchGlucose(skip=20) → appended to state
```

#### Add glucose reading
```
Clinician submits form
  └─ post('/api/v1/patients/42/glucose', { value_mgdl, reading_type, reading_datetime })
       └─ FastAPI: Pydantic validates → INSERT → GlucoseReadingResponse
            └─ Frontend mutates SWR cache → list re-renders
```

#### Discontinue medication
```
PATCH /api/v1/patients/42/medications/7/discontinue
  └─ FastAPI: sets end_date = today → MedicationResponse (is_active: false)
       └─ Medication moves from active → history section
```

---

### Database Schema (ERD summary)

```
patients (1)
  ├──< glucose_readings      (patient_id FK, cascade delete)
  ├──< hba1c_readings        (patient_id FK, cascade delete)
  ├──< blood_pressure_readings (patient_id FK, cascade delete)
  ├──< medications           (patient_id FK, cascade delete)
  └──< appointments          (patient_id FK, cascade delete)
```

All child tables use `ON DELETE CASCADE` enforced at the ORM layer (`cascade="all, delete-orphan"`).

---

### Clinical Logic

| Rule | Location | Detail |
|------|----------|--------|
| Glucose classification | `lib/api.js` `classifyGlucose()` + `schemas.py` `level_label` | <54 Critical Low, 54–69 Low, 70–130 Normal, 131–180 Slightly High, 181–250 High, >250 Very High |
| HbA1c risk classification | `HbA1cBadge.js` | <7% green, 7–9% amber, >9% red (ADA targets) |
| BMI calculation | `schemas.py` `PatientResponse` | weight_kg / (height_m²), rounded to 1 decimal |
| High HbA1c alert threshold | `stats.py` | >9.0% — patients flagged as at-risk |
| Hypoglycemia alert window | `stats.py` | glucose <70 mg/dL in last 7 days |
| Average HbA1c window | `stats.py` | Tests in last 30 days |

---

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite in dev | Zero config; swap to PostgreSQL via `DATABASE_URL` env var — no code changes |
| Offset pagination (`skip`/`limit`) | Simple "Load More" UX; acceptable for datasets up to ~100k records |
| `GET /patients/{id}/summary` mega-endpoint | Avoids N+1 waterfall on patient detail page; returns all clinical sub-resources in one round trip |
| SWR for data fetching | Stale-while-revalidate gives instant perceived load on navigation; automatic deduplication |
| `dynamic(..., {ssr:false})` for GlucoseChart | Recharts uses browser APIs (ResizeObserver); disabling SSR prevents hydration mismatch |
| Pydantic `*Create` / `*Response` split | Prevents accidental over-posting and leaking internal DB columns |
| Enums stored as strings | Readable JSON responses without enum serialization boilerplate |


I can integrate vue-query for caching/revalidation (recommended to match SWR behavior).
I can enhance GlucoseChart.vue with threshold lines, tooltips, and multi-series support.
I can implement accessibility polish and keyboard navigation.
Or I can stop here.