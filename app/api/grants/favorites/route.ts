import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, generateUUID } from '@/lib/db'

// GET - Obtener favoritos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const favorites = await query(
      `SELECT gf.*, g.* 
       FROM grant_favorites gf
       JOIN grants g ON gf.grant_id = g.id
       WHERE gf.user_id = $1
       ORDER BY gf.created_at DESC`,
      [userId]
    )

    return NextResponse.json({ favorites })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener favoritos' },
      { status: 500 }
    )
  }
}

// POST - Añadir/quitar favorito
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { grantId, notes } = await request.json()

    if (!grantId) {
      return NextResponse.json({ error: 'Se requiere grantId' }, { status: 400 })
    }

    // Verificar si ya existe
    const existing = await query(
      `SELECT id FROM grant_favorites WHERE user_id = $1 AND grant_id = $2`,
      [userId, grantId]
    )

    if (existing && existing.length > 0) {
      // Quitar de favoritos
      await query(
        `DELETE FROM grant_favorites WHERE user_id = $1 AND grant_id = $2`,
        [userId, grantId]
      )
      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      // Añadir a favoritos
      await query(
        `INSERT INTO grant_favorites (id, user_id, grant_id, notes) VALUES ($1, $2, $3, $4)`,
        [generateUUID(), userId, grantId, notes || null]
      )
      return NextResponse.json({ success: true, action: 'added' })
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: error.message || 'Error al modificar favorito' },
      { status: 500 }
    )
  }
}

