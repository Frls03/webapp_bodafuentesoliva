// Simulador de API local para desarrollo
// Solo se usa en desarrollo, en producción Vercel maneja las rutas /api/*
import { createClient } from '@supabase/supabase-js';

const isDev = import.meta.env.DEV;

// En desarrollo, simulamos las APIs sin necesidad de Vercel Dev
if (isDev) {
  console.log('🔧 Modo desarrollo: APIs funcionando directamente desde el frontend');
}

// Helper para usar service key en desarrollo
const getSupabaseClient = () => {
  if (isDev) {
    // En desarrollo, podemos usar service key directamente
    // ⚠️ IMPORTANTE: Esto solo funciona en desarrollo local
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY // En dev usamos anon key con RLS desactivado temporalmente
    );
  }
  return null;
};

export const devApiHelper = {
  isDev,
  getSupabaseClient
};
