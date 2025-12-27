'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import TimeMachineViewer from '@/components/dashboard/TimeMachineViewer'
import dynamic from 'next/dynamic'
import {
  Edit,
  Trash2,
  Upload,
  Calendar,
  MapPin,
  Box,
  FileText,
  Clock,
  X,
  Eye,
  Image,
  MoreVertical,
  Archive,
  Copy,
  Building2,
  Shield,
  DollarSign,
  User,
  CheckCircle2,
  ChevronRight,
  Plus,
  MessageSquare,
  Users,
  Camera,
  Share2,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

// Importar visor 3D dinámicamente
const ModelViewer = dynamic(() => import('@/components/3d/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
      <div className="text-gray-400">Cargando visor 3D...</div>
    </div>
  ),
})

interface Project {
  id: string
  name: string
  description: string | null
  location: string | null
  start_date: string | null
  estimated_end_date: string | null
  status: string
  project_status: string
  heritage_type: string | null
  protection_level: string | null
  budget: number | null
  client_owner: string | null
  progress_percentage: number
  created_at: string
}

interface Model3D {
  id: string
  name: string
  file_size: number
  file_type: string | null
  thumbnail_url: string | null
  created_at: string
}

interface ProjectPhase {
  id: string
  project_id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  progress_percentage: number
  status: string
  order_index: number
  created_at: string
  updated_at: string
}

interface ProjectDocument {
  id: string
  name: string
  file_url: string
  file_size: number
  category: string
  created_at: string
}

interface BudgetItem {
  id: string
  description: string
  amount: number
  created_at: string
}

interface ProjectImage {
  id: string
  name: string
  image_url: string
  capture_date: string | null
  description: string | null
  is_before: boolean | number
  is_after: boolean | number
  created_at: string
}

interface ProjectCollaborator {
  id: string
  user_name: string | null
  user_email: string | null
  email: string | null
  role: string
  invited_at: string
}

interface ProjectNote {
  id: string
  user_id: string
  user_name: string | null
  content: string
  created_at: string
}

