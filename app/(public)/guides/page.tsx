'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { BookOpen, Clock, ArrowRight, CheckCircle, Play } from 'lucide-react'
import Link from 'next/link'

const guides = [
  {
    id: 1,
    title: 'Guía de inicio rápido',
    description: 'Aprende los conceptos básicos de ChronoStone en menos de 30 minutos',
    duration: '30 min',
    level: 'Principiante',
    steps: 5,
    icon: '🚀',
  },
  {
    id: 2,
    title: 'Subir y visualizar modelos 3D',
    description: 'Todo sobre formatos, carga y visualización de modelos tridimensionales',
    duration: '45 min',
    level: 'Principiante',
    steps: 8,
    icon: '📦',
  },
  {
    id: 3,
    title: 'Gestión avanzada de proyectos',
    description: 'Organiza proyectos complejos con múltiples modelos y colaboradores',
    duration: '1 hora',
    level: 'Intermedio',
    steps: 12,
    icon: '📁',
  },
  {
    id: 4,
    title: 'Búsqueda y gestión de subvenciones',
    description: 'Encuentra y gestiona subvenciones para tus proyectos patrimoniales',
    duration: '1 hora',
    level: 'Intermedio',
    steps: 10,
    icon: '💰',
  },
  {
    id: 5,
    title: 'Integración con escáneres 3D',
    description: 'Conecta ChronoStone con los principales dispositivos de escaneo',
    duration: '2 horas',
    level: 'Avanzado',
    steps: 15,
    icon: '📷',
  },
  {
    id: 6,
    title: 'Generación de informes profesionales',
    description: 'Crea documentación técnica y memorias de restauración',
    duration: '1.5 horas',
    level: 'Avanzado',
    steps: 11,
    icon: '📊',
  },
]

const levelColors: Record<string, string> = {
  'Principiante': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Intermedio': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Avanzado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
              <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-600 dark:text-primary-400 font-medium">Aprende paso a paso</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Guías y tutoriales
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tutoriales detallados para dominar todas las funcionalidades de ChronoStone
            </p>
          </div>

          {/* Filter by level */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-primary-600 text-white">
              Todos
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:opacity-80 transition-opacity">
              Principiante
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:opacity-80 transition-opacity">
              Intermedio
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:opacity-80 transition-opacity">
              Avanzado
            </button>
          </div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div 
                key={guide.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all group cursor-pointer"
              >
                <div className="text-4xl mb-4">{guide.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${levelColors[guide.level]}`}>
                    {guide.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {guide.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {guide.steps} pasos
                  </div>
                </div>
                <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg font-medium group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  <Play className="h-4 w-4" />
                  Comenzar guía
                </button>
              </div>
            ))}
          </div>

          {/* Video Tutorials Section */}
          <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Play className="h-8 w-8 text-primary-400" />
              <h2 className="text-2xl font-bold">Video tutoriales</h2>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl">
              ¿Prefieres aprender viendo? Explora nuestra biblioteca de video tutoriales en español.
            </p>
            <button className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Ver videos
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

