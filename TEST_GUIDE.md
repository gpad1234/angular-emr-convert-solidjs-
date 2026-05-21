# Test Guide

## Scope

This project has three test layers:
- Backend API tests in `backend-node/test` (Jest)
- Angular frontend unit tests in `angular-frontend/src/**/*.spec.ts` (Vitest via `ng test`)
- Legacy SolidJS frontend tests in `frontend/src/**/__tests__` (Vitest — reference only)

## Backend Test Harness

- Runner: Jest
- HTTP assertions: Supertest
- DB mode in tests: in-memory SQLite (`:memory:`)

Run:

```bash
cd backend-node
npm test
```

## Frontend SolidJS Test Harness

- Runner: Vitest
- DOM environment: jsdom
- UI rendering/assertions: `@solidjs/testing-library`
- Setup file: `frontend/src/test/setup.js`

Run all frontend tests:

```bash
cd frontend
npm run test:unit:ci
```

Run harness-focused suites only:

```bash
cd frontend
npm run test:harness
```

## Current Frontend Harness Coverage

- `src/components/__tests__/NavBar.spec.jsx`
  - Verifies app refresh event dispatch from nav interactions.
- `src/lib/__tests__/api.spec.js`
  - Verifies URL builders and classification helpers.
- `src/pages/__tests__/Dashboard.integration.spec.jsx`
  - Verifies dashboard loading success and error states.
- `src/pages/patients/__tests__/PatientDetail.integration.spec.jsx`
  - Verifies summary + glucose API flow and rendered sections.
- `src/pages/patients/__tests__/Index.integration.spec.jsx`
  - Verifies initial list load, load-more behavior, and debounced search.

## Recommended Debugging Workflow for Solid Tests

1. Run one failing spec first:

```bash
cd frontend
npx vitest run src/pages/patients/__tests__/Index.integration.spec.jsx
```

2. Add targeted assertions around request calls:
- Use `toHaveBeenNthCalledWith` for endpoint and query validation.

3. Stabilize async behavior:
- Prefer `findByText` or `waitFor` for post-render assertions.
- Use fake timers only where needed and always restore real timers in `afterEach`.

4. Normalize text matching when components split text nodes:
- Use a custom matcher over normalized `textContent`.

5. Re-run harness-only suite:

```bash
npm run test:harness
```

6. Finish with full suite:

```bash
npm run test:unit:ci
```

## Common Pitfalls and Fixes

- Module mock hoisting errors in Vitest:
  - Use `vi.hoisted` for mock function declarations used in `vi.mock` factories.
- Router primitive errors during tests:
  - Provide router context or mock router hooks where appropriate.
- jsdom `window.scrollTo` warnings:
  - Stub in `src/test/setup.js`.
- Flaky async checks:
  - Wait on UI state (`findBy*`) instead of only function-call count.

## CI Suggestion

In CI, run this order:
1. `backend-node`: `npm ci && npm test`
2. `frontend`: `npm ci && npm run test:unit:ci`

---

## Frontend E2E Testing (Playwright)

- Runner: Playwright
- Browser: Chromium
- Tests: Full-stack with live backend + frontend servers
- Configuration: `frontend/playwright.config.js`

### Setup

Servers must be running before E2E tests start:

**Terminal 1 (Backend):**
```bash
cd backend-node
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Run E2E Tests

```bash
cd frontend
npm run test:e2e
```

### E2E Test Coverage

- `e2e/app.spec.js`
  - Dashboard loads with stat cards
  - Navigate to patients list
  - Patient search with debounce
  - Patient detail page loads
  - Glucose chart renders
  - Settings page accessible

### E2E Debugging

**Interactive UI mode:**
```bash
npm run test:e2e:ui
```
Opens Playwright Inspector for step-through debugging.

**Debug mode with VS Code:**
```bash
npm run test:e2e:debug
```

**View test report:**
```bash
npx playwright show-report
```

---

## Complete Test Workflow

**All tests (unit + integration + E2E):**

```bash
# Terminal 1: Backend
cd backend-node && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Run all test suites
cd frontend

# Unit + integration (mocked APIs)
npm run test:unit:ci

# Or harness only (faster)
npm run test:harness

# E2E (live servers)
npm run test:e2e

# View E2E report
npx playwright show-report
```

**Quick local iteration (no E2E needed):**
```bash
cd frontend
npm run test:harness  # 8 integration tests, ~8 sec
```

**Full validation before commit:**
```bash
# Ensure servers running, then:
npm run test:unit:ci && npm run test:e2e
```

---

## Angular Frontend Test Harness

The Angular frontend (`angular-frontend/`) uses Angular CLI's built-in `@angular/build:unit-test`
runner, which wraps Vitest with Angular compiler support. No separate `vitest.config.ts` needed.

Run:

```bash
cd angular-frontend
npm test -- --no-watch
```

Watch mode:

```bash
cd angular-frontend
npm test
```

### Angular Test Coverage

- `src/app/app.spec.ts` — App component renders, router-outlet present
- `src/app/services/api.service.spec.ts` — URL builders, HbA1c classification, date formatting

Total: **25 tests**, all passing.

### Debugging Angular Tests

#### Option 1 — VS Code Debugger (step-through)

The config already exists at `.vscode/launch.json` → **"Debug Angular Tests"**.

Key settings that make source stepping work:
- `"NODE_OPTIONS": "--inspect=0"` — propagates the inspector into Vitest's worker process (where tests actually run)
- `"sourceMaps": true` + `"resolveSourceMapLocations"` — maps compiled output back to `.ts` source
- `"skipFiles"` — skips Angular build / Vitest internals so F11 lands in your code

Set breakpoints in any `.ts` file, press **F5** — execution pauses at breakpoints inside
component methods, services, and spec files.

#### Option 2 — Chrome DevTools

```bash
cd angular-frontend
node --inspect-brk ./node_modules/.bin/ng test --no-watch
```

Open `chrome://inspect` → click **inspect** → Sources tab, set breakpoints.

#### Option 3 — `debugger` statement

Drop `debugger;` directly in source or test code:

```typescript
it('should load patients', () => {
  debugger; // pauses here when devtools are open
  const fixture = TestBed.createComponent(PatientsComponent);
  // ...
});
```

**Tip:** Breakpoints work in component class code. For template logic, put breakpoints
in the component methods called by the template instead.

---

## Summary

| Layer | Runner | Scope | Command |
|-------|--------|-------|---------|
| **Backend** | Jest | API routes, DB | `backend-node: npm test` |
| **Angular Unit** | Vitest (via ng) | Components, services | `angular-frontend: npm test -- --no-watch` |
| **Frontend Unit** | Vitest | Utilities, components | `frontend: npm run test:unit:ci` |
| **Frontend Integration** | Vitest | Pages + mocked APIs | `frontend: npm run test:harness` |
| **Frontend E2E** | Playwright | Full stack + live servers | `frontend: npm run test:e2e` |

Total coverage: **25 Angular tests** + legacy SolidJS/backend suites
