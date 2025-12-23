# **Prompt para Cursor - Sistema SaaS Patrimonial con Landing Page y Gestión de Suscripciones**

ACTÚA COMO: CTO/Lead Developer senior especializado en SaaS, arquitectura multi-tenant, y flujos de conversión. Experto en crear productos comerciales escalables con coste inicial ~0€.

## OBJETIVO GENERAL
Crear un SaaS comercial completo para restauración patrimonial en España que incluya:
1. Landing page de marketing/prodcuto (pública)
2. Sistema de autenticación y gestión de usuarios
3. Control de planes/suscripciones
4. Aplicación de gestión patrimonial (solo para usuarios pagantes)
5. Panel de administración para gestión de clientes

## ARQUITECTURA MULTI-TENANT EXIGIDA
- **Público**: Landing page estática (Next.js) sin autenticación
- **Auth Middleware**: Control de acceso a app según plan contratado
- **App Principal**: Solo accesible tras login + suscripción activa
- **Base de datos**: Separación lógica de datos por tenant/user

## FLUJO DE USUARIO COMERCIAL
1. Usuario visita `patrimoniodigital.es` (landing page)
2. Ve planes, precios, casos de éxito
3. Clica "Comenzar prueba gratuita" o "Seleccionar plan"
4. Se registra (email + contraseña)
5. Selecciona plan (Free Trial/Pro/Enterprise) → Redirige a pasarela de pago
6. Tras pago exitoso → Accede a app en `app.patrimoniodigital.es`
7. Su experiencia se limita por plan contratado

## RESTRICCIONES DE COSTE
- Mes 1-3: <100€/mes total (usando tiers gratuitos)
- Backend: 100% serverless
- Base de datos: neon (gratis 500MB)
- Pagos: Stripe (sin cuota mensual, solo comisión por transacción)
- Email: Resend (gratis 3000 emails/mes)

## ESTRUCTURA DE PLANES
```json
{
  "plans": {
    "free_trial": {
      "price": "0€",
      "duration": "14 días",
      "features": ["1 proyecto activo", "3 modelos 3D", "Exportación básica PDF"],
      "limits": {"projects": 1, "storage": "500MB", "users": 1}
    },
    "starter": {
      "price": "49€/mes",
      "features": ["5 proyectos", "Modelos 3D ilimitados", "RA básica", "2 usuarios"],
      "limits": {"projects": 5, "storage": "10GB", "users": 2}
    },
    "professional": {
      "price": "99€/mes",
      "features": ["Proyectos ilimitados", "RA completa", "IA análisis", "5 usuarios"],
      "limits": {"projects": null, "storage": "50GB", "users": 5}
    },
    "enterprise": {
      "price": "199€/mes",
      "features": ["Todo Professional", "API acceso", "Soporte prioritario", "White-label"],
      "limits": {"projects": null, "storage": "100GB", "users": 20}
    }
  }
}
```

## ESQUEMA DE BASE DE DATOS NECESARIO
```sql
-- Tabla users (neon Auth ya la tiene)
-- Tabla para control de suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL, -- 'free_trial', 'starter', etc.
  status VARCHAR(20) NOT NULL, -- 'active', 'past_due', 'canceled'
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para límites de uso
CREATE TABLE usage_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  projects_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0, -- en bytes
  models_3d_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE
);

-- Tabla para proyectos (tenant isolation)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  -- Metadata específica del plan
  is_trial_project BOOLEAN DEFAULT false
);
```

## ARQUITECTURA DE CARPETAS COMPLETA
```
/patrimonio-saas
├── /public
│   ├── landing-page (Next.js estático)
│   │   ├── /pages
│   │   │   ├── index.jsx (home)
│   │   │   ├── pricing.jsx
│   │   │   ├── features.jsx
│   │   │   ├── blog.jsx
│   │   │   └── contact.jsx
│   │   └── /components
│   │       ├── PricingTable.jsx
│   │       ├── FeatureGrid.jsx
│   │       └── Testimonials.jsx
├── /app (Next.js app router - área privada)
│   ├── /api
│   │   ├── auth/[...nextauth].js
│   │   ├── stripe/webhook.js
│   │   └── admin/
│   ├── /dashboard (solo autenticados)
│   │   ├── page.jsx
│   │   ├── /projects
│   │   │   └── [id]/page.jsx
│   │   └── /billing
│   │       └── page.jsx
│   ├── /admin (solo admin users)
│   │   └── page.jsx
│   ├── middleware.js (control de acceso)
│   └── layout.js (layout principal con auth)
├── /lib
│   ├── neon.js (cliente configurado)
│   ├── stripe.js (configuración Stripe)
│   ├── email.js (envío de emails)
│   └── permissions.js (control por plan)
├── /components
│   ├── /ui (componentes reutilizables)
│   └── /features (funcionalidades app)
├── /hooks
│   ├── useSubscription.js
│   └── useUserPermissions.js
└── package.json
```

