'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Shield, Download, Trash2, Edit, Eye, Lock } from 'lucide-react'

const rights = [
  {
    icon: Eye,
    title: 'Derecho de acceso',
    description: 'Puede solicitar una copia de todos los datos personales que tenemos sobre usted.',
  },
  {
    icon: Edit,
    title: 'Derecho de rectificación',
    description: 'Puede solicitar la corrección de datos personales inexactos o incompletos.',
  },
  {
    icon: Trash2,
    title: 'Derecho de supresión',
    description: 'Puede solicitar la eliminación de sus datos personales en determinadas circunstancias.',
  },
  {
    icon: Lock,
    title: 'Derecho de limitación',
    description: 'Puede solicitar que limitemos el procesamiento de sus datos en ciertos casos.',
  },
  {
    icon: Download,
    title: 'Derecho de portabilidad',
    description: 'Puede solicitar sus datos en un formato estructurado y legible por máquina.',
  },
  {
    icon: Shield,
    title: 'Derecho de oposición',
    description: 'Puede oponerse al procesamiento de sus datos para fines de marketing directo.',
  },
]

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              RGPD
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Reglamento General de Protección de Datos
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <h2>Nuestro compromiso con el RGPD</h2>
            <p>
              ChronoStone está totalmente comprometido con el cumplimiento del Reglamento General 
              de Protección de Datos (RGPD) de la Unión Europea. Hemos implementado medidas técnicas 
              y organizativas para garantizar la protección de sus datos personales.
            </p>

            <h2>Base legal para el procesamiento</h2>
            <p>Procesamos sus datos personales basándonos en las siguientes bases legales:</p>
            <ul>
              <li><strong>Ejecución del contrato:</strong> Para proporcionar nuestros servicios</li>
              <li><strong>Consentimiento:</strong> Para comunicaciones de marketing</li>
              <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y seguridad</li>
              <li><strong>Obligación legal:</strong> Para cumplir con requisitos fiscales y legales</li>
            </ul>

            <h2>Datos que recopilamos</h2>
            <ul>
              <li>Datos de identificación (nombre, email)</li>
              <li>Datos de contacto profesional</li>
              <li>Datos de uso del servicio</li>
              <li>Datos de facturación</li>
              <li>Contenido que sube a la plataforma</li>
            </ul>

            <h2>Período de retención</h2>
            <p>
              Conservamos sus datos durante el tiempo necesario para proporcionar nuestros servicios 
              y cumplir con nuestras obligaciones legales:
            </p>
            <ul>
              <li>Datos de cuenta: mientras la cuenta esté activa + 5 años</li>
              <li>Datos de facturación: 10 años (requisito legal)</li>
              <li>Logs de acceso: 6 meses</li>
              <li>Datos analíticos: 26 meses (anonimizados después)</li>
            </ul>

            <h2>Transferencias internacionales</h2>
            <p>
              Sus datos pueden ser transferidos fuera del EEE. En tales casos, nos aseguramos de 
              que existan salvaguardas adecuadas, como:
            </p>
            <ul>
              <li>Cláusulas contractuales tipo de la UE</li>
              <li>Decisiones de adecuación de la Comisión Europea</li>
              <li>Certificaciones (como EU-US Data Privacy Framework)</li>
            </ul>

            <h2>Delegado de Protección de Datos</h2>
            <p>
              Hemos designado un Delegado de Protección de Datos (DPO) al que puede contactar para 
              cualquier consulta relacionada con el tratamiento de sus datos personales:
            </p>
            <p>
              <strong>Email:</strong> dpo@chronostone.com<br />
              <strong>Dirección:</strong> Calle Ejemplo 123, 28001 Madrid, España
            </p>
          </div>

          {/* Your Rights */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sus derechos bajo el RGPD
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {rights.map((right) => (
              <div 
                key={right.title}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <right.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{right.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{right.description}</p>
              </div>
            ))}
          </div>

          {/* Exercise your rights */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ejercer sus derechos</h2>
            <p className="text-white/90 mb-6">
              Puede ejercer cualquiera de sus derechos RGPD enviando una solicitud a nuestro 
              equipo de privacidad. Responderemos dentro de los 30 días siguientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:dpo@chronostone.com"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contactar al DPO
              </a>
              <a 
                href="/dashboard/settings"
                className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                Gestionar mis datos
              </a>
            </div>
          </div>

          <div className="mt-12 prose prose-lg dark:prose-invert max-w-none">
            <h2>Autoridad de control</h2>
            <p>
              Si considera que el tratamiento de sus datos personales infringe el RGPD, tiene 
              derecho a presentar una reclamación ante la Agencia Española de Protección de Datos:
            </p>
            <p>
              <strong>Agencia Española de Protección de Datos</strong><br />
              C/ Jorge Juan, 6<br />
              28001 Madrid<br />
              <a href="https://www.aepd.es">www.aepd.es</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

