import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener documentos de un proyecto
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

        // Verificar propiedad del proyecto
        const project = await queryOne(
            `SELECT p.id FROM projects p
             LEFT JOIN project_collaborators c ON p.id = c.project_id AND c.user_id = $2
             WHERE p.id = $1 AND (p.user_id = $3 OR c.user_id = $4)`,
            [projectId, userId, userId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        const documents = await query(
            `SELECT * FROM project_documents WHERE project_id = $1 ORDER BY created_at DESC`,
            [projectId]
        )

        return NextResponse.json({ documents })
    } catch (error: any) {
        console.error('Error fetching documents:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener documentos' },
            { status: 500 }
        )
    }
}

// POST - Subir un nuevo documento (metadatos)
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
        const { name, fileUrl, fileSize, fileType, category } = body

        if (!name || !fileUrl) {
            return NextResponse.json({ error: 'Nombre y URL del archivo son obligatorios' }, { status: 400 })
        }

        // Verificar propiedad del proyecto
        const project = await queryOne(
            `SELECT p.id FROM projects p
             LEFT JOIN project_collaborators c ON p.id = c.project_id AND c.user_id = $2
             WHERE p.id = $1 AND (p.user_id = $3 OR c.role IN ('coordinator', 'technician'))`,
            [projectId, userId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        const id = generateUUID()

        await query(
            `INSERT INTO project_documents (
        id, project_id, user_id, name, file_url, file_size, file_type, category, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
            [id, projectId, userId, name, fileUrl, fileSize, fileType || null, category || 'other']
        )

        return NextResponse.json({ success: true, id, message: 'Documento guardado' })
    } catch (error: any) {
        console.error('Error saving document:', error)
        return NextResponse.json(
            { error: error.message || 'Error al guardar el documento' },
            { status: 500 }
        )
    }
}
