'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import { Check, CreditCard, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BillingPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const { subscription, loading, isTrial, isActive } = useSubscription(user?.id)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      features: [
        '5 proyectos activos',
        '10 modelos 3D',
        '10GB almacenamiento',
        'Exportación PDF',
        '2 usuarios',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      popular: true,
      features: [
        'Proyectos ilimitados',
        'Modelos 3D ilimitados',
        '50GB almacenamiento',
        'IA + TimeMachine4D',
        '5 usuarios',
        'API acceso',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: [
        'Todo de Professional',
        '100GB almacenamiento',
        '20 usuarios',
        'White-label',
        'Soporte dedicado 24/7',
        'SLA 99.9%',
      ],
    },
  ]

  const handleSelectPlan = async (planId: string) => {
    setProcessingPlan(planId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      toast.error('Error al procesar. Intenta de nuevo.')
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (error) {
      toast.error('Error al abrir el portal de facturación')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Facturación y planes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu suscripción y método de pago
        </p>
      </div>

      {/* Current Subscription Status */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary-500" />
          Estado de suscripción
        </h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plan actual</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {subscription.plan_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                <p className={`text-lg font-semibold ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isTrial ? '✨ Prueba gratuita' : subscription.status === 'active' ? '✓ Activo' : '✗ Inactivo'}
                </p>
              </div>
              {isTrial && subscription.trial_end && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prueba termina</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(subscription.trial_end).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              {subscription.current_period_end && !isTrial && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Próxima factura</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </div>

            {subscription.stripe_customer_id && (
              <button
                onClick={handleManageSubscription}
                className="btn-outline inline-flex items-center"
              >
                Gestionar suscripción
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>No tienes una suscripción activa. Elige un plan para empezar.</p>
          </div>
        )}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {subscription ? 'Cambiar de plan' : 'Elige tu plan'}
        </h2>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${
                  plan.popular 
                    ? 'border-secondary-500 shadow-lg' 
                    : isCurrentPlan 
                      ? 'border-primary-500' 
                      : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}€</span>
                  <span className="text-gray-500 dark:text-gray-400">/mes</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <Check className="h-5 w-5 text-primary-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan || processingPlan === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:shadow-lg'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {processingPlan === plan.id
                    ? 'Procesando...'
                    : isCurrentPlan
                      ? 'Plan actual'
                      : 'Seleccionar plan'
                  }
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">¿Puedo cambiar de plan en cualquier momento?</p>
            <p className="text-gray-600 dark:text-gray-400">Sí, puedes cambiar de plan cuando quieras. El cobro se prorrateará automáticamente.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">¿Qué métodos de pago aceptáis?</p>
            <p className="text-gray-600 dark:text-gray-400">Aceptamos todas las tarjetas principales (Visa, Mastercard, AMEX) y SEPA.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">¿Qué pasa si cancelo?</p>
            <p className="text-gray-600 dark:text-gray-400">Mantendrás acceso hasta fin del periodo pagado. Tus datos se guardarán 30 días.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