const SUPPORTED_FORMATS = ['.stl', '.glb', '.gltf', '.obj', '.zip']
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB para ZIPs con texturas

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [models, setModels] = useState<Model3D[]>([])
  const [phases, setPhases] = useState<ProjectPhase[]>([])
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [images, setImages] = useState<ProjectImage[]>([])
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [phasesView, setPhasesView] = useState<'list' | 'timeline'>('list')

  // Estados para subida de modelos
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showViewer, setShowViewer] = useState(false)
  const [modelColor, setModelColor] = useState('#c9a227')

  // TimeMachine
  const [showTimeMachine, setShowTimeMachine] = useState(false)
  const [timeMachineImages, setTimeMachineImages] = useState<{ before: string, after: string } | null>(null)

  useEffect(() => {
    if (session?.user && params.id) {
      fetchProject()
      fetchPhases()
      fetchDocuments()
      fetchBudget()
      fetchImages()
      fetchNotes()
      fetchCollaborators()
    }
  }, [session, params.id])

  const fetchBudget = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/budget`)
      const data = await response.json()
      if (response.ok) {
        setBudgetItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching budget:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/documents`)
      const data = await response.json()
      if (response.ok) {
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const fetchPhases = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/phases`)
      const data = await response.json()
      if (response.ok) {
        setPhases(data.phases || [])
      }
    } catch (error) {
      console.error('Error fetching phases:', error)
    }
  }

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar el proyecto')
      }

      setProject(data.project)
      setModels(data.models || [])
    } catch (error: any) {
      console.error('Error fetching project:', error)
      toast.error('Error al cargar el proyecto')
      router.push('/dashboard/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar')
      }

      toast.success('Proyecto eliminado')
      router.push('/dashboard/projects')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      toast.error(error.message || 'Error al eliminar el proyecto')
    }
  }

  // Abrir selector de archivos
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click()
  }

  // Manejar archivo seleccionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!SUPPORTED_FORMATS.includes(extension)) {
      toast.error(`Formato no soportado. Usa: ${SUPPORTED_FORMATS.join(', ')}`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande (máx. 100MB)')
      return
    }

    setSelectedFile(file)
    setShowViewer(true)
    toast.success(`Modelo "${file.name}" cargado`)

    // Limpiar el input para poder seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cerrar visor
  const handleCloseViewer = () => {
    setShowViewer(false)
    setSelectedFile(null)
  }

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/images`)
      const data = await response.json()
      if (response.ok) setImages(data.images || [])
    } catch (e) { console.error(e) }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/notes`)
      const data = await response.json()
      if (response.ok) setNotes(data.notes || [])
    } catch (e) { console.error(e) }
  }

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/collaborators`)
      const data = await response.json()
      if (response.ok) setCollaborators(data.collaborators || [])
    } catch (e) { console.error(e) }
  }

  const handleArchive = async () => {
    if (!confirm('¿Estás seguro de que quieres archivar este proyecto? Podrás desarchivarlo después.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_status: 'archived' }),
      })

      if (!response.ok) {
        throw new Error('Error al archivar')
      }

      toast.success('Proyecto archivado')
      fetchProject()
    } catch (error: any) {
      toast.error(error.message || 'Error al archivar')
    }
  }

  const handleDuplicate = async () => {
    const newName = prompt('Nombre para el nuevo proyecto:', `${project?.name} (Copia)`)
    if (!newName) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          duplicateFrom: params.id
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      toast.success('Proyecto duplicado')
      router.push(`/dashboard/projects/${data.projectId}`)
    } catch (error: any) {
      toast.error(error.message || 'Error al duplicar')
    }
  }

  // Guardar modelo en el proyecto
  const [saving, setSaving] = useState(false)

  // Editar thumbnail de modelo
  const [editingThumbnail, setEditingThumbnail] = useState<string | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const handleEditThumbnail = (modelId: string) => {
    setEditingThumbnail(modelId)
    setTimeout(() => thumbnailInputRef.current?.click(), 100)
  }

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingThumbnail) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen')
      return
    }

    // Convertir a base64 para guardar (en producción usarías un servicio de storage)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string

        const response = await fetch(`/api/models/${editingThumbnail}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnailUrl: base64 }),
        })

        if (!response.ok) {
          throw new Error('Error al actualizar la imagen')
        }

        toast.success('Imagen actualizada')
        fetchProject() // Recargar para ver la nueva imagen
      } catch (error) {
        toast.error('Error al actualizar la imagen')
      } finally {
        setEditingThumbnail(null)
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = ''
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveModel = async () => {
    if (!selectedFile || !project) return

    setSaving(true)
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.name.split('.').pop()?.toLowerCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el modelo')
      }

      toast.success('¡Modelo guardado en el proyecto!')

      // Recargar los modelos del proyecto
      fetchProject()

      // Cerrar el visor
      handleCloseViewer()
    } catch (error: any) {
      console.error('Error saving model:', error)
      toast.error(error.message || 'Error al guardar el modelo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Proyecto no encontrado</p>
        <Link href="/dashboard/projects" className="text-primary-600 hover:underline mt-2 inline-block">
          Volver a proyectos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {project.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {project.description || 'Sin descripción'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDuplicate}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Duplicar"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            onClick={handleArchive}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Archivar"
          >
            <Archive className="h-5 w-5" />
          </button>
          <Link
            href={`/dashboard/projects/${params.id}/edit`}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado y Progreso */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                ${project.project_status === 'completed' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  project.project_status === 'in_progress' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    project.project_status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      project.project_status === 'archived' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}
              >
                {project.project_status === 'planning' ? 'Planificación' :
                  project.project_status === 'in_progress' ? 'En curso' :
                    project.project_status === 'paused' ? 'Pausado' :
                      project.project_status === 'completed' ? 'Completado' : 'Archivado'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{project.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-full transition-all duration-300"
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <Building2 className="h-5 w-5 text-primary-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo Patrimonio</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {project.heritage_type || 'No definido'}
          </p>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Shield className="h-3 w-3 mr-1" />
            {project.protection_level || 'Sin protección'}
          </div>
        </div>

        {/* Financiero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.budget ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget) : 'No definido'}
          </p>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <User className="h-3 w-3 mr-1" />
            {project.client_owner || 'Sin cliente'}
          </div>
        </div>

        {/* Cronograma */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Plazos</span>
          </div>
          <div className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500">Inicio:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Fin est.:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {project.estimated_end_date ? new Date(project.estimated_end_date).toLocaleDateString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación y Modelos */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center">
          <MapPin className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <span className="text-sm text-gray-500 block">Ubicación</span>
            <span className="font-semibold text-gray-900 dark:text-white">{project.location || 'No especificada'}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center">
          <Box className="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <span className="text-sm text-gray-500 block">Modelos 3D</span>
            <span className="font-semibold text-gray-900 dark:text-white">{models.length} modelos cargados</span>
          </div>
        </div>
      </div>

      {/* Input de archivo oculto para modelos 3D */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.glb,.gltf,.obj,.zip"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input de archivo oculto para thumbnails */}
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        onChange={handleThumbnailChange}
        className="hidden"
      />

      {/* Models Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Box className="h-5 w-5 mr-2 text-primary-500" />
            Modelos 3D
          </h2>
          <button
            onClick={handleOpenFileSelector}
            className="btn-primary inline-flex items-center text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir modelo
          </button>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Box className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay modelos 3D todavía
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sube tu primer modelo 3D para comenzar a trabajar en este proyecto
            </p>
            <button
              onClick={handleOpenFileSelector}
              className="btn-primary inline-flex items-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              Subir primer modelo
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Formatos: STL, GLB, GLTF, OBJ, ZIP con texturas (máx. 200MB)
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                {/* Imagen de previsualización */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                  {model.thumbnail_url ? (
                    <img
                      src={model.thumbnail_url}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Box className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}

                  {/* Botón de editar imagen (visible en hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditThumbnail(model.id)
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Cambiar imagen de previsualización"
                  >
                    <Image className="h-4 w-4" />
                  </button>
                </div>

                {/* Info del modelo */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {model.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(model.file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <span className="text-xs text-gray-500 uppercase">
                      {model.file_type || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal del Visor 3D */}
      {showViewer && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary-500" />
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Selector de color */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Color:</span>
                  {['#c9a227', '#8b7355', '#a0a0a0', '#cd7f32', '#4a5568'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setModelColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${modelColor === color ? 'border-primary-500' : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCloseViewer}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Visor 3D */}
            <div className="h-[60vh]">
              <ModelViewer
                modelFile={selectedFile}
                className="h-full"
                modelColor={modelColor}
                autoRotate={true}
              />
            </div>

            {/* Footer con acciones */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Arrastrar: rotar • Scroll: zoom • Shift+Scroll: orbitar vertical • Clic derecho: mover
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseViewer}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  className="btn-primary disabled:opacity-50"
                  onClick={handleSaveModel}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar en proyecto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TimeMachine Viewer */}
      <TimeMachineViewer
        open={showTimeMachine}
        onClose={() => setShowTimeMachine(false)}
        beforeImage={timeMachineImages?.before || ''}
        afterImage={timeMachineImages?.after || ''}
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Documentación */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-500" />
                Documentación del Proyecto
              </h2>
              <button
                onClick={() => {
                  const name = prompt('Nombre del documento:')
                  if (name) {
                    fetch(`/api/projects/${params.id}/documents`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, fileUrl: '#', fileSize: 1024 * 1024, fileType: 'pdf', category: 'other' })
                    }).then(() => { toast.success('Documento guardado'); fetchDocuments() })
                  }
                }}
                className="btn-primary py-2 px-4 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Subir archivo
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay documentos técnicos subidos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-all group">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg mr-4">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">{doc.name}</h4>
                      <p className="text-xs text-gray-500">{(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                    <button onClick={async () => { if (confirm('¿Eliminar?')) { await fetch(`/api/projects/${params.id}/documents/${doc.id}`, { method: 'DELETE' }); fetchDocuments() } }} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Galería de Imágenes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Image className="h-5 w-5 mr-2 text-purple-500" />
                Galería y TimeMachine 4D
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const b = images.find(img => img.is_before)
                    const a = images.find(img => img.is_after)
                    if (b && a) {
                      setTimeMachineImages({ before: b.image_url, after: a.image_url })
                      setShowTimeMachine(true)
                    }
                    else toast('Sube imágenes etiquetadas como "Antes" y "Después" para habilitar el TimeMachine')
                  }}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  TimeMachine 4D
                </button>
                <button
                  onClick={() => {
                    const name = prompt('Nombre:')
                    if (name) fetch(`/api/projects/${params.id}/images`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada', description: '', isBefore: true }) }).then(() => { toast.success('Imagen añadida'); fetchImages() })
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Añadir foto
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                <Camera className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay imágenes en la galería.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                    <img src={img.image_url} alt={img.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2">
                      <button onClick={async (e) => { e.stopPropagation(); if (confirm('¿Eliminar?')) { await fetch(`/api/projects/${params.id}/images/${img.id}`, { method: 'DELETE' }); fetchImages() } }} className="text-white hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presupuesto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Control de Presupuesto
              </h2>
              <button
                onClick={() => {
                  const description = prompt('Concepto:')
                  const amount = prompt('Importe:')
                  if (description && amount) fetch(`/api/projects/${params.id}/budget`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, amount: parseFloat(amount), category: 'restoration' }) }).then(() => { toast.success('Partida añadida'); fetchBudget() })
                }}
                className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva partida
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Comprometido</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(budgetItems.reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase">Restante</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format((project?.budget || 0) - budgetItems.reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 uppercase font-black">
                    <th className="px-4 py-3">Concepto</th>
                    <th className="px-4 py-3 text-right">Importe</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {budgetItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{item.description}</td>
                      <td className="px-4 py-3 text-right font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={async () => { if (confirm('¿Eliminar?')) { await fetch(`/api/projects/${params.id}/budget/${item.id}`, { method: 'DELETE' }); fetchBudget() } }} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fases */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary-500" />
                Cronograma de Fases
              </h2>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button onClick={() => setPhasesView('list')} className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${phasesView === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>Lista</button>
                <button onClick={() => setPhasesView('timeline')} className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${phasesView === 'timeline' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>Gantt</button>
              </div>
            </div>

            {phasesView === 'list' ? (
              <div className="space-y-4">
                {phases.map(phase => (
                  <div key={phase.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div>
                      <h4 className="font-semibold">{phase.name}</h4>
                      <p className="text-xs text-gray-500">{phase.progress_percentage}% completado</p>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{ width: `${phase.progress_percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-l-2 border-primary-500 ml-4 pl-6 space-y-6">
                {phases.map((phase, i) => (
                  <div key={phase.id} className="relative">
                    <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-gray-800 shadow-sm" />
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-primary-500 uppercase">FASE 0{i + 1}</p>
                      <h5 className="text-sm font-bold">{phase.name}</h5>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-500" />
              Herramientas
            </h2>
            <div className="space-y-3">
              <Link href={`/dashboard/projects/${params.id}/reports`} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm group">
                <span className="font-medium group-hover:text-primary-600">Informe Técnico</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </Link>
              <button disabled className="w-full flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl opacity-50 text-sm">
                <span>Análisis IA (Próx.)</span>
                <Lock className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-500" />
                Equipo
              </h2>
              <button onClick={() => {
                const email = prompt('Email:');
                if (email) fetch(`/api/projects/${params.id}/collaborators`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role: 'technician' }) }).then(() => fetchCollaborators())
              }} className="text-primary-600 hover:text-primary-700"><Plus className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase">{session?.user?.name?.[0]}</div>
                <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{session?.user?.name}</p><p className="text-[10px] text-gray-500">Propietario</p></div>
              </div>
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">{c.user_name?.[0] || 'U'}</div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{c.user_name || c.email}</p><p className="text-[10px] text-gray-500 capitalize">{c.role}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-secondary-500" />
              Notas
            </h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 pr-2">
              {notes.map(n => (
                <div key={n.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 group">
                  <div className="flex justify-between items-start mb-1 text-[10px]">
                    <span className="font-black text-gray-900 dark:text-white">{n.user_name}</span>
                    <button onClick={async () => { if (confirm('¿Eliminar?')) { await fetch(`/api/projects/${params.id}/notes/${n.id}`, { method: 'DELETE' }); fetchNotes() } }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{n.content}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-center text-[10px] text-gray-400 py-4 italic">No hay notas registradas.</p>}
            </div>
            <input
              type="text"
              placeholder="Nueva nota..."
              className="w-full text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const content = e.currentTarget.value
                  if (content) fetch(`/api/projects/${params.id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).then(() => { fetchNotes(); e.currentTarget.value = '' })
                }
              }}
            />
          </div>
        </div>
      </div>
    </div >
  )
}
