import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Auto-detect GitHub Actions so the workflow file never needs to be modified.
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const site = process.env.SITE_URL ?? (isGitHubActions ? 'https://geovannisz.github.io/BINGO-Telescope-site' : 'https://glittery-unicorn-e798c2.netlify.app');
const base = process.env.BASE_PATH ?? (isGitHubActions ? '/BINGO-Telescope-site' : '/');

export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
