import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que es admin
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener estadísticas
    const usersResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM users')
    const totalUsers = parseInt(usersResult[0]?.count || '0')

    const activeResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status = $1`,
      ['active']
    )
    const activeSubscribers = parseInt(activeResult[0]?.count || '0')

    const trialResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status = $1`,
      ['trialing']
    )
    const trialUsers = parseInt(trialResult[0]?.count || '0')

    const projectsResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM projects')
    const totalProjects = parseInt(projectsResult[0]?.count || '0')

    // Calcular MRR aproximado
    const starterCount = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM subscriptions WHERE plan_id = $1 AND status = $2`,
      ['starter', 'active']
    )
    const proCount = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM subscriptions WHERE plan_id = $1 AND status = $2`,
      ['professional', 'active']
    )
    const enterpriseCount = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM subscriptions WHERE plan_id = $1 AND status = $2`,
      ['enterprise', 'active']
    )

    const monthlyRevenue = 
      parseInt(starterCount[0]?.count || '0') * 49 +
      parseInt(proCount[0]?.count || '0') * 99 +
      parseInt(enterpriseCount[0]?.count || '0') * 199

    // Obtener usuarios recientes con su suscripción
    const users = await query(
      `SELECT u.id, u.email, u.full_name, u.created_at, s.plan_id, s.status
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id
       ORDER BY u.created_at DESC
       LIMIT 50`
    )

    return NextResponse.json({
      stats: {
        totalUsers,
        activeSubscribers,
        trialUsers,
        monthlyRevenue,
        totalProjects,
      },
      users,
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

