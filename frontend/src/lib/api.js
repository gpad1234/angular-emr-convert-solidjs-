import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
})

export default client

async function apiFetch(path, options = {}) {
  // axios already throws on non-2xx — normalize response
  const res = await client.request({ url: path, ...options })
  return res.data
}

export async function fetchDashboard() {
  return apiFetch('/api/v1/stats/dashboard')
}

export const post = (path, body) => apiFetch(path, { method: 'POST', data: body })
export const patch = (path, body) => apiFetch(path, { method: 'PATCH', data: body })
export const del = (path) => apiFetch(path, { method: 'DELETE' })

export function buildPatientsUrl(skip = 0, limit = 10, search = '', diabetesType = '') {
  const params = new URLSearchParams({ skip, limit })
  if (search) params.set('search', search)
  if (diabetesType) params.set('diabetes_type', diabetesType)
  return `/api/v1/patients?${params.toString()}`
}

export function buildGlucoseUrl(patientId, skip = 0, limit = 10, readingType = '') {
  const params = new URLSearchParams({ skip, limit })
  if (readingType) params.set('reading_type', readingType)
  return `/api/v1/patients/${patientId}/glucose?${params.toString()}`
}

export function classifyGlucose(valueMgdl) {
  if (valueMgdl < 54) return { label: 'Critical Low', badgeClass: 'badge-critical', color: '#dc2626' }
  if (valueMgdl < 70) return { label: 'Low', badgeClass: 'badge-low', color: '#f59e0b' }
  if (valueMgdl <= 130) return { label: 'Normal', badgeClass: 'badge-normal', color: '#16a34a' }
  if (valueMgdl <= 180) return { label: 'Slightly High', badgeClass: 'badge-elevated', color: '#d97706' }
  if (valueMgdl <= 250) return { label: 'High', badgeClass: 'badge-high', color: '#dc2626' }
  return { label: 'Very High', badgeClass: 'badge-high', color: '#991b1b' }
}

export function classifyHbA1c(pct) {
  if (pct < 5.7) return { label: 'Normal', badgeClass: 'badge-normal', color: '#16a34a' }
  if (pct < 6.5) return { label: 'Prediabetes', badgeClass: 'badge-low', color: '#f59e0b' }
  if (pct < 7.0) return { label: 'At Target', badgeClass: 'badge-normal', color: '#16a34a' }
  if (pct < 8.0) return { label: 'Above Target', badgeClass: 'badge-elevated', color: '#d97706' }
  if (pct < 9.0) return { label: 'Uncontrolled', badgeClass: 'badge-high', color: '#dc2626' }
  return { label: 'Poorly Controlled', badgeClass: 'badge-critical', color: '#991b1b' }
}

export function calculateAge(dobString) {
  const dob = new Date(dobString)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export function formatDate(dateInput) {
  if (!dateInput) return '—'
  return new Date(dateInput).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(datetimeInput) {
  if (!datetimeInput) return '—'
  return new Date(datetimeInput).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

export function timeAgo(dateInput) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}
