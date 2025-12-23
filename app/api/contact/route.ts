import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, company, phone, subject, message } = body

        // Validación básica
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            )
        }

        const subjectMap: Record<string, string> = {
            general: 'Consulta general',
            demo: 'Solicitud de demo',
            pricing: 'Información sobre precios',
            support: 'Soporte técnico',
            partnership: 'Colaboración / Partnership',
            other: 'Otro'
        }

        // Enviar email al equipo
        await resend.emails.send({
            from: 'ChronoStone <noreply@chronostone.es>',
            to: process.env.CONTACT_EMAIL || 'info@chronostone.es',
            replyTo: email,
            subject: `[Contacto Web] ${subjectMap[subject] || subject}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nuevo mensaje de contacto</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ''}
            ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
            <p><strong>Asunto:</strong> ${subjectMap[subject] || subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Mensaje:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #6b7280; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de ChronoStone
          </p>
        </div>
      `
        })

        // Enviar email de confirmación al usuario
        await resend.emails.send({
            from: 'ChronoStone <noreply@chronostone.es>',
            to: email,
            subject: 'Hemos recibido tu mensaje - ChronoStone',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">ChronoStone</h1>
          </div>
          
          <div style="padding: 40px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">¡Gracias por contactarnos, ${name}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Hemos recibido tu mensaje y nuestro equipo lo revisará pronto. 
              Normalmente respondemos en menos de 24 horas laborables.
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #2563eb; margin: 30px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Tu mensaje:</strong></p>
              <p style="margin: 10px 0 0 0; color: #374151; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Mientras tanto, puedes explorar nuestra 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chronostone.es'}/blog" style="color: #2563eb; text-decoration: none;">
                base de conocimientos
              </a> 
              o revisar nuestros 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chronostone.es'}/precios" style="color: #2563eb; text-decoration: none;">
                planes y precios
              </a>.
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Saludos,<br />
                <strong style="color: #1f2937;">El equipo de ChronoStone</strong>
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ChronoStone. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending contact email:', error)
        return NextResponse.json(
            { error: 'Error al enviar el mensaje' },
            { status: 500 }
        )
    }
}
