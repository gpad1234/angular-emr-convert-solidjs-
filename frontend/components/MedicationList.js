/**
 * components/MedicationList.js - Patient Medication Display
 * ==========================================================
 * Shows a patient's active medications as a scrollable list.
 * Each item shows:
 *   - Medication name (generic) and optional brand name
 *   - Dosage and frequency
 *   - Route of administration
 *   - Start date
 *   - Any clinical notes
 *
 * Inactive (discontinued) medications can be shown with the
 * `showInactive` prop — useful for the full medication history view.
 */

import { formatDate } from '@/lib/api';

/**
 * @param {object}   props
 * @param {Array}    props.medications  - Array of MedicationResponse objects
 * @param {boolean}  [props.showInactive] - If true, show discontinued meds too
 */
export default function MedicationList({ medications = [], showInactive = false }) {
  // Filter based on showInactive prop
  const displayMeds = showInactive
    ? medications
    : medications.filter((m) => m.is_active);

  if (displayMeds.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No {showInactive ? '' : 'active '}medications on record
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {displayMeds.map((med) => (
        <MedicationItem key={med.id} med={med} />
      ))}
    </div>
  );
}

/**
 * Individual medication card.
 * Discontinued medications are visually dimmed and show the end date.
 */
function MedicationItem({ med }) {
  // Route color coding — helps quickly distinguish insulin injections from oral meds
  const routeColor = getRouteColor(med.route);

  return (
    <div
      className={`rounded-xl border p-3 transition-opacity
                  ${med.is_active
                    ? 'bg-white border-gray-100'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* ── Left: drug info ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Medication name and optional brand */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">
              {med.medication_name}
            </h3>
            {med.brand_name && (
              <span className="text-xs text-gray-400">({med.brand_name})</span>
            )}
            {/* Discontinued badge */}
            {!med.is_active && (
              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                Discontinued
              </span>
            )}
          </div>

          {/* Dosage and frequency */}
          {(med.dosage || med.frequency) && (
            <p className="text-xs text-gray-600 mt-0.5">
              {[med.dosage, med.frequency].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Route of administration badge */}
          {med.route && (
            <span
              className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium
                          ${routeColor}`}
            >
              {med.route}
            </span>
          )}

          {/* Clinical notes (collapsed by default for space) */}
          {med.notes && (
            <p className="text-xs text-gray-400 mt-1.5 italic leading-tight">
              {med.notes}
            </p>
          )}
        </div>

        {/* ── Right: dates ─────────────────────────────────────────────────── */}
        <div className="text-right flex-shrink-0">
          {med.start_date && (
            <p className="text-xs text-gray-400">
              Since {formatDate(med.start_date)}
            </p>
          )}
          {!med.is_active && med.end_date && (
            <p className="text-xs text-gray-400">
              Until {formatDate(med.end_date)}
            </p>
          )}
          {med.prescribing_provider && (
            <p className="text-xs text-gray-300 mt-1 truncate max-w-[100px]">
              {med.prescribing_provider}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Return Tailwind classes for the route badge based on administration route.
 * Subcutaneous/IV injections are visually distinguished from oral medications.
 */
function getRouteColor(route) {
  if (!route) return 'bg-gray-100 text-gray-600';
  const r = route.toLowerCase();
  if (r.includes('subcutaneous') || r.includes('injection'))
    return 'bg-blue-100 text-blue-700';
  if (r.includes('oral'))
    return 'bg-green-100 text-green-700';
  if (r.includes('pump'))
    return 'bg-indigo-100 text-indigo-700';
  if (r.includes('iv'))
    return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}
