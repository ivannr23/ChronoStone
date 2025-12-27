'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Users,
    CreditCard,
    TrendingUp,
    Package,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    FileBox,
    LayoutDashboard
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Animations'
import { LoadingPage } from '@/components/ui/Loading'

export default function AdminDashboardPage() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
            const data = await res.json()
            setStats(data.stats)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingPage />

    const cards = [
        { title: 'Usuarios Totales', value: stats?.users, icon: Users, trend: '+12%', up: true, color: 'blue' },
        { title: 'MRR', value: `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(stats?.mrr || 0)}`, icon: TrendingUp, trend: '+8%', up: true, color: 'green' },
        { title: 'Suscripciones Activas', value: stats?.subscribers, icon: CreditCard, trend: '+5%', up: true, color: 'purple' },
        { title: 'Trials Activos', value: stats?.trials, icon: Activity, trend: '-2%', up: false, color: 'amber' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <ShieldCheck className="h-8 w-8 mr-3 text-primary-600" />
                        Panel de Administración
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Panel global de control de ChronoStone SaaS</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Estado del Sistema</p>
                    <div className="flex items-center text-green-500 font-bold">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2" />
                        SALUDABLE
                    </div>
                </div>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <StaggerItem key={card.title}>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400`}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <div className={`flex items-center text-xs font-bold ${card.up ? 'text-green-500' : 'text-red-500'}`}>
                                    {card.up ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {card.trend}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary-500" />
                            Actividad del Servidor
                        </h2>
                        <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-widest italic leading-relaxed text-center px-8">Gráfico de actividad en tiempo real<br />(Próximamente con Recharts)</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Uso de Recursos Global</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Proyectos Totales</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.projects}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary-500 h-full w-3/4 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Modelos 3D Subidos</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.models}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full w-1/2 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-6 rounded-2xl text-white">
                        <h3 className="text-lg font-bold mb-2">Churn Rate Mensual</h3>
                        <p className="text-4xl font-black mb-4">{stats?.churnRate}%</p>
                        <p className="text-white/80 text-xs">Un 0.5% menos que el mes pasado. ¡Buen trabajo de retención!</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Acciones Rápidas Admin</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center group">
                                <Users className="h-5 w-5 mr-3 text-blue-500" />
                                <span className="text-sm font-medium group-hover:text-primary-600">Ver Usuarios</span>
                            </button>
                            <button className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center group">
                                <CreditCard className="h-5 w-5 mr-3 text-green-500" />
                                <span className="text-sm font-medium group-hover:text-primary-600">Revisar Pagos</span>
                            </button>
                            <button className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center group">
                                <FileBox className="h-5 w-5 mr-3 text-purple-500" />
                                <span className="text-sm font-medium group-hover:text-primary-600">Gestionar Subvenciones</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
