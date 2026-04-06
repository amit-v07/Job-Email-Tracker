import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Needed for docker
    allowedHosts: 'all', // Allow Tailscale and all external hostnames
    watch: {
      usePolling: true, // Needed for docker file watching on some OS
    },
    proxy: {
      // All /api calls are forwarded to the backend container
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})
