import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, Subscription } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo permitir consultar la propia suscripción (a menos que sea admin)
    const requestedUserId = userId || (session.user as any).id
    if (requestedUserId !== (session.user as any).id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const subscription = await queryOne<Subscription>(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [requestedUserId]
    )

    return NextResponse.json({ subscription })
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener suscripción' },
      { status: 500 }
    )
  }
}

