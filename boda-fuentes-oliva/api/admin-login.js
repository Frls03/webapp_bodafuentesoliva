// Vercel Serverless Function - Admin Login
// Este código se ejecuta en el servidor, NO en el navegador
import { createClient } from '@supabase/supabase-js';

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

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { username, password } = req.body;

  // Validación básica
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Validación de longitud (prevenir DoS)
  if (username.length > 50 || password.length > 50) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

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
