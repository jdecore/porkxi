// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: '/src/vue-app.ts',
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
