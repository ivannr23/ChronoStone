import { useEffect, useState } from 'react'

interface UsageData {
    projects_count: number
    storage_used: number
    models_3d_count: number
    plan_limits: {
        max_projects: number
        max_storage: number
        max_models: number
    }
}

export function useUsage(userId?: string) {
    const [usage, setUsage] = useState<UsageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/usage')

                if (!response.ok) {
                    throw new Error('Error al cargar el uso')
                }

                const data = await response.json()
                setUsage(data)
            } catch (err: any) {
                console.error('Error fetching usage:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchUsage()
    }, [userId])

    const getPercentage = (used: number, max: number) => {
        if (max === -1) return 0 // Unlimited
        return Math.min((used / max) * 100, 100)
    }

    const isNearLimit = (used: number, max: number, threshold = 0.8) => {
        if (max === -1) return false // Unlimited
        return used >= max * threshold
    }

    const isOverLimit = (used: number, max: number) => {
        if (max === -1) return false // Unlimited
        return used >= max
    }

    return {
        usage,
        loading,
        error,
        getPercentage,
        isNearLimit,
        isOverLimit
    }
}
