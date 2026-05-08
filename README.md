# Diabetes EMR — Developer Guide

A mobile-first Electronic Medical Record (EMR) focused on diabetes care.
Built with FastAPI (Python) + Next.js (React), heavily commented for maintainability.

---

## Stack

| Layer      | Technology                             | Version  |
|------------|----------------------------------------|----------|
| Backend    | FastAPI + Uvicorn                      | 0.111.0  |
| ORM        | SQLAlchemy                             | 2.0.30   |
| Database   | SQLite (dev) / any SQL in prod         | —        |
| Validation | Pydantic v2                            | 2.7.1    |
| Frontend   | Next.js (Pages Router)                 | 14.2.3   |
| Data fetch | SWR                                    | 2.2.5    |
| Charts     | Recharts                               | 2.12.7   |
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
    ├── pages/
    │   ├── _app.js          # SWR provider, global CSS
    │   ├── index.js         # Dashboard (population stats)
    │   └── patients/
    │       ├── index.js     # Patient list + search + filter + load more
    │       └── [id].js      # Patient detail (vitals, meds, glucose chart)
    ├── components/
    │   ├── Layout.js        # Page wrapper (header, back button, nav padding)
    │   ├── NavBar.js        # Fixed bottom navigation
    │   ├── PatientCard.js   # Patient list row card
    │   ├── DiabetesTypeBadge.js  # Color-coded type pill
    │   ├── HbA1cBadge.js        # HbA1c value with classification color
    │   ├── GlucoseChart.js      # Recharts line chart (no-SSR)
    │   ├── MedicationList.js    # Active/inactive medication list
    │   ├── AppointmentList.js   # Appointment history rows
    │   └── LoadMoreButton.js    # Paginated "load more" control
    ├── lib/
    │   └── api.js           # Fetch helpers, URL builders, classifiers
    └── styles/
        └── globals.css      # Tailwind base + custom component classes
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

1. Create `frontend/pages/your-page.js`
2. Use `<Layout title="Your Page">` as the wrapper
3. Use `useSWR('/api/v1/your-endpoint')` for data fetching

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

Defined in `frontend/lib/api.js` (`classifyGlucose()`):

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

### Frontend (`.env.local`)
| Variable              | Default                  | Description           |
|-----------------------|--------------------------|-----------------------|
| NEXT_PUBLIC_API_URL   | http://localhost:8000    | Backend base URL      |

---

## Extending the App

Ideas for future development:

- **Authentication**: Add JWT auth to FastAPI; add login page in Next.js
- **Real-time alerts**: WebSocket endpoint for critical glucose alerts
- **PDF reports**: Generate PDF patient summaries using `reportlab` or `weasyprint`
- **CGM data import**: Parse LibreView/Dexcom CSV exports
- **Medication reminders**: Schedule reminders via Twilio or push notifications
- **A1c estimator**: Calculate estimated A1c from average glucose readings
