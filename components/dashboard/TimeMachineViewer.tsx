'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeMachineViewerProps {
    beforeImage: string
    afterImage: string
    onClose: () => void
    open: boolean
}

export default function TimeMachineViewer({ beforeImage, afterImage, onClose, open }: TimeMachineViewerProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const handleMouseDown = () => {
        isDragging.current = true
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging.current || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        let clientX

        if ('touches' in e) {
            clientX = e.touches[0].clientX
        } else {
            clientX = e.clientX
        }

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percentage = (x / rect.width) * 100
        setSliderPosition(percentage)
    }

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            isDragging.current = false
        }
        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('touchend', handleGlobalMouseUp)
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('touchend', handleGlobalMouseUp)
        }
    }, [])

    if (!open) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            >
                <div className="relative w-full max-w-5xl h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 text-white">
                        <h2 className="text-2xl font-bold flex items-center">
                            <ArrowLeftRight className="mr-2 h-6 w-6 text-purple-400" />
                            TimeMachine 4D
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Comparison Slider */}
                    <div
                        ref={containerRef}
                        className="relative flex-1 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/20 shadow-2xl"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* After Image (Background) */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${afterImage})` }}
                        />

                        {/* Before Image (Foreground - Clipped) */}
                        <div
                            className="absolute inset-0 bg-cover bg-center border-r-2 border-white/50"
                            style={{
                                backgroundImage: `url(${beforeImage})`,
                                width: `${sliderPosition}%`,
                            }}
                        />

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center -ml-[15px] border-2 border-purple-500">
                                <ArrowLeftRight className="h-4 w-4 text-purple-600" />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm pointer-events-none">
                            ANTES
                        </div>
                        <div className="absolute top-4 right-4 bg-purple-600/80 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm pointer-events-none">
                            DESPUÉS
                        </div>
                    </div>

                    <p className="text-center text-white/50 mt-4 text-sm">
                        Arrastra el deslizador para comparar la evolución temporal
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
