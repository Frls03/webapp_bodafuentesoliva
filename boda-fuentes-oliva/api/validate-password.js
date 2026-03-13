// Vercel Serverless Function
// Este código se ejecuta en el servidor, no en el navegador
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, applyRateLimitHeaders } from './_lib/rateLimit';

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

  const normalizedPassword = String(password).trim().toLowerCase();
  if (normalizedPassword.length < 4 || normalizedPassword.length > 50) {
    return res.status(400).json({ error: 'Invalid password format' });
  }

  const RATE_LIMIT = 10;
  const WINDOW_MS = 5 * 60 * 1000;
  const rateLimitResult = checkRateLimit({
    req,
    keyPrefix: 'validate-password',
    limit: RATE_LIMIT,
    windowMs: WINDOW_MS
  });

  applyRateLimitHeaders(res, rateLimitResult, RATE_LIMIT);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  }

  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('password', normalizedPassword)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { password: _, ...safeGuestData } = data;

    return res.status(200).json(safeGuestData);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
