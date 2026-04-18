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

  const { guestId, confirmed, count, notes } = req.body || {};

  const parsedGuestId = Number(guestId);
  const parsedCount = Number(count);

  if (!Number.isInteger(parsedGuestId) || parsedGuestId <= 0) {
    return res.status(400).json({ error: 'Invalid guestId' });
  }

  if (typeof confirmed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid confirmed value' });
  }

  if (!Number.isInteger(parsedCount) || parsedCount < 0 || parsedCount > 50) {
    return res.status(400).json({ error: 'Invalid attendance count' });
  }

  const safeNotes = typeof notes === 'string' ? notes.trim() : '';
  if (safeNotes.length > 500) {
    return res.status(400).json({ error: 'Notes too long' });
  }

  try {
    const result = await query(
      `
        UPDATE public.guests
        SET attendance_confirmed = $1,
            attendance_count = $2,
            attendance_notes = $3,
            confirmed_at = NOW()
        WHERE id = $4
        RETURNING *
      `,
      [confirmed, parsedCount, safeNotes, parsedGuestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error confirming attendance:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
