'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Última actualización: 1 de diciembre de 2024
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Información que recopilamos</h2>
            <p>
              En ChronoStone, recopilamos información que usted nos proporciona directamente, 
              como cuando crea una cuenta, utiliza nuestros servicios o se comunica con nosotros.
            </p>
            <ul>
              <li><strong>Información de cuenta:</strong> nombre, dirección de correo electrónico, contraseña</li>
              <li><strong>Información de perfil:</strong> nombre de empresa, cargo, foto de perfil</li>
              <li><strong>Contenido:</strong> proyectos, modelos 3D, documentos que suba a la plataforma</li>
              <li><strong>Información de pago:</strong> datos de tarjeta procesados por Stripe</li>
            </ul>

            <h2>2. Cómo utilizamos su información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul>
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar información relacionada</li>
              <li>Enviar comunicaciones técnicas, actualizaciones y mensajes de soporte</li>
              <li>Responder a sus comentarios, preguntas y solicitudes</li>
              <li>Monitorear y analizar tendencias, uso y actividades</li>
            </ul>

            <h2>3. Compartición de información</h2>
            <p>
              No vendemos ni alquilamos su información personal a terceros. Podemos compartir 
              información en las siguientes circunstancias:
            </p>
            <ul>
              <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Para proteger los derechos y seguridad de ChronoStone y nuestros usuarios</li>
              <li>Con su consentimiento o bajo su dirección</li>
            </ul>

            <h2>4. Seguridad de datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos 
              contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
            </p>
            <ul>
              <li>Cifrado SSL/TLS para todas las comunicaciones</li>
              <li>Cifrado de datos en reposo</li>
              <li>Acceso restringido a datos personales</li>
              <li>Auditorías de seguridad regulares</li>
            </ul>

            <h2>5. Retención de datos</h2>
            <p>
              Conservamos su información personal mientras su cuenta esté activa o según sea 
              necesario para proporcionarle servicios. También conservamos y utilizamos su 
              información según sea necesario para cumplir con nuestras obligaciones legales.
            </p>

            <h2>6. Sus derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul>
              <li>Acceder a sus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>

            <h2>7. Cookies</h2>
            <p>
              Utilizamos cookies y tecnologías similares para recopilar información sobre su 
              actividad de navegación. Puede gestionar sus preferencias de cookies en cualquier 
              momento. Consulte nuestra <a href="/cookies">Política de Cookies</a> para más información.
            </p>

            <h2>8. Transferencias internacionales</h2>
            <p>
              Sus datos pueden ser transferidos y procesados en servidores ubicados fuera de su 
              país de residencia. Nos aseguramos de que dichas transferencias cumplan con las 
              leyes aplicables de protección de datos.
            </p>

            <h2>9. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política de privacidad periódicamente. Le notificaremos 
              cualquier cambio publicando la nueva política en esta página y, si los cambios 
              son significativos, le enviaremos una notificación.
            </p>

            <h2>10. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:
            </p>
            <ul>
              <li>Email: privacidad@chronostone.com</li>
              <li>Dirección: Calle Ejemplo 123, 28001 Madrid, España</li>
              <li>Delegado de Protección de Datos: dpo@chronostone.com</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

