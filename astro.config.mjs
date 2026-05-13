import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://geovannisz.github.io',
  base: '/BINGO-Telescope-site',
  vite: {
    plugins: [tailwindcss()],
  },
});
