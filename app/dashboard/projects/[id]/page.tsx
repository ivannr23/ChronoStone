'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
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
  MoreVertical
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
  status: string
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

const SUPPORTED_FORMATS = ['.stl', '.glb', '.gltf', '.obj', '.zip']
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB para ZIPs con texturas

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [models, setModels] = useState<Model3D[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para subida de modelos
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showViewer, setShowViewer] = useState(false)
  const [modelColor, setModelColor] = useState('#c9a227')

  useEffect(() => {
    if (session?.user && params.id) {
      fetchProject()
    }
  }, [session, params.id])

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
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-primary-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de inicio</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.start_date
              ? new Date(project.start_date).toLocaleDateString('es-ES')
              : 'No especificada'
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ubicación</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.location || 'No especificada'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <Box className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Modelos 3D</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {models.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Creado</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(project.created_at).toLocaleDateString('es-ES')}
          </p>
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

      {/* Actions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary-500" />
          Acciones rápidas
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left">
            <FileText className="h-6 w-6 text-primary-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Generar informe</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Exportar a PDF</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left">
            <Box className="h-6 w-6 text-purple-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Análisis IA</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detectar deterioros</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left">
            <Clock className="h-6 w-6 text-orange-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">TimeMachine</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ver evolución histórica</p>
          </button>
        </div>
      </div>
    </div>
  )
}
