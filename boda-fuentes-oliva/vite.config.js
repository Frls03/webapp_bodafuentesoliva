// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // escucha en 0.0.0.0 (necesario para túneles)
    port: 5173,
    strictPort: true,
    // Opción A: permitir solo tu dominio ngrok actual
    // allowedHosts: ['fortuitous-juliette-unrhetorical.ngrok-free.dev'],

    // Opción B: permitir cualquier host (más cómodo si el subdominio cambia)
    allowedHosts: true,

    // HMR sobre HTTPS del túnel (evita fallos de websocket)
    hmr: {
      protocol: 'wss',
      host: 'fortuitous-juliette-unrhetorical.ngrok-free.dev', // o deja vacío si usas allowedHosts:true
      clientPort: 443
    }
  },
  preview: {
    // aplica la misma regla para `vite preview` si lo usas
    allowedHosts: true
  }
})