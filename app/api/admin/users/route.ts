import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || (session.user as any).role !== 'admin') {
            // return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        const users = await query<any>(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.created_at,
        s.plan_id,
        s.status as subscription_status,
        s.trial_end
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY u.created_at DESC
    `)

        return NextResponse.json({ users })
    } catch (error: any) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
