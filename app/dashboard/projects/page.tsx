'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import { LoadingPage } from '@/components/ui/Loading'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/Animations'
import {
  Plus,
  FolderOpen,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Box
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  description: string
  location: string
  status: 'active' | 'archived' | 'completed'
  models_count: number
  created_at: string
  updated_at: string
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const { limits } = useSubscription(user?.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar proyectos desde la API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()

        if (response.ok) {
          setProjects(data.projects || [])
        } else {
          toast.error(data.error || 'Error al cargar proyectos')
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast.error('Error al cargar proyectos')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchProjects()
    }
  }, [session])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <LoadingPage />
  }

  const isUnlimited = Number(limits?.maxProjects) === -1
  const canCreateProject = isUnlimited || (projects.length < (limits?.maxProjects || 5))

  const handleCreateProject = (e: React.MouseEvent) => {
    if (!canCreateProject) {
      e.preventDefault()
      toast.error('Has alcanzado el límite de proyectos de tu plan. Actualiza para crear más.')
      return
    }
  }

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    archived: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mis Proyectos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {projects.length} {isUnlimited ? 'proyectos creados' : `de ${limits?.maxProjects || 5} proyectos utilizados`}
            </p>
          </div>
          <Link
            href={canCreateProject ? '/dashboard/projects/new' : '#'}
            onClick={handleCreateProject}
            className={`btn-primary inline-flex items-center ${!canCreateProject && 'opacity-50 cursor-not-allowed'}`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo proyecto
          </Link>
        </div>
      </FadeIn>

      {/* Search & Filter */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="completed">Completados</option>
              <option value="archived">Archivados</option>
            </select>
          </div>
        </div>
      </FadeIn>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <FadeIn delay={0.2}>
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || filterStatus !== 'all'
                ? 'No se encontraron proyectos'
                : 'Aún no tienes proyectos'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Crea tu primer proyecto para empezar a trabajar'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                href="/dashboard/projects/new"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear primer proyecto
              </Link>
            )}
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <StaggerItem key={project.id}>
              <HoverScale scale={1.02}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}>
                      {project.status === 'active' ? 'Activo' :
                        project.status === 'completed' ? 'Completado' : 'Archivado'}
                    </span>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Box className="h-4 w-4 mr-1" />
                      {project.models_count || 0} modelos
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(project.updated_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </Link>
              </HoverScale>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Usage Info */}
      <FadeIn delay={0.3}>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Uso del plan
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Proyectos utilizados</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {projects.length} / {isUnlimited ? '∞' : (limits?.maxProjects || 5)}
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 rounded-full h-2 transition-all duration-500"
              style={{ width: isUnlimited ? '100%' : `${(projects.length / (limits?.maxProjects || 5)) * 100}%` }}
            ></div>
          </div>
          {!canCreateProject && !isUnlimited && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              Has alcanzado el límite. <Link href="/dashboard/billing" className="underline">Actualiza tu plan</Link> para crear más proyectos.
            </p>
          )}
          {isUnlimited && (
            <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
              Tienes proyectos ilimitados en tu plan Enterprise.
            </p>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
