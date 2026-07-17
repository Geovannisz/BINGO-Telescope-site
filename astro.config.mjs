import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Define the official domain for SEO canonicals
const site = process.env.SITE_URL ?? 'https://bingotelescope.org';
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '') + '/';

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
