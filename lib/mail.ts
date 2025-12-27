import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) => {
  try {
    const data = await resend.emails.send({
      from: 'ChronoStone <notifications@chronostone.com>',
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Templates predefinidos
export const emailTemplates = {
  welcome: (name: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #c9a227;">¡Bienvenido a ChronoStone, ${name}!</h1>
      <p>Estamos encantados de tenerte con nosotros. ChronoStone es la plataforma líder para la gestión digital del patrimonio.</p>
      <p>Con tu cuenta podrás:</p>
      <ul>
        <li>Gestionar proyectos de restauración y conservación</li>
        <li>Visualizar y analizar modelos 3D de alta precisión</li>
        <li>Monitorizar subvenciones y ayudas públicas</li>
        <li>Generar informes técnicos profesionales</li>
      </ul>
      <p>Tu periodo de prueba de 14 días ha comenzado. ¡Disfrútalo!</p>
      <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 10px;">
        <p style="margin: 0; font-size: 14px; color: #666;">Si tienes alguna duda, responde a este correo.</p>
      </div>
    </div>
  `,
  grantAlert: (grantName: string, organization: string, deadline: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Nueva Subvención Disponible</h2>
      <p>Se ha publicado una convocatoria que podría interesarte:</p>
      <div style="padding: 20px; border-left: 4px solid #2563eb; background: #f0f7ff; margin: 20px 0;">
        <h3 style="margin: 0;">${grantName}</h3>
        <p style="margin: 5px 0;"><strong>Organismo:</strong> ${organization}</p>
        <p style="margin: 5px 0;"><strong>Fecha límite:</strong> ${deadline}</p>
      </div>
      <p><a href="https://chronostone.com/dashboard/grants" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver detalles en el Dashboard</a></p>
    </div>
  `,
  trialExpiration: (name: string, daysLeft: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #f59e0b;">Tu prueba gratuita termina pronto</h2>
      <p>Hola ${name}, te informamos que a tu periodo de prueba le quedan <strong>${daysLeft} días</strong>.</p>
      <p>Para seguir disfrutando de todas las herramientas de ChronoStone sin interrupciones, actualiza tu plan ahora.</p>
      <p><a href="https://chronostone.com/dashboard/billing" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Actualizar Plan</a></p>
    </div>
  `,
  subscriptionRenewal: (name: string, amount: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10b981;">Gracias por renovar tu suscripción</h2>
      <p>Hola ${name}, se ha procesado correctamente el pago de <strong>${amount}</strong> para tu suscripción mensual.</p>
      <p>Ya tienes acceso a todas las funcionalidades premium por un mes más.</p>
      <p><a href="https://chronostone.com/dashboard/billing" style="color: #10b981; text-decoration: underline;">Ver factura en el Panel de Control</a></p>
    </div>
  `
}
// Funciones helpers
export const sendWelcomeEmail = async (email: string, name: string) => {
  return sendEmail({
    to: email,
    subject: '¡Bienvenido a ChronoStone! 🏛️',
    html: emailTemplates.welcome(name)
  })
}

export const sendGrantAlertEmail = async (email: string, grant: { name: string, organization: string, deadline: string }) => {
  return sendEmail({
    to: email,
    subject: `Nueva Subvención: ${grant.name} 💰`,
    html: emailTemplates.grantAlert(grant.name, grant.organization, grant.deadline)
  })
}

export const sendTrialExpirationEmail = async (email: string, name: string, daysLeft: number) => {
  return sendEmail({
    to: email,
    subject: 'Tu prueba de ChronoStone termina pronto ⏳',
    html: (emailTemplates as any).trialExpiration(name, daysLeft)
  })
}

export const sendRenewalEmail = async (email: string, name: string, amount: string) => {
  return sendEmail({
    to: email,
    subject: 'Suscripción renovada con éxito ✅',
    html: (emailTemplates as any).subscriptionRenewal(name, amount)
  })
}
