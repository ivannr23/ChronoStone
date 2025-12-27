import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener colaboradores de un proyecto
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

        // Verificar propiedad
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        const collaborators = await query(
            `SELECT c.*, u.full_name as user_name, u.email as user_email
       FROM project_collaborators c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.project_id = $1`,
            [projectId]
        )

        return NextResponse.json({ collaborators })
    } catch (error: any) {
        console.error('Error fetching collaborators:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener colaboradores' },
            { status: 500 }
        )
    }
}

// POST - Invitar colaborador
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
        const { email, role } = body

        if (!email) {
            return NextResponse.json({ error: 'Email es obligatorio' }, { status: 400 })
        }

        // Verificar propiedad del proyecto
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        // Comprobar si ya existe
        const existing = await queryOne(
            `SELECT id FROM project_collaborators WHERE project_id = $1 AND email = $2`,
            [projectId, email]
        )

        if (existing) {
            return NextResponse.json({ error: 'Ya es colaborador o ha sido invitado' }, { status: 400 })
        }

        // Buscar si el usuario ya existe en el sistema
        const userFound = await queryOne<any>(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        )

        const id = generateUUID()

        await query(
            `INSERT INTO project_collaborators (
        id, project_id, user_id, email, role, invited_at, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [id, projectId, userFound?.id || null, email, role || 'viewer']
        )

        return NextResponse.json({ success: true, id, message: 'Invitación enviada' })
    } catch (error: any) {
        console.error('Error inviting collaborator:', error)
        return NextResponse.json(
            { error: error.message || 'Error al invitar colaborador' },
            { status: 500 }
        )
    }
}
