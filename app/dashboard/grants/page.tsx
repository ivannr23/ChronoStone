'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Heart,
  ExternalLink,
  Calendar,
  Euro,
  MapPin,
  Building2,
  ChevronDown,
  X,
  Bookmark,
  BookmarkCheck,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  Bell,
  RefreshCw,
  Database,
  Upload,
  FileJson
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Grant {
  id: string
  name: string
  description: string
  organization: string
  organization_type: string
  region: string
  province: string | null
  heritage_types: string[]
  protection_levels: string[]
  eligible_beneficiaries: string[]
  min_amount: number | null
  max_amount: number | null
  funding_percentage: number | null
  call_open_date: string | null
  call_close_date: string | null
  year: number
  status: string
  official_url: string | null
  bases_url: string | null
  application_url: string | null
}

const REGIONS = [
  { value: 'all', label: 'Todas las regiones' },
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
  { value: 'ceuta', label: 'Ceuta' },
  { value: 'melilla', label: 'Melilla' },
  { value: 'europeo', label: 'Fondos Europeos' },
]

const ORGANIZATION_TYPES = [
  { value: 'all', label: 'Todos los organismos' },
  { value: 'ministerio', label: 'Ministerio de Cultura' },
  { value: 'ccaa', label: 'Comunidad Autónoma' },
  { value: 'diputacion', label: 'Diputación Provincial' },
  { value: 'ayuntamiento', label: 'Ayuntamiento' },
  { value: 'fundacion', label: 'Fundación' },
  { value: 'europeo', label: 'Fondos Europeos' },
]

const HERITAGE_TYPES = [
  { value: 'all', label: 'Todo tipo de patrimonio' },
  { value: 'iglesia', label: 'Iglesias y ermitas' },
  { value: 'castillo', label: 'Castillos y fortalezas' },
  { value: 'monumento', label: 'Monumentos' },
  { value: 'arqueologico', label: 'Yacimientos arqueológicos' },
  { value: 'civil', label: 'Arquitectura civil' },
  { value: 'industrial', label: 'Patrimonio industrial' },
  { value: 'natural', label: 'Patrimonio natural' },
]

