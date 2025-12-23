import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Obtener un modelo específico
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
    const modelId = params.id

    const models = await query(
      `SELECT * FROM models_3d WHERE id = $1 AND user_id = $2`,
      [modelId, userId]
    )

    if (!models || models.length === 0) {
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ model: models[0] })
  } catch (error: any) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener el modelo' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar un modelo (thumbnail, nombre, etc.)
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
    const modelId = params.id
    const body = await request.json()
    const { thumbnailUrl, name } = body

    // Verificar que el modelo pertenece al usuario
    const models = await query(
      `SELECT id FROM models_3d WHERE id = $1 AND user_id = $2`,
      [modelId, userId]
    )

    if (!models || models.length === 0) {
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 })
    }

    // Construir la actualización dinámicamente
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (thumbnailUrl !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex}`)
      values.push(thumbnailUrl)
      paramIndex++
    }

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`)
      values.push(name)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(modelId)
    values.push(userId)

    await query(
      `UPDATE models_3d SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}`,
      values
    )

    return NextResponse.json({ success: true, message: 'Modelo actualizado' })
  } catch (error: any) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el modelo' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un modelo
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
    const modelId = params.id

    // Verificar que el modelo pertenece al usuario
    const models = await query(
      `SELECT id FROM models_3d WHERE id = $1 AND user_id = $2`,
      [modelId, userId]
    )

    if (!models || models.length === 0) {
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 })
    }

    await query(
      `DELETE FROM models_3d WHERE id = $1 AND user_id = $2`,
      [modelId, userId]
    )

    // Actualizar contador
    await query(
      `UPDATE usage_limits SET models_3d_count = GREATEST(0, models_3d_count - 1) WHERE user_id = $1`,
      [userId]
    )

    return NextResponse.json({ success: true, message: 'Modelo eliminado' })
  } catch (error: any) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el modelo' },
      { status: 500 }
    )
  }
}

