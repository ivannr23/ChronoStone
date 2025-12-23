import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// POST - Archivar/Desarchivar un proyecto
export async function POST(
    request: NextRequest,
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
        const { archived } = body

        // Verificar que el proyecto pertenece al usuario
        const project = await queryOne(
            `SELECT id, status FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        // Actualizar el estado
        const newStatus = archived ? 'archived' : 'active'

        await query(
            `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2`,
            [newStatus, projectId]
        )

        return NextResponse.json({
            success: true,
            message: archived ? 'Proyecto archivado' : 'Proyecto restaurado',
            status: newStatus
        })
    } catch (error: any) {
        console.error('Error archiving/unarchiving project:', error)
        return NextResponse.json(
            { error: error.message || 'Error al actualizar el proyecto' },
            { status: 500 }
        )
    }
}
