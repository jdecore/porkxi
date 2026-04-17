// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const deployTarget = process.env.DEPLOY_TARGET || 'vercel';
const astroBase = process.env.ASTRO_BASE || '/';
const siteUrl = process.env.SITE_URL || 'https://porkxi.com';

export default defineConfig({
  site: siteUrl,
  base: astroBase,
  integrations: [vue(), sitemap()],
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
  ...(deployTarget === 'vercel' ? { adapter: vercel() } : {}),
});
