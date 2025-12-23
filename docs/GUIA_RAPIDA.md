# 🚀 Guía Rápida de Implementación

## ⚡ Pasos Inmediatos (5 minutos)

### 1. Ejecutar el Esquema de Base de Datos

```bash
# Si usas PostgreSQL local
psql -U postgres -d chronostone -f database/schema-projects-extended.sql

# Si usas Neon/Supabase
# Copia el contenido de schema-projects-extended.sql
# y ejecútalo en el SQL Editor de tu dashboard
```

### 2. Agregar el Widget de Uso al Dashboard

Edita `app/dashboard/page.tsx`:

```tsx
import UsageWidget from '@/components/ui/UsageWidget'

// Dentro de tu componente, agrega:
<div className="grid lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Tu contenido existente */}
  </div>
  <div className="space-y-6">
    <UsageWidget />
    {/* Otros widgets */}
  </div>
</div>
```

### 3. Verificar Variables de Entorno

Asegúrate de tener en `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=ChronoStone <noreply@chronostone.es>
CONTACT_EMAIL=info@chronostone.es
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Probar las Nuevas Funcionalidades

### Página de Contacto
```
1. Visita: http://localhost:3000/contacto
2. Completa el formulario
3. Verifica la consola para ver el email (modo dev)
```

### Edición de Proyectos
```
1. Ve a un proyecto existente
2. Haz clic en el ícono de editar (lápiz)
3. Completa los nuevos campos
4. Guarda y verifica
```

### Widget de Uso
```
1. Recarga el dashboard
2. Verifica que aparece el widget de uso
3. Crea un proyecto para ver cómo se actualiza
```

---

## 📋 Checklist de Implementación

- [ ] Ejecutar `schema-projects-extended.sql`
- [ ] Agregar `<UsageWidget />` al dashboard
- [ ] Verificar variables de entorno
- [ ] Probar página de contacto
- [ ] Probar edición de proyectos
- [ ] Verificar que el widget de uso funciona
- [ ] (Opcional) Configurar Resend para emails reales

---

## 🔍 Verificación Rápida

### Base de Datos
```sql
-- Verifica que las nuevas columnas existen
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('heritage_type', 'protection_level', 'budget');

-- Verifica que las nuevas tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('project_phases', 'project_documents', 'project_images');
```

### API Endpoints
```bash
# Probar endpoint de uso (requiere autenticación)
curl http://localhost:3000/api/usage

# Probar endpoint de contacto
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'
```

---

## 🐛 Solución de Problemas

### Error: "Tabla no existe"
```
Solución: Ejecuta schema-projects-extended.sql
```

### Error: "RESEND_API_KEY no configurado"
```
Solución: En desarrollo, los emails se loguean en consola.
Para producción, obtén una API key de resend.com
```

### Widget de uso no aparece
```
Solución: 
1. Verifica que importaste el componente
2. Verifica que el usuario está autenticado
3. Revisa la consola del navegador
```

---

## 📚 Documentación Adicional

- **Detalles técnicos**: Ver `IMPLEMENTATION_SUMMARY.md`
- **Progreso general**: Ver `TODO.md`
- **Resumen ejecutivo**: Ver `TRABAJO_COMPLETADO.md`

---

## 🎯 Próximo Paso Recomendado

**Implementar verificación de límites en tiempo real:**

1. En `app/dashboard/projects/new/page.tsx`, antes de crear un proyecto:

```tsx
const { usage, isOverLimit } = useUsage(user?.id)

if (isOverLimit(usage?.projects_count || 0, usage?.plan_limits.max_projects || 0)) {
  toast.error('Has alcanzado el límite de proyectos. Actualiza tu plan.')
  router.push('/dashboard/billing')
  return
}
```

2. Similar para la subida de modelos 3D

---

*Última actualización: 23 de diciembre de 2024*
