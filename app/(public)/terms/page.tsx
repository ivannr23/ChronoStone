'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Términos de Uso
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Última actualización: 1 de diciembre de 2024
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar ChronoStone ("el Servicio"), usted acepta estar sujeto a estos 
              Términos de Uso. Si no está de acuerdo con alguna parte de estos términos, no podrá 
              acceder al Servicio.
            </p>

            <h2>2. Descripción del servicio</h2>
            <p>
              ChronoStone es una plataforma SaaS para la gestión y digitalización del patrimonio 
              histórico. El Servicio incluye herramientas para:
            </p>
            <ul>
              <li>Gestión de proyectos patrimoniales</li>
              <li>Visualización y almacenamiento de modelos 3D</li>
              <li>Búsqueda y gestión de subvenciones</li>
              <li>Generación de informes y documentación</li>
            </ul>

            <h2>3. Cuentas de usuario</h2>
            <p>
              Para utilizar ciertas funciones del Servicio, debe crear una cuenta. Usted es 
              responsable de:
            </p>
            <ul>
              <li>Mantener la confidencialidad de sus credenciales</li>
              <li>Todas las actividades que ocurran bajo su cuenta</li>
              <li>Notificarnos inmediatamente cualquier uso no autorizado</li>
              <li>Proporcionar información veraz y actualizada</li>
            </ul>

            <h2>4. Uso aceptable</h2>
            <p>Usted se compromete a no:</p>
            <ul>
              <li>Violar leyes o regulaciones aplicables</li>
              <li>Infringir derechos de propiedad intelectual de terceros</li>
              <li>Subir contenido ilegal, ofensivo o dañino</li>
              <li>Intentar acceder a áreas restringidas del sistema</li>
              <li>Utilizar el Servicio para competir directamente con nosotros</li>
              <li>Realizar ingeniería inversa del software</li>
            </ul>

            <h2>5. Propiedad intelectual</h2>
            <p>
              El Servicio y su contenido original, características y funcionalidad son propiedad 
              de ChronoStone y están protegidos por leyes de propiedad intelectual. Usted conserva 
              todos los derechos sobre el contenido que sube a la plataforma.
            </p>

            <h2>6. Contenido del usuario</h2>
            <p>
              Al subir contenido a ChronoStone, usted nos otorga una licencia mundial, no exclusiva, 
              libre de regalías para usar, copiar, modificar y mostrar dicho contenido únicamente 
              con el fin de proporcionar el Servicio.
            </p>

            <h2>7. Planes y pagos</h2>
            <ul>
              <li>Los precios están sujetos a cambios con previo aviso de 30 días</li>
              <li>Los pagos se procesan de forma segura a través de Stripe</li>
              <li>Las suscripciones se renuevan automáticamente</li>
              <li>Puede cancelar en cualquier momento desde su panel de control</li>
              <li>No se ofrecen reembolsos por períodos parciales</li>
            </ul>

            <h2>8. Limitación de responsabilidad</h2>
            <p>
              ChronoStone se proporciona "tal cual" sin garantías de ningún tipo. No seremos 
              responsables de daños indirectos, incidentales, especiales o consecuentes que 
              resulten del uso o imposibilidad de uso del Servicio.
            </p>

            <h2>9. Disponibilidad del servicio</h2>
            <p>
              Nos esforzamos por mantener una disponibilidad del 99.9%. Sin embargo, no 
              garantizamos que el Servicio esté disponible en todo momento. Podemos realizar 
              mantenimientos programados que serán notificados con antelación.
            </p>

            <h2>10. Terminación</h2>
            <p>
              Podemos suspender o terminar su acceso al Servicio inmediatamente, sin previo aviso, 
              por cualquier razón, incluyendo violación de estos Términos. Usted puede cancelar 
              su cuenta en cualquier momento desde la configuración.
            </p>

            <h2>11. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los 
              cambios entrarán en vigor inmediatamente después de su publicación. Su uso 
              continuado del Servicio constituye aceptación de los términos modificados.
            </p>

            <h2>12. Ley aplicable</h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, 
              sin tener en cuenta sus disposiciones sobre conflicto de leyes. Cualquier disputa 
              será sometida a los tribunales de Madrid.
            </p>

            <h2>13. Contacto</h2>
            <p>
              Para cualquier pregunta sobre estos Términos, contáctenos en:
              <br />
              Email: legal@chronostone.com
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

