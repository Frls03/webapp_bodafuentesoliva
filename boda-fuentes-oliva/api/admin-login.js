// Vercel Serverless Function - Admin Login
// This code runs on the server.
import { query } from './_lib/neon.js';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username, password } = req.body || {};
  const safeUsername = typeof username === 'string' ? username.trim() : '';
  const safePassword = typeof password === 'string' ? password.trim() : '';

  // Validación básica
  if (!safeUsername || !safePassword) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Validación de longitud (prevenir DoS)
  if (safeUsername.length > 50 || safePassword.length > 100) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  try {
    const result = await query(
      `
        SELECT id, username
        FROM public.admins
        WHERE username = $1 AND password = $2
        LIMIT 1
      `,
      [safeUsername, safePassword]
    );

    if (result.rowCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const data = result.rows[0];

    return res.status(200).json({
      success: true,
      admin: {
        id: data.id,
        username: data.username
      }
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
