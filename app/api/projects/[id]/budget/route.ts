import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener partidas presupuestarias
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

        const items = await query(
            `SELECT * FROM project_budget_items WHERE project_id = $1 ORDER BY created_at ASC`,
            [projectId]
        )

        return NextResponse.json({ items })
    } catch (error: any) {
        console.error('Error fetching budget items:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener partidas' },
            { status: 500 }
        )
    }
}

// POST - Crear partida presupuestaria
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
        const { category, description, amount, isRealCost } = body

        if (!description || !amount) {
            return NextResponse.json({ error: 'Descripción y cuantía son obligatorios' }, { status: 400 })
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
            `INSERT INTO project_budget_items (
        id, project_id, category, description, amount, is_real_cost, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [id, projectId, category || 'other', description, amount, isRealCost ? 1 : 0]
        )

        return NextResponse.json({ success: true, id, message: 'Partida guardada' })
    } catch (error: any) {
        console.error('Error saving budget item:', error)
        return NextResponse.json(
            { error: error.message || 'Error al guardar la partida' },
            { status: 500 }
        )
    }
}
