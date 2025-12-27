'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import UsageWidget from '@/components/ui/UsageWidget'
import { LoadingPage } from '@/components/ui/Loading'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/Animations'
import {
  FolderOpen,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  FileBox,
  Landmark,
  TrendingUp
} from 'lucide-react'

interface RecentActivity {
  id: string
  type: 'project' | 'model'
  title: string
  subtitle: string
  date: string
}

// Función para formatear tiempo relativo
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get('new') === 'true'
  const { subscription, isTrial } = useSubscription(user?.id)
  const [stats, setStats] = useState({
    projects: 0,
    models: 0,
    storage: 0,
    projectStatusBreakdown: {} as Record<string, number>
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session, fetchDashboardData])

  // Quick actions
  const quickActions = [
    {
      title: 'Nuevo Proyecto',
      description: 'Crear proyecto',
      icon: Plus,
      href: '/dashboard/projects/new',
      gradient: true,
    },
    {
      title: 'Ver Proyectos',
      description: `${stats.projects} activos`,
      icon: FolderOpen,
      href: '/dashboard/projects',
    },
    {
      title: 'Subvenciones',
      description: 'Explorar ayudas',
      icon: Landmark,
      href: '/dashboard/grants',
    },
    {
      title: 'Facturación',
      description: subscription?.plan_id || 'Free',
      icon: TrendingUp,
      href: '/dashboard/billing',
    },
  ]

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Welcome Header */}
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Hola, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isTrial
                ? 'Estás en tu prueba gratuita. Explora todas las funcionalidades.'
                : 'Bienvenido de nuevo a ChronoStone.'
              }
            </p>
          </div>
        </FadeIn>

        {/* New User Welcome */}
        {isNewUser && (
          <FadeIn delay={0.1}>
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <Sparkles className="h-6 w-6 mr-2" />
                  <h2 className="text-xl font-bold">¡Bienvenido a ChronoStone!</h2>
                </div>
                <p className="text-white/90 mb-4">
                  Tu prueba gratuita de 14 días está activa. Empieza creando tu primer proyecto.
                </p>
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center bg-white text-primary-600 font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                >
                  Crear primer proyecto
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Quick Actions */}
        <StaggerContainer className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <StaggerItem key={action.title}>
              <HoverScale scale={1.02}>
                <Link
                  href={action.href}
                  className={`
                    flex items-center p-4 rounded-xl transition-all duration-150
                    ${action.gradient
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg'
                    }
                  `}
                >
                  <action.icon className={`h-8 w-8 mr-3 ${action.gradient ? '' : 'text-primary-500'}`} />
                  <div>
                    <p className={`font-semibold ${action.gradient ? '' : 'text-gray-900 dark:text-white'}`}>
                      {action.title}
                    </p>
                    <p className={`text-sm ${action.gradient ? 'opacity-90' : 'text-gray-500 dark:text-gray-400'}`}>
                      {action.description}
                    </p>
                  </div>
                </Link>
              </HoverScale>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Recent Activity */}
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-500" />
              Actividad reciente
            </h2>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📂</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aún no tienes actividad. ¡Crea tu primer proyecto!
                </p>
                <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear proyecto
                </Link>
              </div>
            ) : (
              <StaggerContainer className="space-y-3">
                {recentActivity.map((activity) => (
                  <StaggerItem key={`${activity.type}-${activity.id}`}>
                    <HoverScale scale={1.01}>
                      <Link
                        href={activity.type === 'project' ? `/dashboard/projects/${activity.id}` : '#'}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${activity.type === 'project'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }`}>
                          {activity.type === 'project' ? (
                            <FolderOpen className="h-5 w-5" />
                          ) : (
                            <FileBox className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.subtitle}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(activity.date)}
                        </span>
                      </Link>
                    </HoverScale>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </FadeIn>

        {/* Getting Started Guide */}
        {(isNewUser || stats.projects === 0) && (
          <FadeIn delay={0.4}>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Guía de inicio rápido
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { step: 1, title: 'Crea un proyecto', desc: 'Define tu primer proyecto patrimonial' },
                  { step: 2, title: 'Sube un modelo 3D', desc: 'Importa tu escaneo o modelo existente' },
                  { step: 3, title: 'Explora subvenciones', desc: 'Encuentra ayudas disponibles' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start">
                    <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mr-3 font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <FadeIn delay={0.2}>
          <UsageWidget />
        </FadeIn>

        {/* Project Stats Distribution */}
        <FadeIn delay={0.25}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Estado de Proyectos
            </h3>
            <div className="space-y-3">
              {[
                { label: 'En Planificación', key: 'planning', color: 'bg-blue-500' },
                { label: 'En Curso', key: 'active', color: 'bg-green-500' },
                { label: 'Completados', key: 'completed', color: 'bg-purple-500' },
                { label: 'Pausados', key: 'paused', color: 'bg-orange-500' },
              ].map(status => {
                const count = stats.projectStatusBreakdown?.[status.key] || 0
                const percentage = stats.projects > 0 ? (count / stats.projects) * 100 : 0

                return (
                  <div key={status.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{status.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${status.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Quick Stats */}
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Resumen rápido
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Plan actual</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {subscription?.plan_id || 'Free Trial'}
                </span>
              </div>
              {isTrial && subscription?.trial_end && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trial termina</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {new Date(subscription.trial_end).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/dashboard/billing"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Gestionar suscripción →
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div >
  )
}
