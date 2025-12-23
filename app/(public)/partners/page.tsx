'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Handshake, Award, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const partnerTypes = [
  {
    title: 'Partners Tecnológicos',
    description: 'Integra tu tecnología con ChronoStone para ofrecer soluciones más completas a tus clientes.',
    benefits: [
      'Acceso a nuestra API',
      'Documentación técnica dedicada',
      'Soporte de integración',
      'Co-marketing conjunto',
    ],
    icon: '🔧',
  },
  {
    title: 'Partners de Canal',
    description: 'Revende ChronoStone a tus clientes y obtén comisiones por cada venta.',
    benefits: [
      'Comisiones competitivas',
      'Formación comercial',
      'Material de ventas',
      'Leads cualificados',
    ],
    icon: '🤝',
  },
  {
    title: 'Partners Académicos',
    description: 'Colabora con nosotros en investigación y formación sobre patrimonio digital.',
    benefits: [
      'Licencias académicas gratuitas',
      'Proyectos de investigación conjuntos',
      'Acceso a datos anonimizados',
      'Publicaciones conjuntas',
    ],
    icon: '🎓',
  },
]

const currentPartners = [
  { name: 'Museo del Prado', type: 'Institución', logo: '🏛️' },
  { name: 'Universidad Complutense', type: 'Académico', logo: '🎓' },
  { name: 'Ministerio de Cultura', type: 'Gobierno', logo: '🏰' },
  { name: 'Artec 3D', type: 'Tecnología', logo: '📷' },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
              <Handshake className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-600 dark:text-primary-400 font-medium">Programa de Partners</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Crece con nosotros
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Únete a nuestro ecosistema de partners y accede a nuevas oportunidades de negocio 
              en el sector del patrimonio digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <Award className="h-8 w-8 text-primary-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Partners activos</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <TrendingUp className="h-8 w-8 text-primary-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">€2M+</div>
              <div className="text-gray-600 dark:text-gray-400">Generado por partners</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-primary-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">15</div>
              <div className="text-gray-600 dark:text-gray-400">Países con partners</div>
            </div>
          </div>
        </section>

        {/* Partner Types */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16 mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Tipos de partnership
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {partnerTypes.map((type) => (
                <div key={type.title} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{type.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Partners */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Confían en nosotros
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {currentPartners.map((partner) => (
              <div key={partner.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-4xl mb-3">{partner.logo}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{partner.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{partner.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para ser partner?</h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              Únete a nuestro programa de partners y accede a recursos exclusivos, 
              formación y oportunidades de co-marketing.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Solicitar información
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

