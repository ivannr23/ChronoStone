'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Euro,
  Calendar,
  Building2,
  ExternalLink,
  Save,
  Trash2,
  ChevronDown,
  Check,
  FolderOpen,
  Link as LinkIcon,
  Download
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
  notification_date: string | null
  documents: any[]
  checklist: any[]
  notes: string | null
  resolution_notes: string | null
  created_at: string
  grant_name: string
  organization: string
  grant_description: string | null
  call_close_date: string | null
  max_amount: number | null
  funding_percentage: number | null
  official_url: string | null
  bases_url: string | null
  application_url: string | null
  grant_required_documents: any[]
  project_name: string | null
}

interface Project {
  id: string
  name: string
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador', color: 'gray' },
  { value: 'preparing', label: 'En preparación', color: 'blue' },
  { value: 'submitted', label: 'Presentada', color: 'indigo' },
  { value: 'under_review', label: 'En revisión', color: 'amber' },
  { value: 'approved', label: 'Aprobada', color: 'green' },
  { value: 'denied', label: 'Denegada', color: 'red' },
  { value: 'desisted', label: 'Desistida', color: 'gray' },
]

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [application, setApplication] = useState<Application | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [status, setStatus] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [requestedAmount, setRequestedAmount] = useState('')
  const [approvedAmount, setApprovedAmount] = useState('')
  const [submissionDate, setSubmissionDate] = useState('')
  const [resolutionDate, setResolutionDate] = useState('')
  const [notes, setNotes] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [projectId, setProjectId] = useState('')
  const [checklist, setChecklist] = useState<any[]>([])

  useEffect(() => {
    if (session?.user && params.id) {
      fetchApplication()
      fetchProjects()
    }
  }, [session, params.id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/grants/applications/${params.id}`)
      const data = await response.json()
      
      if (response.ok && data.application) {
        const app = data.application
        setApplication(app)
        setStatus(app.status)
        setReferenceNumber(app.reference_number || '')
        setRequestedAmount(app.requested_amount?.toString() || '')
        setApprovedAmount(app.approved_amount?.toString() || '')
        setSubmissionDate(app.submission_date?.split('T')[0] || '')
        setResolutionDate(app.resolution_date?.split('T')[0] || '')
        setNotes(app.notes || '')
        setResolutionNotes(app.resolution_notes || '')
        setProjectId(app.project_id || '')
        setChecklist(app.checklist || [])
      } else {
        toast.error(data.error || 'Error al cargar solicitud')
        router.push('/dashboard/grants/applications')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar solicitud')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      if (response.ok) {
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/grants/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          referenceNumber: referenceNumber || null,
          requestedAmount: requestedAmount ? parseFloat(requestedAmount) : null,
          approvedAmount: approvedAmount ? parseFloat(approvedAmount) : null,
          submissionDate: submissionDate || null,
          resolutionDate: resolutionDate || null,
          notes: notes || null,
          resolutionNotes: resolutionNotes || null,
          projectId: projectId || null,
          checklist,
        })
      })

      if (response.ok) {
        toast.success('Solicitud actualizada')
        fetchApplication()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) return

    try {
      const response = await fetch(`/api/grants/applications/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Solicitud eliminada')
        router.push('/dashboard/grants/applications')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar')
      }
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const toggleChecklistItem = (index: number) => {
    const newChecklist = [...checklist]
    newChecklist[index] = {
      ...newChecklist[index],
      completed: !newChecklist[index].completed
    }
    setChecklist(newChecklist)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!application) return null

  const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  const checklistProgress = checklist.length > 0 
    ? Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${statusConfig.color}-100 dark:bg-${statusConfig.color}-900/30 text-${statusConfig.color}-700 dark:text-${statusConfig.color}-300`}>
                {statusConfig.label}
              </span>
              {referenceNumber && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Ref: {referenceNumber}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {application.grant_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {application.organization}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Eliminar solicitud"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {application.official_url && (
            <a
              href={application.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Ver convocatoria oficial
            </a>
          )}
          {application.bases_url && (
            <a
              href={application.bases_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Download className="h-4 w-4" />
              Bases de la convocatoria
            </a>
          )}
          {application.application_url && (
            <a
              href={application.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              Portal de solicitud
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y datos principales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Datos de la solicitud
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nº de registro/expediente
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ej: 2024/12345"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cuantía solicitada (€)
                </label>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cuantía concedida (€)
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="0"
                  disabled={status !== 'approved'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de presentación
                </label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de resolución
                </label>
                <input
                  type="date"
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proyecto vinculado
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sin proyecto vinculado</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documentación requerida
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {checklistProgress}% completado
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            {checklist.length > 0 ? (
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div
                    key={item.id || index}
                    onClick={() => toggleChecklistItem(index)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      item.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      item.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {item.completed && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        item.completed
                          ? 'text-green-800 dark:text-green-200 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay documentación especificada para esta convocatoria
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notas
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Añade notas sobre la solicitud..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />

            {(status === 'approved' || status === 'denied') && (
              <>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mt-4 mb-2">
                  Notas de resolución
                </h3>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  placeholder="Motivos de la resolución..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info de la subvención */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información de la convocatoria
            </h2>
            <div className="space-y-4">
              {application.max_amount && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cuantía máxima</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(application.max_amount)}
                  </p>
                </div>
              )}
              {application.funding_percentage && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Porcentaje de financiación</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hasta {application.funding_percentage}%
                  </p>
                </div>
              )}
              {application.call_close_date && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fecha límite</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(application.call_close_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Proyecto vinculado */}
          {projectId && projects.find(p => p.id === projectId) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Proyecto vinculado
              </h2>
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FolderOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {projects.find(p => p.id === projectId)?.name}
                </span>
              </Link>
            </div>
          )}

          {/* Historial */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Historial
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-gray-900 dark:text-white">Solicitud creada</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatDate(application.created_at)}
                  </p>
                </div>
              </div>
              {submissionDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white">Solicitud presentada</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(submissionDate)}
                    </p>
                  </div>
                </div>
              )}
              {resolutionDate && (
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    status === 'approved' ? 'bg-green-500' : status === 'denied' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {status === 'approved' ? 'Aprobada' : status === 'denied' ? 'Denegada' : 'Resolución'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(resolutionDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

