'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Search, MessageCircle, Mail, Phone, BookOpen, HelpCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    category: 'Cuenta y facturación',
    questions: [
      {
        q: '¿Cómo puedo cambiar mi plan de suscripción?',
        a: 'Puedes cambiar tu plan desde el panel de Facturación en tu dashboard. Los cambios se aplican inmediatamente y el precio se prorratea.',
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), PayPal y transferencia bancaria para planes Enterprise.',
      },
      {
        q: '¿Puedo cancelar mi suscripción en cualquier momento?',
        a: 'Sí, puedes cancelar cuando quieras. Mantendrás el acceso hasta el final del período de facturación actual.',
      },
    ]
  },
  {
    category: 'Modelos 3D',
    questions: [
      {
        q: '¿Qué formatos de archivo soportan?',
        a: 'Soportamos STL, OBJ (con MTL y texturas), GLTF/GLB, y archivos ZIP que contengan estos formatos con sus texturas.',
      },
      {
        q: '¿Cuál es el tamaño máximo de archivo?',
        a: 'El límite depende de tu plan: Free (50MB), Starter (200MB), Professional (500MB), Enterprise (sin límite).',
      },
      {
        q: '¿Se preservan las texturas al subir un modelo?',
        a: 'Sí, si subes un archivo ZIP con las texturas correctamente referenciadas en el archivo MTL, se cargarán automáticamente.',
      },
    ]
  },
  {
    category: 'Subvenciones',
    questions: [
      {
        q: '¿De dónde provienen los datos de subvenciones?',
        a: 'Los datos provienen de la BDNS (Base de Datos Nacional de Subvenciones) del Gobierno de España y otras fuentes oficiales.',
      },
      {
        q: '¿Con qué frecuencia se actualizan las subvenciones?',
        a: 'Las subvenciones se actualizan diariamente. Los usuarios Enterprise pueden configurar actualizaciones más frecuentes.',
      },
      {
        q: '¿Puedo recibir alertas de nuevas subvenciones?',
        a: 'Sí, puedes configurar alertas personalizadas por región, tipo de patrimonio y rango de importes.',
      },
    ]
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Centro de ayuda
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              ¿En qué podemos ayudarte?
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <a href="/docs" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <BookOpen className="h-6 w-6 text-primary-500" />
              <span className="font-medium text-gray-900 dark:text-white">Documentación</span>
            </a>
            <a href="/guides" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <HelpCircle className="h-6 w-6 text-primary-500" />
              <span className="font-medium text-gray-900 dark:text-white">Guías</span>
            </a>
            <a href="/contact" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="h-6 w-6 text-primary-500" />
              <span className="font-medium text-gray-900 dark:text-white">Contactar</span>
            </a>
          </div>

          {/* FAQs */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preguntas frecuentes</h2>
          <div className="space-y-8">
            {faqs.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === `${category.category}-${index}` ? null : `${category.category}-${index}`)}
                        className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openFaq === `${category.category}-${index}` ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === `${category.category}-${index}` && (
                        <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-white/90 mb-6">Nuestro equipo de soporte está aquí para ayudarte</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:soporte@chronostone.com" className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                <Mail className="h-5 w-5" />
                soporte@chronostone.com
              </a>
              <a href="tel:+34900000000" className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
                <Phone className="h-5 w-5" />
                +34 900 000 000
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

