'use client'

import { useEffect, useState } from 'react'

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | number
  trial_start: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  maxProjects: number
  maxModels: number
  maxStorage: number // en MB
  maxUsers: number
}

// Límites por plan
const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    maxProjects: 5,
    maxModels: 10,
    maxStorage: 10000, // 10GB
    maxUsers: 2,
  },
  professional: {
    maxProjects: -1, // ilimitado
    maxModels: -1,
    maxStorage: 50000, // 50GB
    maxUsers: 5,
  },
  enterprise: {
    maxProjects: -1,
    maxModels: -1,
    maxStorage: 100000, // 100GB
    maxUsers: 20,
  },
}

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Si no hay userId, no intentamos cargar
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/subscription?userId=${userId}`)
        const data = await response.json()

        if (data.error) {
          console.error('Subscription API error:', data.error)
          throw new Error(data.error)
        }

        console.log('Subscription loaded:', data.subscription)
        setSubscription(data.subscription)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching subscription:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  // Determinar si la suscripción está activa
  // - "active" = pagando
  // - "trialing" = en prueba gratuita
  // - null/undefined = sin suscripción (tratamos como activo para nuevos usuarios)
  const status = subscription?.status
  const isActive = status === 'active' || status === 'trialing'
  const isTrial = status === 'trialing'
  const isPending = status === 'pending'

  // Obtener límites del plan
  const planId = subscription?.plan_id || 'starter'
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.starter

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrial,
    isPending,
    planId,
    limits,
  }
}
