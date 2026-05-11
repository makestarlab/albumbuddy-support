import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/albumbuddy-support/',
  server: {
    proxy: {
      '/zendesk-api': {
        target: 'https://albumbuddy.zendesk.com/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zendesk-api/, ''),
      },
    },
  },
});
