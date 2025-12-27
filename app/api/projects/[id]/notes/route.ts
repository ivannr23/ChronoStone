import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener notas de un proyecto
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id

        // Verificar propiedad o pertenencia al proyecto
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            // Si no es el dueño, comprobamos si es colaborador
            const collaborator = await queryOne(
                `SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2`,
                [projectId, userId]
            )
            if (!collaborator) {
                return NextResponse.json({ error: 'Proyecto no encontrado o sin acceso' }, { status: 404 })
            }
        }

        const notes = await query(
            `SELECT n.*, u.full_name as user_name 
       FROM project_notes n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.project_id = $1 
       ORDER BY n.created_at DESC`,
            [projectId]
        )

        return NextResponse.json({ notes })
    } catch (error: any) {
        console.error('Error fetching notes:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener notas' },
            { status: 500 }
        )
    }
}

// POST - Crear una nota
export async function POST(
    request: Request,
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
        const { content, parentNoteId, mentionedUsers } = body

        if (!content) {
            return NextResponse.json({ error: 'El contenido es obligatorio' }, { status: 400 })
        }

        // Verificar acceso al proyecto
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            const collaborator = await queryOne(
                `SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2`,
                [projectId, userId]
            )
            if (!collaborator) {
                return NextResponse.json({ error: 'Sin acceso al proyecto' }, { status: 403 })
            }
        }

        const id = generateUUID()

        await query(
            `INSERT INTO project_notes (
        id, project_id, user_id, content, mentioned_users, parent_note_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [id, projectId, userId, content, mentionedUsers || null, parentNoteId || null]
        )

        return NextResponse.json({ success: true, id, message: 'Nota guardada' })
    } catch (error: any) {
        console.error('Error saving note:', error)
        return NextResponse.json(
            { error: error.message || 'Error al guardar la nota' },
            { status: 500 }
        )
    }
}
