'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 dark:from-primary-800 dark:via-primary-900 dark:to-secondary-900">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-fade-in">
          <span className="text-white font-semibold text-sm">
            🎉 Oferta de lanzamiento - 20% de descuento los primeros 3 meses
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 animate-slide-up">
          ¿Listo para revolucionar tu trabajo patrimonial?
        </h2>
        
        <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
          Únete a más de 500 profesionales que ya están digitalizando 
          y restaurando el patrimonio histórico con tecnología de vanguardia.
        </p>

        {/* Benefits */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
          <div className="flex items-center text-white">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>14 días gratis</span>
          </div>
          <div className="flex items-center text-white">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center text-white">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Cancela cuando quieras</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center"
          >
            Comenzar prueba gratuita
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/contact"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-8 rounded-lg transition-all duration-200 inline-flex items-center"
          >
            Hablar con ventas
          </Link>
        </div>

        {/* Trust Signal */}
        <p className="text-primary-100 text-sm mt-8">
          ✓ Configuración en 5 minutos · ✓ Soporte en español · ✓ Datos seguros en EU
        </p>
      </div>
    </section>
  )
}
