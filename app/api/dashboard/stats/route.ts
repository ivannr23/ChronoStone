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

    const userId = (session.user as any).id

    // Obtener conteo de proyectos
    const projectsResult = await query(
      `SELECT COUNT(*) as count FROM projects WHERE user_id = $1`,
      [userId]
    )
    const projectsCount = parseInt((projectsResult[0] as any)?.count || '0')

    // Desglose por estado de proyecto
    const statusResult = await query(
      `SELECT project_status, COUNT(*) as count FROM projects WHERE user_id = $1 GROUP BY project_status`,
      [userId]
    )
    const projectStatusBreakdown = (statusResult as any[]).reduce((acc, curr) => {
      acc[curr.project_status || 'planning'] = parseInt(curr.count)
      return acc
    }, {} as Record<string, number>)

    // Obtener conteo de modelos 3D
    const modelsResult = await query(
      `SELECT COUNT(*) as count FROM models_3d WHERE user_id = $1`,
      [userId]
    )
    const modelsCount = parseInt((modelsResult[0] as any)?.count || '0')

    // Obtener almacenamiento usado (suma de tamaños de archivos)
    const storageResult = await query(
      `SELECT COALESCE(SUM(file_size), 0) as total FROM models_3d WHERE user_id = $1`,
      [userId]
    )
    const storageUsed = parseInt((storageResult[0] as any)?.total || '0')
    const storageUsedMB = Math.round(storageUsed / (1024 * 1024))

    // Obtener actividad reciente (últimos proyectos y modelos)
    const recentProjects = await query(
      `SELECT id, name, 'project' as type, created_at 
       FROM projects 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    )

    const recentModels = await query(
      `SELECT m.id, m.name, 'model' as type, m.created_at, p.name as project_name
       FROM models_3d m
       LEFT JOIN projects p ON m.project_id = p.id
       WHERE m.user_id = $1 
       ORDER BY m.created_at DESC 
       LIMIT 5`,
      [userId]
    )

    // Combinar y ordenar actividad reciente
    const allActivity = [
      ...(recentProjects as any[]).map(p => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        subtitle: 'Proyecto creado',
        date: p.created_at
      })),
      ...(recentModels as any[]).map(m => ({
        id: m.id,
        type: 'model' as const,
        title: m.name,
        subtitle: m.project_name ? `En ${m.project_name}` : 'Modelo 3D subido',
        date: m.created_at
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

    return NextResponse.json({
      stats: {
        projects: projectsCount,
        models: modelsCount,
        storage: storageUsedMB,
        projectStatusBreakdown
      },
      recentActivity: allActivity
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

