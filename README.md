# Diabetes EMR (SolidJS + Express)

Mobile-first diabetes EMR with:
- Frontend: SolidJS + Vite
- Backend: Node.js + Express + SQLite

## Architecture

- Backend API lives in `backend-node` and serves `/api/v1/*` on port `8000`.
- Frontend app lives in `frontend` and runs with Vite on port `3000`.
- In development, frontend requests to `/api/*` are proxied to `http://localhost:8000`.

## Quick Start

### Option A: One command

```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual (two terminals)

Terminal 1:

```bash
cd backend-node
npm install
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

```text
.
├── backend-node/
│   ├── server.js
│   ├── database.js
│   ├── routes/
│   │   ├── patients.js
│   │   ├── glucose.js
│   │   ├── medications.js
│   │   ├── appointments.js
│   │   └── stats.js
│   └── test/
│       └── patients.test.js
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── __tests__/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── __tests__/
│   │   │   └── patients/
│   │   │       ├── Index.jsx
│   │   │       ├── PatientDetail.jsx
│   │   │       └── __tests__/
│   │   ├── components/
│   │   └── test/
│   │       └── setup.js
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
├── TEST_GUIDE.md
├── DEVELOPMENT.md
└── start.sh
```

## API Base

- Base path: `http://localhost:8000/api/v1`

Core endpoints used by frontend:
- `GET /stats/dashboard`
- `GET /patients`
- `GET /patients/:id/summary`
- `GET /patients/:id/glucose`

## Testing

Backend:

```bash
cd backend-node
npm test
```

Frontend full suite:

```bash
cd frontend
npm run test:unit:ci
```

Frontend harness-focused suite:

```bash
cd frontend
npm run test:harness
```

See `TEST_GUIDE.md` for the SolidJS testing workflow and debugging patterns.
