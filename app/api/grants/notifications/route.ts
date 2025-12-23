import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Obtener notificaciones del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    let whereClause = 'WHERE gn.user_id = $1'
    if (unreadOnly) {
      whereClause += ' AND gn.read = false'
    }

    const notifications = await query(
      `SELECT gn.*, g.name as grant_name
       FROM grant_notifications gn
       LEFT JOIN grants g ON gn.grant_id = g.id
       ${whereClause}
       ORDER BY gn.created_at DESC
       LIMIT $2`,
      [userId, limit]
    )

    const unreadCount = await query(
      `SELECT COUNT(*) as count FROM grant_notifications WHERE user_id = $1 AND read = false`,
      [userId]
    )

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: parseInt(unreadCount[0]?.count || '0')
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener notificaciones' },
      { status: 500 }
    )
  }
}

// PATCH - Marcar notificaciones como leidas
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { notificationIds, markAllRead } = await request.json()

    if (markAllRead) {
      await query(
        `UPDATE grant_notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND read = false`,
        [userId]
      )
    } else if (notificationIds && notificationIds.length > 0) {
      await query(
        `UPDATE grant_notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND id = ANY($2)`,
        [userId, notificationIds]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar notificaciones' },
      { status: 500 }
    )
  }
}

