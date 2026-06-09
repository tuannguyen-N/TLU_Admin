import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://tl-connect-app-latest.onrender.com',
        changeOrigin: true,
      }
    }
  }
})