'use client'

import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'María González',
      role: 'Arquitecta de Restauración',
      company: 'Estudios Patrimonio S.L.',
      avatar: '👩‍💼',
      rating: 5,
      text: 'ChronoStone ha revolucionado nuestra forma de trabajar. La precisión de los modelos 3D y el análisis por IA nos ha ahorrado semanas de trabajo en cada proyecto. Indispensable para cualquier profesional de la restauración.',
    },
    {
      name: 'Carlos Ruiz',
      role: 'Director de Conservación',
      company: 'Museo Nacional',
      avatar: '👨‍💼',
      rating: 5,
      text: 'La función TimeMachine4D es simplemente espectacular. Poder mostrar a nuestros visitantes cómo era el patrimonio en diferentes épocas ha aumentado la participación un 300%. El ROI se recuperó en menos de 3 meses.',
    },
    {
      name: 'Laura Martínez',
      role: 'Restauradora Jefe',
      company: 'Patrimonio Histórico de Castilla',
      avatar: '👩',
      rating: 5,
      text: 'El análisis automático de deterioros mediante IA ha detectado problemas que pasamos por alto en la inspección manual. Nos ha ayudado a priorizar intervenciones y justificar presupuestos con datos objetivos.',
    },
    {
      name: 'Antonio López',
      role: 'CEO',
      company: 'Conservación y Arte S.A.',
      avatar: '🧑‍💼',
      rating: 5,
      text: 'Hemos migrado toda nuestra empresa a ChronoStone. La colaboración en tiempo real entre equipos, la gestión de proyectos y la generación automática de informes nos ha hecho ganar en eficiencia y profesionalidad.',
    },
    {
      name: 'Isabel Fernández',
      role: 'Arqueóloga',
      company: 'Universidad de Sevilla',
      avatar: '👩‍🔬',
      rating: 5,
      text: 'Para investigación es perfecta. La capacidad de almacenar, organizar y compartir grandes volúmenes de datos patrimoniales con estudiantes y colegas ha facilitado enormemente nuestro trabajo de campo y publicaciones.',
    },
    {
      name: 'Javier Sánchez',
      role: 'Responsable Técnico',
      company: 'Ayuntamiento de Toledo',
      avatar: '👨',
      rating: 5,
      text: 'La relación calidad-precio es imbatible. Por menos de lo que gastábamos en software de escritorio disperso, tenemos una solución integral en la nube con actualizaciones constantes y soporte en español.',
    },
  ]

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
              ⭐ Casos de éxito
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Más de 500 profesionales{' '}
            <span className="gradient-text">confían en nosotros</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Descubre cómo equipos de toda España están transformando 
            la gestión del patrimonio con ChronoStone.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 card-hover"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary-200 dark:text-primary-800 mb-4" />

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-400">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">4.9/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Valoración media</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clientes activos</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recomendación</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
