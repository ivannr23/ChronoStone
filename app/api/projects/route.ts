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
      `SELECT DISTINCT p.* FROM projects p
       LEFT JOIN project_collaborators c ON p.id = c.project_id
       WHERE p.user_id = $1 OR c.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId, userId]
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

// POST - Crear nuevo proyecto o duplicar existente
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { name, description, location, startDate, duplicateFrom } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre del proyecto es obligatorio' },
        { status: 400 }
      )
    }

    const projectId = generateUUID()

    // Si es una duplicación
    if (duplicateFrom) {
      // Obtener el proyecto original
      const originalProject = await queryOne<any>(
        `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
        [duplicateFrom, userId]
      )

      if (!originalProject) {
        return NextResponse.json({ error: 'Proyecto original no encontrado' }, { status: 404 })
      }

      // Duplicar el proyecto
      await query(
        `INSERT INTO projects (
          id, user_id, name, description, location, start_date, status, 
          project_status, heritage_type, protection_level, budget, client_owner, 
          estimated_end_date, progress_percentage, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
        [
          projectId,
          userId,
          name.trim(),
          originalProject.description,
          originalProject.location,
          originalProject.start_date,
          originalProject.status,
          originalProject.project_status,
          originalProject.heritage_type,
          originalProject.protection_level,
          originalProject.budget,
          originalProject.client_owner,
          originalProject.estimated_end_date,
          originalProject.progress_percentage
        ]
      )

      // Opcional: Duplicar modelos 3D? (Normalmente no se duplican los archivos físicos pero se podrían copiar las referencias)
      // Por ahora solo duplicamos los metadatos del proyecto
    } else {
      // Crear proyecto normal
      await query(
        `INSERT INTO projects (id, user_id, name, description, location, start_date, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [projectId, userId, name.trim(), description || null, location || null, startDate || null, 'active']
      )
    }

    // Actualizar contador de proyectos en usage_limits
    await query(
      `UPDATE usage_limits SET projects_count = projects_count + 1 WHERE user_id = $1`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      projectId,
      message: duplicateFrom ? 'Proyecto duplicado exitosamente' : 'Proyecto creado exitosamente'
    })
  } catch (error: any) {
    console.error('Error creating/duplicating project:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

