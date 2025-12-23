import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// GET - Obtener un proyecto específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const projectId = params.id

    const project = await queryOne(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Obtener modelos 3D del proyecto
    const models = await query(
      `SELECT * FROM models_3d WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    )

    return NextResponse.json({ project, models })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener el proyecto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un proyecto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const projectId = params.id

    // Verificar que el proyecto pertenece al usuario
    const project = await queryOne(
      `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Eliminar modelos 3D asociados primero
    await query(`DELETE FROM models_3d WHERE project_id = $1`, [projectId])

    // Eliminar el proyecto
    await query(`DELETE FROM projects WHERE id = $1`, [projectId])

    // Actualizar contador de proyectos
    await query(
      `UPDATE usage_limits SET projects_count = GREATEST(projects_count - 1, 0) WHERE user_id = $1`,
      [userId]
    )

    return NextResponse.json({ success: true, message: 'Proyecto eliminado' })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el proyecto' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar un proyecto
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const projectId = params.id
    const body = await request.json()
    const {
      name,
      description,
      location,
      status,
      start_date,
      estimated_end_date,
      project_status,
      heritage_type,
      protection_level,
      budget,
      client_owner,
      progress_percentage
    } = body

    // Verificar que el proyecto pertenece al usuario
    const project = await queryOne(
      `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Construir la consulta dinámicamente solo con los campos proporcionados
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(description)
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`)
      values.push(location)
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`)
      values.push(status)
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`)
      values.push(start_date || null)
    }
    if (estimated_end_date !== undefined) {
      updates.push(`estimated_end_date = $${paramCount++}`)
      values.push(estimated_end_date || null)
    }
    if (project_status !== undefined) {
      updates.push(`project_status = $${paramCount++}`)
      values.push(project_status)
    }
    if (heritage_type !== undefined) {
      updates.push(`heritage_type = $${paramCount++}`)
      values.push(heritage_type || null)
    }
    if (protection_level !== undefined) {
      updates.push(`protection_level = $${paramCount++}`)
      values.push(protection_level || null)
    }
    if (budget !== undefined) {
      updates.push(`budget = $${paramCount++}`)
      values.push(budget || null)
    }
    if (client_owner !== undefined) {
      updates.push(`client_owner = $${paramCount++}`)
      values.push(client_owner || null)
    }
    if (progress_percentage !== undefined) {
      updates.push(`progress_percentage = $${paramCount++}`)
      values.push(progress_percentage)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(projectId)

    const updateQuery = `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramCount}`

    await query(updateQuery, values)

    return NextResponse.json({ success: true, message: 'Proyecto actualizado' })
  } catch (error: any) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el proyecto' },
      { status: 500 }
    )
  }
}

