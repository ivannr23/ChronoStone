import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener todas las fases de un proyecto
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

        // Verificar que el proyecto pertenece al usuario
        const project = await queryOne(
            `SELECT p.id FROM projects p
             LEFT JOIN project_collaborators c ON p.id = c.project_id AND c.user_id = $2
             WHERE p.id = $1 AND (p.user_id = $3 OR c.user_id = $4)`,
            [projectId, userId, userId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        const phases = await query(
            `SELECT * FROM project_phases WHERE project_id = $1 ORDER BY order_index ASC`,
            [projectId]
        )

        return NextResponse.json({ phases })
    } catch (error: any) {
        console.error('Error fetching phases:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener las fases' },
            { status: 500 }
        )
    }
}

// POST - Crear una nueva fase
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
        const { name, description, startDate, endDate, status, orderIndex } = body

        if (!name) {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
        }

        // Verificar que el proyecto pertenece al usuario
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
            `INSERT INTO project_phases (
        id, project_id, name, description, start_date, end_date, progress_percentage, status, order_index, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
            [
                id,
                projectId,
                name,
                description || null,
                startDate || null,
                endDate || null,
                0,
                status || 'pending',
                orderIndex || 0
            ]
        )

        return NextResponse.json({ success: true, id, message: 'Fase creada exitosamente' })
    } catch (error: any) {
        console.error('Error creating phase:', error)
        return NextResponse.json(
            { error: error.message || 'Error al crear la fase' },
            { status: 500 }
        )
    }
}
