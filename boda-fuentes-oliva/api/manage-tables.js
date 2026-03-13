// Vercel Serverless Function - Manage Tables
// CRUD completo para mesas y asignaciones
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Service key para bypasear RLS
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // ========================================
    // GET - Obtener mesas y asignaciones
    // ========================================
    if (req.method === 'GET') {
      const { type } = req.query;

      if (type === 'tables') {
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      if (type === 'assignments') {
        const { data, error } = await supabase
          .from('table_assignments')
          .select('*')
          .order('table_id', { ascending: true });

        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    // ========================================
    // POST - Crear mesa o asignación
    // ========================================
    if (req.method === 'POST') {
      const { type, ...data } = req.body;

      if (type === 'table') {
        const { name, capacity } = data;
        const { data: result, error } = await supabase
          .from('tables')
          .insert([{ name, capacity: capacity || 10 }])
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ success: true, data: result });
      }

      if (type === 'assignment') {
        const { table_id, guest_name, source_type, guest_id } = data;
        const { data: result, error } = await supabase
          .from('table_assignments')
          .insert([{ table_id, guest_name, source_type, guest_id }])
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ success: true, data: result });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    // ========================================
    // DELETE - Eliminar mesa o asignación
    // ========================================
    if (req.method === 'DELETE') {
      const { type, id } = req.body;

      if (type === 'table') {
        const { error } = await supabase
          .from('tables')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      if (type === 'assignment') {
        const { error } = await supabase
          .from('table_assignments')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Error managing tables:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
