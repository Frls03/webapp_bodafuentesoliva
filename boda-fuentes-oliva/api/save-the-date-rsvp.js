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

  const { fullName, willAttend, notes } = req.body || {};

  const safeFullName = typeof fullName === 'string' ? fullName.trim() : '';
  const safeNotes = typeof notes === 'string' ? notes.trim() : '';

  if (!safeFullName || safeFullName.length > 120) {
    return res.status(400).json({ error: 'Invalid full name' });
  }

  if (typeof willAttend !== 'boolean') {
    return res.status(400).json({ error: 'Invalid attendance value' });
  }

  if (safeNotes.length > 500) {
    return res.status(400).json({ error: 'Notes too long' });
  }

  try {
    const result = await query(
      `
        INSERT INTO public.save_the_date_rsvp (full_name, will_attend, notes)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [safeFullName, willAttend, safeNotes]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving Save The Date RSVP:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
