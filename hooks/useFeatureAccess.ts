import { useSubscription } from './useSubscription'

export function useFeatureAccess(userId: string | undefined) {
    const { subscription, isTrial, loading } = useSubscription(userId)

    // Calcular si el trial ha expirado
    const isTrialExpired = () => {
        if (!isTrial || !subscription?.trial_end) return false
        const trialEnd = new Date(subscription.trial_end)
        const now = new Date()
        const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        return daysLeft === 0
    }

    // Verificar si el usuario tiene acceso a funciones premium
    const hasAccess = () => {
        if (loading) return false
        if (!subscription) return false

        // Si el trial expiró, no tiene acceso
        if (isTrialExpired()) return false

        // Si tiene un plan activo (no trial o trial activo), tiene acceso
        return subscription.status === 'active' || subscription.status === 'trialing'
    }

    // Verificar límites específicos
    const canCreateProject = (currentCount: number) => {
        if (!hasAccess()) return false

        const limits = {
            free_trial: 5,
            starter: 10,
            professional: 50,
            enterprise: -1 // ilimitado
        }

        const maxProjects = limits[subscription?.plan_id as keyof typeof limits] || 5
        return maxProjects === -1 || currentCount < maxProjects
    }

    const canUploadModel = (currentCount: number) => {
        if (!hasAccess()) return false

        const limits = {
            free_trial: 10,
            starter: 25,
            professional: 100,
            enterprise: -1
        }

        const maxModels = limits[subscription?.plan_id as keyof typeof limits] || 10
        return maxModels === -1 || currentCount < maxModels
    }

    return {
        hasAccess: hasAccess(),
        isTrialExpired: isTrialExpired(),
        canCreateProject,
        canUploadModel,
        subscription,
        loading
    }
}
