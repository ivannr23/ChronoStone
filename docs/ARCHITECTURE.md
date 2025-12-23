# 🏗️ Arquitectura del Sistema - Patrimonio Digital SaaS

## 📐 Visión General

Patrimonio Digital es un SaaS multi-tenant construido con una arquitectura serverless moderna, optimizado para costos mínimos en etapas iniciales y escalabilidad infinita.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Landing   │  │  Dashboard   │  │   Admin Panel          │  │
│  │  Page      │  │  (Protected) │  │   (Role Protected)     │  │
│  └────────────┘  └──────────────┘  └────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │   Middleware   │     │   API Routes   │
        │  (Auth Check)  │     │  (Serverless)  │
        └───────┬────────┘     └───────┬────────┘
                │                       │
    ┌───────────┴───────────┬───────────┴──────────┬──────────┐
    │                       │                      │          │
┌───▼──────┐        ┌──────▼──────┐        ┌──────▼────┐  ┌──▼────┐
│ Supabase │        │   Stripe    │        │  Resend   │  │  CDN  │
│  (Auth + │        │  (Payments) │        │  (Email)  │  │(Vercel)
│   DB)    │        │             │        │           │  │       │
└──────────┘        └──────────────┘        └───────────┘  └───────┘
```

---

## 🎯 Principios de Diseño

### 1. **Serverless First**
- Sin servidores que mantener
- Pago por uso real
- Escalado automático

### 2. **Multi-Tenant con Separación Lógica**
- Datos de cada usuario aislados por `user_id`
- Row Level Security (RLS) en Supabase
- No shared state entre tenants

### 3. **API-First**
- Todas las funcionalidades expuestas como API
- Facilita integraciones futuras
- Frontend y backend desacoplados

### 4. **Security by Default**
- Autenticación en todas las rutas privadas
- Verificación de suscripción en middleware
- Validación de permisos a nivel de base de datos

---

## 📦 Stack Tecnológico

### Frontend
```
Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
├── Lucide Icons
└── React Hot Toast
```

### Backend
```
Next.js API Routes (Serverless)
├── Supabase Client
├── Stripe SDK
└── Resend SDK
```

### Base de Datos
```
Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Triggers automáticos
├── Functions SQL
└── Realtime subscriptions
```

### Pagos
```
Stripe
├── Checkout Sessions
├── Customer Portal
├── Webhooks
└── Subscription Management
```

### Email
```
Resend
├── Transactional Emails
├── Template System
└── Delivery Tracking
```

---

## 🗃️ Modelo de Datos

### Diagrama ER

```
┌─────────────┐
│  auth.users │ (Supabase Auth)
└──────┬──────┘
       │
       │ 1:1
       │
┌──────▼──────┐
│  profiles   │
│─────────────│
│ id          │ PK
│ email       │
│ full_name   │
│ role        │
│ ...         │
└──────┬──────┘
       │
       │ 1:1
       │
┌──────▼──────────┐      ┌──────────────┐
│ subscriptions   │      │ usage_limits │
│─────────────────│      │──────────────│
│ id              │ PK   │ user_id      │ PK
│ user_id         │ FK   │ projects_cnt │
│ plan_id         │      │ storage_used │
│ status          │      │ models_count │
│ stripe_sub_id   │      └──────────────┘
│ ...             │
└──────┬──────────┘
       │
       │ 1:N
       │
┌──────▼─────┐      ┌────────────┐
│ projects   │ 1:N  │ models_3d  │
│────────────│──────▶────────────│
│ id         │ PK   │ id         │ PK
│ user_id    │ FK   │ project_id │ FK
│ name       │      │ file_url   │
│ ...        │      │ file_size  │
└────────────┘      └────────────┘
```

### Tablas Principales

#### `profiles`
- Extensión de `auth.users`
- Información adicional del usuario
- Role-based access control

#### `subscriptions`
- Estado actual de la suscripción
- Vinculación con Stripe
- Control de periodos de prueba

#### `usage_limits`
- Contadores en tiempo real
- Reseteo mensual automático
- Límites por plan

#### `projects`
- Datos patrimoniales del usuario
- Separación por `user_id`
- Metadata configurable

#### `models_3d`
- Referencias a archivos 3D
- Tracking de storage usado
- Estado de procesamiento

---

## 🔐 Seguridad

### Autenticación
```typescript
// Flujo de autenticación
User → Supabase Auth → JWT Token → Middleware Check → Route Access
```

### Autorización
```typescript
// Niveles de acceso
1. Usuario anónimo → Landing page
2. Usuario autenticado → Dashboard
3. Usuario con suscripción activa → Features
4. Admin → Panel administrativo
```

### Row Level Security (RLS)
```sql
-- Ejemplo de policy
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 💰 Sistema de Suscripciones

### Estados de Suscripción

```
[REGISTRO]
    │
    ├─→ [TRIALING] (14 días)
    │      │
    │      ├─→ [ACTIVE] (pago exitoso)
    │      └─→ [CANCELED] (no pago)
    │
    └─→ [ACTIVE] (pago directo)
           │
           ├─→ [PAST_DUE] (pago fallido)
           └─→ [CANCELED] (cancelación)
```

