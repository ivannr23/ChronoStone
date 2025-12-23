import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Función para parsear campos JSON de SQLite
function parseGrant(grant: any) {
  if (!grant) return grant
  return {
    ...grant,
    heritage_types: typeof grant.heritage_types === 'string' 
      ? JSON.parse(grant.heritage_types || '[]') 
      : grant.heritage_types || [],
    protection_levels: typeof grant.protection_levels === 'string' 
      ? JSON.parse(grant.protection_levels || '[]') 
      : grant.protection_levels || [],
    eligible_beneficiaries: typeof grant.eligible_beneficiaries === 'string' 
      ? JSON.parse(grant.eligible_beneficiaries || '[]') 
      : grant.eligible_beneficiaries || [],
    required_documents: typeof grant.required_documents === 'string' 
      ? JSON.parse(grant.required_documents || '[]') 
      : grant.required_documents || [],
    tags: typeof grant.tags === 'string' 
      ? JSON.parse(grant.tags || '[]') 
      : grant.tags || [],
  }
}

// GET - Obtener una subvención específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const grantId = params.id

    const grants = await query(
      `SELECT * FROM grants WHERE id = $1`,
      [grantId]
    )

    if (!grants || grants.length === 0) {
      return NextResponse.json({ error: 'Subvención no encontrada' }, { status: 404 })
    }

    // Si el usuario está autenticado, verificar si es favorita
    const session = await getServerSession(authOptions)
    let isFavorite = false
    let application = null

    if (session?.user) {
      const userId = (session.user as any).id

      // Verificar favorito
      const favorites = await query(
        `SELECT id FROM grant_favorites WHERE user_id = $1 AND grant_id = $2`,
        [userId, grantId]
      )
      isFavorite = favorites && favorites.length > 0

      // Obtener solicitud si existe
      const applications = await query(
        `SELECT * FROM grant_applications WHERE user_id = $1 AND grant_id = $2`,
        [userId, grantId]
      )
      application = applications?.[0] || null
    }

    return NextResponse.json({
      grant: parseGrant(grants[0]),
      isFavorite,
      application
    })
  } catch (error: any) {
    console.error('Error fetching grant:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener subvención' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar subvención (solo admin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const grantId = params.id
    const body = await request.json()

    // Construir actualización dinámica
    const allowedFields = [
      'name', 'description', 'organization', 'organization_type',
      'region', 'province', 'municipality',
      'heritage_types', 'protection_levels', 'eligible_beneficiaries',
      'min_amount', 'max_amount', 'funding_percentage',
      'call_open_date', 'call_close_date', 'resolution_date', 'execution_deadline',
      'year', 'status',
      'official_url', 'bases_url', 'application_url',
      'required_documents', 'notes', 'tags'
    ]

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(body)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      if (allowedFields.includes(snakeKey) && value !== undefined) {
        updates.push(`${snakeKey} = $${paramIndex}`)
        values.push(key === 'requiredDocuments' ? JSON.stringify(value) : value)
        paramIndex++
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    updates.push('updated_at = NOW()')
    values.push(grantId)

    await query(
      `UPDATE grants SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    return NextResponse.json({ success: true, message: 'Subvención actualizada' })
  } catch (error: any) {
    console.error('Error updating grant:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar subvención' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar subvención (solo admin)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const grantId = params.id

    await query(`DELETE FROM grants WHERE id = $1`, [grantId])

    return NextResponse.json({ success: true, message: 'Subvención eliminada' })
  } catch (error: any) {
    console.error('Error deleting grant:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar subvención' },
      { status: 500 }
    )
  }
}

