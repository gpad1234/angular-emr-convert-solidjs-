/**
 * components/AppointmentList.js - Patient Appointment History
 * ============================================================
 * Displays a list of appointments for a patient in chronological order.
 * Each row shows: date/time, visit type, status badge, and provider.
 *
 * Status color coding:
 *   Scheduled   → Blue    (upcoming)
 *   Completed   → Green   (attended)
 *   Cancelled   → Gray    (did not occur)
 *   No-show     → Red     (patient didn't attend)
 *   In-progress → Amber   (currently active)
 */

import { formatDateTime } from '@/lib/api';

/**
 * @param {object} props
 * @param {Array}  props.appointments - Array of AppointmentResponse objects
 */
export default function AppointmentList({ appointments = [] }) {
  if (appointments.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No appointments on record
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((appt) => (
        <AppointmentItem key={appt.id} appointment={appt} />
      ))}
    </div>
  );
}

/**
 * Single appointment row.
 * Shows the date prominently with type and status details below.
 */
function AppointmentItem({ appointment: appt }) {
  const { bgClass, textClass, label } = getStatusStyle(appt.status);

  // Detect if this appointment is upcoming
  const isUpcoming = new Date(appt.appointment_datetime) > new Date()
                     && appt.status === 'Scheduled';

  return (
    <div
      className={`rounded-xl border p-3
                  ${isUpcoming ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'}`}
    >
      <div className="flex items-start justify-between gap-2">

        {/* ── Left: date block ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 text-center bg-white rounded-lg border border-gray-100
                        px-2 py-1 min-w-[48px]">
          {/* Month abbreviation */}
          <p className="text-xs font-semibold text-primary-600 uppercase leading-none">
            {new Date(appt.appointment_datetime).toLocaleString('default', { month: 'short' })}
          </p>
          {/* Day number */}
          <p className="text-xl font-bold text-gray-900 leading-tight">
            {new Date(appt.appointment_datetime).getDate()}
          </p>
          {/* Year (small) */}
          <p className="text-xs text-gray-400 leading-none">
            {new Date(appt.appointment_datetime).getFullYear()}
          </p>
        </div>

        {/* ── Middle: visit details ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Appointment type */}
          <p className="font-semibold text-gray-900 text-sm">{appt.appointment_type}</p>

          {/* Time */}
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(appt.appointment_datetime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {/* Provider */}
          {appt.provider_name && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              👨‍⚕️ {appt.provider_name}
            </p>
          )}

          {/* Clinical notes (shown for completed appointments) */}
          {appt.notes && appt.status === 'Completed' && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
              {appt.notes}
            </p>
          )}
        </div>

        {/* ── Right: status badge ──────────────────────────────────────────── */}
        <span
          className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full
                      ${bgClass} ${textClass}`}
        >
          {label}
        </span>

      </div>
    </div>
  );
}

/**
 * Map appointment status to visual style.
 */
function getStatusStyle(status) {
  const styles = {
    'Scheduled':   { bgClass: 'bg-blue-100',   textClass: 'text-blue-700',   label: 'Scheduled' },
    'Completed':   { bgClass: 'bg-green-100',  textClass: 'text-green-700',  label: 'Completed' },
    'Cancelled':   { bgClass: 'bg-gray-100',   textClass: 'text-gray-600',   label: 'Cancelled' },
    'No-show':     { bgClass: 'bg-red-100',    textClass: 'text-red-700',    label: 'No-show' },
    'In-progress': { bgClass: 'bg-amber-100',  textClass: 'text-amber-700',  label: 'In Progress' },
  };
  return styles[status] || { bgClass: 'bg-gray-100', textClass: 'text-gray-600', label: status };
}
