import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne } from '@/lib/db'

// Límites por plan
const PLAN_LIMITS: Record<string, { max_projects: number; max_storage: number; max_models: number }> = {
    free_trial: {
        max_projects: 3,
        max_storage: 5 * 1024 * 1024 * 1024, // 5GB en bytes
        max_models: 10
    },
    starter: {
        max_projects: 5,
        max_storage: 10 * 1024 * 1024 * 1024, // 10GB
        max_models: 50
    },
    professional: {
        max_projects: -1, // Unlimited
        max_storage: 50 * 1024 * 1024 * 1024, // 50GB
        max_models: -1 // Unlimited
    },
    enterprise: {
        max_projects: -1, // Unlimited
        max_storage: 100 * 1024 * 1024 * 1024, // 100GB
        max_models: -1 // Unlimited
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id

        // Obtener uso actual
        const usage = await queryOne(
            `SELECT projects_count, storage_used, models_3d_count FROM usage_limits WHERE user_id = $1`,
            [userId]
        )

        if (!usage) {
            return NextResponse.json({ error: 'Datos de uso no encontrados' }, { status: 404 })
        }

        // Obtener plan actual
        const subscription = await queryOne(
            `SELECT plan_id FROM subscriptions WHERE user_id = $1`,
            [userId]
        )

        const planId = (subscription as any)?.plan_id || 'free_trial'
        const planLimits = PLAN_LIMITS[planId] || PLAN_LIMITS.free_trial

        return NextResponse.json({
            projects_count: (usage as any).projects_count || 0,
            storage_used: (usage as any).storage_used || 0,
            models_3d_count: (usage as any).models_3d_count || 0,
            plan_limits: planLimits,
            plan_id: planId
        })
    } catch (error: any) {
        console.error('Error fetching usage:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener el uso' },
            { status: 500 }
        )
    }
}
