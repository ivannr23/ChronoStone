import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// DELETE - Eliminar un documento
export async function DELETE(
    request: Request,
    { params }: { params: { id: string, docId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const docId = params.docId

        // Verificar propiedad del proyecto
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        await query(
            `DELETE FROM project_documents WHERE id = $1 AND project_id = $2`,
            [docId, projectId]
        )

        return NextResponse.json({ success: true, message: 'Documento eliminado' })
    } catch (error: any) {
        console.error('Error deleting document:', error)
        return NextResponse.json(
            { error: error.message || 'Error al eliminar el documento' },
            { status: 500 }
        )
    }
}

// PATCH - Cambiar categoría o nombre del documento
export async function PATCH(
    request: Request,
    { params }: { params: { id: string, docId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const docId = params.docId
        const body = await request.json()
        const { name, category } = body

        // Verificar propiedad del proyecto
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`)
            values.push(name)
        }
        if (category !== undefined) {
            updates.push(`category = $${paramCount++}`)
            values.push(category)
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
        }

        updates.push(`updated_at = NOW()`)
        values.push(docId)
        values.push(projectId)

        const updateQuery = `UPDATE project_documents SET ${updates.join(', ')} WHERE id = $${paramCount} AND project_id = $${paramCount + 1}`

        await query(updateQuery, values)

        return NextResponse.json({ success: true, message: 'Documento actualizado' })
    } catch (error: any) {
        console.error('Error updating document:', error)
        return NextResponse.json(
            { error: error.message || 'Error al actualizar el documento' },
            { status: 500 }
        )
    }
}
