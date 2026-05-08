/**
 * components/HbA1cBadge.js - HbA1c Value Display with Color Coding
 * =================================================================
 * Displays an HbA1c percentage with a background color that indicates
 * how well-controlled the patient's diabetes is.
 *
 * Used in:
 *   - Patient list cards
 *   - Patient detail header
 *   - Dashboard statistics
 *
 * ADA Classification:
 *   < 5.7%   → Normal (no diabetes)      → Green
 *   5.7–6.4% → Prediabetes               → Yellow
 *   6.5–6.9% → At/Near Target            → Green (controlled diabetes)
 *   7.0–8.4% → Above Target              → Amber
 *   8.5–9.9% → Uncontrolled              → Orange
 *   ≥ 10.0%  → Severely Uncontrolled     → Red
 */

import { classifyHbA1c } from '@/lib/api';

/**
 * @param {object} props
 * @param {number} props.value  - HbA1c percentage (e.g. 7.2)
 * @param {string} [props.size] - 'sm', 'md' (default), or 'lg'
 * @param {boolean} [props.showLabel] - Show classification label next to number
 */
export default function HbA1cBadge({ value, size = 'md', showLabel = false }) {
  if (value == null) return <span className="text-gray-400 text-sm">—</span>;

  const { label, color } = classifyHbA1c(value);

  // Determine sizes
  const numberSize = { sm: 'text-sm', md: 'text-lg', lg: 'text-3xl' }[size];
  const unitSize   = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size];

  return (
    <span className="inline-flex items-baseline gap-0.5" aria-label={`HbA1c ${value}% — ${label}`}>
      <span className={`font-bold ${numberSize}`} style={{ color }}>
        {value.toFixed(1)}
      </span>
      <span className={`font-normal text-gray-500 ${unitSize}`}>%</span>
      {showLabel && (
        <span
          className={`ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full`}
          style={{ backgroundColor: `${color}20`, color }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
