'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  User,
  Bell,
  Shield,
  Save,
  Camera,
  Database,
  RefreshCw,
  Crown,
  Plus,
  X,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user as any

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    company: '',
    phone: '',
  })

  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    marketing: false,
  })

  const [saving, setSaving] = useState(false)

  // BDNS Sync Config
  const [bdnsConfig, setBdnsConfig] = useState({
    canUseAutoSync: false,
    currentPlan: 'free',
    enabled: false,
    frequency: 'daily',
    searchTerms: ['patrimonio cultural'],
    autoImport: true,
    notifyNew: true,
    lastSync: null as string | null,
    nextSync: null as string | null,
  })
  const [loadingBdns, setLoadingBdns] = useState(true)
  const [savingBdns, setSavingBdns] = useState(false)
  const [newSearchTerm, setNewSearchTerm] = useState('')

  useEffect(() => {
    fetchBdnsConfig()
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setFormData({
            fullName: data.user.full_name || '',
            email: data.user.email || '',
            company: data.user.company || '',
            phone: data.user.phone || '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchBdnsConfig = async () => {
    try {
      const response = await fetch('/api/grants/sync-config')
      const data = await response.json()

      if (response.ok) {
        setBdnsConfig({
          canUseAutoSync: data.canUseAutoSync,
          currentPlan: data.currentPlan,
          enabled: data.config?.enabled || false,
          frequency: data.config?.frequency || 'daily',
          searchTerms: data.config?.searchTerms || ['patrimonio cultural'],
          autoImport: data.config?.autoImport !== false,
          notifyNew: data.config?.notifyNew !== false,
          lastSync: data.config?.lastSync || null,
          nextSync: data.config?.nextSync || null,
        })
      }
    } catch (error) {
      console.error('Error fetching BDNS config:', error)
    } finally {
      setLoadingBdns(false)
    }
  }

  const saveBdnsConfig = async () => {
    setSavingBdns(true)
    try {
      const response = await fetch('/api/grants/sync-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: bdnsConfig.enabled,
          frequency: bdnsConfig.frequency,
          searchTerms: bdnsConfig.searchTerms,
          autoImport: bdnsConfig.autoImport,
          notifyNew: bdnsConfig.notifyNew,
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Configuración de BDNS guardada')
        if (data.nextSync) {
          setBdnsConfig(prev => ({ ...prev, nextSync: data.nextSync }))
        }
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error('Error al guardar configuración')
    } finally {
      setSavingBdns(false)
    }
  }

  const addSearchTerm = () => {
    if (newSearchTerm.trim() && !bdnsConfig.searchTerms.includes(newSearchTerm.trim())) {
      setBdnsConfig(prev => ({
        ...prev,
        searchTerms: [...prev.searchTerms, newSearchTerm.trim()]
      }))
      setNewSearchTerm('')
    }
  }

  const removeSearchTerm = (term: string) => {
    if (bdnsConfig.searchTerms.length > 1) {
      setBdnsConfig(prev => ({
        ...prev,
        searchTerms: prev.searchTerms.filter(t => t !== term)
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Perfil actualizado correctamente')
        // Opcional: Actualizar sesión en el cliente si fuera necesario, 
        // pero normalmente requiere recargar o update() de useSession
      } else {
        toast.error(data.error || 'Error al actualizar perfil')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-primary-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Perfil</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="ml-6">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || 'Usuario'}</p>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Empresa
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Tu empresa (opcional)"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-5 w-5 text-primary-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notificaciones</h2>
        </div>

        <div className="space-y-4">
          {[
            { id: 'email', label: 'Notificaciones por email', desc: 'Recibe actualizaciones de tus proyectos' },
            { id: 'browser', label: 'Notificaciones del navegador', desc: 'Alertas en tiempo real' },
            { id: 'marketing', label: 'Emails de marketing', desc: 'Novedades y ofertas especiales' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.id as keyof typeof notifications]
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-gray-600'
                  }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'
                  }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BDNS Sync Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-primary-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sincronización BDNS
            </h2>
          </div>
          {!bdnsConfig.canUseAutoSync && (
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-full">
              <Crown className="h-4 w-4" />
              Solo Enterprise
            </span>
          )}
        </div>

        {loadingBdns ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : !bdnsConfig.canUseAutoSync ? (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Función Premium
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              La sincronización automática con la Base de Datos Nacional de Subvenciones
              está disponible exclusivamente en el plan <strong>Enterprise</strong>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Tu plan actual: <span className="font-medium capitalize">{bdnsConfig.currentPlan}</span>
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Crown className="h-4 w-4" />
              Actualizar plan
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enable toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Activar sincronización automática</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Importar nuevas subvenciones automáticamente desde la BDNS
                </p>
              </div>
              <button
                onClick={() => setBdnsConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${bdnsConfig.enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${bdnsConfig.enabled ? 'left-7' : 'left-1'
                  }`} />
              </button>
            </div>

            {bdnsConfig.enabled && (
              <>
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frecuencia de sincronización
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'hourly', label: 'Cada hora' },
                      { value: 'daily', label: 'Diaria' },
                      { value: 'weekly', label: 'Semanal' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setBdnsConfig(prev => ({ ...prev, frequency: option.value }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${bdnsConfig.frequency === option.value
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Términos de búsqueda
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {bdnsConfig.searchTerms.map(term => (
                      <span
                        key={term}
                        className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                      >
                        {term}
                        {bdnsConfig.searchTerms.length > 1 && (
                          <button
                            onClick={() => removeSearchTerm(term)}
                            className="hover:text-primary-900 dark:hover:text-primary-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSearchTerm}
                      onChange={(e) => setNewSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSearchTerm()}
                      placeholder="Añadir término..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={addSearchTerm}
                      disabled={!newSearchTerm.trim()}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Additional options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Importar automáticamente</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Guardar nuevas subvenciones sin confirmación
                      </p>
                    </div>
                    <button
                      onClick={() => setBdnsConfig(prev => ({ ...prev, autoImport: !prev.autoImport }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${bdnsConfig.autoImport ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${bdnsConfig.autoImport ? 'left-7' : 'left-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Notificar nuevas subvenciones</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recibir notificación cuando se importen nuevas
                      </p>
                    </div>
                    <button
                      onClick={() => setBdnsConfig(prev => ({ ...prev, notifyNew: !prev.notifyNew }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${bdnsConfig.notifyNew ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${bdnsConfig.notifyNew ? 'left-7' : 'left-1'
                        }`} />
                    </button>
                  </div>
                </div>

                {/* Sync info */}
                {(bdnsConfig.lastSync || bdnsConfig.nextSync) && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {bdnsConfig.lastSync && (
                        <span>
                          Última sincronización: {new Date(bdnsConfig.lastSync).toLocaleString('es-ES')}
                        </span>
                      )}
                      {bdnsConfig.nextSync && (
                        <span className="ml-auto">
                          Próxima: {new Date(bdnsConfig.nextSync).toLocaleString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={saveBdnsConfig}
                    disabled={savingBdns}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {savingBdns ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar configuración BDNS
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-5 w-5 text-primary-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Seguridad</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Cambiar contraseña</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización: Nunca</p>
            </div>
            <button className="px-4 py-2 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
              Cambiar
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Autenticación de dos factores</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Añade una capa extra de seguridad</p>
            </div>
            <button className="px-4 py-2 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
              Activar
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">Zona de peligro</h2>
        <p className="text-red-600 dark:text-red-300 text-sm mb-4">
          Estas acciones son permanentes y no se pueden deshacer.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Eliminar cuenta
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
