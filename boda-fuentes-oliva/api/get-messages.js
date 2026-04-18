// Vercel Serverless Function - Get Messages
// Gets all guest messages.
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
    const result = await query(
      `
        SELECT gm.*, g.names AS guest_names, g.password AS guest_password
        FROM public.guest_messages gm
        LEFT JOIN public.guests g ON g.id = gm.guest_id
        ORDER BY gm.created_at DESC
      `
    );

    const messages = result.rows.map(row => ({
      id: row.id,
      guest_id: row.guest_id,
      sender_name: row.sender_name,
      message: row.message,
      created_at: row.created_at,
      guests: row.guest_names || row.guest_password
        ? {
            names: row.guest_names,
            password: row.guest_password
          }
        : null
    }));

    return res.status(200).json({
      success: true,
      messages
    });

  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
