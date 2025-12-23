'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Code, Copy, Check, Lock, Key, Zap } from 'lucide-react'
import { useState } from 'react'

const endpoints = [
  {
    method: 'GET',
    path: '/api/projects',
    description: 'Listar todos los proyectos del usuario',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/projects',
    description: 'Crear un nuevo proyecto',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/projects/:id',
    description: 'Obtener detalles de un proyecto',
    auth: true,
  },
  {
    method: 'PATCH',
    path: '/api/projects/:id',
    description: 'Actualizar un proyecto',
    auth: true,
  },
  {
    method: 'DELETE',
    path: '/api/projects/:id',
    description: 'Eliminar un proyecto',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/models',
    description: 'Listar modelos 3D de un proyecto',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/models',
    description: 'Subir un nuevo modelo 3D',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/grants',
    description: 'Buscar subvenciones con filtros',
    auth: true,
  },
]

export default function ApiReferencePage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exampleCode = `// Ejemplo: Listar proyectos
const response = await fetch('https://api.chronostone.com/api/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.projects);`

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
              <Code className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-600 dark:text-primary-400 font-medium">API v1.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              API Reference
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Integra ChronoStone con tus aplicaciones usando nuestra API REST
            </p>
          </div>

          {/* Authentication */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Autenticación</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Todas las peticiones a la API requieren autenticación mediante token Bearer. 
              Puedes obtener tu API key desde el panel de configuración.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
              <span className="text-green-400">Authorization:</span> Bearer YOUR_API_KEY
            </div>
          </div>

          {/* Example Code */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Ejemplo de uso</h3>
              <button
                onClick={() => copyToClipboard(exampleCode)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{exampleCode}</code>
            </pre>
          </div>

          {/* Endpoints */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Endpoints disponibles</h2>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    endpoint.method === 'PATCH' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-gray-900 dark:text-white font-mono">{endpoint.path}</code>
                  {endpoint.auth && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{endpoint.description}</p>
              </div>
            ))}
          </div>

          {/* Rate Limits */}
          <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">Límites de uso</h2>
            </div>
            <ul className="space-y-2 text-yellow-700 dark:text-yellow-300">
              <li>• <strong>Free:</strong> 100 peticiones/hora</li>
              <li>• <strong>Starter:</strong> 1.000 peticiones/hora</li>
              <li>• <strong>Professional:</strong> 10.000 peticiones/hora</li>
              <li>• <strong>Enterprise:</strong> Sin límite</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

