'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Save, X, Building2, Shield, DollarSign, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const HERITAGE_TYPES = [
    'Iglesia',
    'Catedral',
    'Castillo',
    'Palacio',
    'Monasterio',
    'Convento',
    'Torre',
    'Muralla',
    'Puente',
    'Acueducto',
    'Teatro Romano',
    'Yacimiento Arqueológico',
    'Casa Señorial',
    'Edificio Civil',
    'Otro'
]

const PROTECTION_LEVELS = [
    'BIC - Bien de Interés Cultural',
    'BRL - Bien de Relevancia Local',
    'Catálogo General del Patrimonio',
    'Patrimonio Mundial UNESCO',
    'Inventario General',
    'Sin protección específica',
    'Otro'
]

const PROJECT_STATUSES = [
    { value: 'planning', label: 'Planificación', color: 'blue' },
    { value: 'in_progress', label: 'En curso', color: 'green' },
    { value: 'paused', label: 'Pausado', color: 'yellow' },
    { value: 'completed', label: 'Completado', color: 'purple' },
    { value: 'archived', label: 'Archivado', color: 'gray' }
]

export default function EditProjectPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        start_date: '',
        estimated_end_date: '',
        project_status: 'planning',
        heritage_type: '',
        protection_level: '',
        budget: '',
        client_owner: '',
        progress_percentage: 0
    })

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

            const project = data.project
            setFormData({
                name: project.name || '',
                description: project.description || '',
                location: project.location || '',
                start_date: project.start_date || '',
                estimated_end_date: project.estimated_end_date || '',
                project_status: project.project_status || 'planning',
                heritage_type: project.heritage_type || '',
                protection_level: project.protection_level || '',
                budget: project.budget || '',
                client_owner: project.client_owner || '',
                progress_percentage: project.progress_percentage || 0
            })
        } catch (error: any) {
            console.error('Error fetching project:', error)
            toast.error('Error al cargar el proyecto')
            router.push('/dashboard/projects')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch(`/api/projects/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar el proyecto')
            }

            toast.success('Proyecto actualizado correctamente')
            router.push(`/dashboard/projects/${params.id}`)
        } catch (error: any) {
            console.error('Error updating project:', error)
            toast.error(error.message || 'Error al actualizar el proyecto')
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Editar Proyecto
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Actualiza la información de tu proyecto patrimonial
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Básica */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Información Básica
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre del proyecto *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Ej: Restauración Iglesia de San Miguel"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                placeholder="Describe el proyecto, objetivos, alcance..."
                            />
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ubicación
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Ej: Calle Mayor 123, Toledo"
                            />
                        </div>
                    </div>
                </div>

                {/* Clasificación Patrimonial */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-primary-500" />
                        Clasificación Patrimonial
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="heritage_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de patrimonio
                            </label>
                            <select
                                id="heritage_type"
                                name="heritage_type"
                                value={formData.heritage_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            >
                                <option value="">Seleccionar tipo...</option>
                                {HERITAGE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="protection_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Shield className="h-4 w-4 inline mr-1" />
                                Nivel de protección
                            </label>
                            <select
                                id="protection_level"
                                name="protection_level"
                                value={formData.protection_level}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            >
                                <option value="">Seleccionar nivel...</option>
                                {PROTECTION_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Planificación y Estado */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary-500" />
                        Planificación y Estado
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha de inicio
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="estimated_end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha estimada de fin
                            </label>
                            <input
                                type="date"
                                id="estimated_end_date"
                                name="estimated_end_date"
                                value={formData.estimated_end_date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="project_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Estado del proyecto
                            </label>
                            <select
                                id="project_status"
                                name="project_status"
                                value={formData.project_status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            >
                                {PROJECT_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="progress_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Progreso: {formData.progress_percentage}%
                            </label>
                            <input
                                type="range"
                                id="progress_percentage"
                                name="progress_percentage"
                                min="0"
                                max="100"
                                value={formData.progress_percentage}
                                onChange={handleChange}
                                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-300"
                                    style={{ width: `${formData.progress_percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información Financiera y Cliente */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-primary-500" />
                        Información Financiera y Cliente
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Presupuesto total (€)
                            </label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                step="0.01"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Ej: 250000.00"
                            />
                        </div>

                        <div>
                            <label htmlFor="client_owner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <User className="h-4 w-4 inline mr-1" />
                                Cliente / Propietario
                            </label>
                            <input
                                type="text"
                                id="client_owner"
                                name="client_owner"
                                value={formData.client_owner}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Ej: Diócesis de Toledo"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <X className="h-5 w-5" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    )
}
