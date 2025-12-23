import { PLANS, type PlanId } from './stripe'
import { supabaseAdmin } from './supabase'

// Verificar si el usuario tiene acceso a una funcionalidad
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription || subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false
  }

  const plan = PLANS[subscription.plan_id as PlanId]
  
  // Mapeo de features premium
  const featureRequirements: Record<string, PlanId[]> = {
    'timemachine4d': ['professional', 'enterprise'],
    'ar_complete': ['professional', 'enterprise'],
    'ai_analysis': ['professional', 'enterprise'],
    'api_access': ['enterprise'],
    'white_label': ['enterprise'],
    'advanced_export': ['starter', 'professional', 'enterprise'],
  }

  const requiredPlans = featureRequirements[feature]
  
  if (!requiredPlans) {
    return true // Feature no restringida
  }

  return requiredPlans.includes(subscription.plan_id as PlanId)
}

// Verificar límites de uso
export async function checkUsageLimit(
  userId: string,
  limitType: 'projects' | 'storage' | 'models' | 'users'
): Promise<{ allowed: boolean; current: number; limit: number | null; percentage: number }> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, current: 0, limit: 0, percentage: 100 }
  }

  const plan = PLANS[subscription.plan_id as PlanId]
  const limit = plan.limits[limitType]

  // Si el límite es null (ilimitado), siempre permitir
  if (limit === null) {
    return { allowed: true, current: 0, limit: null, percentage: 0 }
  }

  // Obtener uso actual
  const { data: usage } = await supabaseAdmin
    .from('usage_limits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!usage) {
    return { allowed: true, current: 0, limit, percentage: 0 }
  }

  let current = 0
  switch (limitType) {
    case 'projects':
      current = usage.projects_count
      break
    case 'storage':
      current = usage.storage_used
      break
    case 'models':
      current = usage.models_3d_count
      break
    case 'users':
      current = 1 // Por ahora, solo contamos el usuario principal
      break
  }

  const percentage = limit ? (current / limit) * 100 : 0
  const allowed = current < limit

  return { allowed, current, limit, percentage }
}

// Incrementar contador de uso
export async function incrementUsage(
  userId: string,
  limitType: 'projects' | 'models',
  amount: number = 1
): Promise<void> {
  const field = limitType === 'projects' ? 'projects_count' : 'models_3d_count'
  
  await supabaseAdmin.rpc('increment_usage', {
    p_user_id: userId,
    p_field: field,
    p_amount: amount,
  })
}

// Decrementar contador de uso
export async function decrementUsage(
  userId: string,
  limitType: 'projects' | 'models',
  amount: number = 1
): Promise<void> {
  const field = limitType === 'projects' ? 'projects_count' : 'models_3d_count'
  
  await supabaseAdmin.rpc('decrement_usage', {
    p_user_id: userId,
    p_field: field,
    p_amount: amount,
  })
}

// Actualizar uso de storage
export async function updateStorageUsage(userId: string, bytes: number): Promise<void> {
  await supabaseAdmin
    .from('usage_limits')
    .update({ storage_used: bytes })
    .eq('user_id', userId)
}

// Obtener suscripción del usuario
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

// Obtener límites del plan actual
export async function getUserLimits(userId: string) {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return PLANS.free_trial.limits
  }

  return PLANS[subscription.plan_id as PlanId].limits
}

// Verificar si la suscripción está próxima a expirar
export function isSubscriptionExpiringSoon(subscription: any, daysThreshold: number = 7): boolean {
  if (!subscription?.current_period_end) {
    return false
  }

  const endDate = new Date(subscription.current_period_end)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
}

// Verificar si la prueba gratuita está próxima a expirar
export function isTrialExpiringSoon(subscription: any, daysThreshold: number = 3): boolean {
  if (subscription?.status !== 'trialing' || !subscription?.trial_end) {
    return false
  }

  const endDate = new Date(subscription.trial_end)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
}

// Obtener días restantes de la prueba
export function getTrialDaysRemaining(subscription: any): number {
  if (subscription?.status !== 'trialing' || !subscription?.trial_end) {
    return 0
  }

  const endDate = new Date(subscription.trial_end)
  const now = new Date()
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return Math.max(0, daysRemaining)
}

