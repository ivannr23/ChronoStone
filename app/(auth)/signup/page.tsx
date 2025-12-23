'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Mail, Lock, User, ArrowLeft, Check, Sparkles } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    hasTrial: true,
    features: ['5 proyectos', '10 modelos 3D', '10GB almacenamiento'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    hasTrial: false,
    popular: true,
    features: ['Proyectos ilimitados', 'IA + TimeMachine4D', '50GB almacenamiento'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    hasTrial: false,
    features: ['Todo de Professional', 'White-label', '100GB almacenamiento'],
  },
]

export default function SignupPage() {
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan') || 'starter'

  const [selectedPlan, setSelectedPlan] = useState(planFromUrl)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const currentPlan = plans.find(p => p.id === selectedPlan) || plans[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (!agreedToTerms) {
      toast.error('Debes aceptar los términos y condiciones')
      return
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      // Registrar usuario
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          plan: selectedPlan,
        }),
      })

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Error al crear la cuenta')
      }

      // Iniciar sesión automáticamente
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Si tiene trial (solo Starter), va al dashboard
      // Si no tiene trial, va directamente a checkout
      if (currentPlan.hasTrial) {
        // Redirigir al dashboard con recarga completa
        window.location.href = '/dashboard?new=true'
      } else {
        // Crear checkout de Stripe
        const checkoutResponse = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: selectedPlan }),
        })
        const { url } = await checkoutResponse.json()
        if (url) {
          window.location.href = url
        } else {
          window.location.href = '/dashboard/billing'
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Home + Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/logo_con_letras.png" alt="ChronoStone" className="h-24 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crear cuenta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Elige tu plan y comienza a gestionar tu patrimonio
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Plan Selector */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              1. Selecciona tu plan
            </h2>
            
            <div className="grid sm:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-secondary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}

                  {/* Selected indicator */}
                  {selectedPlan === plan.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}

                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}€</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/mes</span>
                  </div>

                  {/* Trial badge */}
                  {plan.hasTrial ? (
                    <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold mb-3">
                      <Sparkles className="h-3 w-3 mr-1" />
                      14 días gratis
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium mb-3">
                      Pago inmediato
                    </div>
                  )}

                  <ul className="space-y-1.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Check className="h-3 w-3 text-primary-500 mr-1.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {/* Plan info message */}
            <div className={`p-4 rounded-lg ${
              currentPlan.hasTrial 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              {currentPlan.hasTrial ? (
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✨ <strong>Plan {currentPlan.name}:</strong> Disfruta de 14 días de prueba gratuita. 
                  No te cobraremos nada hasta que finalice el periodo de prueba.
                </p>
              ) : (
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  💳 <strong>Plan {currentPlan.name}:</strong> Este plan no incluye periodo de prueba. 
                  Se te redirigirá al pago ({currentPlan.price}€/mes) después de crear la cuenta.
                </p>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              2. Completa tu registro
            </h2>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Juan García"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded text-primary-600 mt-0.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                  Acepto los{' '}
                  <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                    términos
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                    política de privacidad
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Creando cuenta...' 
                  : currentPlan.hasTrial 
                    ? 'Comenzar prueba gratuita'
                    : `Crear cuenta y pagar ${currentPlan.price}€/mes`
                }
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔒 Pago seguro con Stripe · 📧 Soporte en español · 🇪🇺 Datos en EU
          </p>
        </div>
      </div>
    </div>
  )
}
