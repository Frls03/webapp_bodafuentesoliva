// Vercel Serverless Function - Get Stats
// Gets attendance and Save The Date stats.
import { query } from './_lib/neon.js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const guestsResult = await query(
      `
        SELECT id, names, attendance_confirmed, attendance_count,
               attendance_notes, confirmed_at, password
        FROM public.guests
        ORDER BY confirmed_at DESC NULLS LAST
      `
    );

    const guests = guestsResult.rows;

    const confirmed = guests.filter(g => g.attendance_confirmed === true).length;
    const declined = guests.filter(g => g.attendance_confirmed === false).length;
    const pending = guests.filter(g => g.attendance_confirmed === null).length;
    const totalAttendees = guests.reduce((sum, g) => sum + (g.attendance_count || 0), 0);

    const saveTheDateResult = await query(
      `
        SELECT *
        FROM public.save_the_date_rsvp
        ORDER BY created_at DESC
      `
    );

    const saveTheDate = saveTheDateResult.rows;

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
