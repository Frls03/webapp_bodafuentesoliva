// Vercel Serverless Function - Manage Tables
// Full CRUD for tables and assignments.
import { query } from './_lib/neon.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ========================================
    // GET - Obtener mesas y asignaciones
    // ========================================
    if (req.method === 'GET') {
      const { type } = req.query;

      if (type === 'tables') {
        const result = await query(
          `
            SELECT *
            FROM public.tables
            ORDER BY id ASC
          `
        );

        return res.status(200).json({ success: true, data: result.rows });
      }

      if (type === 'assignments') {
        const result = await query(
          `
            SELECT *
            FROM public.table_assignments
            ORDER BY table_id ASC, id ASC
          `
        );

        return res.status(200).json({ success: true, data: result.rows });
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
        const safeName = typeof name === 'string' ? name.trim() : '';
        const safeCapacity = Number.isInteger(Number(capacity)) ? Number(capacity) : 10;

        if (!safeName || safeName.length > 80) {
          return res.status(400).json({ error: 'Invalid table name' });
        }

        if (safeCapacity < 1 || safeCapacity > 50) {
          return res.status(400).json({ error: 'Invalid table capacity' });
        }

        const result = await query(
          `
            INSERT INTO public.tables (name, capacity)
            VALUES ($1, $2)
            RETURNING *
          `,
          [safeName, safeCapacity]
        );

        return res.status(200).json({ success: true, data: result.rows[0] });
      }

      if (type === 'assignment') {
        const { table_id, guest_name, source_type, guest_id } = data;
        const safeTableId = Number(table_id);
        const safeGuestName = typeof guest_name === 'string' ? guest_name.trim() : '';
        const safeSourceType = typeof source_type === 'string' ? source_type.trim() : '';
        const safeGuestId = guest_id == null ? null : Number(guest_id);

        if (!Number.isInteger(safeTableId) || safeTableId <= 0) {
          return res.status(400).json({ error: 'Invalid table id' });
        }

        if (!safeGuestName || safeGuestName.length > 200) {
          return res.status(400).json({ error: 'Invalid guest name' });
        }

        if (!['savethedate', 'invitation'].includes(safeSourceType)) {
          return res.status(400).json({ error: 'Invalid source type' });
        }

        if (safeGuestId !== null && (!Number.isInteger(safeGuestId) || safeGuestId <= 0)) {
          return res.status(400).json({ error: 'Invalid guest id' });
        }

        const result = await query(
          `
            INSERT INTO public.table_assignments (table_id, guest_name, source_type, guest_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `,
          [safeTableId, safeGuestName, safeSourceType, safeGuestId]
        );

        return res.status(200).json({ success: true, data: result.rows[0] });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    // ========================================
    // DELETE - Eliminar mesa o asignación
    // ========================================
    if (req.method === 'DELETE') {
      const { type, id } = req.body;
      const safeId = Number(id);

      if (!Number.isInteger(safeId) || safeId <= 0) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      if (type === 'table') {
        await query('DELETE FROM public.tables WHERE id = $1', [safeId]);
        return res.status(200).json({ success: true });
      }

      if (type === 'assignment') {
        await query('DELETE FROM public.table_assignments WHERE id = $1', [safeId]);
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
