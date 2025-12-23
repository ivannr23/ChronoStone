# 🛠️ Configuración de Desarrollo

Ejecuta el proyecto en tu máquina en **2 minutos**.

---

## 📋 Requisitos

- **Node.js 18+** ([descargar](https://nodejs.org))

Eso es todo. No necesitas Docker, ni bases de datos externas.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos local (SQLite)
npm run db:setup

# 3. Configurar variables
cp env.development.example .env.local

# 4. Iniciar servidor
npm run dev
```

Abre http://localhost:3000 🎉

---

## 🗄️ Base de Datos

| Entorno | Motor | Archivo/URL |
|---------|-------|-------------|
| **Desarrollo** | SQLite | `dev.db` (archivo local) |
| **Producción** | Neon PostgreSQL | `DATABASE_URL` |

**Misma estructura de tablas**, diferente motor. El código detecta automáticamente qué usar.

### Comandos

```bash
npm run db:setup   # Crear base de datos SQLite
npm run db:reset   # Borrar y recrear (datos perdidos)
```

---

## ⚙️ Variables de Entorno

El archivo `.env.local` solo necesita:

```env
NEXTAUTH_SECRET=cualquier_texto_aleatorio
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Stripe y Resend son opcionales** para desarrollo.

---

## 🧪 Probar la App

### Sin Stripe ni Resend

✅ **Funciona:**
- Landing page
- Registro / Login
- Dashboard
- Crear proyectos
- Panel admin

📧 **Emails:** Se muestran en consola del servidor

### Crear cuenta

1. Ve a http://localhost:3000/signup
2. Regístrate con cualquier email
3. Tienes 14 días de trial automáticamente

### Hacerte admin

Abre el archivo `dev.db` con cualquier visor SQLite (ej: [DB Browser](https://sqlitebrowser.org/)) o ejecuta:

```bash
# Si tienes sqlite3 instalado
sqlite3 dev.db "UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';"
```

---

## 🔗 URLs

| Página | URL |
|--------|-----|
| Landing | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Registro | http://localhost:3000/signup |
| Dashboard | http://localhost:3000/dashboard |
| Admin | http://localhost:3000/admin |

---

## 📁 Archivos

```
patrimonio-saas/
├── dev.db                  # Base de datos SQLite (desarrollo)
├── .env.local              # Variables de entorno locales
├── env.development.example # Plantilla
├── scripts/
│   └── setup-local-db.js   # Script para crear tablas
├── lib/
│   └── db.ts               # Cliente que detecta SQLite/Neon
└── database/
    └── schema-neon.sql     # Schema para producción (Neon)
```

---

## 🚀 Pasar a Producción

1. Crea proyecto en [Neon](https://neon.tech)
2. Ejecuta `database/schema-neon.sql` en Neon
3. En Netlify, configura `DATABASE_URL` con la URL de Neon
4. Despliega

El código detecta automáticamente que está en producción y usa Neon.

---

## ✅ Checklist

- [ ] Node.js 18+ instalado
- [ ] `npm install` ejecutado
- [ ] `npm run db:setup` ejecutado
- [ ] `.env.local` creado
- [ ] `npm run dev` funcionando
- [ ] http://localhost:3000 carga
