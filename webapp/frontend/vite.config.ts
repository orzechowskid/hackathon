import react from '@vitejs/plugin-react';
import {
  defineConfig
} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [[
          'babel-plugin-styled-components', {
            displayName: true,
            fileName: false
          }]]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: process.env.FRONTEND_PORT ?? 3000
  }
});
