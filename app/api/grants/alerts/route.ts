import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, generateUUID } from '@/lib/db'

// GET - Obtener configuración de alertas del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const alerts = await query(
      `SELECT * FROM grant_alerts WHERE user_id = $1`,
      [userId]
    )

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error: any) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener alertas' },
      { status: 500 }
    )
  }
}

// POST - Crear/actualizar configuración de alertas
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()

    const {
      regions,
      heritageTypes,
      organizationTypes,
      minAmount,
      emailEnabled,
      pushEnabled,
      frequency
    } = body

    // Verificar si ya existe una configuración
    const existing = await query(
      `SELECT id FROM grant_alerts WHERE user_id = $1`,
      [userId]
    )

    if (existing && existing.length > 0) {
      // Actualizar
      await query(
        `UPDATE grant_alerts SET 
          regions = $1, 
          heritage_types = $2, 
          organization_types = $3,
          min_amount = $4,
          email_enabled = $5,
          push_enabled = $6,
          frequency = $7,
          updated_at = NOW()
         WHERE user_id = $8`,
        [
          regions || [],
          heritageTypes || [],
          organizationTypes || [],
          minAmount || null,
          emailEnabled !== false,
          pushEnabled !== false,
          frequency || 'immediate',
          userId
        ]
      )
    } else {
      // Crear
      await query(
        `INSERT INTO grant_alerts (
          id, user_id, regions, heritage_types, organization_types,
          min_amount, email_enabled, push_enabled, frequency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          generateUUID(),
          userId,
          regions || [],
          heritageTypes || [],
          organizationTypes || [],
          minAmount || null,
          emailEnabled !== false,
          pushEnabled !== false,
          frequency || 'immediate'
        ]
      )
    }

    return NextResponse.json({ success: true, message: 'Alertas configuradas' })
  } catch (error: any) {
    console.error('Error saving alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Error al guardar alertas' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar configuración de alertas
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    await query(`DELETE FROM grant_alerts WHERE user_id = $1`, [userId])

    return NextResponse.json({ success: true, message: 'Alertas eliminadas' })
  } catch (error: any) {
    console.error('Error deleting alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar alertas' },
      { status: 500 }
    )
  }
}

