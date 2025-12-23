'use client'

import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function PricingTable() {
  const plans = [
    {
      name: 'Starter',
      price: 49,
      description: 'Perfecto para proyectos pequeños y freelancers',
      hasTrial: true,
      features: [
        '5 proyectos activos',
        'Modelos 3D ilimitados',
        'Realidad Aumentada básica',
        '2 usuarios',
        'Exportación avanzada PDF',
        'Soporte prioritario',
        '10GB de almacenamiento',
        'Actualizaciones incluidas',
      ],
      popular: false,
      cta: '14 días gratis',
      color: 'primary',
    },
    {
      name: 'Professional',
      price: 99,
      description: 'Para equipos que buscan funcionalidades completas',
      hasTrial: false,
      features: [
        'Proyectos ilimitados',
        'Modelos 3D ilimitados',
        'Realidad Aumentada completa',
        'IA análisis de deterioro',
        '5 usuarios',
        'TimeMachine4D incluido',
        'Exportación avanzada (PDF, CAD, BIM)',
        'Soporte prioritario 24/7',
        '50GB de almacenamiento',
        'API de acceso',
        'Formación personalizada',
      ],
      popular: true,
      cta: 'Comenzar ahora',
      color: 'secondary',
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'Para grandes organizaciones con necesidades avanzadas',
      hasTrial: false,
      features: [
        'Todo de Professional',
        'White-label personalizado',
        '20 usuarios',
        'Integración con sistemas legacy',
        'Soporte dedicado 24/7',
        'SLA garantizado 99.9%',
        '100GB de almacenamiento',
        'Servidor dedicado opcional',
        'Cumplimiento normativo',
        'Auditorías de seguridad',
        'Desarrollo de features a medida',
      ],
      popular: false,
      cta: 'Contactar ventas',
      color: 'primary',
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
              💰 Precios transparentes
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Un plan para cada{' '}
            <span className="gradient-text">necesidad</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Sin compromisos. Sin letra pequeña. Cancela cuando quieras.
          </p>

          {/* Trial Badge - Solo para Starter */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Plan Starter: 14 días de prueba gratuita</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 ${
                plan.popular
                  ? 'border-secondary-500 scale-105 lg:scale-110'
                  : 'border-gray-200 dark:border-gray-700'
              } p-8 transition-all duration-300 hover:shadow-2xl`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    🔥 MÁS POPULAR
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 min-h-[3rem]">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {plan.price}€
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/mes</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  IVA no incluido
                </p>

                {/* Trial indicator */}
                <div className="mt-4">
                  {plan.hasTrial ? (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                      <Sparkles className="h-4 w-4 mr-1" />
                      14 días gratis
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                      Sin prueba gratuita
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className={`h-5 w-5 ${
                      plan.popular ? 'text-secondary-500' : 'text-primary-500'
                    } mr-3 flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={plan.name === 'Enterprise' ? '/contact' : '/signup?plan=' + plan.name.toLowerCase()}
                className={`block w-full text-center py-4 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:shadow-lg hover:scale-105'
                    : plan.hasTrial
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Necesitas más de 20 usuarios o funcionalidades específicas?
          </p>
          <Link href="/contact" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 underline">
            Hablemos sobre tu plan personalizado →
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl mb-2">💳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sin permanencia</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pago seguro (Stripe)</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📧</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Soporte en español</p>
          </div>
          <div>
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Factura automática</p>
          </div>
        </div>
      </div>
    </section>
  )
}
