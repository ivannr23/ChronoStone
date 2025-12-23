import { Resend } from 'resend'

const isDevelopment = process.env.NODE_ENV === 'development'
const hasResendKey = !!process.env.RESEND_API_KEY

// Solo inicializar Resend si hay API key
const resend = hasResendKey ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@localhost'

// Tipos de emails
export type EmailType = 
  | 'welcome'
  | 'trial_reminder'
  | 'payment_success'
  | 'renewal_reminder'
  | 'subscription_cancelled'
  | 'upgrade_success'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

// Función base para enviar emails
async function sendEmail({ to, subject, html }: SendEmailParams) {
  // En desarrollo sin Resend, solo loguear
  if (isDevelopment && !hasResendKey) {
    console.log('\n📧 ========== EMAIL (DEV MODE) ==========')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log('Body: [HTML content - check email templates]')
    console.log('==========================================\n')
    return { success: true, data: { id: 'dev-mode' } }
  }

  if (!resend) {
    console.warn('Resend no configurado, email no enviado:', { to, subject })
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Email de bienvenida
export async function sendWelcomeEmail(to: string, userName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const subject = '¡Bienvenido a ChronoStone! 🎉'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { list-style: none; padding: 0; }
          .features li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a ChronoStone!</h1>
          </div>
          <div class="content">
            <p>Hola ${userName},</p>
            <p>Estamos encantados de tenerte con nosotros. Has activado tu <strong>prueba gratuita de 14 días</strong> con acceso completo a nuestras funcionalidades.</p>
            
            <h3>¿Qué puedes hacer ahora?</h3>
            <ul class="features">
              <li>✅ Crear tu primer proyecto patrimonial</li>
              <li>✅ Subir hasta 3 modelos 3D</li>
              <li>✅ Exportar informes en PDF</li>
              <li>✅ Explorar todas las herramientas</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${appUrl}/dashboard" class="button">
                Comenzar ahora
              </a>
            </p>
            
            <p><strong>Recordatorio:</strong> Tu prueba gratuita termina en 14 días. Te enviaremos recordatorios para que no pierdas acceso a tu trabajo.</p>
            
            <p>Si tienes alguna pregunta, responde a este email o visita nuestro centro de ayuda.</p>
            
            <p>¡A restaurar!</p>
            <p>El equipo de ChronoStone</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

// Email de recordatorio de prueba (días 7, 10, 13)
export async function sendTrialReminderEmail(to: string, userName: string, daysLeft: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const subject = `⏰ Tu prueba gratuita termina en ${daysLeft} días`
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ ${daysLeft} días restantes</h1>
          </div>
          <div class="content">
            <p>Hola ${userName},</p>
            
            <div class="urgent">
              <strong>Tu prueba gratuita termina en ${daysLeft} días</strong><br>
              No pierdas acceso a tus proyectos y modelos 3D.
            </div>
            
            <p>Para continuar usando ChronoStone sin interrupciones, elige el plan que mejor se adapte a tus necesidades:</p>
            
            <ul>
              <li><strong>Starter (49€/mes):</strong> Perfecto para proyectos pequeños</li>
              <li><strong>Professional (99€/mes):</strong> Funcionalidades completas + IA</li>
              <li><strong>Enterprise (199€/mes):</strong> Para equipos grandes</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${appUrl}/dashboard/billing" class="button">
                Ver planes y precios
              </a>
            </p>
            
            <p>¿Tienes dudas? Responde a este email y te ayudaremos a elegir el mejor plan para ti.</p>
            
            <p>Saludos,<br>El equipo de ChronoStone</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

// Email de confirmación de pago
export async function sendPaymentSuccessEmail(to: string, userName: string, planName: string, amount: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const subject = '✅ Pago confirmado - Bienvenido a ChronoStone'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .invoice { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Pago confirmado!</h1>
          </div>
          <div class="content">
            <p>Hola ${userName},</p>
            <p>Hemos recibido tu pago correctamente. Ya tienes acceso completo a todas las funcionalidades del plan <strong>${planName}</strong>.</p>
            
            <div class="invoice">
              <h3>Detalles del pago</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Importe:</strong> ${amount}€ (IVA incluido)</p>
              <p><strong>Próxima factura:</strong> En 30 días</p>
            </div>
            
            <p>Tu factura completa estará disponible en tu panel de facturación.</p>
            
            <p style="text-align: center;">
              <a href="${appUrl}/dashboard" class="button">
                Ir al dashboard
              </a>
            </p>
            
            <p>Gracias por confiar en ChronoStone.</p>
            <p>El equipo de ChronoStone</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

// Email de recordatorio de renovación
export async function sendRenewalReminderEmail(to: string, userName: string, daysUntilRenewal: number, amount: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const subject = `Tu suscripción se renovará en ${daysUntilRenewal} días`
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p>Hola ${userName},</p>
            <p>Tu suscripción a ChronoStone se renovará automáticamente en <strong>${daysUntilRenewal} días</strong>.</p>
            <p><strong>Importe del cargo:</strong> ${amount}€ (IVA incluido)</p>
            <p>No necesitas hacer nada. El pago se procesará automáticamente con el método de pago guardado.</p>
            <p>Si deseas modificar o cancelar tu suscripción, puedes hacerlo desde tu panel de facturación.</p>
            <p><a href="${appUrl}/dashboard/billing">Gestionar suscripción</a></p>
            <p>Saludos,<br>El equipo de ChronoStone</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

// Email de cancelación de suscripción
export async function sendSubscriptionCancelledEmail(to: string, userName: string, endDate: string) {
  const subject = 'Tu suscripción ha sido cancelada'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p>Hola ${userName},</p>
            <p>Lamentamos que hayas decidido cancelar tu suscripción a ChronoStone.</p>
            <p><strong>Acceso hasta:</strong> ${endDate}</p>
            <p>Seguirás teniendo acceso a todas las funcionalidades hasta la fecha indicada. Después, tu cuenta pasará a modo solo lectura.</p>
            <p>Si cambias de opinión, puedes reactivar tu suscripción en cualquier momento desde tu panel de facturación.</p>
            <p>¿Hay algo que podamos mejorar? Responde a este email y cuéntanos tu experiencia.</p>
            <p>Esperamos verte de nuevo pronto.</p>
            <p>El equipo de ChronoStone</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}
