import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener proyectos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const projects = await query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    )

    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener proyectos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { name, description, location, startDate } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre del proyecto es obligatorio' },
        { status: 400 }
      )
    }

    const projectId = generateUUID()

    await query(
      `INSERT INTO projects (id, user_id, name, description, location, start_date, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [projectId, userId, name.trim(), description || null, location || null, startDate || null, 'active']
    )

    // Actualizar contador de proyectos en usage_limits
    await query(
      `UPDATE usage_limits SET projects_count = projects_count + 1 WHERE user_id = $1`,
      [userId]
    )

    return NextResponse.json({ 
      success: true, 
      projectId,
      message: 'Proyecto creado exitosamente' 
    })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear el proyecto' },
      { status: 500 }
    )
  }
}

