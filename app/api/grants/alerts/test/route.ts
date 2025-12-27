import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendGrantAlertEmail } from '@/lib/mail'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { grantName, organization, deadline } = body || {
            grantName: 'Subvenciones para la digitalización del patrimonio cultural 2024',
            organization: 'Ministerio de Cultura',
            deadline: '15/07/2024'
        }

        await sendGrantAlertEmail(session.user.email, {
            name: grantName,
            organization,
            deadline
        })

        return NextResponse.json({ success: true, message: 'Email de alerta enviado' })
    } catch (error: any) {
        console.error('Error sending test alert:', error)
        return NextResponse.json(
            { error: error.message || 'Error al enviar alerta' },
            { status: 500 }
        )
    }
}
