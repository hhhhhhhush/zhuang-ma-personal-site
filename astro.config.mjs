import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { visit } from './src/lib/markdown-paths.mjs';

const site = process.env.SITE_URL || 'https://example.com';
const base = process.env.BASE_PATH || '/';
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (url) => !url.endsWith('/404/') && !url.endsWith('/admin/') })],
  markdown: {
    processor: unified({
      remarkPlugins: [[visit, { base }]],
      shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
    }),
  },
});
