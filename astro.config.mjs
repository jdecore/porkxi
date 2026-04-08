// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: '/src/vue-app.ts',
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        }
      }
    })
  ],
  build: {
    inlineStylesheets: 'always',
  },
  experimental: {
    clientPrerender: false
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['astro:components']
      }
    }
  }
});
