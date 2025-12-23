'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Users, Target, Award, Globe, Heart, Zap } from 'lucide-react'

const team = [
  { name: 'Carlos Martínez', role: 'CEO & Co-Fundador', image: '👨‍💼' },
  { name: 'María García', role: 'CTO & Co-Fundadora', image: '👩‍💻' },
  { name: 'David López', role: 'Director de Producto', image: '👨‍🎨' },
  { name: 'Ana Fernández', role: 'Head of Sales', image: '👩‍💼' },
]

const values = [
  {
    icon: Heart,
    title: 'Pasión por el patrimonio',
    description: 'Creemos en la importancia de preservar nuestra historia para las generaciones futuras.',
  },
  {
    icon: Zap,
    title: 'Innovación constante',
    description: 'Utilizamos las últimas tecnologías para ofrecer soluciones de vanguardia.',
  },
  {
    icon: Users,
    title: 'Centrados en el usuario',
    description: 'Diseñamos pensando en las necesidades reales de profesionales del patrimonio.',
  },
  {
    icon: Globe,
    title: 'Impacto global',
    description: 'Trabajamos con instituciones de todo el mundo para democratizar el acceso al patrimonio.',
  },
]

const stats = [
  { value: '500+', label: 'Proyectos gestionados' },
  { value: '50+', label: 'Instituciones confían en nosotros' },
  { value: '10TB+', label: 'Datos patrimoniales digitalizados' },
  { value: '15', label: 'Países con presencia' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Sobre nosotros
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Somos un equipo apasionado por la tecnología y el patrimonio cultural. 
              Nuestra misión es hacer accesible la digitalización y gestión del patrimonio histórico a todos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nuestra historia
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ChronoStone nació en 2023 de la necesidad de modernizar la forma en que gestionamos 
                y preservamos nuestro patrimonio histórico. Vimos cómo muchas instituciones y profesionales 
                luchaban con herramientas fragmentadas y procesos obsoletos.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Fundada por un equipo de expertos en tecnología 3D y conservación del patrimonio, 
                nuestra plataforma combina lo mejor de ambos mundos para ofrecer una solución integral.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Hoy, ChronoStone es utilizada por museos, ayuntamientos, empresas de restauración 
                y profesionales independientes en más de 15 países.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
              <Target className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Nuestra misión</h3>
              <p className="text-white/90">
                Democratizar el acceso a herramientas profesionales de gestión patrimonial, 
                permitiendo a cualquier organización preservar y compartir su patrimonio histórico 
                de forma digital y sostenible.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16 mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Nuestros valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Nuestro equipo
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full flex items-center justify-center text-4xl mb-4">
                  {member.image}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

