# 🚀 Guía de Despliegue - Patrimonio Digital SaaS

Esta guía te llevará paso a paso desde la configuración inicial hasta tener el SaaS completo en producción.

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com) (gratuita)
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Stripe](https://stripe.com) (gratuita en modo test)
- Cuenta en [Resend](https://resend.com) (gratuita hasta 3000 emails/mes)
- Node.js 18+ instalado localmente

---

## 1️⃣ Configuración de Supabase (Base de Datos)

### Paso 1: Crear Proyecto

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Clic en "New Project"
3. Rellena los datos:
   - **Name**: `patrimonio-digital`
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Elige la más cercana a tus usuarios (Europe West para España)
4. Clic en "Create new project" (tarda ~2 minutos)

### Paso 2: Ejecutar Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (menú lateral)
2. Clic en "+ New query"
3. Copia y pega TODO el contenido de `database/schema.sql`
4. Clic en "Run" (▶️)
5. Repetir con `database/functions.sql`

✅ Deberías ver: "Success. No rows returned"

### Paso 3: Configurar Autenticación

1. Ve a **Authentication** > **Settings**
2. En "Email Auth", asegúrate de que esté habilitado
3. Configura las URLs:
   - **Site URL**: `https://tu-dominio.vercel.app` (o tu dominio)
   - **Redirect URLs**: Añade:
     - `https://tu-dominio.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo)

### Paso 4: Obtener Credenciales

1. Ve a **Settings** > **API**
2. Copia y guarda:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ NUNCA la expongas en el cliente)

---

## 2️⃣ Configuración de Stripe (Pagos)

### Paso 1: Crear Cuenta

1. Regístrate en [Stripe](https://dashboard.stripe.com/register)
2. Activa el **modo de prueba** (toggle arriba a la derecha)

### Paso 2: Crear Productos

1. Ve a **Products** > **Add product**
2. Crea 3 productos:

**Producto 1: Starter**
- Name: `Starter`
- Description: `Plan Starter - 5 proyectos`
- Pricing: `Recurring` > `Monthly` > `49 EUR`
- Click "Save product"
- **Copia el Price ID** (empieza con `price_...`)

**Producto 2: Professional**
- Name: `Professional`
- Description: `Plan Professional - Proyectos ilimitados`
- Pricing: `Recurring` > `Monthly` > `99 EUR`
- Click "Save product"
- **Copia el Price ID**

**Producto 3: Enterprise**
- Name: `Enterprise`
- Description: `Plan Enterprise - Todo incluido`
- Pricing: `Recurring` > `Monthly` > `199 EUR`
- Click "Save product"
- **Copia el Price ID**

### Paso 3: Configurar Webhooks

1. Ve a **Developers** > **Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copia el "Signing secret"** (empieza con `whsec_...`)

### Paso 4: Obtener API Keys

1. Ve a **Developers** > **API keys**
2. Copia:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)

---

## 3️⃣ Configuración de Resend (Emails)

### Paso 1: Crear Cuenta

1. Regístrate en [Resend](https://resend.com/signup)
2. Verifica tu email

### Paso 2: Agregar Dominio (Opcional pero recomendado)

1. Ve a **Domains** > **Add Domain**
2. Ingresa tu dominio (ej: `patrimoniodigital.es`)
3. Añade los registros DNS que te indican
4. Espera verificación (puede tardar hasta 48h)

Si no tienes dominio, puedes usar el email de prueba de Resend temporalmente.

### Paso 3: Crear API Key

1. Ve a **API Keys** > **Create API Key**
2. Name: `patrimonio-digital-production`
3. Permission: `Full access`
4. Click "Create"
5. **Copia la API key** (empieza con `re_...`)

---

## 4️⃣ Despliegue en Vercel

### Paso 1: Instalar Vercel CLI (Opcional)

```bash
npm install -g vercel
```

### Paso 2: Conectar Repositorio

1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Patrimonio Digital SaaS"
git remote add origin https://github.com/tu-usuario/patrimonio-saas.git
git push -u origin main
```

2. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Importa tu repositorio de GitHub
5. Configura el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (dejar por defecto)
   - **Build Command**: `npm run build` (automático)

### Paso 3: Configurar Variables de Entorno

En Vercel, antes de hacer deploy, añade estas variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx

# Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@tudominio.com

# URLs
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app

# Admin
ADMIN_EMAIL=tu@email.com
```

### Paso 4: Deploy

1. Click "Deploy"
2. Espera 2-3 minutos
3. ✅ Tu app estará en `https://tu-proyecto.vercel.app`

---

## 5️⃣ Configuración Post-Despliegue

### Actualizar URLs en Servicios

**Supabase:**
1. Authentication > Settings > Site URL: `https://tu-proyecto.vercel.app`
2. Redirect URLs: Añadir `https://tu-proyecto.vercel.app/auth/callback`

**Stripe:**
1. Webhooks > Editar endpoint
2. Cambiar URL a: `https://tu-proyecto.vercel.app/api/stripe/webhook`

### Crear Usuario Admin

1. Regístrate en tu app: `https://tu-proyecto.vercel.app/signup`
2. Ve a Supabase Dashboard > Table Editor > `profiles`
3. Busca tu usuario y cambia `role` de `user` a `admin`
4. Ahora puedes acceder a `/admin`

### Probar Webhook de Stripe

1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
2. Ejecuta:
```bash
stripe listen --forward-to https://tu-proyecto.vercel.app/api/stripe/webhook
```
3. Haz una compra de prueba
4. Verifica que el webhook se recibe correctamente

---

## 6️⃣ Dominio Personalizado (Opcional)

### En Vercel:

1. Ve a tu proyecto > Settings > Domains
2. Click "Add"
3. Ingresa tu dominio: `patrimoniodigital.es`
4. Vercel te dará registros DNS para configurar:

```
CNAME www cname.vercel-dns.com
A @ 76.76.21.21
```

5. Añade esos registros en tu proveedor de dominios
6. Espera propagación DNS (5-30 minutos)

### Subdominios:

Para `app.patrimoniodigital.es`:
```
CNAME app cname.vercel-dns.com
```

---

## 7️⃣ Monitorización y Mantenimiento

### Logs en Vercel

- Ve a tu proyecto > **Logs** para ver errores en tiempo real
- Configura alertas para errores críticos

### Logs en Supabase

- Database > Logs para queries lentas
- API > Logs para errores de autenticación

### Métricas en Stripe

- Stripe Dashboard muestra MRR, churn rate automáticamente

---

## 🔧 Solución de Problemas Comunes

### Error: "Invalid API Key"

**Solución**: Verifica que hayas copiado las keys correctamente y que no tengan espacios al principio/final.

### Error: "Subscription not found"

**Solución**: Asegúrate de que el webhook de Stripe esté configurado y funcionando. Verifica en Stripe > Webhooks > Events que los eventos se estén enviando.

### Emails no se envían

**Solución**: 
1. Verifica que `RESEND_API_KEY` esté en las variables de entorno
2. Si usas dominio propio, verifica que esté verificado en Resend
3. Comprueba los logs de Resend para ver errores

### Usuario no puede crear proyectos

**Solución**: Verifica que:
1. La suscripción esté activa: `subscriptions` table > `status` = 'active' o 'trialing'
2. El middleware esté permitiendo el acceso
3. Los límites en `usage_limits` no estén excedidos

---

## 📊 Costos Estimados

### Primeros 3 meses (0-100 usuarios):
- **Vercel**: 0€ (Hobby plan)
- **Supabase**: 0€ (Free tier hasta 500MB)
- **Stripe**: 0€ fijos + 2.4% + 0.30€ por transacción
- **Resend**: 0€ (hasta 3000 emails/mes)
- **TOTAL**: ~0-50€/mes

### Escala (100-500 usuarios):
- **Vercel Pro**: 20$/mes
- **Supabase Pro**: 25$/mes
- **Stripe**: 0€ fijos + comisiones
- **Resend**: 20€/mes
- **TOTAL**: ~100-150€/mes

---

## 🚀 Siguientes Pasos

1. **Configura Google Analytics** para tracking de conversiones
2. **Implementa un sistema de referidos** para crecimiento viral
3. **Añade más funcionalidades** según feedback de usuarios
4. **Configura backups automáticos** de la base de datos
5. **Implementa tests E2E** con Playwright o Cypress

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel y Supabase
2. Verifica que todas las variables de entorno estén correctas
3. Comprueba que los webhooks de Stripe funcionen

---

## ✅ Checklist Final

- [ ] Supabase proyecto creado y schema ejecutado
- [ ] Stripe productos creados con Price IDs
- [ ] Stripe webhook configurado
- [ ] Resend API key obtenida
- [ ] Variables de entorno configuradas en Vercel
- [ ] Primer deploy exitoso
- [ ] URLs actualizadas en Supabase y Stripe
- [ ] Usuario admin creado
- [ ] Prueba de compra realizada exitosamente
- [ ] Emails de bienvenida funcionando
- [ ] Dominio personalizado configurado (opcional)

¡Felicidades! 🎉 Tu SaaS está en producción.

