/**
 * pages/patients/[id].js - Patient Detail Page
 * ===============================================
 * The main clinical view for a single patient.
 * Loaded via /patients/123 where 123 is the patient's database ID.
 *
 * Data sources:
 *   1. GET /api/v1/patients/{id}/summary — all clinical data in one call:
 *        patient info, latest HbA1c, latest glucose, latest BP,
 *        active medications, recent HbA1c history, upcoming appointments
 *   2. GET /api/v1/patients/{id}/glucose — paginated glucose history
 *        (loaded separately with "Load More" pagination)
 *
 * Page sections:
 *   A. Patient header (name, age, type, BMI, provider)
 *   B. Clinical alerts (if any readings are out of range)
 *   C. Latest vitals (HbA1c, glucose, blood pressure, BMI)
 *   D. HbA1c trend (last 4 readings + classification)
 *   E. Active medications
 *   F. Upcoming appointments
 *   G. Glucose readings history with "Load More"
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import DiabetesTypeBadge from '@/components/DiabetesTypeBadge';
import HbA1cBadge from '@/components/HbA1cBadge';
import GlucoseChart from '@/components/GlucoseChart';
import MedicationList from '@/components/MedicationList';
import AppointmentList from '@/components/AppointmentList';
import LoadMoreButton from '@/components/LoadMoreButton';
import { calculateAge, classifyGlucose, buildGlucoseUrl, formatDate, formatDateTime, fetcher } from '@/lib/api';

const GLUCOSE_PAGE_SIZE = 20;

export default function PatientDetailPage() {
  const router = useRouter();
  // `id` comes from the URL: /patients/[id]
  // It may be undefined on first render (Next.js pre-hydration)
  const { id } = router.query;

  // ── Primary data: patient summary ─────────────────────────────────────────
  // Only fetch once `id` is available. SWR skips the fetch if key is null.
  const {
    data: summary,
    error: summaryError,
    isLoading: summaryLoading,
  } = useSWR(id ? `/api/v1/patients/${id}/summary` : null);

  // ── Secondary data: glucose readings (paginated) ──────────────────────────
  const [glucoseReadings, setGlucoseReadings] = useState([]);
  const [glucoseSkip,     setGlucoseSkip]     = useState(0);
  const [glucoseHasMore,  setGlucoseHasMore]  = useState(false);
  const [glucoseLoading,  setGlucoseLoading]  = useState(false);

  // Load glucose readings when patient ID is available
  useEffect(() => {
    if (id) fetchGlucose(0);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetches a page of glucose readings and appends to state.
   * @param {number} currentSkip - Offset for this page
   */
  async function fetchGlucose(currentSkip) {
    setGlucoseLoading(true);
    try {
      const url = buildGlucoseUrl(id, currentSkip, GLUCOSE_PAGE_SIZE);
      const data = await fetcher(url);

      setGlucoseReadings((prev) =>
        currentSkip === 0 ? data.readings : [...prev, ...data.readings]
      );
      setGlucoseHasMore(data.has_more);
      setGlucoseSkip(currentSkip + GLUCOSE_PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch glucose readings:', err);
    } finally {
      setGlucoseLoading(false);
    }
  }

  // ── Back navigation ───────────────────────────────────────────────────────
  const handleBack = () => router.push('/patients');

  // ── Loading state ─────────────────────────────────────────────────────────
  if (summaryLoading || !id) {
    return (
      <Layout title="Patient" showBack onBack={handleBack}>
        <PatientDetailSkeleton />
      </Layout>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (summaryError) {
    return (
      <Layout title="Patient" showBack onBack={handleBack}>
        <div className="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 font-semibold">Patient not found</p>
          <p className="text-red-500 text-sm mt-1">
            Patient #{id} could not be loaded.
          </p>
        </div>
      </Layout>
    );
  }

  if (!summary) return null;

  // ── Destructure summary ───────────────────────────────────────────────────
  const {
    patient,
    latest_hba1c,
    latest_glucose,
    latest_bp,
    active_medications,
    recent_hba1c,
    upcoming_appointments,
  } = summary;

  const age = calculateAge(patient.date_of_birth);

  // Clinical alert checks
  const glucoseAlert   = latest_glucose && (latest_glucose.value_mgdl < 70 || latest_glucose.value_mgdl > 300);
  const hba1cAlert     = latest_hba1c   && latest_hba1c.value_percent > 9;

  return (
    <>
      <Head>
        <title>{patient.first_name} {patient.last_name} — Diabetes EMR</title>
      </Head>

      <Layout
        title={`${patient.first_name} ${patient.last_name}`}
        showBack
        onBack={handleBack}
      >
        <div className="space-y-4 pb-4">

          {/* ── Section A: Patient header ──────────────────────────────────── */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-4 pb-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {patient.first_name[0]}{patient.last_name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-primary-100 text-sm">
                  {age} yrs · {patient.gender}
                  {patient.bmi && <span> · BMI {patient.bmi}</span>}
                </p>
              </div>
            </div>

            {/* Type badge + provider */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <DiabetesTypeBadge type={patient.diabetes_type} size="lg" />
              {patient.primary_care_provider && (
                <span className="text-primary-100 text-xs">
                  {patient.primary_care_provider}
                </span>
              )}
            </div>

            {/* Diagnosis info */}
            {patient.diagnosis_date && (
              <p className="text-primary-200 text-xs mt-2">
                Diagnosed: {formatDate(patient.diagnosis_date)}
              </p>
            )}

            {/* Notes / conditions summary */}
            {patient.notes && (
              <p className="text-primary-100 text-xs mt-2 leading-relaxed line-clamp-2">
                {patient.notes}
              </p>
            )}
          </div>

          {/* ── Section B: Clinical alerts ────────────────────────────────── */}
          {(glucoseAlert || hba1cAlert) && (
            <div className="px-4 space-y-2">
              {hba1cAlert && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-700 text-sm font-semibold">
                    ⚠️ HbA1c {latest_hba1c.value_percent.toFixed(1)}% — Poorly Controlled
                  </p>
                  <p className="text-red-600 text-xs mt-0.5">Review treatment plan</p>
                </div>
              )}
              {glucoseAlert && (
                <div className={`p-3 rounded-xl border
                                 ${latest_glucose.value_mgdl < 70
                                   ? 'bg-red-50 border-red-200'
                                   : 'bg-amber-50 border-amber-200'}`}>
                  <p className={`text-sm font-semibold
                                 ${latest_glucose.value_mgdl < 70 ? 'text-red-700' : 'text-amber-700'}`}>
                    {latest_glucose.value_mgdl < 70
                      ? `🚨 Hypoglycemia: ${latest_glucose.value_mgdl} mg/dL`
                      : `📈 High Glucose: ${latest_glucose.value_mgdl} mg/dL`}
                  </p>
                  <p className={`text-xs mt-0.5
                                 ${latest_glucose.value_mgdl < 70 ? 'text-red-600' : 'text-amber-600'}`}>
                    Recorded {formatDateTime(latest_glucose.reading_datetime)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Section C: Latest vitals grid ─────────────────────────────── */}
          <section className="px-4">
            <h2 className="section-title mb-3">Latest Readings</h2>
            <div className="grid grid-cols-2 gap-3">

              {/* HbA1c */}
              <div className="card text-center">
                <p className="text-xs text-gray-500 mb-1">HbA1c</p>
                {latest_hba1c
                  ? <HbA1cBadge value={latest_hba1c.value_percent} size="lg" showLabel />
                  : <span className="text-gray-300 text-lg">—</span>}
                {latest_hba1c?.test_date && (
                  <p className="text-xs text-gray-400 mt-1">{formatDate(latest_hba1c.test_date)}</p>
                )}
              </div>

              {/* Blood Glucose */}
              <div className="card text-center">
                <p className="text-xs text-gray-500 mb-1">Glucose</p>
                {latest_glucose ? (
                  <>
                    <GlucoseValue value={latest_glucose.value_mgdl} />
                    <p className="text-xs text-gray-400 mt-1">
                      {latest_glucose.reading_type}
                    </p>
                  </>
                ) : <span className="text-gray-300 text-lg">—</span>}
              </div>

              {/* Blood Pressure */}
              <div className="card text-center">
                <p className="text-xs text-gray-500 mb-1">Blood Pressure</p>
                {latest_bp ? (
                  <>
                    <p className="stat-number text-gray-900">
                      {latest_bp.systolic}/{latest_bp.diastolic}
                    </p>
                    <p className="text-xs text-gray-400">mmHg</p>
                  </>
                ) : <span className="text-gray-300 text-lg">—</span>}
              </div>

              {/* BMI */}
              <div className="card text-center">
                <p className="text-xs text-gray-500 mb-1">BMI</p>
                {patient.bmi ? (
                  <>
                    <p className="stat-number text-gray-900">{patient.bmi}</p>
                    <p className="text-xs text-gray-400">{getBmiLabel(patient.bmi)}</p>
                  </>
                ) : <span className="text-gray-300 text-lg">—</span>}
              </div>

            </div>
          </section>

          {/* ── Section D: HbA1c trend ────────────────────────────────────── */}
          {recent_hba1c && recent_hba1c.length > 0 && (
            <section className="px-4">
              <h2 className="section-title mb-3">HbA1c Trend</h2>
              <div className="card">
                <div className="flex items-center justify-around">
                  {recent_hba1c.slice(0, 4).reverse().map((reading, i) => (
                    <div key={reading.id} className="text-center">
                      <HbA1cBadge value={reading.value_percent} size="sm" />
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(reading.test_date).toLocaleDateString('default', {
                          month: 'short',
                          year: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Section E: Active medications ─────────────────────────────── */}
          <section className="px-4">
            <h2 className="section-title mb-3">
              Active Medications
              {active_medications?.length > 0 && (
                <span className="ml-2 text-xs bg-primary-100 text-primary-700
                                  px-2 py-0.5 rounded-full font-medium">
                  {active_medications.length}
                </span>
              )}
            </h2>
            <MedicationList medications={active_medications || []} />
          </section>

          {/* ── Section F: Upcoming appointments ─────────────────────────── */}
          {upcoming_appointments && upcoming_appointments.length > 0 && (
            <section className="px-4">
              <h2 className="section-title mb-3">Upcoming Appointments</h2>
              <AppointmentList appointments={upcoming_appointments} />
            </section>
          )}

          {/* ── Section G: Glucose chart + history ───────────────────────── */}
          <section className="px-4">
            <h2 className="section-title mb-3">Glucose History</h2>

            {/* Chart — shows all loaded readings */}
            {glucoseReadings.length > 0 && (
              <div className="card mb-3 overflow-hidden">
                <p className="text-xs text-gray-400 mb-2">Last {glucoseReadings.length} readings</p>
                <GlucoseChart readings={glucoseReadings} />
                {/* Legend */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                    180 mg/dL target
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-3 h-0.5 bg-red-400 inline-block" />
                    70 mg/dL hypo
                  </span>
                </div>
              </div>
            )}

            {/* Glucose reading rows */}
            <div className="space-y-2">
              {glucoseReadings.map((reading) => (
                <GlucoseRow key={reading.id} reading={reading} />
              ))}
            </div>

            {glucoseLoading && glucoseReadings.length === 0 && (
              <div className="space-y-2">
                {[0,1,2].map(i => (
                  <div key={i} className="card animate-pulse flex justify-between">
                    <div className="skeleton w-24 h-4 rounded" />
                    <div className="skeleton w-16 h-4 rounded" />
                  </div>
                ))}
              </div>
            )}

            <LoadMoreButton
              onClick={() => fetchGlucose(glucoseSkip)}
              isLoading={glucoseLoading}
              hasMore={glucoseHasMore}
              label="Load More Readings"
            />
          </section>

        </div>
      </Layout>
    </>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

/**
 * Displays a single glucose reading row in the history list.
 */
function GlucoseRow({ reading }) {
  const { label, color } = classifyGlucose(reading.value_mgdl);
  return (
    <div className="card flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm text-gray-700">{reading.reading_type}</p>
        <p className="text-xs text-gray-400">{formatDateTime(reading.reading_datetime)}</p>
      </div>
      <div className="text-right">
        <span className="font-bold text-lg" style={{ color }}>
          {Math.round(reading.value_mgdl)}
        </span>
        <span className="text-xs text-gray-400 ml-0.5">mg/dL</span>
        <p className="text-xs" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

/**
 * Displays a large glucose value with classification color.
 */
function GlucoseValue({ value }) {
  const { color } = classifyGlucose(value);
  return (
    <span className="stat-number" style={{ color }}>
      {Math.round(value)}
      <span className="text-xs text-gray-400 font-normal ml-0.5">mg/dL</span>
    </span>
  );
}

/**
 * BMI classification label.
 */
function getBmiLabel(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

/**
 * Loading skeleton for the patient detail page.
 */
function PatientDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-primary-600 px-4 pt-4 pb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="skeleton w-14 h-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton w-3/4 h-5 rounded" />
            <div className="skeleton w-1/2 h-3 rounded" />
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="card skeleton h-20" />)}
        </div>
        <div className="card skeleton h-32" />
      </div>
    </div>
  );
}
