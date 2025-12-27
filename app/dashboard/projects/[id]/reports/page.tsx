'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    FileText,
    Printer,
    ChevronLeft,
    Download,
    Calendar,
    MapPin,
    Building2,
    Shield,
    DollarSign
} from 'lucide-react'
import { LoadingPage } from '@/components/ui/Loading'

export default function projectReportPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [project, setProject] = useState<any>(null)
    const [models, setModels] = useState<any[]>([])
    const [phases, setPhases] = useState<any[]>([])
    const [budgetItems, setBudgetItems] = useState<any[]>([])
    const [documents, setDocuments] = useState<any[]>([])
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user && params.id) {
            fetchAllData()
        }
    }, [session, params.id])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [pRes, mRes, phRes, bRes, dRes, iRes] = await Promise.all([
                fetch(`/api/projects/${params.id}`),
                fetch(`/api/projects/${params.id}/models`),
                fetch(`/api/projects/${params.id}/phases`),
                fetch(`/api/projects/${params.id}/budget`),
                fetch(`/api/projects/${params.id}/documents`),
                fetch(`/api/projects/${params.id}/images`)
            ])

            const [pData, mData, phData, bData, dData, iData] = await Promise.all([
                pRes.json(), mRes.json(), phRes.json(), bRes.json(), dRes.json(), iRes.json()
            ])

            setProject(pData.project)
            setModels(mData.models || [])
            setPhases(phData.phases || [])
            setBudgetItems(bData.items || [])
            setDocuments(dData.documents || [])
            setImages(iData.images || [])
        } catch (error) {
            console.error('Error fetching report data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) return <LoadingPage />
    if (!project) return <div>Proyecto no encontrado</div>

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 print:bg-white print:pb-0">
            {/* Top Bar - Hidden on Print */}
            <div className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Volver al proyecto
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="btn-primary flex items-center"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir Informe
                    </button>
                </div>
            </div>

            {/* Report Container */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl print:shadow-none print:max-w-none">
                {/* Header */}
                <div className="p-12 border-b-4 border-primary-600">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-3">
                                    C
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    ChronoStone <span className="text-primary-600">Heritage</span>
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase mb-2">Informe Técnico</h1>
                            <p className="text-gray-500 uppercase tracking-widest font-semibold">{project.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">Fecha del Informe</p>
                            <p className="text-gray-500">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {project.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Tipo de Patrimonio</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{project.heritage_type || 'No definido'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Nivel Protección</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{project.protection_level || 'No definido'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Presupuesto Total</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget || 0)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Estado General</p>
                            <p className="text-sm font-semibold text-primary-600 uppercase italic">{project.project_status}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-12 space-y-12">
                    {/* Description Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-2 mb-4 uppercase">1. Descripción del Proyecto</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {project.description || 'Sin descripción detallada disponible.'}
                        </p>
                    </section>

                    {/* Chronogram Section */}
                    <section className="break-inside-avoid">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-2 mb-6 uppercase">2. Cronograma y Avance de Fases</h2>
                        <div className="space-y-4">
                            {phases.map((phase, idx) => (
                                <div key={phase.id} className="flex items-center">
                                    <div className="w-1/4 text-sm font-semibold text-gray-700 dark:text-gray-400 pr-4">{phase.name}</div>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-6 rounded-full overflow-hidden relative border border-gray-200 dark:border-gray-600">
                                        <div
                                            className="h-full bg-primary-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all duration-1000"
                                            style={{ width: `${phase.progress_percentage}%` }}
                                        >
                                            {phase.progress_percentage}%
                                        </div>
                                    </div>
                                    <div className="w-1/6 text-right text-[10px] font-bold text-gray-400 uppercase">{phase.status}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Economic Section */}
                    <section className="break-inside-avoid">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-2 mb-4 uppercase">3. Desglose Económico</h2>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">Partida / Concepto</th>
                                    <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase text-right">Importe (€)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {budgetItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.description}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-primary-50 dark:bg-primary-900/10 font-bold">
                                    <td className="px-4 py-3 text-sm text-primary-700 uppercase">Total Comprometido</td>
                                    <td className="px-4 py-3 text-sm text-primary-700 text-right">
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(budgetItems.reduce((acc, curr) => acc + curr.amount, 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Visual Gallery */}
                    <section className="break-inside-avoid">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-2 mb-6 uppercase">4. Registro Fotográfico</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {images.slice(0, 4).map((img) => (
                                <div key={img.id} className="space-y-2">
                                    <img src={img.image_url} alt={img.name} className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase text-center">{img.name} - {img.capture_date}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer of the report */}
                    <div className="pt-20 mt-20 border-t border-gray-100 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-8">Firma del Coordinador</p>
                            <div className="w-48 border-b border-gray-300 mb-2"></div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{session?.user?.name}</p>
                            <p className="text-xs text-gray-500">Gestor de Patrimonio en ChronoStone</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-300 uppercase tracking-widest">Documento generado digitalmente via ChronoStone S.A.S</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print styles */}
            <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
        </div>
    )
}
