# 🚀 Guía de Despliegue en Netlify con Neon

Esta guía te llevará paso a paso para desplegar el SaaS en **Netlify** usando **Neon** como base de datos PostgreSQL.

---

## 📋 Requisitos Previos

- Cuenta en [Netlify](https://netlify.com) (gratuita)
- Cuenta en [Neon](https://neon.tech) (gratuita, incluida en Netlify)
- Cuenta en [Stripe](https://stripe.com) (modo test gratuito)
- Cuenta en [Resend](https://resend.com) (gratuita hasta 3000 emails/mes)
- Repositorio en GitHub/GitLab

---

## 1️⃣ Configuración de Neon (Base de Datos)

### Opción A: Desde Netlify (Recomendado)

1. Ve a tu proyecto en [Netlify Dashboard](https://app.netlify.com)
2. Ve a **Integrations** > **Database**
3. Selecciona **Neon**
4. Click en **Enable**
5. Netlify creará automáticamente una base de datos Neon y configurará `DATABASE_URL`

### Opción B: Directamente desde Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Click en "New Project"
3. Elige:
   - **Name**: `patrimonio-digital`
   - **Region**: Europe (Frankfurt) - más cercano a España
4. Click "Create Project"
5. Copia la **Connection String** que aparece:

```
postgresql://neondb_owner:XXXXXXX@ep-wispy-block-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Paso 2: Ejecutar Schema SQL

1. En Neon Console, ve a **SQL Editor**
2. Abre el archivo `database/schema-neon.sql`
3. Copia y pega TODO el contenido
4. Click en "Run" ▶️

✅ Deberías ver: "Query executed successfully"

---

## 2️⃣ Configuración de Stripe (Pagos)

### Paso 1: Crear Cuenta y Productos

1. Regístrate en [Stripe](https://dashboard.stripe.com/register)
2. Activa **modo de prueba** (toggle arriba)
3. Ve a **Products** > **Add product**

**Crear 3 productos:**

| Nombre | Descripción | Precio | Frecuencia |
|--------|-------------|--------|------------|
| Starter | Plan Starter - 5 proyectos | 49€ | Mensual |
| Professional | Plan Professional - Ilimitado | 99€ | Mensual |
| Enterprise | Plan Enterprise - Todo incluido | 199€ | Mensual |

4. Para cada producto, copia el **Price ID** (ej: `price_1abc...`)

### Paso 2: Configurar Webhooks

1. Ve a **Developers** > **Webhooks**
2. Click "Add endpoint"
3. URL: `https://tu-sitio.netlify.app/api/stripe/webhook`
4. Eventos a seleccionar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copia el **Signing secret** (`whsec_...`)

### Paso 3: Obtener API Keys

1. Ve a **Developers** > **API keys**
2. Copia:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`)

---

## 3️⃣ Configuración de Resend (Emails)

1. Regístrate en [Resend](https://resend.com)
2. Ve a **API Keys** > **Create API Key**
3. Copia la API key (`re_...`)

*(Opcional)* Verifica tu dominio en **Domains** para enviar desde tu email personalizado.

---

## 4️⃣ Despliegue en Netlify

### Paso 1: Conectar Repositorio

1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Conecta con GitHub/GitLab
4. Selecciona tu repositorio

### Paso 2: Configurar Build

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: `.netlify/functions`

### Paso 3: Variables de Entorno

En Netlify, ve a **Site settings** > **Environment variables** y añade:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_SECRET=tu_secret_generado_con_openssl_rand_base64_32
NEXTAUTH_URL=https://tu-sitio.netlify.app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx

# Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@tudominio.com

# URLs
NEXT_PUBLIC_APP_URL=https://tu-sitio.netlify.app
NEXT_PUBLIC_SITE_URL=https://tu-sitio.netlify.app

# Admin
ADMIN_EMAIL=tu@email.com
```

### Paso 4: Deploy

1. Click "Deploy site"
2. Espera 2-3 minutos
3. ✅ Tu app estará en `https://tu-sitio.netlify.app`

---

## 5️⃣ Post-Despliegue

### Actualizar Webhook de Stripe

1. Ve a Stripe Dashboard > Webhooks
2. Edita el endpoint
3. Cambia la URL a tu dominio de producción

### Generar NEXTAUTH_SECRET

En tu terminal:
```bash
openssl rand -base64 32
```
Copia el resultado y ponlo como `NEXTAUTH_SECRET`.

### Crear Usuario Admin

1. Regístrate en tu app desplegada
2. Conéctate a Neon Console > SQL Editor
3. Ejecuta:
```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
```
4. Ahora puedes acceder a `/admin`

### Probar Pagos

1. Usa la tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

---

## 6️⃣ Dominio Personalizado (Opcional)

### En Netlify:

1. Ve a **Domain settings** > **Add custom domain**
2. Ingresa tu dominio: `patrimoniodigital.es`
3. Netlify te dará registros DNS:

```
ALIAS @ apex-loadbalancer.netlify.com
CNAME www tu-sitio.netlify.app
```

4. Configura estos registros en tu proveedor de dominios
5. Habilita HTTPS automático

### Actualizar variables después:

```env
NEXTAUTH_URL=https://patrimoniodigital.es
NEXT_PUBLIC_APP_URL=https://patrimoniodigital.es
NEXT_PUBLIC_SITE_URL=https://patrimoniodigital.es
```

---

## 📊 Costos Mensuales

### Primeros 3 meses (0-100 usuarios):
| Servicio | Costo | Notas |
|----------|-------|-------|
| Netlify | 0€ | Free tier (100GB banda/mes) |
| Neon | 0€ | Free tier (500MB, 0.25 CU) |
| Stripe | Solo comisiones | 2.4% + 0.30€ por transacción |
| Resend | 0€ | Hasta 3000 emails/mes |
| **TOTAL** | **~0€** | + comisiones Stripe |

### Escala (100-500 usuarios):
| Servicio | Costo | Notas |
|----------|-------|-------|
| Netlify Pro | $19/mes | Build time, analytics |
| Neon | ~$20/mes | Según uso |
| Stripe | Solo comisiones | - |
| Resend | ~$20/mes | 10,000 emails |
| **TOTAL** | **~60€/mes** | + comisiones Stripe |

---

## 🔧 Solución de Problemas

### Error: "Database connection failed"

**Causa**: URL de conexión incorrecta o base de datos no activa.

**Solución**:
1. Verifica que la `DATABASE_URL` sea correcta
2. Asegúrate de que el proyecto Neon esté activo
3. Verifica que `?sslmode=require` esté en la URL

### Error: "NEXTAUTH_SECRET missing"

**Solución**: Genera un secret con `openssl rand -base64 32` y añádelo.

### Webhook de Stripe no funciona

**Solución**:
1. Verifica la URL del webhook en Stripe Dashboard
2. Asegúrate de que `STRIPE_WEBHOOK_SECRET` sea correcto
3. Revisa logs en Stripe > Webhooks > Recent deliveries

### Build falla en Netlify

**Solución**:
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs de build en Netlify Dashboard
3. Asegúrate de que Node.js 18 esté configurado

---

## ✅ Checklist Final

- [ ] Neon: Base de datos creada y schema ejecutado
- [ ] Stripe: Productos creados con Price IDs
- [ ] Stripe: Webhook configurado
- [ ] Resend: API key obtenida
- [ ] Netlify: Variables de entorno configuradas
- [ ] Netlify: Deploy exitoso
- [ ] URLs actualizadas en Stripe webhook
- [ ] Usuario admin creado
- [ ] Prueba de registro funcionando
- [ ] Prueba de pago funcionando
- [ ] Emails enviándose correctamente
- [ ] (Opcional) Dominio personalizado configurado

---

## 🎉 ¡Listo!

Tu SaaS **Patrimonio Digital** está desplegado en Netlify con:

- ✅ Base de datos PostgreSQL en Neon
- ✅ Autenticación con NextAuth.js
- ✅ Pagos con Stripe
- ✅ Emails con Resend
- ✅ SSL automático
- ✅ CDN global

**Costo total para empezar: 0€/mes** (solo pagas comisiones de Stripe por ventas reales).

