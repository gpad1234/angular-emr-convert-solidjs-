/**
 * pages/index.js - Dashboard Page
 * =================================
 * The home screen of the Diabetes EMR.
 * Shows aggregate statistics about the entire patient population.
 *
 * Data source: GET /api/v1/stats/dashboard
 *
 * Sections:
 *   1. Total patient count and type breakdown
 *   2. Average HbA1c over the last 30 days
 *   3. High HbA1c alert (patients above 9%)
 *   4. Recent hypoglycemia alert (glucose < 70 in last 7 days)
 *   5. Active medications count
 *   6. Link to patient list
 */

import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';

// ── Diabetes type display config ─────────────────────────────────────────────
// Maps API type strings to display label + Tailwind color class
const TYPE_CONFIG = {
  'Type 1':      { label: 'Type 1',      color: 'bg-blue-100 text-blue-800' },
  'Type 2':      { label: 'Type 2',      color: 'bg-purple-100 text-purple-800' },
  'LADA':        { label: 'LADA',        color: 'bg-indigo-100 text-indigo-800' },
  'Gestational': { label: 'Gestational', color: 'bg-pink-100 text-pink-800' },
  'Prediabetes': { label: 'Prediabetes', color: 'bg-yellow-100 text-yellow-800' },
  'Other':       { label: 'Other',       color: 'bg-gray-100 text-gray-700' },
};

export default function DashboardPage() {
  // ── Data fetching ───────────────────────────────────────────────────────────
  // SWR caches the result and shows stale data while re-validating in background.
  const { data: stats, error, isLoading } = useSWR('/api/v1/stats/dashboard');

  return (
    <>
      <Head>
        <title>Dashboard — Diabetes EMR</title>
        <meta name="description" content="Diabetes patient population dashboard" />
      </Head>

      <Layout title="Dashboard">
        {/* Loading state — show skeleton placeholders */}
        {isLoading && <DashboardSkeleton />}

        {/* Error state */}
        {error && (
          <div className="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-700 font-semibold text-sm">Failed to load dashboard</p>
            <p className="text-red-500 text-xs mt-1">
              Ensure the backend is running at{' '}
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </p>
          </div>
        )}

        {/* Loaded state */}
        {stats && (
          <div className="p-4 space-y-4">

            {/* ── Alert banners (shown only when there are concerns) ─────────── */}
            {stats.high_hba1c_count > 0 && (
              <AlertBanner
                type="warning"
                icon="⚠️"
                title={`${stats.high_hba1c_count} patient${stats.high_hba1c_count > 1 ? 's' : ''} with HbA1c above 9%`}
                subtitle="Review treatment plans for poorly controlled patients"
                href="/patients?filter=high_hba1c"
              />
            )}
            {stats.recent_hypoglycemia_count > 0 && (
              <AlertBanner
                type="critical"
                icon="🚨"
                title={`${stats.recent_hypoglycemia_count} hypoglycemia event${stats.recent_hypoglycemia_count > 1 ? 's' : ''} in the last 7 days`}
                subtitle="Glucose readings below 70 mg/dL detected"
                href="/patients"
              />
            )}

            {/* ── Key metrics grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total patients */}
              <StatCard
                label="Total Patients"
                value={stats.total_patients}
                icon="👥"
                href="/patients"
                highlight
              />
              {/* Average HbA1c */}
              <StatCard
                label="Avg HbA1c (30d)"
                value={stats.avg_hba1c_last_30_days
                  ? `${stats.avg_hba1c_last_30_days.toFixed(1)}%`
                  : 'N/A'}
                icon="🩺"
                valueColor={getHbA1cColor(stats.avg_hba1c_last_30_days)}
              />
              {/* High HbA1c count */}
              <StatCard
                label="HbA1c > 9%"
                value={stats.high_hba1c_count}
                icon="📈"
                valueColor={stats.high_hba1c_count > 0 ? 'text-red-600' : 'text-green-600'}
              />
              {/* Active medications */}
              <StatCard
                label="Active Meds"
                value={stats.active_medications_count}
                icon="💊"
              />
            </div>

            {/* ── Patient breakdown by diabetes type ───────────────────────── */}
            {stats.by_diabetes_type && (
              <section>
                <h2 className="section-title mb-3">By Diabetes Type</h2>
                <div className="card space-y-2">
                  {Object.entries(stats.by_diabetes_type)
                    // Sort by count descending
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const config = TYPE_CONFIG[type] || TYPE_CONFIG['Other'];
                      const pct = Math.round((count / stats.total_patients) * 100);
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-28 text-center flex-shrink-0 ${config.color}`}>
                            {config.label}
                          </span>
                          {/* Progress bar */}
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-primary-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* ── Quick action: View all patients ──────────────────────────── */}
            <Link
              href="/patients"
              className="btn-primary flex items-center justify-center gap-2 w-full mt-2"
            >
              <span>View All Patients</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

          </div>
        )}
      </Layout>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * A single metric card on the stats grid.
 */
function StatCard({ label, value, icon, href, highlight, valueColor }) {
  const content = (
    <div className={`card text-center ${highlight ? 'border-primary-200' : ''}`}>
      <span className="text-2xl">{icon}</span>
      <p className={`stat-number mt-1 ${valueColor || 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

/**
 * A colored banner for clinical alerts.
 */
function AlertBanner({ type, icon, title, subtitle, href }) {
  const styles = {
    warning:  'bg-amber-50 border-amber-200',
    critical: 'bg-red-50 border-red-200',
  };
  const textStyles = {
    warning:  'text-amber-800',
    critical: 'text-red-800',
  };
  const subtitleStyles = {
    warning:  'text-amber-600',
    critical: 'text-red-600',
  };

  const content = (
    <div className={`rounded-xl border p-3 ${styles[type]}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div>
          <p className={`text-sm font-semibold ${textStyles[type]}`}>{title}</p>
          <p className={`text-xs mt-0.5 ${subtitleStyles[type]}`}>{subtitle}</p>
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

/**
 * Skeleton loading state — shown while stats are fetching.
 * Mirrors the layout of the actual content to prevent layout shift.
 */
function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="card">
            <div className="skeleton w-8 h-8 rounded-full mx-auto" />
            <div className="skeleton w-16 h-7 rounded mx-auto mt-2" />
            <div className="skeleton w-24 h-3 rounded mx-auto mt-1" />
          </div>
        ))}
      </div>
      <div className="card space-y-3">
        {[0,1,2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-28 h-5 rounded-full" />
            <div className="skeleton flex-1 h-2 rounded-full" />
            <div className="skeleton w-6 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Returns a Tailwind text color class based on HbA1c level.
 * Used to color the "Avg HbA1c" stat card value.
 */
function getHbA1cColor(value) {
  if (!value) return 'text-gray-400';
  if (value < 7)   return 'text-green-600';
  if (value < 8.5) return 'text-amber-600';
  return 'text-red-600';
}
