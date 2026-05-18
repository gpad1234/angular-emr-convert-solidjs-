**Development Guide: Diabetes EMR (Express + Node.js backend, Vue frontend)**

**Overview**:
- **Backend**: Node.js + Express API in [backend-node/server.js](backend-node/server.js) (serves `/api/v1/*`, SQLite DB `diabetes_emr.db`).
- **Frontend**: Vue 3 app (Vite) in [frontend](frontend), dev server on port 3000 proxying `/api` → `http://localhost:8000`.

**Prerequisites**:
- Node.js (tested on v22.x). Use `node -v` to verify.
- npm (bundled with Node) or `pnpm`/`yarn` if preferred.
- Git, a code editor (VS Code recommended).

**Quick setup (first time)**:
1. Install backend deps and build native bindings (better-sqlite3):

```bash
cd backend-node
npm install
```

2. Install frontend deps:

```bash
cd ../frontend
npm install
```

**Run development servers (two terminals)**:

Backend (auto-reload with nodemon):

```bash
cd backend-node
npm run dev    # runs nodemon server.js
```

Frontend (Vite dev server with proxy):

```bash
cd frontend
npm run dev
# opens http://localhost:3000
```

Alternatively run both with the helper script:

```bash
./start.sh
```

**Build & Preview (production static)**:

1. Build the frontend static files:

```bash
cd frontend
npm run build    # outputs static files to frontend/dist
```

2. Preview the static site locally:

```bash
npm run preview   # serves dist/ (default port 4173)
```

3. (Optional) Serve `frontend/dist` from the Express backend for a single-process deployment. Example (add to [backend-node/server.js](backend-node/server.js)):

```js
const express = require('express')
const path = require('path')
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')))
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html')))
```

**Database & Seed**:
- The SQLite DB file is `diabetes_emr.db` (created by [backend-node/database.js](backend-node/database.js) on first run).
- To reset the DB remove the file and restart the backend:

```bash
rm backend-node/diabetes_emr.db
# then restart backend
```

**API basics**:
- Base path: `/api/v1/`
- Examples:

```bash
curl http://localhost:8000/api/v1/patients
curl http://localhost:8000/api/v1/patients/1/summary
```

**Debugging**:
- Quick logs: add `console.log` / `console.error` in route files (nodemon will reload).
- Node Inspector (Chrome DevTools):

```bash
cd backend-node
node --inspect server.js
# open chrome://inspect and click 'inspect'
```

- VS Code (recommended): We added a launch config at `.vscode/launch.json`. Press F5 → choose `Debug Backend` to run with breakpoints.

**Frontend debugging**:
- Vite HMR updates on file save. Use Vue Devtools in the browser to inspect components.

**Common troubleshooting**:
- "vite: command not found": run `cd frontend && npm install`.
- `better-sqlite3` native build errors on new Node versions: remove and reinstall the binding:

```bash
cd backend-node
rm -rf node_modules/better-sqlite3
npm install
```

- If the frontend shows `toFixed` errors, ensure backend returns `latest_hba1c.value_percent` (server maps `value_pct` → `value_percent`).

**Lint / Formatting / Tests**:
- Frontend scripts in [frontend/package.json](frontend/package.json): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Backend: no linter configured by default—consider adding `eslint`.

**Environment & ports**:
- Backend default port: `8000` (change via `process.env.PORT` in `server.js`).
- Frontend default port: `3000` (Vite default).

**Recommended VS Code tips**:
- Open the workspace root in VS Code.
- Use the `.vscode/launch.json` target `Debug Backend` (F5).
- Install extensions: ESLint, Prettier, Vetur / Volar, Vue Devtools for browser.

**Production considerations** (brief)
- Use a proper RDB or managed DB for production instead of a single SQLite file.
- Add environment configuration for secrets and ports (`dotenv`).
- Serve static assets from CDN or behind a reverse proxy.
- Harden CORS and authentication.

**Next steps I can do for you**:
- Add a `serve-static` route to `backend-node/server.js` to serve production `frontend/dist` automatically.
- Add a `Makefile` or npm script at repo root to orchestrate `install`, `dev`, `build` tasks.
- Add CI steps (GitHub Actions) to build and lint on PRs.

---
Created by the dev helper. Ask me to add any of the optional changes above.