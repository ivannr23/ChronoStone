import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, generateUUID } from '@/lib/db'

// POST - Crear nuevo modelo 3D (metadatos)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { projectId, name, fileSize, fileType } = body

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await query(
      `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )

    if (!project || project.length === 0) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    const modelId = generateUUID()
    
    // Por ahora guardamos el modelo sin archivo real (local storage en el futuro)
    // En producción usarías un servicio como S3, Cloudflare R2, etc.
    const fileUrl = `local://${modelId}/${name}`
    
    // Imagen de previsualización por defecto
    const defaultThumbnail = '/images/model-placeholder.svg'

    await query(
      `INSERT INTO models_3d (id, project_id, user_id, name, file_url, file_size, file_type, thumbnail_url, processing_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', NOW(), NOW())`,
      [modelId, projectId, userId, name, fileUrl, fileSize || 0, fileType || null, defaultThumbnail]
    )

    // Actualizar contador de modelos en usage_limits
    await query(
      `UPDATE usage_limits SET models_3d_count = models_3d_count + 1 WHERE user_id = $1`,
      [userId]
    )

    return NextResponse.json({ 
      success: true, 
      modelId,
      message: 'Modelo guardado exitosamente' 
    })
  } catch (error: any) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: error.message || 'Error al guardar el modelo' },
      { status: 500 }
    )
  }
}

// GET - Obtener modelos de un proyecto
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Se requiere projectId' },
        { status: 400 }
      )
    }

    const models = await query(
      `SELECT * FROM models_3d WHERE project_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
      [projectId, userId]
    )

    return NextResponse.json({ models })
  } catch (error: any) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener modelos' },
      { status: 500 }
    )
  }
}