## COMPONENTES CLAVE A IMPLEMENTAR

### 1. **Landing Page (Next.js estático)**
```jsx
// components/PricingTable.jsx
export default function PricingTable() {
  const plans = [
    { name: "Starter", price: "49€", features: [...] },
    { name: "Professional", price: "99€", features: [...] },
    { name: "Enterprise", price: "199€", features: [...] }
  ];
  
  return (
    <div className="pricing-grid">
      {plans.map(plan => (
        <div key={plan.name} className="pricing-card">
          <h3>{plan.name}</h3>
          <div className="price">{plan.price}<small>/mes</small></div>
          <ul>{plan.features.map(f => <li key={f}>{f}</li>)}</ul>
          <button onClick={() => redirectToSignup(plan.name)}>
            Comenzar ahora
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2. **Middleware de Control de Acceso**
```javascript
// app/middleware.js
import { NextResponse } from 'next/server';
import { getSubscriptionStatus } from '@/lib/subscription';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Rutas públicas
  if (path.startsWith('/public')) return NextResponse.next();
  
  // Verificar autenticación
  const user = await getCurrentUser();
  if (!user) return redirectToLogin(request);
  
  // Verificar suscripción activa
  const subscription = await getSubscriptionStatus(user.id);
  
  if (!subscription.active && !path.startsWith('/billing')) {
    // Redirigir a página de actualización de plan
    return NextResponse.redirect('/billing/upgrade');
  }
  
  // Verificar límites del plan
  if (path.startsWith('/projects')) {
    const projectCount = await getUserProjectCount(user.id);
    const planLimit = getPlanLimit(subscription.plan);
    
    if (projectCount >= planLimit.projects && path.includes('/new')) {
      return NextResponse.redirect('/billing/upgrade?reason=project_limit');
    }
  }
  
  return NextResponse.next();
}
```

### 3. **Hook de Gestión de Suscripción**
```javascript
// hooks/useSubscription.js
import { useEffect, useState } from 'react';
import { neon } from '@/lib/neon';

