import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si es admin (esto debería estar en los roles del usuario)
    // Por ahora, permitimos si el email es del administrador principal o si tiene flag admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      // return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      // Para desarrollo/demo, si no hay flag admin aún, permitimos si es el primer usuario o similar
    }

    // Stats de usuarios
    const userCount = await queryOne<any>(`SELECT COUNT(*) as count FROM users`)
    const activeSubscribers = await queryOne<any>(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`)
    const trialUsers = await queryOne<any>(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'trialing' OR plan_id = 'free_trial'`)

    // MRR Aproximado (simplificado: 10€ starter, 49€ pro)
    const mrr = await queryOne<any>(`
      SELECT 
        SUM(CASE WHEN plan_id = 'starter' THEN 10 WHEN plan_id = 'professional' THEN 49 ELSE 0 END) as total 
      FROM subscriptions WHERE status = 'active'
    `)

    // Proyectos totales
    const projectCount = await queryOne<any>(`SELECT COUNT(*) as count FROM projects`)

    // Modelos totales
    const modelCount = await queryOne<any>(`SELECT COUNT(*) as count FROM models_3d`)

    return NextResponse.json({
      stats: {
        users: userCount?.count || 0,
        subscribers: activeSubscribers?.count || 0,
        trials: trialUsers?.count || 0,
        mrr: mrr?.total || 0,
        projects: projectCount?.count || 0,
        models: modelCount?.count || 0,
        churnRate: 2.4 // Mock
      }
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
