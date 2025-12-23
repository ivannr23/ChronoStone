import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Configuración de planes
export const PLANS = {
  free_trial: {
    id: 'free_trial',
    name: 'Prueba Gratuita',
    price: 0,
    priceId: null,
    duration: '14 días',
    features: [
      '1 proyecto activo',
      '3 modelos 3D',
      'Exportación básica PDF',
      'Soporte por email',
    ],
    limits: {
      projects: 1,
      storage: 500 * 1024 * 1024, // 500MB en bytes
      models: 3,
      users: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      '5 proyectos activos',
      'Modelos 3D ilimitados',
      'Realidad Aumentada básica',
      '2 usuarios',
      'Exportación avanzada PDF',
      'Soporte prioritario',
    ],
    limits: {
      projects: 5,
      storage: 10 * 1024 * 1024 * 1024, // 10GB
      models: null, // ilimitado
      users: 2,
    },
    popular: false,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    features: [
      'Proyectos ilimitados',
      'Modelos 3D ilimitados',
      'Realidad Aumentada completa',
      'IA análisis de deterioro',
      '5 usuarios',
      'Exportación avanzada PDF',
      'Soporte prioritario 24/7',
      'TimeMachine4D incluido',
    ],
    limits: {
      projects: null, // ilimitado
      storage: 50 * 1024 * 1024 * 1024, // 50GB
      models: null,
      users: 5,
    },
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: [
      'Todo de Professional',
      'API de acceso completa',
      'White-label personalizado',
      '20 usuarios',
      'Integración con sistemas legacy',
      'Soporte dedicado 24/7',
      'SLA garantizado 99.9%',
      'Formación personalizada',
    ],
    limits: {
      projects: null,
      storage: 100 * 1024 * 1024 * 1024, // 100GB
      models: null,
      users: 20,
    },
    popular: false,
  },
}

export type PlanId = keyof typeof PLANS

// Función helper para obtener info del plan
export function getPlanById(planId: string) {
  return PLANS[planId as PlanId] || PLANS.free_trial
}

// Función para crear o recuperar cliente Stripe
export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const { supabaseAdmin } = await import('./supabase')
  
  // Verificar si ya existe un customer_id
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id
  }

  // Crear nuevo cliente en Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })

  return customer.id
}

// Función para crear sesión de checkout
export async function createCheckoutSession({
  userId,
  email,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  email: string
  planId: PlanId
  successUrl: string
  cancelUrl: string
}) {
  const plan = PLANS[planId]
  
  if (!plan.priceId) {
    throw new Error('Plan no válido para checkout')
  }

  const customerId = await getOrCreateStripeCustomer(userId, email)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })

  return session
}

// Función para crear portal de cliente
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