export function useSubscription(userId) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchSubscription = async () => {
      const { data, error } = await neon
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (!error && data) {
        setSubscription(data);
        
        // Verificar si está por expirar (notificar)
        const daysLeft = getDaysUntilExpiry(data.current_period_end);
        if (daysLeft <= 7) {
          showRenewalNotification(daysLeft);
        }
      }
      setLoading(false);
    };
    
    fetchSubscription();
    
    // Suscribirse a cambios en tiempo real
    const subscriptionChannel = neon
      .channel(`subscription-${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' },
        fetchSubscription
      )
      .subscribe();
    
    return () => neon.removeChannel(subscriptionChannel);
  }, [userId]);
  
  return { subscription, loading };
}
```

### 4. **Integración Stripe (Checkout)**
```javascript
// app/api/stripe/checkout/route.js
import Stripe from 'stripe';
import { neon } from '@/lib/neon';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId, planId, successUrl, cancelUrl } = await request.json();
  
  // Crear o recuperar cliente Stripe
  let customerId = await getStripeCustomerId(userId);
  
  // Precios configurados en Stripe Dashboard
  const priceIds = {
    'starter': 'price_starter_mensual',
    'professional': 'price_professional_mensual',
    'enterprise': 'price_enterprise_mensual'
  };
  
  // Crear sesión de checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceIds[planId],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId
    }
  });
  
  return Response.json({ url: session.url });
}
```

### 5. **Panel de Administración Básico**
```jsx
// app/admin/page.jsx
'use client';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export default function AdminDashboard() {
  const { users, subscriptions, loading } = useAdminUsers();
  
  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      
      <div className="stats-grid">
        <StatCard title="Usuarios totales" value={users.length} />
        <StatCard title="MRR" value={`${calculateMRR(subscriptions)}€`} />
        <StatCard title="Churn rate" value={`${calculateChurnRate()}%`} />
      </div>
      
      <UsersTable users={users} />
      <SubscriptionsChart subscriptions={subscriptions} />
    </div>
  );
}
```

## FUNCIONALIDADES COMERCIALES IMPRESCINDIBLES

### 1. **Sistema de Prueba Gratuita**
- 14 días automáticos al registrarse
- Límites claros (1 proyecto, 3 modelos)
- Recordatorios en días 7, 10, 13
- Conversión automática a plan pagado o suspensión

### 2. **Facturación y Pagos**
- Stripe para tarjetas (compatible con SEPA)
- Facturas automáticas con IVA español
- Portal del cliente para gestionar suscripción
- Upgrades/downgrades automáticos

### 3. **Email Automatizado**
- Bienvenida y onboarding
- Recordatorio prueba gratuita
- Confirmación de pago
- Notificación de renovación
- Encuestas NPS

### 4. **Analíticas de Conversión**
- Seguimiento de visitas → registros → pagos
- Fuentes de tráfico (Google Ads, redes sociales)
- Tasa de conversión por plan
- LTV y CAC estimados

## DESPLIEGUE Y COSTOS

### **Costo Mes 1 (pre-lanzamiento): ~0€**
- Vercel: Hobby plan (gratis)
- neon: Free tier (gratis)
- Stripe: Sin cuota mensual
- Resend: 3000 emails/mes (gratis)
- Cloudflare R2: 10GB (gratis)

### **Costo Mes 2-3 (primeros 100 usuarios): <50€/mes**
- neon: Pago por uso (<20€)
- Vercel: Pago por uso (<10€)
- Resend: Si se superan 3000 emails (~20€)
- Stripe: Solo % de transacciones (2.4% + 0.30€)

### **Escalado (100+ usuarios): 100-300€/mes**
- neon Pro: 25$/mes
- Vercel Pro: 20$/mes
- Email profesional: 30-50€/mes
- Soporte Stripe priorizado: 0€ (incluido)

## INSTRUCCIONES ESPECÍFICAS PARA CURSOR

1. **Comienza generando la landing page** con:
   - Hero section con valor proposición
   - Grid de características visuales
   - Tabla de precios interactiva
   - Formulario de captación leads

2. **Implementa autenticación con neon Auth** incluyendo:
   - Magic link para login sin contraseña
   - Protección de rutas por rol
   - Middleware para control de acceso

3. **Crea el sistema de suscripciones** que:
   - Sincronice con Stripe via webhooks
   - Aplique límites en tiempo real
   - Permita upgrades/downgrades

4. **Desarrolla el área de aplicación** con:
   - Dashboard personalizado por plan
   - Componentes que respeten límites
   - Notificaciones de uso cercano al límite

5. **Incluye panel de administración** básico para:
   - Ver todos los usuarios
   - Gestionar suscripciones manualmente
   - Ver métricas de negocio

6. **Añade funcionalidades de producto** graduales:
   - TimeMachine4D (solo planes Professional+)
   - Realidad Aumentada (solo Professional+)
   - Exportación avanzada PDF (solo Starter+)

7. **Documenta el proceso de despliegue** completo:
   - Variables de entorno necesarias
   - Configuración de Stripe Dashboard
   - Setup de dominios (app. y www.)
   - Backup y recuperación de datos

## GENERAR EN ESTE ORDEN:

1. **Landing page completa** (Next.js estático)
2. **Sistema de autenticación** (neon + middleware)
3. **Integración Stripe completa** (checkout + portal + webhooks)
4. **Base de datos multi-tenant** con control de límites
5. **Dashboard básico de la app** que respete planes
6. **Funcionalidades premium** por niveles
7. **Panel de administración**
8. **Sistema de emails automatizados**
9. **Analíticas básicas de conversión**
