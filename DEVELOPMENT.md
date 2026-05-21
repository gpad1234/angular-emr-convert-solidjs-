# Development Guide (Angular + Express)

## Overview

- Backend: Node.js + Express API in `backend-node` on port `8000`
- Frontend: Angular 21 app in `angular-frontend` on port `4200`
- Frontend API calls use `/api/v1/*`.

## Prerequisites

- Node.js 18+
- npm 10+

## Install

```bash
cd backend-node && npm install
cd ../angular-frontend && npm install
```

## Build

The Angular frontend build is verified with:

```bash
cd angular-frontend
npm run build
```

The build output is written to `angular-frontend/dist/angular-frontend`.

## Run Locally

### Backend

```bash
cd backend-node
npm run dev
```

The API listens on `http://localhost:8000`.

### Frontend

```bash
cd angular-frontend
npm start
```

The dev server listens on `http://localhost:4200`.

### Important note

The Angular app currently calls `/api/v1/*` with a relative URL and this workspace does not include a checked-in proxy configuration. If you want the browser UI to talk to the local backend while using `ng serve`, you will need to add a proxy or point the frontend at `http://localhost:8000` in your local environment. Without that, the frontend build still works, but API-backed screens will not reach the backend from the dev server.

## Tests

Backend:

```bash
cd backend-node
npm test
```

Frontend unit tests:

```bash
cd angular-frontend
npm test
```

## Database Reset

```bash
rm -f backend-node/diabetes_emr.db
```

Then restart the backend to recreate the schema and seed data.
