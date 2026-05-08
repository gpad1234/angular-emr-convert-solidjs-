/**
 * components/NavBar.js - Mobile Bottom Navigation Bar
 * =====================================================
 * Fixed to the bottom of the screen. Provides the primary navigation
 * for the mobile EMR app.
 *
 * Mobile-first design principle: bottom navigation is more thumb-friendly
 * than a top hamburger menu. The active route is highlighted in blue.
 *
 * Nav items:
 *   Dashboard  → /          (overview stats)
 *   Patients   → /patients  (patient list)
 *   Search     → /search    (patient search - placeholder for extension)
 */

import Link from 'next/link';
import { useRouter } from 'next/router';

// ── Navigation item definitions ───────────────────────────────────────────────
// To add new sections, append to this array.
const NAV_ITEMS = [
  {
    href:  '/',
    label: 'Dashboard',
    // SVG icon inline (no icon library dependency needed)
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-gray-400'}`}
           fill={active ? 'currentColor' : 'none'}
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href:  '/patients',
    label: 'Patients',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-gray-400'}`}
           fill={active ? 'currentColor' : 'none'}
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href:  '/patients?search=',
    label: 'Search',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-gray-400'}`}
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const router = useRouter();

  return (
    // Fixed to viewport bottom. z-50 keeps it above page content.
    // pb-safe adds padding for the iOS home indicator (safe area inset).
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          // Determine if this nav item matches the current route
          // Exact match for home, prefix match for other sections
          const isActive =
            href === '/'
              ? router.pathname === '/'
              : router.pathname.startsWith(href.split('?')[0]);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 min-w-0 flex-1
                          transition-colors duration-150
                          ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {icon(isActive)}
              <span className={`text-2xs font-medium truncate
                               ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
