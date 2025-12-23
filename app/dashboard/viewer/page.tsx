'use client'

import { useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Upload, FileType, Info, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

// Importar dinámicamente para evitar SSR issues con Three.js
const ModelViewer = dynamic(() => import('@/components/3d/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-900 rounded-xl flex items-center justify-center">
      <div className="text-gray-400">Cargando visor 3D...</div>
    </div>
  ),
})

const SUPPORTED_FORMATS = ['.stl', '.glb', '.gltf', '.obj']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export default function ViewerPage() {
  const { data: session } = useSession()
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [modelColor, setModelColor] = useState('#c9a227')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!SUPPORTED_FORMATS.includes(extension)) {
      toast.error(`Formato no soportado. Usa: ${SUPPORTED_FORMATS.join(', ')}`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande (máx. 100MB)')
      return
    }

    setModelFile(file)
    toast.success(`Modelo "${file.name}" cargado`)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Visor de Modelos 3D
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza modelos 3D de patrimonio histórico. Compatible con archivos de Cults3D.
        </p>
      </div>

      {/* Main viewer area */}
      <div 
        className={`relative rounded-xl overflow-hidden transition-all ${
          isDragging ? 'ring-4 ring-primary-500 ring-opacity-50' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <ModelViewer 
          modelFile={modelFile || undefined}
          className="h-[500px]"
          modelColor={modelColor}
          autoRotate={true}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-xl">
              <Upload className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Suelta el archivo aquí
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-primary-500" />
            Cargar modelo
          </h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <FileType className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Haz clic o arrastra un archivo
            </p>
            <p className="text-sm text-gray-500">
              STL, GLB, GLTF, OBJ (máx. 100MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".stl,.glb,.gltf,.obj"
            onChange={handleInputChange}
            className="hidden"
          />

          {modelFile && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {modelFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(modelFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Color picker for STL */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color del modelo (para STL)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={modelColor}
                onChange={(e) => setModelColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <div className="flex gap-2">
                {['#c9a227', '#8b7355', '#a0a0a0', '#cd7f32', '#4a5568'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setModelColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      modelColor === color ? 'border-primary-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary-500" />
            Dónde conseguir modelos
          </h3>

          <div className="space-y-4">
            <a
              href="https://cults3d.com/es/etiquetas/monumentos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Cults3D</p>
                <p className="text-sm text-gray-500">Modelos STL gratuitos de monumentos</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a
              href="https://www.myminifactory.com/scantheworld/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Scan The World</p>
                <p className="text-sm text-gray-500">Esculturas y arte escaneados</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a
              href="https://3d.si.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Smithsonian 3D</p>
                <p className="text-sm text-gray-500">Colección del museo</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          </div>

          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm text-primary-800 dark:text-primary-300">
              <strong>💡 Tip:</strong> Los archivos STL de Cults3D funcionan perfectamente. 
              Descarga el modelo y arrástralo aquí.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Controles del visor
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">🖱️ Arrastrar</span>
            <span>Rotar</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">🖱️ Scroll</span>
            <span>Zoom</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">🖱️ Clic derecho</span>
            <span>Mover</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">F</span>
            <span>Pantalla completa</span>
          </div>
        </div>
      </div>
    </div>
  )
}

