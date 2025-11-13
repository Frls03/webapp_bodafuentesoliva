import { createClient } from '@supabase/supabase-js';

// Configuración desde variables de entorno
// Las credenciales NO están hardcodeadas en el código
// Para desarrollo: usa archivo .env
// Para producción: configura en Vercel Dashboard

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de que las variables existen
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para validar contraseña y obtener datos del invitado
export const validatePassword = async (password) => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error validating password:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Función para obtener todos los invitados (opcional, para admin)
export const getAllGuests = async () => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching guests:', error);
    return [];
  }

  return data;
};

// Función para confirmar asistencia
export const confirmAttendance = async (guestId, attendanceData) => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .update({
        attendance_confirmed: attendanceData.confirmed,
        attendance_count: attendanceData.count || 0,
        attendance_notes: attendanceData.notes || '',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', guestId)
      .select()
      .single();

    if (error) {
      console.error('Error confirming attendance:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

// Función para login de administradores (novios)
export const adminLogin = async (username, password) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Admin login error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Función para obtener estadísticas de asistencia (solo admins)
export const getAttendanceStats = async () => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('id, names, attendance_confirmed, attendance_count, attendance_notes, confirmed_at, password')
      .order('confirmed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return { total: 0, confirmed: 0, pending: 0, guests: [] };
    }

    const confirmed = data.filter(g => g.attendance_confirmed).length;
    const totalAttendees = data.reduce((sum, g) => sum + (g.attendance_count || 0), 0);

    return {
      total: data.length,
      confirmed,
      pending: data.length - confirmed,
      totalAttendees,
      guests: data
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { total: 0, confirmed: 0, pending: 0, guests: [] };
  }
};

