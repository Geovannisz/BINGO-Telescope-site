import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Define the official domain for SEO canonicals
const site = process.env.SITE_URL ?? 'https://bingotelescope.org';
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '') + '/';

export default defineConfig({
  site,
  base,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/404') && !page.includes('/team'),  // TODO: remove '/team' filter when team page is re-enabled
      serialize(item) {
        // Home page — highest priority
        if (item.url === `${site}/` || item.url === site) {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        }
        // News pages — change often
        else if (item.url.includes('/news')) {
          item.changefreq = 'daily';
          item.priority = 0.8;
        }
        // Main content pages
        else if (/\/(about|science|instrumentation|location|team|publications|abdus|uirapuru|outreach)\/?$/.test(new URL(item.url).pathname)) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        }
        // Individual team/news pages
        else {
          item.changefreq = 'monthly';
          item.priority = 0.5;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
