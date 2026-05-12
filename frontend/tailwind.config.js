/** @type {import('tailwindcss').Config} */

/**
 * tailwind.config.js - Tailwind CSS Configuration
 * =================================================
 * Tailwind scans the files in `content` to find class names used,
 * then generates only those CSS rules (tree-shaking unused styles).
 *
 * Custom theme extensions add medical-specific colors and sizes.
 * The `medical` color palette is used throughout the EMR for
 * consistent glucose level coloring, alert states, etc.
 */

module.exports = {
  // ── Tell Tailwind where to look for class names ─────────────────────────
  // If you add new file locations (e.g. src/), add them here.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── Inter font via CSS variable (set in _app.js) ─────────────────────
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ── Custom color palette ───────────────────────────────────────────────
      colors: {
        // Primary brand colors — teal/cyan for a modern clinical feel
        primary: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
        // Glucose level colors — used for visual urgency coding
        glucose: {
          critical: "#dc2626",   // < 54 mg/dL  (Critical Low — red)
          low:      "#f59e0b",   // 54-69 mg/dL  (Low — amber)
          normal:   "#16a34a",   // 70-130 mg/dL (Normal — green)
          elevated: "#d97706",   // 131-180 mg/dL (Slightly High — orange)
          high:     "#dc2626",   // > 180 mg/dL  (High — red)
        },
        // HbA1c level colors
        hba1c: {
          good:     "#16a34a",   // < 7.0%
          moderate: "#f59e0b",   // 7.0-8.5%
          poor:     "#dc2626",   // > 8.5%
        },
      },

      // ── Safe area insets for mobile (notch/home bar) ──────────────────────
      // Used with pb-safe to pad content above the iPhone home indicator
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },

      // ── Font size adjustments for mobile readability ───────────────────────
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],   // 10px
      },
    },
  },

  plugins: [],
};
