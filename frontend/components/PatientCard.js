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
    <Link href={`/patients/${patient.id}`} className="block mb-3">
      <article
        className="card-interactive cursor-pointer overflow-hidden"
        aria-label={`View ${patient.first_name} ${patient.last_name}'s record`}
      >
        {/* Colored top accent bar keyed to diabetes type */}
        <div className={`h-1 -mx-4 -mt-4 mb-4 rounded-t-2xl ${getTypeAccent(patient.diabetes_type)}`} />
        <div className="flex items-start justify-between gap-3">

          {/* ── Patient avatar (initials) ──────────────────────────────────── */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-full ${getTypeAvatarBg(patient.diabetes_type)}
                          flex items-center justify-center shadow-sm`}>
            <span className={`font-bold text-sm ${getTypeAvatarText(patient.diabetes_type)}`}>
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

// Gradient accent bar across top of card, keyed to diabetes type
function getTypeAccent(type) {
  const map = {
    'Type 1':     'bg-gradient-to-r from-blue-400 to-blue-500',
    'Type 2':     'bg-gradient-to-r from-violet-400 to-violet-500',
    'LADA':       'bg-gradient-to-r from-indigo-400 to-indigo-500',
    'Gestational':'bg-gradient-to-r from-pink-400 to-pink-500',
    'Prediabetes':'bg-gradient-to-r from-amber-400 to-amber-500',
  };
  return map[type] || 'bg-gradient-to-r from-gray-300 to-gray-400';
}

// Avatar background per type
function getTypeAvatarBg(type) {
  const map = {
    'Type 1':     'bg-blue-100',
    'Type 2':     'bg-violet-100',
    'LADA':       'bg-indigo-100',
    'Gestational':'bg-pink-100',
    'Prediabetes':'bg-amber-100',
  };
  return map[type] || 'bg-gray-100';
}

// Avatar text color per type
function getTypeAvatarText(type) {
  const map = {
    'Type 1':     'text-blue-700',
    'Type 2':     'text-violet-700',
    'LADA':       'text-indigo-700',
    'Gestational':'text-pink-700',
    'Prediabetes':'text-amber-700',
  };
  return map[type] || 'text-gray-600';
}
