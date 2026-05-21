import { describe, it, expect } from 'vitest';
import {
  classifyGlucose,
  classifyHbA1c,
  calculateAge,
  formatDate,
  formatDateTime,
  timeAgo,
  buildPatientsUrl,
  buildGlucoseUrl,
} from './api.service';

// ── classifyGlucose ─────────────────────────────────────────────────────────

describe('classifyGlucose', () => {
  it('returns Critical Low for < 54', () => {
    expect(classifyGlucose(40).label).toBe('Critical Low');
    expect(classifyGlucose(40).badgeClass).toBe('badge-critical');
  });
  it('returns Low for 54-69', () => {
    expect(classifyGlucose(60).label).toBe('Low');
  });
  it('returns Normal for 70-130', () => {
    expect(classifyGlucose(100).label).toBe('Normal');
    expect(classifyGlucose(100).color).toBe('#16a34a');
  });
  it('returns Slightly High for 131-180', () => {
    expect(classifyGlucose(150).label).toBe('Slightly High');
  });
  it('returns High for 181-250', () => {
    expect(classifyGlucose(200).label).toBe('High');
  });
  it('returns Very High for > 250', () => {
    expect(classifyGlucose(300).label).toBe('Very High');
  });
});

// ── classifyHbA1c ───────────────────────────────────────────────────────────

describe('classifyHbA1c', () => {
  it('Normal for < 5.7', () => expect(classifyHbA1c(5.0).label).toBe('Normal'));
  it('Prediabetes for 5.7-6.4', () => expect(classifyHbA1c(6.0).label).toBe('Prediabetes'));
  it('At Target for 6.5-6.9', () => expect(classifyHbA1c(6.8).label).toBe('At Target'));
  it('Above Target for 7.0-7.9', () => expect(classifyHbA1c(7.5).label).toBe('Above Target'));
  it('Uncontrolled for 8.0-8.9', () => expect(classifyHbA1c(8.5).label).toBe('Uncontrolled'));
  it('Poorly Controlled for >= 9.0', () => expect(classifyHbA1c(9.5).label).toBe('Poorly Controlled'));
});

// ── calculateAge ────────────────────────────────────────────────────────────

describe('calculateAge', () => {
  it('returns correct age', () => {
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    expect(calculateAge(thirtyYearsAgo.toISOString())).toBe(30);
  });
});

// ── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns em dash for null', () => expect(formatDate(null)).toBe('—'));
  it('returns em dash for undefined', () => expect(formatDate(undefined)).toBe('—'));
  it('formats a valid date', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
  });
});

// ── formatDateTime ──────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('returns em dash for null', () => expect(formatDateTime(null)).toBe('—'));
  it('includes AM/PM', () => {
    const result = formatDateTime('2024-06-01T10:30:00');
    expect(/am|pm/i.test(result)).toBe(true);
  });
});

// ── buildPatientsUrl ────────────────────────────────────────────────────────

describe('buildPatientsUrl', () => {
  it('builds default URL', () => {
    const url = buildPatientsUrl();
    expect(url).toContain('/api/v1/patients');
    expect(url).toContain('skip=0');
    expect(url).toContain('limit=10');
  });

  it('includes search param when provided', () => {
    expect(buildPatientsUrl(0, 10, 'john')).toContain('search=john');
  });

  it('includes diabetes_type when provided', () => {
    expect(buildPatientsUrl(0, 10, '', 'Type 1')).toMatch(/diabetes_type=Type(\+|%20)1/);
  });

  it('omits empty search param', () => {
    expect(buildPatientsUrl(0, 10, '')).not.toContain('search=');
  });
});

// ── buildGlucoseUrl ─────────────────────────────────────────────────────────

describe('buildGlucoseUrl', () => {
  it('builds URL for patient', () => {
    const url = buildGlucoseUrl(42, 0, 20);
    expect(url).toContain('/api/v1/patients/42/glucose');
    expect(url).toContain('limit=20');
  });
});
