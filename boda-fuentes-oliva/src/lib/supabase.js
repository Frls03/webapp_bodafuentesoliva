import { createClient } from '@supabase/supabase-js';
import { 
  validateName, 
  validateMessage, 
  validateNotes, 
  validatePassword,
  validateUsername,
  validateAttendanceCount 
} from '../utils/validation';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isDev = import.meta.env.DEV;
const USE_API = import.meta.env.PROD;

console.log(`🔧 Modo: ${isDev ? 'DESARROLLO' : 'PRODUCCIÓN'} | APIs: ${USE_API ? '/api/*' : 'Supabase directo'}`);

export const getGuestByPassword = async (password) => {
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

export const confirmAttendance = async (guestId, attendanceData) => {
  try {
    const countValidation = validateAttendanceCount(attendanceData.count);
    const notesValidation = validateNotes(attendanceData.notes);

    if (!countValidation.isValid || !notesValidation.isValid) {
      return { 
        success: false, 
        error: countValidation.error || notesValidation.error 
      };
    }

    const { data, error } = await supabase
      .from('guests')
      .update({
        attendance_confirmed: attendanceData.confirmed,
        attendance_count: countValidation.sanitized,
        attendance_notes: notesValidation.sanitized,
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

export const adminLogin = async (username, password) => {
  try {
    if (USE_API) {
      console.log('🔐 Attempting admin login via API...');
      console.log('API URL:', '/api/admin-login');
      
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        console.log('✅ Login successful');
        return result.admin;
      }

      console.error('❌ Admin login error:', result.error);
      return null;
    }
    
    console.log('🔐 Using direct Supabase login (dev mode)');
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
    console.error('❌ Unexpected error in adminLogin:', err);
    return null;
  }
};

// Función para obtener estadísticas de asistencia (solo admins)
export const getAttendanceStats = async () => {
  try {
    // En producción, usar API
    if (USE_API) {
      const response = await fetch('/api/get-stats');
      const result = await response.json();
      if (result.success) return result.attendance;
      console.error('Error fetching stats:', result.error);
      return { total: 0, confirmed: 0, pending: 0, guests: [] };
    }
    
    // En desarrollo, acceso directo
    const { data, error} = await supabase
      .from('guests')
      .select('id, names, attendance_confirmed, attendance_count, attendance_notes, confirmed_at, password')
      .order('confirmed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return { total: 0, confirmed: 0, pending: 0, guests: [] };
    }

    const confirmed = data.filter(g => g.attendance_confirmed === true).length;
    const declined = data.filter(g => g.attendance_confirmed === false).length;
    const pending = data.filter(g => g.attendance_confirmed === null).length;
    const totalAttendees = data.reduce((sum, g) => sum + (g.attendance_count || 0), 0);

    return {
      total: data.length,
      confirmed,
      declined,
      pending,
      totalAttendees,
      guests: data
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { total: 0, confirmed: 0, pending: 0, guests: [] };
  }
};



// Función para enviar confirmación del Save The Date (sin autenticación)
export const submitSaveTheDateRSVP = async (fullName, willAttend, notes = '') => {
  try {
    // Validación en el backend
    const nameValidation = validateName(fullName);
    const notesValidation = validateNotes(notes);

    if (!nameValidation.isValid || !notesValidation.isValid) {
      return { 
        success: false, 
        error: nameValidation.error || notesValidation.error 
      };
    }

    const { data, error } = await supabase
      .from('save_the_date_rsvp')
      .insert([
        {
          full_name: nameValidation.sanitized,
          will_attend: willAttend,
          notes: notesValidation.sanitized
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting Save The Date RSVP:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const getSaveTheDateStats = async () => {
  try {
    if (USE_API) {
      const response = await fetch('/api/get-stats');
      const result = await response.json();
      if (result.success) return result.saveTheDate;
      console.error('Error fetching Save The Date stats:', result.error);
      return { total: 0, confirmed: 0, declined: 0, responses: [] };
    }
    
    const { data, error } = await supabase
      .from('save_the_date_rsvp')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Save The Date stats:', error);
      return { total: 0, confirmed: 0, declined: 0, responses: [] };
    }

    const confirmed = data.filter(r => r.will_attend === true).length;
    const declined = data.filter(r => r.will_attend === false).length;

    return {
      total: data.length,
      confirmed,
      declined,
      responses: data
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { total: 0, confirmed: 0, declined: 0, responses: [] };
  }
};

export const getTables = async () => {
  try {
    if (USE_API) {
      const response = await fetch('/api/manage-tables?type=tables');
      const result = await response.json();
      if (result.success) return result.data;
      console.error('Error fetching tables:', result.error);
      return [];
    }
    
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching tables:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

export const createTable = async (name, capacity = 10) => {
  try {
    if (USE_API) {
      const response = await fetch('/api/manage-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'table', name, capacity })
      });
      const result = await response.json();
      if (result.success) return { success: true, data: result.data };
      console.error('Error creating table:', result.error);
      return { success: false, error: result.error };
    }
    
    const { data, error } = await supabase
      .from('tables')
      .insert([{ name, capacity }])
      .select()
      .single();

    if (error) {
      console.error('Error creating table:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const deleteTable = async (tableId) => {
  try {
    if (USE_API) {
      const response = await fetch('/api/manage-tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'table', id: tableId })
      });
      const result = await response.json();
      if (result.success) return { success: true };
      console.error('Error deleting table:', result.error);
      return { success: false, error: result.error };
    }
    
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', tableId);

    if (error) {
      console.error('Error deleting table:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const getTableAssignments = async () => {
  try {
    if (USE_API) {
      const response = await fetch('/api/manage-tables?type=assignments');
      const result = await response.json();
      if (result.success) return result.data;
      console.error('Error fetching assignments:', result.error);
      return [];
    }
    
    const { data, error } = await supabase
      .from('table_assignments')
      .select('*, tables(*)')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

export const assignGuestToTable = async (tableId, guestName, sourceType, guestId = null) => {
  try {
    if (USE_API) {
      const response = await fetch('/api/manage-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assignment',
          table_id: tableId,
          guest_name: guestName,
          source_type: sourceType,
          guest_id: guestId
        })
      });
      const result = await response.json();
      if (result.success) return { success: true, data: result.data };
      console.error('Error assigning guest:', result.error);
      return { success: false, error: result.error };
    }
    
    const { data, error } = await supabase
      .from('table_assignments')
      .insert([{
        table_id: tableId,
        guest_name: guestName,
        source_type: sourceType,
        guest_id: guestId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error assigning guest:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const removeGuestFromTable = async (assignmentId) => {
  try {
    if (USE_API) {
      const response = await fetch('/api/manage-tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'assignment', id: assignmentId })
      });
      const result = await response.json();
      if (result.success) return { success: true };
      console.error('Error removing guest:', result.error);
      return { success: false, error: result.error };
    }
    
    const { error } = await supabase
      .from('table_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing guest:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const saveGuestMessage = async (guestId, senderName, message) => {
  try {
    const nameValidation = validateName(senderName);
    const messageValidation = validateMessage(message);

    if (!nameValidation.isValid || !messageValidation.isValid) {
      return { 
        success: false, 
        error: nameValidation.error || messageValidation.error 
      };
    }

    const { data, error } = await supabase
      .from('guest_messages')
      .insert([{
        guest_id: guestId,
        sender_name: nameValidation.sanitized,
        message: messageValidation.sanitized,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const getAllMessages = async () => {
  try {
    if (USE_API) {
      const response = await fetch('/api/get-messages');
      const result = await response.json();
      if (result.success) return result.messages;
      console.error('Error fetching messages:', result.error);
      return [];
    }
    
    const { data, error } = await supabase
      .from('guest_messages')
      .select(`
        *,
        guests (
          names,
          password
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

