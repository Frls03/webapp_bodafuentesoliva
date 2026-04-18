// Vercel Serverless Function
// This code runs on the server.
import { query } from './_lib/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let safePassword = '';
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const password = body.password;
    safePassword = typeof password === 'string' ? password.trim() : '';
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!safePassword || safePassword.length > 100) {
    return res.status(400).json({ error: 'Password required' });
  }

  try {
    const result = await query(
      `
        SELECT id, names, message, created_at, attendance_confirmed,
               attendance_count, attendance_notes, confirmed_at, max_attendees
        FROM public.guests
        WHERE password = $1
        LIMIT 1
      `,
      [safePassword]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
