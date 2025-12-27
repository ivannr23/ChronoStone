import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// DELETE - Eliminar una partida
export async function DELETE(
    request: Request,
    { params }: { params: { id: string, itemId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const itemId = params.itemId

        // Verificar propiedad del proyecto
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        await query(
            `DELETE FROM project_budget_items WHERE id = $1 AND project_id = $2`,
            [itemId, projectId]
        )

        return NextResponse.json({ success: true, message: 'Partida eliminada' })
    } catch (error: any) {
        console.error('Error deleting budget item:', error)
        return NextResponse.json(
            { error: error.message || 'Error al eliminar la partida' },
            { status: 500 }
        )
    }
}
