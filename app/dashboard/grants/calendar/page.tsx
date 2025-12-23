'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Euro,
  Building2,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Grant {
  id: string
  name: string
  organization: string
  call_close_date: string
  max_amount: number | null
  official_url: string | null
  region: string
}

interface Application {
  id: string
  grant_name: string
  organization: string
  call_close_date: string | null
  submission_date: string | null
  status: string
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function CalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [grants, setGrants] = useState<Grant[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'list'>('month')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Obtener subvenciones activas
      const grantsRes = await fetch('/api/grants?status=active&limit=100')
      const grantsData = await grantsRes.json()
      if (grantsRes.ok) {
        setGrants(grantsData.grants || [])
      }

      // Obtener solicitudes del usuario
      if (session?.user) {
        const appsRes = await fetch('/api/grants/applications')
        const appsData = await appsRes.json()
        if (appsRes.ok) {
          setApplications(appsData.applications || [])
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Ajustar para que la semana comience en lunes
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6
    
    const days: (Date | null)[] = []
    
    // Días vacíos al principio
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  // Obtener eventos de un día
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    const grantDeadlines = grants.filter(g => 
      g.call_close_date?.split('T')[0] === dateStr
    )
    
    const appDeadlines = applications.filter(a => 
      a.call_close_date?.split('T')[0] === dateStr && 
      a.status !== 'submitted' && 
      a.status !== 'approved' && 
      a.status !== 'denied'
    )
    
    return { grantDeadlines, appDeadlines }
  }

  // Obtener todos los eventos del mes para la vista de lista
  const getMonthEvents = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const monthGrants = grants.filter(g => {
      if (!g.call_close_date) return false
      const date = new Date(g.call_close_date)
      return date.getFullYear() === year && date.getMonth() === month
    }).sort((a, b) => new Date(a.call_close_date).getTime() - new Date(b.call_close_date).getTime())

    return monthGrants
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 0 
    }).format(amount)
  }

  const getDaysUntil = (date: string) => {
    const target = new Date(date)
    const now = new Date()
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  const days = generateCalendarDays()
  const monthEvents = getMonthEvents()
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : null

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Calendario de Plazos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualiza las fechas límite de las convocatorias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'month' ? 'list' : 'month')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {view === 'month' ? 'Vista lista' : 'Vista calendario'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
            >
              Hoy
            </button>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : view === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }
                
                const events = getEventsForDate(date)
                const hasEvents = events.grantDeadlines.length > 0 || events.appDeadlines.length > 0
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-1 rounded-lg transition-all relative ${
                      isSelected(date)
                        ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                        : isToday(date)
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${isPast ? 'opacity-50' : ''}`}
                  >
                    <span className={`text-sm ${
                      isToday(date)
                        ? 'font-bold text-primary-600 dark:text-primary-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {date.getDate()}
                    </span>
                    {hasEvents && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {events.grantDeadlines.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        )}
                        {events.appDeadlines.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Cierre convocatoria</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Mis solicitudes pendientes</span>
              </div>
            </div>
          </div>

          {/* Selected day details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            {selectedDate ? (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                
                {selectedDateEvents && (
                  selectedDateEvents.grantDeadlines.length === 0 && selectedDateEvents.appDeadlines.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay eventos este día
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.grantDeadlines.map(grant => (
                        <Link
                          key={grant.id}
                          href={`/dashboard/grants`}
                          className="block p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
                        >
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs mb-1">
                            <Clock className="h-3 w-3" />
                            Cierre de convocatoria
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {grant.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {grant.organization}
                          </p>
                        </Link>
                      ))}
                      {selectedDateEvents.appDeadlines.map(app => (
                        <Link
                          key={app.id}
                          href={`/dashboard/grants/applications/${app.id}`}
                          className="block p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xs mb-1">
                            <AlertCircle className="h-3 w-3" />
                            Tu solicitud pendiente
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {app.grant_name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Selecciona un día para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {monthEvents.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No hay plazos este mes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No hay convocatorias con fecha límite en {MONTH_NAMES[currentDate.getMonth()]}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {monthEvents.map(grant => {
                const daysLeft = getDaysUntil(grant.call_close_date)
                const isUrgent = daysLeft <= 7 && daysLeft >= 0
                const isPast = daysLeft < 0
                
                return (
                  <div
                    key={grant.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      isPast ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`text-center min-w-[60px] p-2 rounded-lg ${
                          isUrgent && !isPast
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <p className={`text-2xl font-bold ${
                            isUrgent && !isPast
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {new Date(grant.call_close_date).getDate()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {MONTH_NAMES[new Date(grant.call_close_date).getMonth()].slice(0, 3)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {grant.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {grant.organization}
                          </p>
                          {grant.max_amount && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <Euro className="h-4 w-4" />
                              Hasta {formatCurrency(grant.max_amount)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!isPast && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isUrgent
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `${daysLeft} días`}
                          </span>
                        )}
                        {grant.official_url && (
                          <a
                            href={grant.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

