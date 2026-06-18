import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static (SSG) output so every page is pre-rendered HTML with its own <head>/OG —
// keeps link previews + Google indexing working. Deployed to GitHub Pages at the
// custom domain root (badbills.ca).
export default defineConfig({
  site: 'https://badbills.ca',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
