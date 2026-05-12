/**
 * pages/_app.js - Next.js Application Root
 * ==========================================
 * This file wraps every page in the app. It's the place to:
 *   1. Import global CSS (must happen here, not in individual pages)
 *   2. Configure SWR defaults (fetcher, error retry, refresh intervals)
 *   3. Add any global providers (auth, theme, etc.)
 *
 * SWR Configuration:
 *   - `fetcher`: The default function used by all `useSWR` hooks.
 *     Defined in lib/api.js — it calls fetch() and throws on non-2xx.
 *   - `revalidateOnFocus: false`: Don't re-fetch when the user switches
 *     back to the tab. In an EMR, we don't need real-time updates; manual
 *     refresh is fine and avoids unnecessary network calls.
 *   - `shouldRetryOnError: false`: Don't silently retry failed requests.
 *     In a clinical setting, errors should be visible, not hidden.
 */

import { SWRConfig } from 'swr';
import { Inter } from 'next/font/google';
import { fetcher } from '@/lib/api';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * @param {object} props
 * @param {React.ComponentType} props.Component - The active page component
 * @param {object} props.pageProps - Props pre-fetched by getServerSideProps/getStaticProps
 */
export default function App({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        dedupingInterval: 5000,
      }}
    >
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </SWRConfig>
  );
}
