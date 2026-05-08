/**
 * components/GlucoseChart.js - Blood Glucose Timeline Chart
 * ===========================================================
 * Renders a line chart of blood glucose readings over time using Recharts.
 *
 * WHY dynamic import?
 *   Recharts uses browser-only APIs (SVG, DOM measurements) that fail
 *   during Next.js server-side rendering (SSR). We use next/dynamic with
 *   ssr: false to load Recharts only in the browser.
 *   The `loading` placeholder prevents layout shift during hydration.
 *
 * Chart features:
 *   - Reference lines for normal range (70 mg/dL – 180 mg/dL)
 *   - Color-coded dots (green = normal, red = high/low)
 *   - Custom tooltip showing value, type, and time
 *   - Responsive container adapts to any screen width
 */

import dynamic from 'next/dynamic';
import { classifyGlucose, formatDateTime } from '@/lib/api';

// ── Lazy-load Recharts components (browser-only) ──────────────────────────────
// Each Recharts component is individually importable to minimize bundle size.
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Dot,
} = {
  // We import these dynamically inside a no-SSR wrapper below.
  // This object is a placeholder; actual components come from DynamicChart.
};

/**
 * Client-side-only chart component.
 * Wrapped in dynamic() at the bottom of this file.
 */
function GlucoseChartInner({ readings }) {
  const {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ReferenceLine, ResponsiveContainer,
  } = require('recharts');

  if (!readings || readings.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No glucose readings available
      </div>
    );
  }

  // ── Transform API data for Recharts ────────────────────────────────────────
  // Recharts expects an array of plain objects with consistent keys.
  // We reverse the array so the chart shows oldest → newest left → right.
  const chartData = [...readings]
    .reverse()  // API returns newest-first; chart wants oldest-first
    .map((r) => ({
      time:        formatDateTime(r.reading_datetime),
      value:       Math.round(r.value_mgdl),
      type:        r.reading_type,
      // Color each dot based on the glucose classification
      dotColor:    classifyGlucose(r.value_mgdl).color,
    }));

  return (
    // ResponsiveContainer fills the parent width; height is fixed in px.
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={chartData}
        // Compact margins for mobile
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        {/* Grid lines — help read exact values */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* X axis — timestamps (abbreviated) */}
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          // Only show a subset of labels to avoid crowding on mobile
          interval="preserveStartEnd"
          // Truncate long labels
          tickFormatter={(t) => t.split(',')[0]}  // "May 5" instead of "May 5, 2:30 PM"
        />

        {/* Y axis — glucose values (mg/dL) */}
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
        />

        {/* Custom tooltip shown on hover/tap */}
        <Tooltip content={<CustomTooltip />} />

        {/* ── Reference lines for clinical target range ─────────────────── */}
        {/* Upper limit: 180 mg/dL (post-meal target) */}
        <ReferenceLine
          y={180}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{ value: '180', position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }}
        />
        {/* Lower limit: 70 mg/dL (hypoglycemia threshold) */}
        <ReferenceLine
          y={70}
          stroke="#ef4444"
          strokeDasharray="4 4"
          label={{ value: '70', position: 'insideBottomRight', fontSize: 9, fill: '#ef4444' }}
        />

        {/* ── Glucose line ───────────────────────────────────────────────── */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"        // Blue line
          strokeWidth={2}
          dot={<ColoredDot />}    // Custom dot that inherits color from data
          activeDot={{ r: 5, stroke: '#1d4ed8', strokeWidth: 2 }}
          connectNulls             // Don't break line on missing data
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Custom dot component — colors each dot based on glucose classification.
 * Recharts passes dot props (cx, cy, payload) automatically.
 */
function ColoredDot({ cx, cy, payload }) {
  if (!cx || !cy) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={payload?.dotColor || '#3b82f6'}
      stroke="white"
      strokeWidth={1.5}
    />
  );
}

/**
 * Custom tooltip content displayed on hover/tap.
 * Shows glucose value, classification, reading type, and timestamp.
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { value, type, time } = payload[0].payload;
  const { label, color } = classifyGlucose(value);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-bold text-gray-900 text-sm">
        <span style={{ color }}>{value}</span>
        <span className="text-gray-400 font-normal"> mg/dL</span>
      </p>
      <p style={{ color }} className="font-medium">{label}</p>
      <p className="text-gray-500">{type}</p>
      <p className="text-gray-400 mt-1">{time}</p>
    </div>
  );
}

// ── Dynamic (no-SSR) export ───────────────────────────────────────────────────
// Wraps GlucoseChartInner so it only renders in the browser.
// The `loading` component shows while the JS is hydrating.
const GlucoseChart = dynamic(() => Promise.resolve(GlucoseChartInner), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] flex items-center justify-center">
      <div className="skeleton w-full h-full rounded-xl" />
    </div>
  ),
});

export default GlucoseChart;
