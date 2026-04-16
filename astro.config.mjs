// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://porkxi.com',
  integrations: [ vue(), sitemap() ],
  adapter: vercel(),
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
});
