'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from './useSubscription'
import { PLANS, type PlanId } from '@/lib/stripe'

export function useUserPermissions(userId: string | undefined) {
  const { subscription, loading: subscriptionLoading } = useSubscription(userId)
  const [limits, setLimits] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (subscriptionLoading) return

    if (!subscription) {
      setLimits(PLANS.free_trial.limits)
      setLoading(false)
      return
    }

    const plan = PLANS[subscription.plan_id as PlanId]
    setLimits(plan.limits)
    setLoading(false)
  }, [subscription, subscriptionLoading])

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false

    const planId = subscription.plan_id as PlanId
    const plan = PLANS[planId]

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

    return requiredPlans.includes(planId)
  }

  const canCreateProject = async (): Promise<boolean> => {
    if (!userId || !limits) return false

    // Si el límite de proyectos es null (ilimitado), siempre permitir
    if (limits.projects === null) {
      return true
    }

    // Verificar uso actual
    const response = await fetch(`/api/usage/check?userId=${userId}&type=projects`)
    const data = await response.json()

    return data.allowed
  }

  const canUploadModel = async (): Promise<boolean> => {
    if (!userId || !limits) return false

    // Si el límite de modelos es null (ilimitado), siempre permitir
    if (limits.models === null) {
      return true
    }

    // Verificar uso actual
    const response = await fetch(`/api/usage/check?userId=${userId}&type=models`)
    const data = await response.json()

    return data.allowed
  }

  return {
    limits,
    loading,
    hasFeature,
    canCreateProject,
    canUploadModel,
    planName: subscription ? PLANS[subscription.plan_id as PlanId].name : 'Free Trial',
  }
}

