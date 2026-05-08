/**
 * components/Layout.js - Mobile-First Page Layout Wrapper
 * =========================================================
 * Every page wraps its content in this component to get:
 *   1. Consistent max-width centering (looks good on desktop too)
 *   2. Bottom navigation bar padding (content doesn't hide behind nav)
 *   3. Page title in the top header
 *   4. Optional back button
 *
 * Usage:
 *   <Layout title="Patient List">
 *     <PatientList />
 *   </Layout>
 */

import Head from 'next/head';
import NavBar from './NavBar';

/**
 * @param {object}    props
 * @param {string}    props.title       - Page title (shown in <head> and header)
 * @param {ReactNode} props.children    - Page content
 * @param {boolean}   [props.showBack]  - Show a back arrow in the header
 * @param {function}  [props.onBack]    - Callback when back arrow is tapped
 * @param {ReactNode} [props.headerRight] - Optional element placed top-right in header
 */
export default function Layout({ title, children, showBack, onBack, headerRight }) {
  return (
    <>
      {/* ── HTML <head> ─────────────────────────────────────────────────────── */}
      <Head>
        {/* Each page has its own title for browser tabs and screen readers */}
        <title>{title ? `${title} — Diabetes EMR` : 'Diabetes EMR'}</title>
        <meta name="description" content="Diabetes-focused Electronic Medical Records" />
        {/* Viewport meta is critical for mobile — disables browser zoom scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* viewport-fit=cover extends layout into iPhone notch/Dynamic Island area */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── App shell ────────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-gray-50 flex flex-col">

        {/* ── Top header bar ────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 pt-safe">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">

            {/* Left: back button or spacer */}
            <div className="w-10">
              {showBack && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Go back"
                >
                  {/* Left chevron SVG */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Center: page title */}
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {title || 'Diabetes EMR'}
            </h1>

            {/* Right: optional action (e.g. add button, avatar) */}
            <div className="w-10 flex justify-end">
              {headerRight || null}
            </div>

          </div>
        </header>

        {/* ── Main content area ─────────────────────────────────────────────── */}
        {/* pb-24 ensures content scrolls above the 64px bottom nav bar */}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
          {children}
        </main>

        {/* ── Bottom navigation ─────────────────────────────────────────────── */}
        <NavBar />
      </div>
    </>
  );
}
