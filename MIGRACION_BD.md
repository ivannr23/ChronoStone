# 🔄 Guía de Migraciones - Desarrollo y Producción

## 📋 Resumen

Tu proyecto ChronoStone usa **dos bases de datos diferentes**:
- **Desarrollo**: SQLite local (`dev.db`)
- **Producción**: PostgreSQL en Neon

He creado migraciones compatibles con ambas.

---

## 🏠 DESARROLLO (SQLite Local)

### Opción 1: Comando Automático (Recomendado) ⚡

```bash
npm run db:migrate
```

Este comando:
- ✅ Lee el archivo de migración
- ✅ Ejecuta cada statement
- ✅ Muestra un resumen detallado
- ✅ Verifica que todo se creó correctamente
- ✅ Ignora errores de "ya existe"

### Opción 2: Manual

Si prefieres hacerlo manualmente:

1. Abre una terminal SQLite:
```bash
sqlite3 dev.db
```

2. Ejecuta el archivo de migración:
```sql
.read database/migrations/001_projects_extended_sqlite.sql
```

3. Verifica las nuevas columnas:
```sql
PRAGMA table_info(projects);
```

4. Verifica las nuevas tablas:
```sql
.tables
```

5. Sal de SQLite:
```sql
.exit
```

---

## ☁️ PRODUCCIÓN (Neon/PostgreSQL)

### Paso 1: Acceder a Neon

1. Ve a https://console.neon.tech/
2. Selecciona tu proyecto ChronoStone
3. Ve a la pestaña "SQL Editor"

### Paso 2: Ejecutar Migración

1. Abre el archivo `database/schema-projects-extended.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor de Neon
4. Haz clic en "Run" o presiona `Ctrl+Enter`

### Paso 3: Verificar

Ejecuta esta query para verificar:

```sql
-- Verificar nuevas columnas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('heritage_type', 'protection_level', 'budget', 'project_status');

-- Verificar nuevas tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name LIKE 'project_%';
```

Si ambas queries retornan resultados, ¡la migración fue exitosa! ✅

---

## 🔍 Verificación Post-Migración

### En Desarrollo (SQLite)

```bash
# Ejecutar migración
npm run db:migrate

# Deberías ver algo como:
# ✅ Columna agregada: project_status
# ✅ Columna agregada: heritage_type
# ✅ Tabla creada: project_phases
# ✅ Tabla creada: project_documents
# ...
# ✨ ¡Migración completada exitosamente!
```

### En Producción (Neon)

Ejecuta en el SQL Editor:

```sql
-- Contar nuevas tablas
SELECT COUNT(*) as nuevas_tablas
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('project_phases', 'project_documents', 'project_images', 
                    'project_budget_items', 'project_collaborators', 'project_notes');
-- Debe retornar: 6
```

---

## 🚨 Solución de Problemas

### Error: "duplicate column name"

**En SQLite:**
- ✅ Es normal, significa que la columna ya existe
- El script automático (`npm run db:migrate`) ignora estos errores

**Solución:** No hacer nada, continuar.

### Error: "table already exists"

**En ambos:**
- ✅ Es normal, significa que la tabla ya existe
- Ambos scripts usan `IF NOT EXISTS`

**Solución:** No hacer nada, continuar.

### Error: "no such table: projects"

**En SQLite:**
- ❌ La base de datos no está inicializada

**Solución:**
```bash
npm run db:setup
npm run db:migrate
```

### Error: "syntax error"

**En SQLite:**
- Verifica que estás usando el archivo correcto:
  - ✅ `database/migrations/001_projects_extended_sqlite.sql` (para SQLite)
  - ❌ `database/schema-projects-extended.sql` (solo para PostgreSQL)

**En Neon:**
- Verifica que estás usando el archivo correcto:
  - ✅ `database/schema-projects-extended.sql` (para PostgreSQL)
  - ❌ `database/migrations/001_projects_extended_sqlite.sql` (solo para SQLite)

---

## 📊 Diferencias entre SQLite y PostgreSQL

| Característica | SQLite | PostgreSQL (Neon) |
|----------------|--------|-------------------|
| **IDs** | TEXT con hex | UUID |
| **Fechas** | TEXT | TIMESTAMP WITH TIME ZONE |
| **Booleanos** | INTEGER (0/1) | BOOLEAN |
| **Arrays** | TEXT (JSON) | Array nativo |
| **NOW()** | datetime('now') | NOW() |
| **UUID** | randomblob(16) | uuid_generate_v4() |

**No te preocupes**: El archivo `lib/db.ts` ya maneja estas diferencias automáticamente. 🎉

---

## ✅ Checklist de Migración

### Desarrollo (SQLite)
- [ ] Ejecutar `npm run db:migrate`
- [ ] Ver mensaje "✨ ¡Migración completada exitosamente!"
- [ ] Verificar que no hay errores críticos
- [ ] Probar crear/editar un proyecto

### Producción (Neon)
- [ ] Abrir SQL Editor en Neon
- [ ] Copiar contenido de `schema-projects-extended.sql`
- [ ] Ejecutar en Neon
- [ ] Verificar con las queries de verificación
- [ ] Hacer deploy y probar

---

## 🎯 Próximo Paso

Una vez completadas las migraciones:

```bash
# Iniciar servidor de desarrollo
npm run dev

# Probar las nuevas funcionalidades:
# 1. Dashboard con widget de uso
# 2. Editar un proyecto (nuevos campos)
# 3. Página de contacto
```

---

## 📝 Notas Importantes

1. **Las migraciones son idempotentes**: Puedes ejecutarlas múltiples veces sin problemas
2. **No borran datos**: Solo agregan columnas y tablas nuevas
3. **Compatibles con ambos entornos**: Mismo código funciona en dev y prod
4. **Seguras**: Usan `IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`

---

## 🆘 ¿Necesitas Ayuda?

Si algo sale mal:

1. Revisa los mensajes de error
2. Consulta la sección "Solución de Problemas" arriba
3. Verifica que estás usando el archivo correcto para tu entorno
4. Los archivos de migración tienen comentarios explicativos

---

*Última actualización: 23 de diciembre de 2024*
*Versión: 1.3.0*
