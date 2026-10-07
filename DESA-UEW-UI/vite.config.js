import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://api.senzapps.dpdns.org',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'desaseek.senzapps.dpdns.org'
    ],
  }
})
