import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, generateUUID } from '@/lib/db'

// GET - Obtener imágenes de un proyecto
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

        const images = await query(
            `SELECT * FROM project_images WHERE project_id = $1 ORDER BY capture_date DESC, created_at DESC`,
            [projectId]
        )

        return NextResponse.json({ images })
    } catch (error: any) {
        console.error('Error fetching images:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener imágenes' },
            { status: 500 }
        )
    }
}

// POST - Registrar una nueva imagen
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
        const {
            name,
            imageUrl,
            thumbnailUrl,
            fileSize,
            phaseId,
            captureDate,
            description,
            isBefore,
            isAfter
        } = body

        if (!name || !imageUrl) {
            return NextResponse.json({ error: 'Nombre e imagen son obligatorios' }, { status: 400 })
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
            `INSERT INTO project_images (
        id, project_id, user_id, name, image_url, thumbnail_url, file_size, 
        phase_id, capture_date, description, is_before, is_after, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
            [
                id,
                projectId,
                userId,
                name,
                imageUrl,
                thumbnailUrl || imageUrl,
                fileSize || 0,
                phaseId || null,
                captureDate || null,
                description || null,
                isBefore ? 1 : 0,
                isAfter ? 1 : 0
            ]
        )

        return NextResponse.json({ success: true, id, message: 'Imagen guardada' })
    } catch (error: any) {
        console.error('Error saving image:', error)
        return NextResponse.json(
            { error: error.message || 'Error al guardar la imagen' },
            { status: 500 }
        )
    }
}
