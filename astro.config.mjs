// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [ vue() ],
  output: 'static',
  build: {
    inlineStylesheets: 'always',
    // Activar Brotli/Gzip para mejorar el rendimiento
    brotli: true,
    gzip: true,
  },
});
