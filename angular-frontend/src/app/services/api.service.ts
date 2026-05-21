import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export const apiBaseUrl = environment.apiUrl;

// ── Domain helper functions (pure, testable) ──────────────────────────────

export function buildPatientsUrl(skip = 0, limit = 10, search = '', diabetesType = ''): string {
  let params = new HttpParams().set('skip', skip).set('limit', limit);
  if (search) params = params.set('search', search);
  if (diabetesType) params = params.set('diabetes_type', diabetesType);
  return `/api/v1/patients?${params.toString()}`;
}

export function buildGlucoseUrl(patientId: string | number, skip = 0, limit = 10, readingType = ''): string {
  let params = new HttpParams().set('skip', skip).set('limit', limit);
  if (readingType) params = params.set('reading_type', readingType);
  return `/api/v1/patients/${patientId}/glucose?${params.toString()}`;
}

export interface GlucoseClassification {
  label: string;
  badgeClass: string;
  color: string;
}

export function classifyGlucose(valueMgdl: number): GlucoseClassification {
  if (valueMgdl < 54) return { label: 'Critical Low', badgeClass: 'badge-critical', color: '#dc2626' };
  if (valueMgdl < 70) return { label: 'Low', badgeClass: 'badge-low', color: '#f59e0b' };
  if (valueMgdl <= 130) return { label: 'Normal', badgeClass: 'badge-normal', color: '#16a34a' };
  if (valueMgdl <= 180) return { label: 'Slightly High', badgeClass: 'badge-elevated', color: '#d97706' };
  if (valueMgdl <= 250) return { label: 'High', badgeClass: 'badge-high', color: '#dc2626' };
  return { label: 'Very High', badgeClass: 'badge-high', color: '#991b1b' };
}

export interface HbA1cClassification {
  label: string;
  badgeClass: string;
  color: string;
}

export function classifyHbA1c(pct: number): HbA1cClassification {
  if (pct < 5.7) return { label: 'Normal', badgeClass: 'badge-normal', color: '#16a34a' };
  if (pct < 6.5) return { label: 'Prediabetes', badgeClass: 'badge-low', color: '#f59e0b' };
  if (pct < 7.0) return { label: 'At Target', badgeClass: 'badge-normal', color: '#16a34a' };
  if (pct < 8.0) return { label: 'Above Target', badgeClass: 'badge-elevated', color: '#d97706' };
  if (pct < 9.0) return { label: 'Uncontrolled', badgeClass: 'badge-high', color: '#dc2626' };
  return { label: 'Poorly Controlled', badgeClass: 'badge-critical', color: '#991b1b' };
}

export function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function formatDate(dateInput: string | null | undefined): string {
  if (!dateInput) return '—';
  return new Date(dateInput).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(datetimeInput: string | null | undefined): string {
  if (!datetimeInput) return '—';
  return new Date(datetimeInput).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export function timeAgo(dateInput: string | null | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(dateInput);
}

// ── HTTP Service ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${apiBaseUrl}${url}`);
  }

  fetchDashboard(): Observable<any> {
    return this.get('/api/v1/stats/dashboard');
  }

  fetchPatients(url: string): Observable<any> {
    return this.http.get<any>(`${apiBaseUrl}${url}`);
  }

  fetchPatientSummary(id: string | number): Observable<any> {
    return this.get(`/api/v1/patients/${id}/summary`);
  }

  fetchGlucose(url: string): Observable<any> {
    return this.http.get<any>(`${apiBaseUrl}${url}`);
  }
}
