/**
 * pages/patients/index.js - Patient List Page
 * =============================================
 * Displays all patients with search, filter, and "Load More" pagination.
 *
 * Features:
 *   - Search by name (debounced 300ms to avoid excessive API calls)
 *   - Filter by diabetes type via dropdown
 *   - "Load More" button fetches the next page and appends to the list
 *   - Renders a <PatientCard> for each patient
 *
 * Pagination pattern:
 *   We use `skip` + `limit` (offset pagination) rather than cursor-based
 *   pagination because the API supports it and our dataset is small.
 *   State: `patients` array accumulates all loaded results.
 *          `skip` tracks the offset for the next fetch.
 *          `hasMore` hides the "Load More" button when exhausted.
 *
 * Search/filter pattern:
 *   When search or filter changes, reset `patients` to [] and `skip` to 0,
 *   then trigger a new first-page fetch with the new parameters.
 */

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PatientCard from '@/components/PatientCard';
import LoadMoreButton from '@/components/LoadMoreButton';
import { buildPatientsUrl, fetcher } from '@/lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;                // Patients per page (matches API default)

const DIABETES_TYPES = [
  '',            // All types (empty string = no filter)
  'Type 1',
  'Type 2',
  'LADA',
  'Gestational',
  'Prediabetes',
  'Other',
];

export default function PatientsPage() {
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────────────────
  const [patients,    setPatients]    = useState([]);    // Accumulated results
  const [skip,        setSkip]        = useState(0);     // Pagination offset
  const [hasMore,     setHasMore]     = useState(false); // Whether more pages exist
  const [isLoading,   setIsLoading]   = useState(false); // Loading indicator
  const [error,       setError]       = useState(null);  // Error message
  const [search,      setSearch]      = useState('');    // Search input value
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');    // Selected type filter

  // ── Debounce search input ─────────────────────────────────────────────────
  // Wait 300ms after user stops typing before triggering a fetch.
  // This avoids sending a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer); // Cancel timer if user types again
  }, [search]);

  // ── Reset when search or filter changes ──────────────────────────────────
  // When the query changes, start over from page 1.
  useEffect(() => {
    setPatients([]);
    setSkip(0);
    setHasMore(false);
    setError(null);
  }, [debouncedSearch, typeFilter]);

  // ── Fetch function ───────────────────────────────────────────────────────
  // Fetches one page of patients and appends results to state.
  // `currentSkip` is passed explicitly to avoid stale closure issues.
  const fetchPatients = useCallback(async (currentSkip) => {
    setIsLoading(true);
    setError(null);

    const url = buildPatientsUrl(currentSkip, PAGE_SIZE, debouncedSearch, typeFilter);

    try {
      const data = await fetcher(url);

      // Append new results to existing list
      setPatients((prev) =>
        currentSkip === 0
          ? data.patients           // First page: replace
          : [...prev, ...data.patients] // Subsequent pages: append
      );
      setHasMore(data.has_more);
      setSkip(currentSkip + PAGE_SIZE);

    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, typeFilter]);

  // ── Initial fetch on mount + when query changes ──────────────────────────
  useEffect(() => {
    fetchPatients(0);
  }, [fetchPatients]);

  // ── Load more handler ─────────────────────────────────────────────────────
  const handleLoadMore = () => fetchPatients(skip);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Patients — Diabetes EMR</title>
        <meta name="description" content="Diabetes patient list" />
      </Head>

      <Layout title="Patients">
        <div className="p-4 space-y-3">

          {/* ── Search input ─────────────────────────────────────────────── */}
          <div className="relative">
            {/* Search icon */}
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search patients by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
                         bg-white text-sm focus:outline-none focus:ring-2
                         focus:ring-primary-300 focus:border-transparent"
              aria-label="Search patients"
            />
            {/* Clear button — shown when there's text */}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* ── Type filter dropdown ─────────────────────────────────────── */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200
                       bg-white text-sm focus:outline-none focus:ring-2
                       focus:ring-primary-300 text-gray-700"
            aria-label="Filter by diabetes type"
          >
            <option value="">All Diabetes Types</option>
            {DIABETES_TYPES.filter(Boolean).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* ── Error state ──────────────────────────────────────────────── */}
          {error && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-700 text-sm">Failed to load patients: {error}</p>
            </div>
          )}

          {/* ── Empty state (after search returns nothing) ────────────────── */}
          {!isLoading && patients.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-4xl mb-2">🔍</p>
              <p className="text-gray-500 font-medium">No patients found</p>
              {(debouncedSearch || typeFilter) && (
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your search or filter
                </p>
              )}
            </div>
          )}

          {/* ── Patient list ─────────────────────────────────────────────── */}
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}

          {/* ── Initial loading skeleton ──────────────────────────────────── */}
          {isLoading && patients.length === 0 && (
            <div className="space-y-3">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="flex gap-3">
                    <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton w-2/3 h-4 rounded" />
                      <div className="skeleton w-1/2 h-3 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Patient count summary ─────────────────────────────────────── */}
          {patients.length > 0 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
              {(debouncedSearch || typeFilter) ? ' matching your filter' : ''}
            </p>
          )}

          {/* ── Load more ─────────────────────────────────────────────────── */}
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={isLoading && patients.length > 0} // Only show spinner on append-loads
            hasMore={hasMore}
          />

        </div>
      </Layout>
    </>
  );
}
