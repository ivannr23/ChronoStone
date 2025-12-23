'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Newspaper, Download, Mail, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'

const pressReleases = [
  {
    date: '2024-12-01',
    title: 'ChronoStone cierra ronda de financiación de 5M€',
    excerpt: 'La startup española de patrimonio digital anuncia su ronda Series A para expandirse en Europa.',
  },
  {
    date: '2024-11-15',
    title: 'Nuevo acuerdo con el Ministerio de Cultura',
    excerpt: 'ChronoStone se convierte en proveedor oficial de tecnología 3D para proyectos patrimoniales.',
  },
  {
    date: '2024-10-20',
    title: 'Lanzamiento de ChronoStone 2.0',
    excerpt: 'La nueva versión incluye IA para análisis de daños y realidad aumentada integrada.',
  },
  {
    date: '2024-09-10',
    title: 'Expansión a América Latina',
    excerpt: 'ChronoStone abre oficinas en México y Colombia para atender el mercado latinoamericano.',
  },
]

const mediaKit = [
  { name: 'Logo pack (PNG, SVG)', size: '2.5 MB', type: 'ZIP' },
  { name: 'Brand guidelines', size: '4.2 MB', type: 'PDF' },
  { name: 'Fotos del equipo', size: '15 MB', type: 'ZIP' },
  { name: 'Screenshots de producto', size: '8.3 MB', type: 'ZIP' },
]

const coverage = [
  { outlet: 'El País', title: 'La startup que digitaliza el patrimonio español', date: '2024-11-20' },
  { outlet: 'TechCrunch', title: 'ChronoStone raises €5M to digitize cultural heritage', date: '2024-12-01' },
  { outlet: 'Expansión', title: 'Tecnología 3D al servicio de la historia', date: '2024-10-15' },
  { outlet: 'Wired España', title: 'El futuro de los museos está en el 3D', date: '2024-09-28' },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
              <Newspaper className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-600 dark:text-primary-400 font-medium">Sala de Prensa</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Prensa y medios
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Recursos para periodistas y medios de comunicación
            </p>
          </div>

          {/* Contact for press */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contacto de prensa</h2>
              <p className="text-white/90">Para consultas de medios, entrevistas o información adicional</p>
            </div>
            <a 
              href="mailto:prensa@chronostone.com"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-5 w-5" />
              prensa@chronostone.com
            </a>
          </div>
        </section>

        {/* Press Releases */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comunicados de prensa
          </h2>
          <div className="space-y-4">
            {pressReleases.map((release) => (
              <div 
                key={release.title}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(release.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                  {release.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{release.excerpt}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Media Coverage */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16 mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ChronoStone en los medios
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {coverage.map((item) => (
                <div 
                  key={item.title}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    📰
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary-600 dark:text-primary-400">{item.outlet}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Kit de prensa
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mediaKit.map((item) => (
              <div 
                key={item.name}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.type} • {item.size}</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors font-medium">
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

