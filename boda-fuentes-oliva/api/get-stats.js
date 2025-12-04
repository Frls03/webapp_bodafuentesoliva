// Vercel Serverless Function - Get Stats
// Obtiene estadísticas de asistencia y Save The Date
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Service key para bypasear RLS
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Obtener estadísticas de invitación
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, names, attendance_confirmed, attendance_count, attendance_notes, confirmed_at, password')
      .order('confirmed_at', { ascending: false, nullsFirst: false });

    if (guestsError) {
      throw guestsError;
    }

    const confirmed = guests.filter(g => g.attendance_confirmed === true).length;
    const declined = guests.filter(g => g.attendance_confirmed === false).length;
    const pending = guests.filter(g => g.attendance_confirmed === null).length;
    const totalAttendees = guests.reduce((sum, g) => sum + (g.attendance_count || 0), 0);

    // Obtener estadísticas de Save The Date
    const { data: saveTheDate, error: stdError } = await supabase
      .from('save_the_date_rsvp')
      .select('*')
      .order('created_at', { ascending: false });

    if (stdError) {
      throw stdError;
    }

    const stdConfirmed = saveTheDate.filter(r => r.will_attend === true).length;
    const stdDeclined = saveTheDate.filter(r => r.will_attend === false).length;

    // Devolver ambas estadísticas
    return res.status(200).json({
      success: true,
      attendance: {
        total: guests.length,
        confirmed,
        declined,
        pending,
        totalAttendees,
        guests
      },
      saveTheDate: {
        total: saveTheDate.length,
        confirmed: stdConfirmed,
        declined: stdDeclined,
        responses: saveTheDate
      }
    });

  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
