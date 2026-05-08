/**
 * components/DiabetesTypeBadge.js - Diabetes Type Pill Badge
 * ============================================================
 * A small colored pill that displays the patient's diabetes type.
 * Different colors help staff quickly identify patient types at a glance.
 *
 * Type → Color mapping:
 *   Type 1        → Blue   (autoimmune, typically younger onset)
 *   Type 2        → Purple (most common, lifestyle/genetic)
 *   LADA          → Indigo (Type 1.5, autoimmune in adults)
 *   Gestational   → Pink   (pregnancy-related)
 *   Prediabetes   → Yellow (at risk, preventable)
 *   Other         → Gray
 */

/**
 * @param {object} props
 * @param {string} props.type - Diabetes type string from the API
 * @param {string} [props.size] - 'sm' (default) or 'lg'
 */
export default function DiabetesTypeBadge({ type, size = 'sm' }) {
  const { bgClass, textClass, label } = getTypeStyles(type);
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium
                  ${bgClass} ${textClass} ${sizeClass}`}
      // Aria label for screen readers
      aria-label={`Diabetes type: ${label}`}
    >
      {label}
    </span>
  );
}

/**
 * Map diabetes type string to Tailwind classes.
 * Centralised here so any future rebranding only needs one edit.
 */
function getTypeStyles(type) {
  const styles = {
    'Type 1':     { bgClass: 'bg-blue-100',   textClass: 'text-blue-800',   label: 'Type 1' },
    'Type 2':     { bgClass: 'bg-purple-100', textClass: 'text-purple-800', label: 'Type 2' },
    'LADA':       { bgClass: 'bg-indigo-100', textClass: 'text-indigo-800', label: 'LADA' },
    'Gestational':{ bgClass: 'bg-pink-100',   textClass: 'text-pink-800',   label: 'Gestational' },
    'Prediabetes':{ bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', label: 'Prediabetes' },
  };
  return styles[type] || { bgClass: 'bg-gray-100', textClass: 'text-gray-700', label: type || 'Unknown' };
}
