Test Guide — Frontend (Vue) & Backend (Express)

Overview
- This guide documents how tests are organised and run for both the backend and frontend, and details the test harnesses used.

**Backend (Express + SQLite)**

- Location: [backend-node](backend-node)
- Test runner: Jest
- HTTP test harness: Supertest
- DB: better-sqlite3 (native file DB). Tests use an in-memory DB by setting `DATABASE_PATH=':memory:'`.
- Server support: `backend-node/server.js` exports `app` and `initDb`. The server does not call `listen()` when `NODE_ENV==='test'`, so test suites can import `app` safely.
- Test files: `backend-node/test/*.test.js` (example: [backend-node/test/patients.test.js](backend-node/test/patients.test.js))

How the backend test harness works (key points)
- Tests set `process.env.DATABASE_PATH = ':memory:'` before requiring the server so the database module opens an in-memory DB.
- Import the server module and call `initDb()` in `beforeAll()` to create tables and seed sample data.
- Use `supertest` with the exported `app`: `const res = await request(app).get('/api/v1/patients')`.
- The `package.json` test script runs: `NODE_ENV=test jest --runInBand` to ensure single-process execution.

Recommended patterns and tips
- Isolation: For independent suites, either use separate in-memory DBs per suite or clear tables between tests. To re-initialize, you can clear the Node require cache for `database.js` and re-require, or add a `resetDb()` helper that truncates all tables.
- Long-running/database integration tests: create a temporary file DB (unique path) instead of `:memory:` when you need to inspect the DB after tests.
- Seed control: `initDb()` seeds data only if patients table is empty. Tests expecting a clean DB should ensure cleanup or use a fresh DB path.

Useful commands (backend)

```bash
cd backend-node
npm install
npm test
```

**Frontend (Vue + Vite)**

- Location: [frontend](frontend)
- Current setup: Vite dev/build, no tests configured yet (see [frontend/package.json](frontend/package.json)).

Recommended harness and tools
- Unit tests: Vitest + @vue/test-utils
  - Lightweight, integrates with Vite, fast mocking and single-run mode.
  - Dev dependencies: `vitest`, `@vue/test-utils`, `jsdom` (if DOM is required), and optionally `@testing-library/vue` for more ergonomic assertions.
  - Add scripts:
    ```json
    "test:unit": "vitest"
    "test:unit:ci": "vitest --run"
    ```
  - Example test file: `frontend/src/components/__tests__/NavBar.spec.js` using `mount()` from `@vue/test-utils`.
- E2E tests: Playwright or Cypress
  - Playwright recommended for speed and modern API; Cypress is also solid and has an excellent GUI.
  - E2E approach: run the backend in test/seeded mode (see backend instructions) on a known port, then run Playwright tests against `http://localhost:PORT`.

Mocking the API for unit tests
- For unit tests that don't need the real backend, use one of:
  - `msw` (Mock Service Worker) to mock network at the fetch/axios layer.
  - Stub `api.js` module with a Jest/Vitest mock that returns deterministic data.

Frontend test setup commands (example)

```bash
cd frontend
# Install unit test deps
npm install -D vitest @vue/test-utils @testing-library/vue jsdom
# Run unit tests
npm run test:unit
```

**End-to-end (E2E) strategy**
- Two options:
  1. Run E2E against a running test backend (recommended for integration):
     - Start backend with a seeded DB (or a disposable DB file): `DATABASE_PATH=./tmp/test.db NODE_ENV=test node server.js`
     - Start frontend preview: `npm run build && npm run preview --port 5174` (or run Vite dev server)
     - Run Playwright/Cypress pointing to the preview URL.
  2. Run E2E with network mocked by `msw` for faster, deterministic tests.

**CI integration (GitHub Actions example)**
- Steps:
  1. Checkout
  2. Setup Node
  3. Install dependencies for both `backend-node` and `frontend`
  4. Run backend tests (`npm test` in `backend-node`)
  5. Run frontend unit tests (Vitest)
  6. Optionally run E2E: start backend in background, start frontend preview, run Playwright tests

