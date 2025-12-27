import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// DELETE - Eliminar una nota
export async function DELETE(
    request: Request,
    { params }: { params: { id: string, noteId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const noteId = params.noteId

        // Solo el dueño de la nota o el dueño del proyecto pueden borrarla
        const note = await queryOne<any>(
            `SELECT user_id FROM project_notes WHERE id = $1 AND project_id = $2`,
            [noteId, projectId]
        )

        if (!note) {
            return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
        }

        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (note.user_id !== userId && !project) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        await query(
            `DELETE FROM project_notes WHERE id = $1 AND project_id = $2`,
            [noteId, projectId]
        )

        return NextResponse.json({ success: true, message: 'Nota eliminada' })
    } catch (error: any) {
        console.error('Error deleting note:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
