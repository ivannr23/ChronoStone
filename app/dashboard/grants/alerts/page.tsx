'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Bell,
  BellRing,
  Mail,
  Smartphone,
  Save,
  MapPin,
  Building2,
  Landmark,
  Euro,
  Check,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const REGIONS = [
  { value: 'nacional', label: 'Nacional' },
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'baleares', label: 'Islas Baleares' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla_leon', label: 'Castilla y León' },
  { value: 'castilla_mancha', label: 'Castilla-La Mancha' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'comunidad_valenciana', label: 'Comunitat Valenciana' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'madrid', label: 'Madrid' },
  { value: 'murcia', label: 'Región de Murcia' },
  { value: 'navarra', label: 'Navarra' },
  { value: 'pais_vasco', label: 'País Vasco' },
  { value: 'la_rioja', label: 'La Rioja' },
  { value: 'europeo', label: 'Fondos Europeos' },
]

const ORGANIZATION_TYPES = [
  { value: 'ministerio', label: 'Ministerio de Cultura' },
  { value: 'ccaa', label: 'Comunidades Autónomas' },
  { value: 'diputacion', label: 'Diputaciones' },
  { value: 'ayuntamiento', label: 'Ayuntamientos' },
  { value: 'fundacion', label: 'Fundaciones' },
  { value: 'europeo', label: 'Fondos Europeos' },
]

const HERITAGE_TYPES = [
  { value: 'iglesia', label: 'Iglesias y ermitas' },
  { value: 'castillo', label: 'Castillos y fortalezas' },
  { value: 'monumento', label: 'Monumentos' },
  { value: 'arqueologico', label: 'Yacimientos arqueológicos' },
  { value: 'civil', label: 'Arquitectura civil' },
  { value: 'industrial', label: 'Patrimonio industrial' },
  { value: 'natural', label: 'Patrimonio natural' },
]

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Inmediata', description: 'Recibe alertas al instante' },
  { value: 'daily', label: 'Diaria', description: 'Resumen diario por la mañana' },
  { value: 'weekly', label: 'Semanal', description: 'Resumen cada lunes' },
]

export default function AlertsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [regions, setRegions] = useState<string[]>([])
  const [heritageTypes, setHeritageTypes] = useState<string[]>([])
  const [organizationTypes, setOrganizationTypes] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [frequency, setFrequency] = useState('immediate')

  useEffect(() => {
    if (session?.user) {
      fetchAlerts()
    }
  }, [session])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/grants/alerts')
      const data = await response.json()
      
      if (response.ok && data.alerts && data.alerts.length > 0) {
        const alert = data.alerts[0]
        setRegions(alert.regions || [])
        setHeritageTypes(alert.heritage_types || [])
        setOrganizationTypes(alert.organization_types || [])
        setMinAmount(alert.min_amount?.toString() || '')
        setEmailEnabled(alert.email_enabled !== false)
        setPushEnabled(alert.push_enabled !== false)
        setFrequency(alert.frequency || 'immediate')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/grants/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regions,
          heritageTypes,
          organizationTypes,
          minAmount: minAmount ? parseFloat(minAmount) : null,
          emailEnabled,
          pushEnabled,
          frequency
        })
      })

      if (response.ok) {
        toast.success('Alertas configuradas correctamente')
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

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, value: string) => {
    if (array.includes(value)) {
      setArray(array.filter(v => v !== value))
    } else {
      setArray([...array, value])
    }
  }

  const selectAll = (setArray: (arr: string[]) => void, options: { value: string }[]) => {
    setArray(options.map(o => o.value))
  }

  const clearAll = (setArray: (arr: string[]) => void) => {
    setArray([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <BellRing className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configurar Alertas
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Recibe notificaciones cuando se publiquen nuevas subvenciones que coincidan con tus criterios
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Mantente informado de nuevas oportunidades
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              Configura tus preferencias y te avisaremos automáticamente cuando se publiquen convocatorias 
              que encajen con tu perfil. No te pierdas ninguna oportunidad de financiación.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Regiones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Regiones de interés
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => selectAll(setRegions, REGIONS)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Seleccionar todas
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => clearAll(setRegions)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <button
                key={region.value}
                onClick={() => toggleArrayItem(regions, setRegions, region.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  regions.includes(region.value)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {regions.includes(region.value) && <Check className="h-3 w-3 inline mr-1" />}
                {region.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tipos de patrimonio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tipos de patrimonio
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => selectAll(setHeritageTypes, HERITAGE_TYPES)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Seleccionar todos
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => clearAll(setHeritageTypes)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {HERITAGE_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => toggleArrayItem(heritageTypes, setHeritageTypes, type.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  heritageTypes.includes(type.value)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {heritageTypes.includes(type.value) && <Check className="h-3 w-3 inline mr-1" />}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tipos de organismo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tipos de organismo
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => selectAll(setOrganizationTypes, ORGANIZATION_TYPES)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Seleccionar todos
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => clearAll(setOrganizationTypes)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ORGANIZATION_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => toggleArrayItem(organizationTypes, setOrganizationTypes, type.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  organizationTypes.includes(type.value)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {organizationTypes.includes(type.value) && <Check className="h-3 w-3 inline mr-1" />}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuantía mínima */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Euro className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cuantía mínima
            </h2>
          </div>
          <div className="max-w-xs">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Sin mínimo"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Solo recibirás alertas de subvenciones con cuantía superior a este importe
            </p>
          </div>
        </div>

        {/* Canales de notificación */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Canales de notificación
            </h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recibir notificaciones por correo electrónico
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Notificaciones push</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recibir notificaciones en el navegador
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Frecuencia */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Frecuencia de notificaciones
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FREQUENCY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value)}
                className={`p-4 rounded-lg text-left transition-all ${
                  frequency === option.value
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <p className={`font-medium ${
                  frequency === option.value
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}

