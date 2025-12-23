import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, generateUUID } from '@/lib/db'

// GET - Obtener solicitudes del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')

    let whereConditions = ['ga.user_id = $1']
    let values: any[] = [userId]
    let paramIndex = 2

    if (status && status !== 'all') {
      whereConditions.push(`ga.status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (projectId) {
      whereConditions.push(`ga.project_id = $${paramIndex}`)
      values.push(projectId)
      paramIndex++
    }

    const applications = await query(
      `SELECT ga.*, 
              g.name as grant_name, 
              g.organization, 
              g.call_close_date,
              g.max_amount,
              p.name as project_name
       FROM grant_applications ga
       LEFT JOIN grants g ON ga.grant_id = g.id
       LEFT JOIN projects p ON ga.project_id = p.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY ga.created_at DESC`,
      values
    )

    return NextResponse.json({ applications })
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener solicitudes' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva solicitud
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { grantId, projectId, requestedAmount, notes } = body

    if (!grantId) {
      return NextResponse.json({ error: 'Se requiere grantId' }, { status: 400 })
    }

    // Verificar que la subvención existe
    const grants = await query(`SELECT * FROM grants WHERE id = $1`, [grantId])
    if (!grants || grants.length === 0) {
      return NextResponse.json({ error: 'Subvención no encontrada' }, { status: 404 })
    }

    // Verificar si ya existe una solicitud para esta subvención
    const existing = await query(
      `SELECT id FROM grant_applications WHERE user_id = $1 AND grant_id = $2`,
      [userId, grantId]
    )

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud para esta subvención' },
        { status: 400 }
      )
    }

    // Crear checklist inicial basado en documentos requeridos
    const grant = grants[0]
    const requiredDocs = grant.required_documents || []
    const checklist = requiredDocs.map((doc: any) => ({
      id: generateUUID(),
      name: typeof doc === 'string' ? doc : doc.name,
      description: typeof doc === 'string' ? '' : doc.description,
      completed: false
    }))

    const applicationId = generateUUID()

    await query(
      `INSERT INTO grant_applications (
        id, user_id, grant_id, project_id, status, 
        requested_amount, notes, checklist
      ) VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7)`,
      [applicationId, userId, grantId, projectId || null, requestedAmount || null, notes || null, JSON.stringify(checklist)]
    )

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Solicitud creada'
    })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear solicitud' },
      { status: 500 }
    )
  }
}

