/**
 * lib/api.js - API Client Layer
 * ==============================
 * Centralises all communication with the FastAPI backend.
 *
 * WHY a dedicated API layer?
 *   - Single place to change the base URL (dev → staging → prod)
 *   - Consistent error handling across all requests
 *   - Easy to mock in tests (replace this module with stubs)
 *   - Keeps component files clean — no fetch() calls scattered in JSX
 *
 * USAGE with SWR (recommended — handles caching + revalidation):
 *   import useSWR from 'swr';
 *   import { fetcher } from '@/lib/api';
 *   const { data, error } = useSWR('/api/v1/patients?skip=0&limit=10', fetcher);
 *
 * USAGE for mutations (POST/PATCH):
 *   import { post } from '@/lib/api';
 *   await post('/api/v1/patients/3/glucose', { value_mgdl: 142, ... });
 */

// ── Base URL from environment variable ────────────────────────────────────────
// Development: set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
// Production:  leave NEXT_PUBLIC_API_URL empty — nginx proxies /api/* on the
//              same origin so no absolute URL is needed.
const BASE_URL =
  typeof process.env.NEXT_PUBLIC_API_URL === 'string'
    ? process.env.NEXT_PUBLIC_API_URL   // '' in prod (relative), 'http://...' in dev
    : 'http://localhost:8000';           // SSR fallback during local dev

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps fetch() with:
 *  - Base URL prepending
 *  - JSON response parsing
 *  - Error throwing (so SWR's error state is populated)
 *
 * @param {string} path  - API path, e.g. '/api/v1/patients?skip=0&limit=10'
 * @param {RequestInit} options - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} Parsed JSON response body
 * @throws {Error} If the response status is not 2xx
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header here if you add JWT auth:
      // 'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
    ...options,
  });

  // Parse the body regardless of status (FastAPI returns JSON error details)
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // FastAPI validation errors come as { detail: [...] } or { detail: "string" }
    const message =
      typeof data?.detail === 'string'
        ? data.detail
        : Array.isArray(data?.detail)
        ? data.detail.map((e) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
        : `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// SWR fetcher (default export for convenience)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default fetcher used by SWR hooks throughout the app.
 * SWR calls this with the key (URL path) whenever it needs fresh data.
 *
 * Example:
 *   const { data } = useSWR('/api/v1/patients', fetcher);
 */
export const fetcher = (path) => apiFetch(path);

// ─────────────────────────────────────────────────────────────────────────────
// HTTP method helpers
// ─────────────────────────────────────────────────────────────────────────────

/** POST a JSON body to the API. Returns parsed response. */
export const post = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) });

/** PATCH (partial update) a resource. */
export const patch = (path, body) =>
  apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });

/** DELETE a resource. */
export const del = (path) =>
  apiFetch(path, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────────────────────────
// Typed API functions (optional — use these for better autocomplete)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a paginated patients URL with optional search and type filter.
 * Returns the URL string for use as an SWR key.
 *
 * @param {number} skip          - Pagination offset
 * @param {number} limit         - Page size
 * @param {string} [search]      - Name search string
 * @param {string} [diabetesType] - Diabetes type filter
 */
export function buildPatientsUrl(skip = 0, limit = 10, search = '', diabetesType = '') {
  const params = new URLSearchParams({ skip, limit });
  if (search)       params.set('search', search);
  if (diabetesType) params.set('diabetes_type', diabetesType);
  return `/api/v1/patients?${params.toString()}`;
}

/**
 * Build a paginated glucose readings URL.
 *
 * @param {number} patientId
 * @param {number} skip
 * @param {number} limit
 * @param {string} [readingType] - Optional filter: 'Fasting', 'Post-meal', etc.
 */
export function buildGlucoseUrl(patientId, skip = 0, limit = 10, readingType = '') {
  const params = new URLSearchParams({ skip, limit });
  if (readingType) params.set('reading_type', readingType);
  return `/api/v1/patients/${patientId}/glucose?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clinical helpers (pure utility — no API calls)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a glucose value into a level label and Tailwind badge class.
 * Used consistently wherever glucose is displayed.
 *
 * @param {number} valueMgdl - Blood glucose in mg/dL
 * @returns {{ label: string, badgeClass: string, color: string }}
 */
export function classifyGlucose(valueMgdl) {
  if (valueMgdl < 54)  return { label: 'Critical Low', badgeClass: 'badge-critical', color: '#dc2626' };
  if (valueMgdl < 70)  return { label: 'Low',          badgeClass: 'badge-low',      color: '#f59e0b' };
  if (valueMgdl <= 130) return { label: 'Normal',       badgeClass: 'badge-normal',   color: '#16a34a' };
  if (valueMgdl <= 180) return { label: 'Slightly High',badgeClass: 'badge-elevated', color: '#d97706' };
  if (valueMgdl <= 250) return { label: 'High',         badgeClass: 'badge-high',     color: '#dc2626' };
  return                       { label: 'Very High',    badgeClass: 'badge-high',     color: '#991b1b' };
}

/**
 * Classify an HbA1c percentage into a label and color.
 *
 * @param {number} pct - HbA1c percentage (e.g. 7.2)
 * @returns {{ label: string, badgeClass: string, color: string }}
 */
export function classifyHbA1c(pct) {
  if (pct < 5.7) return { label: 'Normal',              badgeClass: 'badge-normal',   color: '#16a34a' };
  if (pct < 6.5) return { label: 'Prediabetes',         badgeClass: 'badge-low',      color: '#f59e0b' };
  if (pct < 7.0) return { label: 'At Target',           badgeClass: 'badge-normal',   color: '#16a34a' };
  if (pct < 8.0) return { label: 'Above Target',        badgeClass: 'badge-elevated', color: '#d97706' };
  if (pct < 9.0) return { label: 'Uncontrolled',        badgeClass: 'badge-high',     color: '#dc2626' };
  return               { label: 'Poorly Controlled',   badgeClass: 'badge-critical', color: '#991b1b' };
}

/**
 * Calculate a patient's age from their date of birth string.
 * @param {string} dobString - ISO date string, e.g. "1974-03-15"
 * @returns {number} Age in years
 */
export function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format a date string for display (e.g. "Mar 15, 2026").
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  return new Date(dateInput).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Format a datetime for display (e.g. "Mar 15, 10:30 AM").
 * @param {string|Date} datetimeInput
 * @returns {string}
 */
export function formatDateTime(datetimeInput) {
  if (!datetimeInput) return '—';
  return new Date(datetimeInput).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Format a relative time string (e.g. "2 hours ago", "3 days ago").
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function timeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000 },
    { label: 'day',    secs: 86400 },
    { label: 'hour',   secs: 3600 },
    { label: 'minute', secs: 60 },
  ];

  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
