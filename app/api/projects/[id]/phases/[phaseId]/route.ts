import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// PATCH - Actualizar una fase
export async function PATCH(
    request: Request,
    { params }: { params: { id: string, phaseId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const phaseId = params.phaseId
        const body = await request.json()

        // Verificar que el proyecto pertenece al usuario
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        const {
            name,
            description,
            startDate,
            endDate,
            progressPercentage,
            status,
            orderIndex
        } = body

        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`)
            values.push(name)
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`)
            values.push(description)
        }
        if (startDate !== undefined) {
            updates.push(`start_date = $${paramCount++}`)
            values.push(startDate || null)
        }
        if (endDate !== undefined) {
            updates.push(`end_date = $${paramCount++}`)
            values.push(endDate || null)
        }
        if (progressPercentage !== undefined) {
            updates.push(`progress_percentage = $${paramCount++}`)
            values.push(progressPercentage)
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`)
            values.push(status)
        }
        if (orderIndex !== undefined) {
            updates.push(`order_index = $${paramCount++}`)
            values.push(orderIndex)
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
        }

        updates.push(`updated_at = NOW()`)
        values.push(phaseId)
        values.push(projectId)

        const updateQuery = `UPDATE project_phases SET ${updates.join(', ')} WHERE id = $${paramCount} AND project_id = $${paramCount + 1}`

        await query(updateQuery, values)

        // Si se actualizó el progreso, recalcular el progreso total del proyecto
        if (progressPercentage !== undefined) {
            const allPhases = await query<any>(
                `SELECT progress_percentage FROM project_phases WHERE project_id = $1`,
                [projectId]
            )

            if (allPhases.length > 0) {
                const totalProgress = Math.round(
                    allPhases.reduce((acc, curr) => acc + curr.progress_percentage, 0) / allPhases.length
                )

                await query(
                    `UPDATE projects SET progress_percentage = $1, updated_at = NOW() WHERE id = $2`,
                    [totalProgress, projectId]
                )
            }
        }

        return NextResponse.json({ success: true, message: 'Fase actualizada' })
    } catch (error: any) {
        console.error('Error updating phase:', error)
        return NextResponse.json(
            { error: error.message || 'Error al actualizar la fase' },
            { status: 500 }
        )
    }
}

// DELETE - Eliminar una fase
export async function DELETE(
    request: Request,
    { params }: { params: { id: string, phaseId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const projectId = params.id
        const phaseId = params.phaseId

        // Verificar que el proyecto pertenece al usuario
        const project = await queryOne(
            `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
            [projectId, userId]
        )

        if (!project) {
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        await query(
            `DELETE FROM project_phases WHERE id = $1 AND project_id = $2`,
            [phaseId, projectId]
        )

        return NextResponse.json({ success: true, message: 'Fase eliminada' })
    } catch (error: any) {
        console.error('Error deleting phase:', error)
        return NextResponse.json(
            { error: error.message || 'Error al eliminar la fase' },
            { status: 500 }
        )
    }
}
