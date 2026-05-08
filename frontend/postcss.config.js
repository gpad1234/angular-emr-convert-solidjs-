/** postcss.config.js
 * PostCSS processes CSS files during the Next.js build.
 * - tailwindcss:  Generates utility classes from tailwind.config.js
 * - autoprefixer: Adds vendor prefixes (e.g. -webkit-) for browser compatibility
 * These are the standard plugins for all Tailwind CSS projects.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
