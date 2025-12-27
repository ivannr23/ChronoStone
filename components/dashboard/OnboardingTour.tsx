'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, LayoutDashboard, FolderOpen, Box, Landmark, CreditCard } from 'lucide-react'

interface Step {
    title: string
    description: string
    targetId?: string
    icon: any
    position?: 'center' | 'bottom' | 'top' | 'left' | 'right'
}

export default function OnboardingTour() {
    const [show, setShow] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })

    const steps: Step[] = [
        {
            title: '¡Bienvenido a ChronoStone! 🏛️',
            description: 'Estamos encantados de tenerte aquí. Deja que te mostremos cómo gestionar tu patrimonio de forma profesional y eficiente.',
            icon: Sparkles,
            position: 'center'
        },
        {
            title: 'Tu Centro de Control',
            description: 'Desde el Dashboard tendrás una visión global de tus proyectos activos y estadísticas clave de un vistazo.',
            targetId: 'nav-dashboard',
            icon: LayoutDashboard
        },
        {
            title: 'Gestión de Proyectos',
            description: 'Aquí podrás crear y gestionar todos tus proyectos de restauración, con documentos, fases y equipos.',
            targetId: 'nav-proyectos',
            icon: FolderOpen
        },
        {
            title: 'Visualización 3D Avanzada',
            description: 'Sube y visualiza modelos 3D de alta precisión. Analiza patologías e integra fotogrametría fácilmente.',
            targetId: 'nav-visor-3d',
            icon: Box
        },
        {
            title: 'Oportunidades de Financiación',
            description: 'Accede a nuestro catálogo de subvenciones actualizado y configura alertas personalizadas para no perder ninguna ayuda.',
            targetId: 'nav-subvenciones',
            icon: Landmark
        },
        {
            title: 'Tu Plan y Facturación',
            description: 'Gestiona tu suscripción, descarga facturas y ajusta tus límites de uso en cualquier momento.',
            targetId: 'nav-facturación',
            icon: CreditCard
        },
        {
            title: '¡Todo listo!',
            description: 'Ya puedes empezar a explorar. Si necesitas ayuda, nuestro equipo de soporte está a un clic de distancia.',
            icon: Sparkles,
            position: 'center'
        }
    ]

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('chrono_onboarding_seen')
        if (!hasSeenTour) {
            // Pequeño delay para que la página cargue bien
            const timer = setTimeout(() => setShow(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        if (show && steps[currentStep].targetId) {
            updateCoords()
            window.addEventListener('resize', updateCoords)
            return () => window.removeEventListener('resize', updateCoords)
        }
    }, [show, currentStep])

    const updateCoords = () => {
        const target = document.getElementById(steps[currentStep].targetId!)
        if (target) {
            const rect = target.getBoundingClientRect()
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            })
        }
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleComplete()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleComplete = () => {
        setShow(false)
        localStorage.setItem('chrono_onboarding_seen', 'true')
    }

    if (!show) return null

    const step = steps[currentStep]
    const isLast = currentStep === steps.length - 1

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
            {/* Dark Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                onClick={handleComplete}
            />

            {/* Spotlight Effect */}
            {step.targetId && (
                <motion.div
                    animate={{
                        top: coords.top - 8,
                        left: coords.left - 8,
                        width: coords.width + 16,
                        height: coords.height + 16,
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                    className="absolute bg-white/10 border-2 border-primary-400 rounded-xl shadow-[0_0_20px_rgba(191,155,48,0.5)] pointer-events-none z-[101]"
                />
            )}

            {/* Card Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: !step.targetId ? 0 : (coords.left + coords.width + 160 > window.innerWidth ? -100 : 200),
                        y: !step.targetId ? 0 : (Math.min(coords.top, window.innerHeight - 300) - window.innerHeight / 2 + 100)
                    }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100 dark:border-gray-700 pointer-events-auto z-[102]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
                            <step.icon className="h-6 w-6" />
                        </div>
                        <button
                            onClick={handleComplete}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="space-y-3 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Footer / Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-primary-500' : 'w-1 bg-gray-200 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="btn-primary py-2 px-6 flex items-center font-bold text-sm"
                            >
                                {isLast ? 'Empezar' : 'Siguiente'}
                                {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
                            </button>
                        </div>
                    </div>

                    {/* Arrow indicator for targeted steps */}
                    {step.targetId && (
                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-b border-gray-100 dark:border-gray-700 rotate-45 ${coords.left + coords.width + 160 > window.innerWidth ? '-right-2' : '-left-2'}`} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
