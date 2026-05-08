/**
 * components/LoadMoreButton.js - Paginated List "Load More" Control
 * ==================================================================
 * Reusable button placed at the bottom of any paginated list.
 *
 * Behavior:
 *   - Visible only when hasMore is true
 *   - Shows a spinner while isLoading is true
 *   - Calls onClick to trigger the next page fetch
 *
 * Usage:
 *   <LoadMoreButton
 *     onClick={loadNextPage}
 *     isLoading={isFetching}
 *     hasMore={data.has_more}
 *   />
 */

/**
 * @param {object}   props
 * @param {Function} props.onClick    - Called when user taps to load more
 * @param {boolean}  props.isLoading  - True while the next page is fetching
 * @param {boolean}  props.hasMore    - If false, the button is hidden entirely
 * @param {string}   [props.label]    - Override button text (default "Load More")
 */
export default function LoadMoreButton({
  onClick,
  isLoading,
  hasMore,
  label = 'Load More',
}) {
  // Don't render anything if there's no more data to load
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-2 pb-4">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full
                    border border-primary-200 text-primary-700 font-medium text-sm
                    transition-all duration-200
                    ${isLoading
                      ? 'opacity-70 cursor-not-allowed bg-gray-50'
                      : 'hover:bg-primary-50 active:scale-95 bg-white'
                    }`}
        aria-label={isLoading ? 'Loading more items...' : label}
      >
        {/* Spinner shown while loading */}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLoading ? 'Loading...' : label}
      </button>
    </div>
  );
}
