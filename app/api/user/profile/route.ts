import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const user = await queryOne(
            `SELECT full_name, email, company, phone, avatar_url FROM users WHERE id = $1`,
            [userId]
        )

        return NextResponse.json({ user })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const body = await request.json()
        const { fullName, company, phone } = body

        // Validación básica
        if (!fullName) {
            return NextResponse.json({ error: 'El nombre completo es obligatorio' }, { status: 400 })
        }

        await query(
            `UPDATE users SET full_name = $1, company = $2, phone = $3, updated_at = datetime('now') WHERE id = $4`,
            [fullName, company || null, phone || null, userId]
        )

        // Si estás usando Postgres en producción, la query sería ligeramente diferente para updated_at (NOW())
        // pero lib/db.ts debería manejar la diferencia o podríamos usar un helper si fuera necesario.
        // Dado que el script de setup usa datetime('now') para SQLite, asumimos compatibilidad o ajuste en db.ts

        return NextResponse.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            user: {
                name: fullName,
                company,
                phone
            }
        })
    } catch (error: any) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: error.message || 'Error al actualizar perfil' },
            { status: 500 }
        )
    }
}
