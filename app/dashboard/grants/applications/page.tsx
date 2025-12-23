'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Euro,
  Calendar,
  Building2,
  Filter,
  FolderOpen
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Application {
  id: string
  grant_id: string
  project_id: string | null
  reference_number: string | null
  status: string
  requested_amount: number | null
  approved_amount: number | null
  submission_date: string | null
  resolution_date: string | null
  created_at: string
  grant_name: string
  organization: string
  call_close_date: string | null
  max_amount: number | null
  project_name: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: 'Borrador', color: 'gray', icon: FileText },
  preparing: { label: 'En preparación', color: 'blue', icon: Clock },
  submitted: { label: 'Presentada', color: 'indigo', icon: CheckCircle },
  under_review: { label: 'En revisión', color: 'amber', icon: AlertCircle },
  approved: { label: 'Aprobada', color: 'green', icon: CheckCircle },
  denied: { label: 'Denegada', color: 'red', icon: XCircle },
  desisted: { label: 'Desistida', color: 'gray', icon: XCircle },
}

export default function ApplicationsPage() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/grants/applications?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setApplications(data.applications || [])
      } else {
        toast.error(data.error || 'Error al cargar solicitudes')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (session?.user) {
      fetchApplications()
    }
  }, [session, fetchApplications])

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 0 
    }).format(amount)
  }

  // Stats
  const stats = {
    total: applications.length,
    draft: applications.filter(a => a.status === 'draft' || a.status === 'preparing').length,
    submitted: applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    totalApproved: applications.filter(a => a.status === 'approved').reduce((sum, a) => sum + (a.approved_amount || 0), 0),
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mis Solicitudes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tus solicitudes de subvenciones
            </p>
          </div>
          <Link
            href="/dashboard/grants"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total solicitudes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En preparación</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.draft}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Presentadas</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.submitted}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aprobadas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            {stats.totalApproved > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(stats.totalApproved)} concedidos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todas
            </button>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tienes solicitudes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Busca subvenciones y comienza a solicitar ayudas para tus proyectos
          </p>
          <Link
            href="/dashboard/grants"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Buscar subvenciones
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft
            const StatusIcon = statusConfig.icon

            return (
              <Link
                key={app.id}
                href={`/dashboard/grants/applications/${app.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg shrink-0 bg-${statusConfig.color}-100 dark:bg-${statusConfig.color}-900/30`}>
                        <StatusIcon className={`h-5 w-5 text-${statusConfig.color}-600 dark:text-${statusConfig.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${statusConfig.color}-100 dark:bg-${statusConfig.color}-900/30 text-${statusConfig.color}-700 dark:text-${statusConfig.color}-300`}>
                            {statusConfig.label}
                          </span>
                          {app.reference_number && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Ref: {app.reference_number}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {app.grant_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.organization}
                        </p>
                      </div>
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {app.project_name && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FolderOpen className="h-4 w-4" />
                          {app.project_name}
                        </div>
                      )}
                      {app.requested_amount && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Euro className="h-4 w-4" />
                          Solicitado: {formatCurrency(app.requested_amount)}
                        </div>
                      )}
                      {app.approved_amount && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                          <Euro className="h-4 w-4" />
                          Concedido: {formatCurrency(app.approved_amount)}
                        </div>
                      )}
                      {app.submission_date && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          Presentada: {formatDate(app.submission_date)}
                        </div>
                      )}
                      {!app.submission_date && app.call_close_date && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Clock className="h-4 w-4" />
                          Plazo: {formatDate(app.call_close_date)}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