export default function GrantsPage() {
  const { data: session } = useSession()
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncSearchTerm, setSyncSearchTerm] = useState('patrimonio cultural')
  const [importingJson, setImportingJson] = useState(false)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('all')
  const [organizationType, setOrganizationType] = useState('all')
  const [heritageType, setHeritageType] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [year, setYear] = useState('all')
  const [status, setStatus] = useState('active')

  // Paginación
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchGrants = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (region !== 'all') params.append('region', region)
      if (organizationType !== 'all') params.append('organizationType', organizationType)
      if (heritageType !== 'all') params.append('heritageType', heritageType)
      if (minAmount) params.append('minAmount', minAmount)
      if (maxAmount) params.append('maxAmount', maxAmount)
      if (year !== 'all') params.append('year', year)
      if (status !== 'all') params.append('status', status)
      params.append('page', page.toString())
      params.append('status', status === 'all' ? 'active' : status)

      const response = await fetch(`/api/grants?${params}`)
      const data = await response.json()

      if (response.ok) {
        setGrants(data.grants || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      } else {
        toast.error(data.error || 'Error al cargar subvenciones')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar subvenciones')
    } finally {
      setLoading(false)
    }
  }, [search, region, organizationType, heritageType, minAmount, maxAmount, year, status, page])

  const syncWithBDNS = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/grants/sync-bdns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: syncSearchTerm,
          soloAbiertas: true
        })
      })
      const data = await response.json()

      if (data.bdnsUnavailable) {
        // BDNS no disponible - mostrar mensaje informativo
        if (data.needsToken) {
          toast.error('La API de BDNS requiere un token de autenticación. Configúralo en el archivo .env.local', {
            duration: 8000
          })
        } else {
          toast.error(data.message || 'La API de BDNS no está disponible en este momento', {
            duration: 6000
          })
        }
        return
      }

      if (response.ok) {
        if (data.imported > 0) {
          toast.success(`Se han importado ${data.imported} nuevas subvenciones de la BDNS`)
          setShowSyncModal(false)
          fetchGrants()
        } else if (data.skipped > 0) {
          toast.success(`${data.skipped} subvenciones ya existían en el sistema`)
        } else {
          toast('No se encontraron nuevas subvenciones con ese término', {
            icon: 'ℹ️'
          })
        }
      } else {
        toast.error(data.error || 'Error al sincronizar con BDNS')
      }
    } catch (error) {
      toast.error('Error al conectar con la BDNS')
    } finally {
      setSyncing(false)
    }
  }

  // Importar desde archivo JSON
  const handleJsonImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportingJson(true)
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)

      const response = await fetch('/api/grants/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || `Se importaron ${data.imported} convocatorias`, {
          duration: 5000
        })
        setShowSyncModal(false)
        fetchGrants()
      } else {
        toast.error(data.error || 'Error al importar el archivo')
      }
    } catch (error) {
      console.error('Error parsing JSON:', error)
      toast.error('El archivo no es un JSON válido')
    } finally {
      setImportingJson(false)
      if (jsonInputRef.current) {
        jsonInputRef.current.value = ''
      }
    }
  }

  const fetchFavorites = useCallback(async () => {
    if (!session?.user) return
    try {
      const response = await fetch('/api/grants/favorites')
      const data = await response.json()
      if (response.ok && data.favorites) {
        setFavorites(new Set(data.favorites.map((f: any) => f.grant_id)))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }, [session])

  useEffect(() => {
    fetchGrants()
  }, [fetchGrants])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const toggleFavorite = async (grantId: string) => {
    try {
      const response = await fetch('/api/grants/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantId })
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(prev => {
          const newSet = new Set(prev)
          if (data.action === 'added') {
            newSet.add(grantId)
            toast.success('Añadido a favoritos')
          } else {
            newSet.delete(grantId)
            toast.success('Eliminado de favoritos')
          }
          return newSet
        })
      }
    } catch (error) {
      toast.error('Error al modificar favoritos')
    }
  }

  const startApplication = async (grant: Grant) => {
    try {
      const response = await fetch('/api/grants/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantId: grant.id })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Solicitud creada')
        window.location.href = `/dashboard/grants/applications/${data.applicationId}`
      } else {
        toast.error(data.error || 'Error al crear solicitud')
      }
    } catch (error) {
      toast.error('Error al crear solicitud')
    }
  }

  const getDaysUntilDeadline = (date: string | null) => {
    if (!date) return null
    const deadline = new Date(date)
    const now = new Date()
    const days = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
  }

  const clearFilters = () => {
    setSearch('')
    setRegion('all')
    setOrganizationType('all')
    setHeritageType('all')
    setMinAmount('')
    setMaxAmount('')
    setYear('all')
    setStatus('active')
    setPage(1)
  }

  const hasActiveFilters = region !== 'all' || organizationType !== 'all' || heritageType !== 'all' || minAmount !== '' || maxAmount !== '' || year !== 'all' || status !== 'active'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Subvenciones para Patrimonio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Encuentra convocatorias de ayudas para restauración de patrimonio en España
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              title="Sincronizar con la Base de Datos Nacional de Subvenciones"
            >
              <Database className="h-4 w-4" />
              Importar BDNS
            </button>
            <Link
              href="/dashboard/grants/alerts"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-4 w-4" />
              Alertas
            </Link>
            <a
              href="/api/grants/export-calendar"
              download
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Exportar Calendario
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Convocatorias activas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{favorites.size}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Favoritas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {grants.filter(g => {
                    const days = getDaysUntilDeadline(g.call_close_date)
                    return days !== null && days <= 30 && days >= 0
                  }).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cierran en 30 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        {/* Search bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, organismo o descripción..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${showFilters || hasActiveFilters
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
          >
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[region !== 'all', organizationType !== 'all', heritageType !== 'all', !!minAmount, !!maxAmount, year !== 'all', status !== 'active'].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Región
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {REGIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de organismo
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {ORGANIZATION_TYPES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de patrimonio
                </label>
                <select
                  value={heritageType}
                  onChange={(e) => setHeritageType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {HERITAGE_TYPES.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cuantía mínima (€)
                </label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cuantía máxima (€)
                </label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Sin límite"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Año
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Cualquier año</option>
                  {[2025, 2024, 2023].map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Abiertas</option>
                  <option value="closed">Cerradas</option>
                  <option value="all">Todas</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : grants.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay subvenciones
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {hasActiveFilters
              ? 'No se encontraron subvenciones con los filtros seleccionados'
              : 'Importa subvenciones desde la Base de Datos Nacional de Subvenciones (BDNS)'
            }
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setShowSyncModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Database className="h-5 w-5" />
              Importar de BDNS
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {grants.map((grant) => {
            const daysLeft = getDaysUntilDeadline(grant.call_close_date)
            const isFavorite = favorites.has(grant.id)
            const isUrgent = daysLeft !== null && daysLeft <= 15 && daysLeft >= 0

            return (
              <div
                key={grant.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border transition-all hover:shadow-lg ${isUrgent
                  ? 'border-amber-300 dark:border-amber-600'
                  : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg shrink-0">
                          <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {grant.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {grant.organization}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {grant.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {grant.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {REGIONS.find(r => r.value === grant.region)?.label || grant.region || 'Nacional'}
                        </span>
                        {grant.heritage_types?.slice(0, 2).map((type, i) => (
                          <span key={i} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                            {HERITAGE_TYPES.find(h => h.value === type)?.label || type}
                          </span>
                        ))}
                        {grant.funding_percentage && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Hasta {grant.funding_percentage}% financiado
                          </span>
                        )}
                      </div>

                      {/* Info row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {(grant.min_amount || grant.max_amount) && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Euro className="h-4 w-4" />
                            {grant.min_amount && grant.max_amount
                              ? `${formatCurrency(grant.min_amount)} - ${formatCurrency(grant.max_amount)}`
                              : grant.max_amount
                                ? `Hasta ${formatCurrency(grant.max_amount)}`
                                : `Desde ${formatCurrency(grant.min_amount)}`
                            }
                          </div>
                        )}
                        {grant.call_close_date && (
                          <div className={`flex items-center gap-1 ${isUrgent ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            <Calendar className="h-4 w-4" />
                            {daysLeft !== null && daysLeft >= 0
                              ? `Cierra en ${daysLeft} días`
                              : 'Plazo cerrado'
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => toggleFavorite(grant.id)}
                        className={`p-2 rounded-lg transition-colors ${isFavorite
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        {isFavorite ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                      </button>

                      {daysLeft !== null && daysLeft >= 0 && (
                        <button
                          onClick={() => startApplication(grant)}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Solicitar
                        </button>
                      )}

                      {grant.official_url && (
                        <a
                          href={grant.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          Ver convocatoria
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {isUrgent && (
                  <div className="px-6 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      ¡Plazo próximo a finalizar! Quedan {daysLeft} días para presentar solicitud.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de sincronización BDNS */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Database className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Importar de BDNS
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Base de Datos Nacional de Subvenciones
                </p>
              </div>
            </div>

            {/* Opción 1: Importar desde archivo JSON */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">Opción recomendada: Importar desde archivo JSON</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Descarga el JSON de convocatorias desde{' '}
                <a
                  href="https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatorias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  pap.hacienda.gob.es
                </a>
                {' '}y súbelo aquí.
              </p>

              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonImport}
                className="hidden"
                id="json-import"
              />
              <label
                htmlFor="json-import"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors ${importingJson ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {importingJson ? (
                  <>
                    <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-green-700 dark:text-green-300">Importando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300">Seleccionar archivo JSON</span>
                  </>
                )}
              </label>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 dark:border-gray-700 w-full"></div>
              <span className="absolute bg-white dark:bg-gray-800 px-3 text-sm text-gray-500">o</span>
            </div>

            {/* Opción 2: Buscar via API (puede no funcionar) */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Buscar via API (puede requerir autenticación)</span>
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  value={syncSearchTerm}
                  onChange={(e) => setSyncSearchTerm(e.target.value)}
                  placeholder="patrimonio cultural"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <button
                onClick={syncWithBDNS}
                disabled={syncing || !syncSearchTerm.trim()}
                className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar en API
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

