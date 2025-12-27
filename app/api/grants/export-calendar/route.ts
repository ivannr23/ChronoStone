import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { generateICal } from '@/lib/export'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = (session.user as any).id

        // Obtener las subvenciones favoritas que tienen fecha de cierre
        const favoriteGrants = await query<any>(
            `SELECT g.* FROM grants g
       JOIN grant_favorites f ON g.id = f.grant_id
       WHERE f.user_id = $1 AND g.call_close_date IS NOT NULL`,
            [userId]
        )

        if (favoriteGrants.length === 0) {
            return NextResponse.json({ error: 'No hay subvenciones favoritas con fechas' }, { status: 404 })
        }

        const events = favoriteGrants.map(grant => {
            const closeDate = new Date(grant.call_close_date)
            // Ponemos la hora a las 23:59 del día de cierre
            closeDate.setHours(23, 59, 0, 0)

            const startDate = new Date(closeDate)
            startDate.setHours(9, 0, 0, 0) // El evento dura todo el día de cierre

            return {
                id: grant.id,
                title: `CIERRE: ${grant.name}`,
                description: `Organismo: ${grant.organization}\nURL: ${grant.official_url || 'N/A'}`,
                startDate: startDate,
                endDate: closeDate,
                url: grant.official_url || undefined
            }
        })

        const icsContent = generateICal(events)

        return new Response(icsContent, {
            headers: {
                'Content-Type': 'text/calendar',
                'Content-Disposition': 'attachment; filename="subvenciones-chronostone.ics"'
            }
        })
    } catch (error: any) {
        console.error('Error exporting calendar:', error)
        return NextResponse.json(
            { error: error.message || 'Error al exportar el calendario' },
            { status: 500 }
        )
    }
}