Minimal CI YAML snippet (concept):

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Backend tests
        run: |
          cd backend-node
          npm ci
          npm test
      - name: Frontend unit tests
        run: |
          cd frontend
          npm ci
          npm run test:unit:ci
```

**Files to inspect / modify**
- Server export: [backend-node/server.js](backend-node/server.js)
- Example backend test: [backend-node/test/patients.test.js](backend-node/test/patients.test.js)
- Frontend package: [frontend/package.json](frontend/package.json)

**Next steps I can take**
- Add a `resetDb()` helper to `backend-node/database.js` and show usage in tests.
- Scaffold one example unit test for a Vue component using Vitest.
- Add a GitHub Actions workflow file.

---
Created: [TEST_GUIDE.md](TEST_GUIDE.md)

**Addendum — Changes Made & Notes**

- **Backend changes**:
  - Added `resetDb()` helper to `backend-node/database.js` and exported it. Use this in tests to clear rows while keeping schema intact.
  - Modified `backend-node/server.js` to export `app` and `initDb`, and to skip `app.listen()` when `NODE_ENV === 'test'`. This allows test harnesses to import `app` without starting an HTTP listener.
  - Added Jest + Supertest test harness and example tests at `backend-node/test/patients.test.js`. Tests use `process.env.DATABASE_PATH=':memory:'` to run against an in-memory SQLite DB and call `resetDb()` in `beforeEach()` to ensure isolation.
  - `backend-node/package.json` updated: added `test` script (`NODE_ENV=test jest --runInBand`) and devDependencies `jest` and `supertest`.

- **Frontend changes**:
  - Scaffoled Vitest for unit testing: added `vitest`, `@vue/test-utils`, `jsdom`, and `@testing-library/vue` to `frontend/package.json` devDependencies and test scripts: `test:unit` and `test:unit:ci`.
  - Added `frontend/vitest.config.js` which includes `@vitejs/plugin-vue` so `.vue` files are transformed during tests and configures `jsdom` environment.
  - Added example unit test `frontend/src/components/__tests__/NavBar.spec.js` which stubs `router-link` and asserts the `app-refresh` event is dispatched on click.

- **Documentation**:
  - Updated `TEST_GUIDE.md` (this file) with the addendum and explicit run commands.

**Important Notes and Caveats**

- The backend test harness relies on `better-sqlite3`. When using `DATABASE_PATH=':memory:'`, the in-memory DB is per process; tests running in separate processes will not share state. `jest --runInBand` is used to keep tests in a single process.
- `resetDb()` deletes rows from known tables and runs `VACUUM` (which may be a no-op on in-memory DBs); it does not drop or recreate tables. If you need a fresh schema programmatically, call `initDb()` after clearing or use a unique temporary file path for `DATABASE_PATH`.
- Frontend tests require `@vitejs/plugin-vue` available to transform `.vue` files; `vitest` is configured to load that plugin via `vitest.config.js`.
- If running tests on CI, ensure `npm ci` (or `npm install`) is run in both `backend-node` and `frontend` directories before executing their test scripts.

**Commands Recap**

Backend (run from repo root):
```bash
cd backend-node
npm install
npm test
```

Frontend (run once to install dev deps, then run unit tests):
```bash
cd frontend
npm install
npm run test:unit
```

**Recommended next improvements**

- Add a `clearAndSeed()` helper that wraps `resetDb()` and `initDb()` so tests can simply call one function to get a seeded state.
- Add more example tests covering `glucose`, `medications`, and `appointments` routes.
- Add a CI workflow (GitHub Actions) to run backend and frontend tests automatically on push/PR.

If you want, I can create the `clearAndSeed()` helper and update tests to call it, then open a commit/PR. 
