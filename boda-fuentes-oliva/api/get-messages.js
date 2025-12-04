// Vercel Serverless Function - Get Messages
// Obtiene todos los mensajes de invitados
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
    const { data, error } = await supabase
      .from('guest_messages')
      .select(`
        *,
        guests (
          names,
          password
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      messages: data
    });

  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
