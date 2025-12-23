'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'
import Link from 'next/link'

const posts = [
  {
    id: 1,
    title: 'Introducción a la digitalización del patrimonio histórico',
    excerpt: 'Descubre cómo la tecnología 3D está revolucionando la conservación y documentación del patrimonio cultural en España.',
    image: '/images/blog/digitalizacion.jpg',
    author: 'María García',
    date: '2024-12-01',
    category: 'Tecnología',
    readTime: '5 min',
  },
  {
    id: 2,
    title: 'Guía completa de subvenciones para patrimonio 2025',
    excerpt: 'Todo lo que necesitas saber sobre las ayudas disponibles para proyectos de restauración y conservación del patrimonio.',
    image: '/images/blog/subvenciones.jpg',
    author: 'Carlos López',
    date: '2024-11-28',
    category: 'Subvenciones',
    readTime: '8 min',
  },
  {
    id: 3,
    title: 'Mejores prácticas en escaneo 3D de monumentos',
    excerpt: 'Aprende las técnicas más efectivas para digitalizar monumentos y crear modelos 3D de alta calidad.',
    image: '/images/blog/escaneo3d.jpg',
    author: 'Ana Martínez',
    date: '2024-11-25',
    category: 'Tutoriales',
    readTime: '10 min',
  },
  {
    id: 4,
    title: 'El futuro de la realidad aumentada en museos',
    excerpt: 'Cómo la RA está transformando la experiencia de los visitantes y la forma en que interactuamos con el arte.',
    image: '/images/blog/ar-museos.jpg',
    author: 'Pedro Sánchez',
    date: '2024-11-20',
    category: 'Innovación',
    readTime: '6 min',
  },
  {
    id: 5,
    title: 'Caso de éxito: Restauración de la Catedral de Burgos',
    excerpt: 'Cómo ChronoStone ayudó en el proyecto de documentación digital de uno de los monumentos más importantes de España.',
    image: '/images/blog/burgos.jpg',
    author: 'Laura Fernández',
    date: '2024-11-15',
    category: 'Casos de éxito',
    readTime: '7 min',
  },
  {
    id: 6,
    title: 'Inteligencia Artificial aplicada al patrimonio',
    excerpt: 'Exploramos las aplicaciones de la IA en la detección de daños, clasificación y análisis de elementos patrimoniales.',
    image: '/images/blog/ia-patrimonio.jpg',
    author: 'David Ruiz',
    date: '2024-11-10',
    category: 'Tecnología',
    readTime: '9 min',
  },
]

const categories = ['Todos', 'Tecnología', 'Subvenciones', 'Tutoriales', 'Innovación', 'Casos de éxito']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Noticias, tutoriales y recursos sobre patrimonio digital y tecnología
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === 'Todos'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 mb-12 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5" />
              <span className="font-medium">Destacado</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">{posts[0].title}</h2>
            <p className="text-white/90 mb-6 max-w-2xl">{posts[0].excerpt}</p>
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {posts[0].author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(posts[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <article 
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <span className="text-4xl">📖</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{post.readTime} lectura</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{post.author}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">
              Cargar más artículos
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