### Límites por Plan

| Plan | Proyectos | Storage | Modelos | Usuarios |
|------|-----------|---------|---------|----------|
| Free Trial | 1 | 500MB | 3 | 1 |
| Starter | 5 | 10GB | ∞ | 2 |
| Professional | ∞ | 50GB | ∞ | 5 |
| Enterprise | ∞ | 100GB | ∞ | 20 |

### Verificación de Límites

```typescript
// Proceso de verificación
1. Usuario intenta crear proyecto
2. Middleware verifica suscripción activa
3. Hook verifica límites de uso
4. Si ok → permite acción
5. Si límite excedido → redirect a /billing
```

---

## 🔄 Flujo de Pago con Stripe

```
Usuario selecciona plan
    │
    ▼
POST /api/stripe/checkout
    │
    ├─→ Crear Stripe Customer
    ├─→ Crear Checkout Session
    └─→ Redirect a Stripe
         │
         ▼
    Usuario paga en Stripe
         │
         ├─→ checkout.session.completed (webhook)
         ├─→ customer.subscription.created (webhook)
         │
         ▼
    POST /api/stripe/webhook
         │
         ├─→ Actualizar subscriptions table
         ├─→ Enviar email confirmación
         └─→ Redirect a /dashboard
```

---

## 📧 Sistema de Emails

### Eventos que disparan emails

```typescript
const emailTriggers = {
  signup: 'Bienvenida',
  trial_day_7: 'Recordatorio trial',
  trial_day_10: 'Recordatorio trial',
  trial_day_13: 'Último día trial',
  payment_success: 'Confirmación de pago',
  renewal_7days: 'Próxima renovación',
  subscription_cancelled: 'Cancelación confirmada',
}
```

### Arquitectura de Emails

```
Trigger → lib/email.ts → Resend API → Usuario
```

---

## 🚀 Despliegue y CI/CD

### Pipeline de Despliegue

```
Local Development
    │
    ├─→ git push to main
    │
    ▼
GitHub Repository
    │
    ├─→ Auto-trigger Vercel
    │
    ▼
Vercel Build
    │
    ├─→ npm install
    ├─→ npm run build
    ├─→ Optimización automática
    │
    ▼
Production Deploy
    │
    └─→ https://patrimonio-digital.vercel.app
```

### Environments

```
Development (local)
├── .env.local
└── localhost:3000

Preview (Vercel)
├── PR-based deployments
└── auto-generated URLs

Production (Vercel)
├── Environment variables en dashboard
└── Custom domain
```

---

## 📊 Monitorización

### Métricas Clave (KPIs)

```typescript
// Disponibles en /admin
const kpis = {
  // Usuarios
  totalUsers: 'Usuarios registrados',
  activeSubscribers: 'Suscriptores pagando',
  trialUsers: 'Usuarios en prueba',
  
  // Financieros
  MRR: 'Monthly Recurring Revenue',
  ARPU: 'Average Revenue Per User',
  churnRate: 'Tasa de cancelación',
  
  // Uso
  totalProjects: 'Proyectos creados',
  totalModels: 'Modelos 3D subidos',
  storageUsed: 'Storage total usado',
}
```

### Logs y Debugging

```
Vercel Logs
├── Function logs
├── Build logs
└── Runtime errors

Supabase Logs
├── Database queries
├── Auth attempts
└── API calls

Stripe Dashboard
├── Payment events
├── Webhook deliveries
└── Failed charges
```

---

## 🔧 Mantenimiento

### Tareas Automáticas

```sql
-- Ejecutar diariamente via cron
SELECT cleanup_expired_trials();
```

### Backups

```
Supabase
├── Backup automático diario
├── Point-in-time recovery (Pro plan)
└── Export manual disponible

Vercel
├── Git como source of truth
└── Deploy history preservado
```

---

## 🎯 Optimizaciones

### Performance

- **SSR**: Solo en landing page
- **ISR**: Para páginas públicas con poca variación
- **CSR**: Dashboard y área privada
- **Image Optimization**: Automático con Next.js
- **Code Splitting**: Automático por rutas

### SEO

- **Landing page**: Optimizada para buscadores
- **Meta tags**: Dinámicos por página
- **Sitemap**: Generado automáticamente
- **Robots.txt**: Configurado

---

## 📈 Escalabilidad

### Horizontal

- **Vercel**: Auto-scaling infinito
- **Supabase**: Connection pooling automático
- **Stripe**: Sin límites de transacciones

### Vertical

- **Database**: Upgrade Supabase según necesidad
- **Storage**: Migrar a Cloudflare R2 si excede límites
- **CDN**: Vercel Edge Network global

---

## 🔮 Roadmap Técnico

### Fase 1 (Actual)
- ✅ MVP funcional
- ✅ Sistema de suscripciones
- ✅ Dashboard básico

### Fase 2 (Q1 2025)
- [ ] API pública REST
- [ ] Webhooks para integraciones
- [ ] Sistema de notificaciones push

### Fase 3 (Q2 2025)
- [ ] Mobile app (React Native)
- [ ] Procesamiento de modelos 3D en background
- [ ] ML para análisis de deterioro

---

## 📚 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

