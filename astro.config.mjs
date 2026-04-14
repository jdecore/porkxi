// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [ vue() ],
  build: {
    inlineStylesheets: 'always',
    // Activar Brotli/Gzip para mejorar el rendimiento
    brotli: true,
    gzip: true,
  },
});
