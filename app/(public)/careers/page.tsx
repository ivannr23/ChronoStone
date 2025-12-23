'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users, Globe } from 'lucide-react'
import Link from 'next/link'

const benefits = [
  { icon: Heart, title: 'Salud y bienestar', description: 'Seguro médico completo y programas de bienestar' },
  { icon: Zap, title: 'Flexibilidad', description: 'Trabajo remoto y horarios flexibles' },
  { icon: Users, title: 'Equipo increíble', description: 'Trabaja con expertos en tecnología y patrimonio' },
  { icon: Globe, title: 'Impacto real', description: 'Tu trabajo ayuda a preservar la historia' },
]

const openings = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Ingeniería',
    location: 'Remoto (España)',
    type: 'Tiempo completo',
    description: 'Buscamos un desarrollador frontend senior para liderar el desarrollo de nuestra plataforma web.',
  },
  {
    id: 2,
    title: 'Backend Developer (Node.js)',
    department: 'Ingeniería',
    location: 'Madrid / Remoto',
    type: 'Tiempo completo',
    description: 'Únete a nuestro equipo de backend para desarrollar APIs escalables y robustas.',
  },
  {
    id: 3,
    title: '3D Graphics Engineer',
    department: 'Ingeniería',
    location: 'Remoto (España)',
    type: 'Tiempo completo',
    description: 'Especialista en Three.js/WebGL para mejorar nuestra experiencia de visualización 3D.',
  },
  {
    id: 4,
    title: 'Product Designer (UX/UI)',
    department: 'Diseño',
    location: 'Madrid / Remoto',
    type: 'Tiempo completo',
    description: 'Diseña experiencias excepcionales para profesionales del patrimonio.',
  },
  {
    id: 5,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Madrid',
    type: 'Tiempo completo',
    description: 'Ayuda a nuestros clientes a sacar el máximo partido de ChronoStone.',
  },
  {
    id: 6,
    title: 'Sales Development Representative',
    department: 'Ventas',
    location: 'Madrid',
    type: 'Tiempo completo',
    description: 'Genera oportunidades comerciales y ayuda a crecer nuestra base de clientes.',
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Trabaja con nosotros
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Únete a un equipo apasionado por la tecnología y el patrimonio cultural. 
              Juntos estamos construyendo el futuro de la preservación digital.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">¿Por qué ChronoStone?</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Somos una startup en crecimiento con un propósito claro: hacer accesible la preservación 
              del patrimonio histórico. Cada línea de código que escribes tiene un impacto real en la 
              conservación de nuestra historia.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16 mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Beneficios
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Posiciones abiertas
          </h2>
          <div className="space-y-4">
            {openings.map((job) => (
              <div 
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-600 transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                        {job.department}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{job.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/careers/${job.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium whitespace-nowrap"
                  >
                    Ver detalles
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* No fitting position? */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¿No encuentras tu puesto ideal?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Siempre estamos buscando talento. Envíanos tu CV y te contactaremos cuando surja una oportunidad.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Enviar candidatura espontánea
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

