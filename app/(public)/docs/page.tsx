'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Book, Code, FileText, Zap, Database, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const sections = [
  {
    title: 'Primeros pasos',
    icon: Zap,
    items: [
      { title: 'Introducción a ChronoStone', href: '#intro' },
      { title: 'Crear tu primera cuenta', href: '#account' },
      { title: 'Configuración inicial', href: '#setup' },
      { title: 'Tu primer proyecto', href: '#first-project' },
    ]
  },
  {
    title: 'Gestión de Proyectos',
    icon: FileText,
    items: [
      { title: 'Crear y editar proyectos', href: '#projects' },
      { title: 'Añadir ubicación y metadatos', href: '#metadata' },
      { title: 'Gestión de colaboradores', href: '#collaborators' },
      { title: 'Estados y flujos de trabajo', href: '#workflows' },
    ]
  },
  {
    title: 'Modelos 3D',
    icon: Database,
    items: [
      { title: 'Formatos soportados', href: '#formats' },
      { title: 'Subir modelos 3D', href: '#upload' },
      { title: 'Visor 3D interactivo', href: '#viewer' },
      { title: 'Texturas y materiales', href: '#textures' },
    ]
  },
  {
    title: 'Subvenciones',
    icon: Book,
    items: [
      { title: 'Búsqueda de subvenciones', href: '#grants-search' },
      { title: 'Alertas personalizadas', href: '#alerts' },
      { title: 'Gestión de solicitudes', href: '#applications' },
      { title: 'Importar desde BDNS', href: '#bdns' },
    ]
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Documentación
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas saber para sacar el máximo partido a ChronoStone
            </p>
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 mb-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Zap className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Inicio rápido</h2>
            </div>
            <p className="text-white/90 mb-6 max-w-2xl">
              Empieza a usar ChronoStone en menos de 5 minutos. Crea tu cuenta, configura tu primer proyecto 
              y sube tu primer modelo 3D.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Comenzar ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <section.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <a 
                        href={item.href}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* API Section */}
          <div className="mt-12 bg-gray-900 dark:bg-gray-800 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Code className="h-8 w-8 text-primary-400" />
              <h2 className="text-2xl font-bold">API Reference</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Integra ChronoStone con tus herramientas existentes usando nuestra API REST.
            </p>
            <Link href="/api-reference" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Ver documentación API
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

