// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [vue()],
  build: {
    inlineStylesheets: 'auto',
    target: 'esnext',
  },
  vite: {
    build: {
      target: 'esnext',
      minify: 'terser',
      cssMinify: true,
    },
    optimizeDeps: {
      include: ['vue'],
    },
  },
  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: true,
  },
});