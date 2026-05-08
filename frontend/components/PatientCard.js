/**
 * components/PatientCard.js - Patient List Card
 * ===============================================
 * Rendered for each patient in the patient list.
 * Tapping the card navigates to the patient detail page.
 *
 * Displays:
 *   - Patient name, age, and gender
 *   - Diabetes type badge
 *   - Primary care provider
 *   - Latest HbA1c if available (passed as a prop)
 */

import Link from 'next/link';
import DiabetesTypeBadge from './DiabetesTypeBadge';
import { calculateAge, formatDate } from '@/lib/api';

/**
 * @param {object} props
 * @param {object} props.patient - Patient object from API (PatientResponse schema)
 */
export default function PatientCard({ patient }) {
  const age = calculateAge(patient.date_of_birth);

  return (
    // The entire card is a link to the patient detail page
    <Link href={`/patients/${patient.id}`} className="block">
      <article
        className="card mb-3 active:scale-98 transition-transform duration-100
                   hover:shadow-md cursor-pointer"
        // aria-label for screen readers
        aria-label={`View ${patient.first_name} ${patient.last_name}'s record`}
      >
        <div className="flex items-start justify-between gap-3">

          {/* ── Patient avatar (initials) ──────────────────────────────────── */}
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary-100
                          flex items-center justify-center">
            <span className="text-primary-700 font-bold text-sm">
              {/* First letter of each name */}
              {patient.first_name[0]}{patient.last_name[0]}
            </span>
          </div>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Name and diabetes type badge on same line */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-gray-900 text-sm truncate">
                {patient.first_name} {patient.last_name}
              </h2>
              <DiabetesTypeBadge type={patient.diabetes_type} />
            </div>

            {/* Age, gender, and diagnosis info */}
            <p className="text-xs text-gray-500 mt-0.5">
              {age} yrs · {patient.gender}
              {patient.diagnosis_date && (
                <span> · Dx {new Date(patient.diagnosis_date).getFullYear()}</span>
              )}
            </p>

            {/* Provider */}
            {patient.primary_care_provider && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                👨‍⚕️ {patient.primary_care_provider}
              </p>
            )}
          </div>

          {/* ── Right: BMI or chevron ──────────────────────────────────────── */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            {patient.bmi && (
              <div className="text-right">
                <span className="text-xs text-gray-400">BMI</span>
                <p className={`text-sm font-semibold ${getBmiColor(patient.bmi)}`}>
                  {patient.bmi}
                </p>
              </div>
            )}
            {/* Right chevron indicates tappable */}
            <svg className="w-4 h-4 text-gray-300 mt-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

        </div>
      </article>
    </Link>
  );
}

/**
 * Returns a Tailwind text color class based on BMI.
 * BMI classification (WHO):
 *   < 18.5  → Underweight (blue)
 *   18.5-24.9 → Normal (green)
 *   25-29.9 → Overweight (amber)
 *   ≥ 30    → Obese (red)
 *
 * Obesity is a significant risk factor for Type 2 diabetes.
 */
function getBmiColor(bmi) {
  if (bmi < 18.5) return 'text-blue-600';
  if (bmi < 25)   return 'text-green-600';
  if (bmi < 30)   return 'text-amber-600';
  return 'text-red-600';
}
