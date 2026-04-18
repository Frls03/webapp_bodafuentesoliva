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

  const { guestId, senderName, message } = req.body || {};

  const parsedGuestId = Number(guestId);
  const safeSenderName = typeof senderName === 'string' ? senderName.trim() : '';
  const safeMessage = typeof message === 'string' ? message.trim() : '';

  if (!Number.isInteger(parsedGuestId) || parsedGuestId <= 0) {
    return res.status(400).json({ error: 'Invalid guestId' });
  }

  if (!safeSenderName || safeSenderName.length > 120) {
    return res.status(400).json({ error: 'Invalid sender name' });
  }

  if (!safeMessage || safeMessage.length > 1200) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    const result = await query(
      `
        INSERT INTO public.guest_messages (guest_id, sender_name, message, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `,
      [parsedGuestId, safeSenderName, safeMessage]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving guest message:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
