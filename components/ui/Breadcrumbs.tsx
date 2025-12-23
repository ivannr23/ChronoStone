'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Proyectos',
  billing: 'Facturación',
  settings: 'Configuración',
  new: 'Nuevo',
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // No mostrar breadcrumbs en la página principal del dashboard
  if (segments.length <= 1) return null

  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    return { name, path, isLast }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 animate-fade-in">
      <Link
        href="/dashboard"
        className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
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
  )
}

