import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// DELETE - Eliminar una imagen
export async function DELETE(
    request: Request,
    { params }: { params: { id: string, imageId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const imageId = params.imageId

        // Verificar propiedad
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        await query(
            `DELETE FROM project_images WHERE id = $1 AND project_id = $2`,
            [imageId, projectId]
        )

        return NextResponse.json({ success: true, message: 'Imagen eliminada' })
    } catch (error: any) {
        console.error('Error deleting image:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
