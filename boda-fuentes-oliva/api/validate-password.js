// Vercel Serverless Function
// Este código se ejecuta en el servidor, no en el navegador
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Credenciales SOLO en el servidor
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // ⬅️ Service key (más privilegios)
  );

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  try {
    const { data, error } = await supabase
      .from('guests')
      .select('id, names, message') // NO devolver password
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
