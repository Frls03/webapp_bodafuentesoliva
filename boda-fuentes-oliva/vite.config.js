// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const injectedPort = Number(process.env.PORT || 0)
const isVercelDev = Number.isFinite(injectedPort) && injectedPort > 0

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // escucha en 0.0.0.0 (necesario para túneles)
    port: isVercelDev ? injectedPort : 5173,
    strictPort: isVercelDev,
    // Opción A: permitir solo tu dominio ngrok actual
    // allowedHosts: ['fortuitous-juliette-unrhetorical.ngrok-free.dev'],

    // Opción B: permitir cualquier host (más cómodo si el subdominio cambia)
    allowedHosts: true,

    // Proxy para las API calls al backend de Vercel
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    // aplica la misma regla para `vite preview` si lo usas
    allowedHosts: true
  }
})