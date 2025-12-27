'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import {
  LayoutDashboard,
  FolderOpen,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Home,
  ArrowLeft,
  Box,
  Landmark,
  FileText,
  Bell,
  Calendar
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import PageWrapper from '@/components/ui/PageWrapper'
import OnboardingTour from '@/components/dashboard/OnboardingTour'

// Nombres de rutas para breadcrumbs
const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Proyectos',
  viewer: 'Visor 3D',
  grants: 'Subvenciones',
  applications: 'Mis Solicitudes',
  calendar: 'Calendario',
  alerts: 'Alertas',
  billing: 'Facturación',
  settings: 'Configuración',
  new: 'Nuevo proyecto',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = session?.user as any
  const { subscription, loading: subscriptionLoading, isTrial, isPending } = useSubscription(user?.id)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Cerrar sidebar en navegación
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Proyectos', href: '/dashboard/projects', icon: FolderOpen, exact: false },
    { name: 'Visor 3D', href: '/dashboard/viewer', icon: Box, exact: false },
    { name: 'Subvenciones', href: '/dashboard/grants', icon: Landmark, exact: false },
    { name: 'Mis Solicitudes', href: '/dashboard/grants/applications', icon: FileText, exact: false },
    { name: 'Calendario', href: '/dashboard/grants/calendar', icon: Calendar, exact: false },
    { name: 'Facturación', href: '/dashboard/billing', icon: CreditCard, exact: false },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings, exact: false },
  ]

  // Generar breadcrumbs
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { name, path, isLast }
  })

  // Mostrar loading mientras se carga la sesión o la suscripción
  if (status === 'loading' || (status === 'authenticated' && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calcular días restantes del trial
  const getTrialDaysLeft = () => {
    if (!subscription?.trial_end) return 0
    const trialEnd = new Date(subscription.trial_end)
    const now = new Date()
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const trialDaysLeft = getTrialDaysLeft()
  const isTrialExpired = isTrial && trialDaysLeft === 0

  // Determinar si mostrar botón de volver
  const canGoBack = segments.length > 1
  const parentPath = '/' + segments.slice(0, -1).join('/')

  // Función para determinar si un item está activo
  const isItemActive = (item: typeof navigation[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    // Para rutas anidadas, verificar que no haya una ruta más específica que coincida
    if (pathname === item.href) {
      return true
    }
    if (pathname.startsWith(item.href + '/')) {
      // Verificar si hay otro item de navegación más específico que coincida
      const moreSpecificMatch = navigation.find(
        nav => nav.href !== item.href &&
          nav.href.startsWith(item.href) &&
          (pathname === nav.href || pathname.startsWith(nav.href + '/'))
      )
      return !moreSpecificMatch
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Trial Banner */}
      {isTrial && subscription && !isTrialExpired && (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                <p className="text-sm">
                  <strong>Prueba gratuita:</strong> Te quedan {trialDaysLeft} días
                </p>
              </div>
              <Link
                href="/dashboard/billing"
                className="text-sm font-semibold underline hover:no-underline"
              >
                Actualizar plan →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trial Expired Banner */}
      {isTrialExpired && (
        <div className="bg-red-600 text-white fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                ⚠️ Tu prueba gratuita ha expirado. Actualiza tu plan para continuar.
              </p>
              <Link
                href="/dashboard/billing"
                className="bg-white text-red-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-red-50"
              >
                Actualizar ahora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pending Payment Banner */}
      {isPending && (
        <div className="bg-amber-500 text-white fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <strong>Pago pendiente:</strong> Completa el pago para activar tu plan.
              </p>
              <Link
                href="/dashboard/billing"
                className="bg-white text-amber-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-amber-50"
              >
                Completar pago
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Fixed en desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${(isTrial && subscription) || isPending ? 'pt-10' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img src="/images/logo_sin_letras.png" alt="ChronoStone" className="h-10 w-auto" />
              <span className="text-lg font-bold gradient-text">
                ChronoStone
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isItemActive(item)
              return (
                <Link
                  key={item.name}
                  id={`nav-${item.name.toLowerCase().replace(/ /g, '-')}`}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-150
                    ${isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div id="user-profile-section" className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            {subscription && (
              <div className={`mb-3 px-3 py-2 rounded-lg ${isTrial && !isTrialExpired ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Plan actual</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {isTrialExpired ? (
                    <span className="text-red-600 dark:text-red-400">Trial expirado</span>
                  ) : (
                    <>
                      {subscription.plan_id.replace('_', ' ')}
                      {isTrial && !isTrialExpired && <span className="text-primary-500 ml-1">(trial)</span>}
                    </>
                  )}
                </p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Con margen para el sidebar fijo */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Header */}
        <div className={`bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between sticky z-30 top-0 border-b border-gray-200 dark:border-gray-700 ${((isTrial && subscription && !isTrialExpired) || isPending || isTrialExpired) ? '-mt-[38px] pt-[50px]' : ''}`}>
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Botón Volver */}
            {canGoBack && (
              <button
                onClick={() => router.push(parentPath)}
                className="hidden sm:flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="text-sm">Volver</span>
              </button>
            )}

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              <Link
                href="/dashboard"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>

              {breadcrumbs.slice(1).map((crumb) => (
                <div key={crumb.path} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {crumb.isLast ? (
                    <span className="text-gray-900 dark:text-white font-medium">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <ThemeToggle />
        </div>

        {/* Content */}
        <main className="px-6 lg:px-8 pt-12 pb-6 lg:pt-16 lg:pb-8">
          <PageWrapper>
            {children}
          </PageWrapper>
        </main>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <OnboardingTour />
    </div>
  )
}
