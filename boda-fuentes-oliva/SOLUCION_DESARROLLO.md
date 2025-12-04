# 🚀 SOLUCIÓN SIMPLE - Desarrollo Local

## El problema:
- `vercel dev` no funciona bien localmente con tu configuración
- Las APIs de `/api/*` solo funcionan en producción (Vercel)
- En desarrollo local necesitas acceso directo a Supabase

## ✅ SOLUCIÓN:

### **1. Desactiva RLS temporalmente** (SOLO para desarrollo local)

En Supabase SQL Editor ejecuta:

```sql
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE save_the_date_rsvp DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE guest_messages DISABLE ROW LEVEL SECURITY;
```

### **2. Corre solo npm run dev:**

```powershell
npm run dev
```

### **3. Abre http://localhost:5173**

✅ Tu app funcionará completamente

---

## 🌐 PARA PRODUCCIÓN:

### **1. Reactiva RLS:**
```sql
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_the_date_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
```

### **2. Deploy a Vercel:**
```powershell
vercel --prod
```

### **3. Configura variables de entorno en Vercel Dashboard:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

---

## 🎯 RESUMEN:

| Entorno | RLS | Backend |
|---------|-----|---------|
| **Desarrollo** | ❌ OFF | No necesario |
| **Producción** | ✅ ON | Vercel Serverless |

---

**¿Desactivas RLS para probar localmente?** Esto es lo más rápido.
