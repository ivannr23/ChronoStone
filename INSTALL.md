# 🚀 Instalación Rápida - Patrimonio Digital SaaS

Esta guía te permite tener el proyecto funcionando localmente en **menos de 10 minutos**.

## ⚡ Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/patrimonio-saas.git
cd patrimonio-saas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` y rellena las variables (ver sección de Configuración abajo).

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔧 Configuración Detallada

### Variables de Entorno Necesarias

#### Supabase (Base de datos + Autenticación)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**¿Dónde obtenerlas?**
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API
4. Copia las credenciales

#### Stripe (Pagos)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# IDs de precios (debes crearlos en Stripe Dashboard)
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

**¿Dónde obtenerlas?**
1. Crea una cuenta en [Stripe](https://stripe.com)
2. Activa el modo TEST
3. Ve a Developers > API keys
4. Crea productos en Products > Add product
5. Copia los Price IDs

#### Resend (Emails)

```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@tudominio.com
```

**¿Dónde obtenerla?**
1. Crea una cuenta en [Resend](https://resend.com)
2. Ve a API Keys
3. Crea una nueva key

#### URLs de la aplicación

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=tu@email.com
```

---

## 📊 Configurar Base de Datos

### 1. Ejecutar Schema SQL

En Supabase Dashboard:
1. Ve a SQL Editor
2. Abre `database/schema.sql`
3. Copia y pega el contenido
4. Click en "Run"

### 2. Ejecutar Functions SQL

Repite el proceso con `database/functions.sql`

---

## 🧪 Modo Desarrollo

### Scripts disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción local
npm start

# Linting
npm run lint
```

### Hot Reload

El proyecto usa hot reload automático. Cualquier cambio en el código se refleja instantáneamente.

---

## 🎨 Estructura del Proyecto

```
patrimonio-saas/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Páginas de autenticación
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard protegido
│   └── page.tsx           # Landing page
├── components/            # Componentes React
│   ├── landing/          # Componentes de landing
│   └── ui/               # Componentes UI reutilizables
├── lib/                   # Librerías y utilidades
│   ├── supabase.ts       # Cliente Supabase
│   ├── stripe.ts         # Configuración Stripe
│   ├── email.ts          # Sistema de emails
│   └── permissions.ts    # Control de permisos
├── hooks/                 # React Hooks personalizados
│   ├── useUser.ts
│   ├── useSubscription.ts
│   └── useUserPermissions.ts
├── database/             # SQL schemas y funciones
│   ├── schema.sql
│   └── functions.sql
├── public/               # Archivos estáticos
└── package.json
```

---

## 🐛 Solución de Problemas

### Error: "Invalid API Key"

**Problema**: Las credenciales de Supabase/Stripe no son válidas.

**Solución**: 
- Verifica que copiaste las keys correctamente
- Asegúrate de no tener espacios al inicio/final
- Reinicia el servidor de desarrollo

### Error: "Database connection failed"

**Problema**: No se puede conectar a Supabase.

**Solución**:
- Verifica que el proyecto de Supabase esté activo
- Comprueba que la URL sea correcta
- Asegúrate de haber ejecutado el schema SQL

### Error: "Webhook signature verification failed"

**Problema**: El webhook de Stripe no puede verificarse.

**Solución**:
- En desarrollo local, usa Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
- Copia el webhook secret que aparece en la terminal

### Página en blanco o error 500

**Problema**: Error en el servidor.

**Solución**:
- Revisa la consola del navegador
- Revisa la terminal donde corre `npm run dev`
- Verifica que todas las variables de entorno estén configuradas

---

## 🚀 Primeros Pasos Después de Instalar

### 1. Crear tu primera cuenta

1. Ve a [http://localhost:3000/signup](http://localhost:3000/signup)
2. Registra una cuenta
3. Confirma el email (mira en Supabase > Auth > Users)

### 2. Convertirte en Admin

1. Ve a Supabase Dashboard
2. Table Editor > profiles
3. Busca tu usuario
4. Cambia `role` de `user` a `admin`
5. Ahora puedes acceder a `/admin`

### 3. Probar el flujo de pago

1. Usa las tarjetas de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

2. Selecciona un plan en `/dashboard/billing`

3. Completa el pago (modo test)

---

## 📚 Recursos Adicionales

### Documentación

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa de despliegue en producción
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [README.md](./README.md) - Información general del proyecto

### Links Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa los logs** en la terminal donde corre `npm run dev`
2. **Verifica las variables de entorno** en `.env.local`
3. **Comprueba la base de datos** en Supabase Dashboard
4. **Mira los issues** en GitHub (si aplica)

---

## ✅ Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] Repositorio clonado
- [ ] `npm install` ejecutado
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Schema SQL ejecutado
- [ ] Functions SQL ejecutadas
- [ ] Cuenta de Stripe creada (modo test)
- [ ] Productos de Stripe creados
- [ ] Cuenta de Resend creada
- [ ] `.env.local` configurado con todas las variables
- [ ] `npm run dev` funcionando
- [ ] Página en http://localhost:3000 carga correctamente
- [ ] Primera cuenta de usuario creada
- [ ] Usuario convertido a admin
- [ ] Acceso a `/admin` verificado

¡Listo! 🎉 Ya tienes el SaaS funcionando localmente.

