import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Obtener una solicitud específica
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
    const applicationId = params.id

    const applications = await query(
      `SELECT ga.*, 
              g.name as grant_name,
              g.organization,
              g.description as grant_description,
              g.call_close_date,
              g.max_amount,
              g.funding_percentage,
              g.official_url,
              g.bases_url,
              g.application_url,
              g.required_documents as grant_required_documents,
              p.name as project_name
       FROM grant_applications ga
       LEFT JOIN grants g ON ga.grant_id = g.id
       LEFT JOIN projects p ON ga.project_id = p.id
       WHERE ga.id = $1 AND ga.user_id = $2`,
      [applicationId, userId]
    )

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ application: applications[0] })
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener solicitud' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar solicitud
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const applicationId = params.id
    const body = await request.json()

    // Verificar que la solicitud pertenece al usuario
    const existing = await query(
      `SELECT id FROM grant_applications WHERE id = $1 AND user_id = $2`,
      [applicationId, userId]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    const {
      status,
      referenceNumber,
      requestedAmount,
      approvedAmount,
      submissionDate,
      resolutionDate,
      notificationDate,
      documents,
      checklist,
      notes,
      resolutionNotes,
      projectId
    } = body

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (referenceNumber !== undefined) {
      updates.push(`reference_number = $${paramIndex}`)
      values.push(referenceNumber)
      paramIndex++
    }

    if (requestedAmount !== undefined) {
      updates.push(`requested_amount = $${paramIndex}`)
      values.push(requestedAmount)
      paramIndex++
    }

    if (approvedAmount !== undefined) {
      updates.push(`approved_amount = $${paramIndex}`)
      values.push(approvedAmount)
      paramIndex++
    }

    if (submissionDate !== undefined) {
      updates.push(`submission_date = $${paramIndex}`)
      values.push(submissionDate)
      paramIndex++
    }

    if (resolutionDate !== undefined) {
      updates.push(`resolution_date = $${paramIndex}`)
      values.push(resolutionDate)
      paramIndex++
    }

    if (notificationDate !== undefined) {
      updates.push(`notification_date = $${paramIndex}`)
      values.push(notificationDate)
      paramIndex++
    }

    if (documents !== undefined) {
      updates.push(`documents = $${paramIndex}`)
      values.push(JSON.stringify(documents))
      paramIndex++
    }

    if (checklist !== undefined) {
      updates.push(`checklist = $${paramIndex}`)
      values.push(JSON.stringify(checklist))
      paramIndex++
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`)
      values.push(notes)
      paramIndex++
    }

    if (resolutionNotes !== undefined) {
      updates.push(`resolution_notes = $${paramIndex}`)
      values.push(resolutionNotes)
      paramIndex++
    }

    if (projectId !== undefined) {
      updates.push(`project_id = $${paramIndex}`)
      values.push(projectId)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    updates.push('updated_at = NOW()')
    values.push(applicationId)

    await query(
      `UPDATE grant_applications SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    return NextResponse.json({ success: true, message: 'Solicitud actualizada' })
  } catch (error: any) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar solicitud' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar solicitud
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const applicationId = params.id

    await query(
      `DELETE FROM grant_applications WHERE id = $1 AND user_id = $2`,
      [applicationId, userId]
    )

    return NextResponse.json({ success: true, message: 'Solicitud eliminada' })
  } catch (error: any) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar solicitud' },
      { status: 500 }
    )
  }
}

