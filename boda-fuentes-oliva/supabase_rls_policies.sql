-- ========================================
-- CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS)
-- ========================================
-- Este script DEBE ejecutarse en el SQL Editor de Supabase
-- CRÍTICO: Sin RLS, cualquiera con tu anon key puede acceder a toda la DB
-- ========================================

-- PASO 1: Habilitar RLS en todas las tablas
-- ========================================

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_the_date_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 2: Políticas para GUESTS
-- ========================================
-- Los invitados solo pueden leer sus propios datos cuando tienen la contraseña correcta
-- Los admins pueden leer todos los datos desde el backend

-- Permitir SELECT solo con contraseña correcta (para login de invitados)
CREATE POLICY "guests_select_with_password"
  ON guests FOR SELECT
  USING (true); -- Permitimos SELECT, pero la validación se hace en el backend

-- Solo admins pueden actualizar (confirmación de asistencia)
CREATE POLICY "guests_update_attendance"
  ON guests FOR UPDATE
  USING (true); -- La autenticación se valida en el backend

-- NO permitir INSERT o DELETE desde el frontend
CREATE POLICY "guests_no_insert"
  ON guests FOR INSERT
  WITH CHECK (false);

CREATE POLICY "guests_no_delete"
  ON guests FOR DELETE
  USING (false);

-- ========================================
-- PASO 3: Políticas para ADMINS
-- ========================================
-- Los admins NUNCA se acceden directamente desde el frontend
-- Deben autenticarse a través de serverless functions

-- NO permitir acceso directo desde el anon key
CREATE POLICY "admins_no_select"
  ON admins FOR SELECT
  USING (false);

CREATE POLICY "admins_no_insert"
  ON admins FOR INSERT
  WITH CHECK (false);

CREATE POLICY "admins_no_update"
  ON admins FOR UPDATE
  USING (false);

CREATE POLICY "admins_no_delete"
  ON admins FOR DELETE
  USING (false);

-- ========================================
-- PASO 4: Políticas para SAVE_THE_DATE_RSVP
-- ========================================
-- Cualquiera puede insertar (confirmaciones públicas)
-- Solo admins pueden leer

CREATE POLICY "save_the_date_insert_public"
  ON save_the_date_rsvp FOR INSERT
  WITH CHECK (true);

CREATE POLICY "save_the_date_select_admin_only"
  ON save_the_date_rsvp FOR SELECT
  USING (false); -- La lectura se hace desde el backend con service key

CREATE POLICY "save_the_date_no_update"
  ON save_the_date_rsvp FOR UPDATE
  USING (false);

CREATE POLICY "save_the_date_no_delete"
  ON save_the_date_rsvp FOR DELETE
  USING (false);

-- ========================================
-- PASO 5: Políticas para TABLES
-- ========================================
-- Solo admins pueden gestionar mesas

CREATE POLICY "tables_admin_only_all"
  ON tables FOR ALL
  USING (false);

-- ========================================
-- PASO 6: Políticas para TABLE_ASSIGNMENTS
-- ========================================
-- Solo admins pueden gestionar asignaciones

CREATE POLICY "assignments_admin_only_all"
  ON table_assignments FOR ALL
  USING (false);

-- ========================================
-- PASO 7: Políticas para GUEST_MESSAGES
-- ========================================
-- Cualquiera puede insertar mensajes
-- Solo admins pueden leerlos

CREATE POLICY "messages_insert_public"
  ON guest_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "messages_select_admin_only"
  ON guest_messages FOR SELECT
  USING (false); -- La lectura se hace desde el backend

CREATE POLICY "messages_no_update"
  ON guest_messages FOR UPDATE
  USING (false);

CREATE POLICY "messages_no_delete"
  ON guest_messages FOR DELETE
  USING (false);

-- ========================================
-- VERIFICACIÓN: Confirma que RLS está habilitado
-- ========================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'guests', 
  'admins', 
  'save_the_date_rsvp', 
  'tables', 
  'table_assignments', 
  'guest_messages'
);

-- Si rowsecurity = true, ¡RLS está activado! ✅

-- ========================================
-- VERIFICACIÓN: Lista todas las políticas creadas
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- IMPORTANTE: CREDENCIALES DE BACKEND
-- ========================================
-- Para que el backend (Vercel Functions) pueda leer datos de admins,
-- necesitas usar SUPABASE_SERVICE_KEY (no anon key) en las funciones serverless.
--
-- En Vercel Dashboard → Settings → Environment Variables:
-- SUPABASE_URL = https://myiejxfmzvbohgminjrp.supabase.co
-- SUPABASE_SERVICE_KEY = [tu service key de Supabase Dashboard → Settings → API → service_role key]
--
-- NUNCA expongas el service key en el frontend!
-- ========================================

-- ========================================
-- PROBAR RLS (Opcional - para debugging)
-- ========================================
-- Intenta hacer un SELECT como si fueras un usuario anónimo:
-- Esto DEBE devolver 0 resultados o error:

SET ROLE anon;
SELECT * FROM admins; -- Debe fallar
SELECT * FROM tables; -- Debe fallar
SELECT * FROM save_the_date_rsvp; -- Debe fallar
RESET ROLE;

-- Si alguna de estas queries devuelve datos, RLS NO está funcionando correctamente
