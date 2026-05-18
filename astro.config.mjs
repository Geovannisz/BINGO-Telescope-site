import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Auto-detect GitHub Actions so the workflow file never needs to be modified.
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
// Define the official domain for SEO canonicals
const site = process.env.SITE_URL ?? 'https://bingotelescope.com';
const base = (process.env.BASE_PATH ?? (isGitHubActions ? '/BINGO-Telescope-site/' : '/')).replace(/\/$/, '') + '/';

export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
