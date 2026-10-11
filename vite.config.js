import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_LOCAL_BACKEND ? 'http://localhost:3000' : 'https://crisos-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
