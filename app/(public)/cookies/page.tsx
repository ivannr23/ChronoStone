'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Cookies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Última actualización: 1 de diciembre de 2024
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando 
              visita un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen 
              de manera más eficiente y proporcionar información a los propietarios del sitio.
            </p>

            <h2>Tipos de cookies que utilizamos</h2>
            
            <h3>Cookies esenciales</h3>
            <p>
              Estas cookies son necesarias para el funcionamiento del sitio web y no pueden ser 
              desactivadas. Incluyen:
            </p>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Propósito</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Identificación de sesión de usuario</td>
                  <td>Sesión</td>
                </tr>
                <tr>
                  <td>csrf_token</td>
                  <td>Protección contra ataques CSRF</td>
                  <td>Sesión</td>
                </tr>
                <tr>
                  <td>auth_token</td>
                  <td>Autenticación de usuario</td>
                  <td>30 días</td>
                </tr>
              </tbody>
            </table>

            <h3>Cookies de preferencias</h3>
            <p>
              Permiten recordar información que cambia la forma en que el sitio se comporta o se ve:
            </p>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Propósito</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>theme</td>
                  <td>Preferencia de tema (claro/oscuro)</td>
                  <td>1 año</td>
                </tr>
                <tr>
                  <td>language</td>
                  <td>Preferencia de idioma</td>
                  <td>1 año</td>
                </tr>
              </tbody>
            </table>

            <h3>Cookies analíticas</h3>
            <p>
              Nos ayudan a entender cómo los visitantes interactúan con el sitio web:
            </p>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Propósito</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>Google Analytics - identificación de usuarios</td>
                  <td>2 años</td>
                </tr>
                <tr>
                  <td>_gid</td>
                  <td>Google Analytics - identificación de sesión</td>
                  <td>24 horas</td>
                </tr>
              </tbody>
            </table>

            <h2>Cómo gestionar las cookies</h2>
            <p>
              Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo 
              se envía una cookie. Sin embargo, si no acepta cookies, es posible que no pueda 
              utilizar algunas partes de nuestro Servicio.
            </p>
            
            <h3>En los principales navegadores:</h3>
            <ul>
              <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
              <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
              <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
              <li><strong>Edge:</strong> Configuración → Privacidad → Cookies</li>
            </ul>

            <h2>Cookies de terceros</h2>
            <p>
              Algunas cookies son establecidas por servicios de terceros que aparecen en nuestras 
              páginas. No tenemos control sobre estas cookies. Los terceros incluyen:
            </p>
            <ul>
              <li>Google Analytics (análisis web)</li>
              <li>Stripe (procesamiento de pagos)</li>
              <li>Intercom (chat de soporte)</li>
            </ul>

            <h2>Actualizaciones de esta política</h2>
            <p>
              Podemos actualizar nuestra Política de Cookies periódicamente. Le notificaremos 
              cualquier cambio publicando la nueva política en esta página.
            </p>

            <h2>Contacto</h2>
            <p>
              Si tiene preguntas sobre nuestra política de cookies, contáctenos en:
              <br />
              Email: privacidad@chronostone.com
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

