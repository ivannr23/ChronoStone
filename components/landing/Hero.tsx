'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2 animate-pulse" />
              <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                Ahora con IA y Realidad Aumentada
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Gestión patrimonial{' '}
              <span className="gradient-text">inteligente</span> para el siglo XXI
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Digitaliza, restaura y preserva el patrimonio histórico con tecnología de vanguardia. 
              Modelos 3D, análisis por IA, realidad aumentada y más en una sola plataforma.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { value: '500+', label: 'Proyectos activos' },
                { value: '98%', label: 'Satisfacción' },
                { value: '15TB', label: 'Datos procesados' },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/signup" className="btn-primary inline-flex items-center justify-center">
                  Comenzar prueba gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              <motion.button 
                className="btn-secondary inline-flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="mr-2 h-5 w-5" />
                Ver demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.p 
              className="text-sm text-gray-500 dark:text-gray-400 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              ✓ Sin tarjeta de crédito · ✓ 14 días gratis · ✓ Cancela cuando quieras
            </motion.p>
          </div>

          {/* Right Column - Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative z-10">
              {/* Placeholder para demo o imagen */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700"
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg flex items-center justify-center overflow-hidden">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div 
                      className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.2, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Play className="h-10 w-10 text-primary-600 dark:text-primary-400 ml-1" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Ver demo interactiva</p>
                  </motion.div>
                </div>
                
                {/* Feature badges */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[
                    { emoji: '🎯', label: 'Precisión IA', color: 'primary' },
                    { emoji: '🚀', label: 'Fácil uso', color: 'secondary' },
                  ].map((badge, index) => (
                    <motion.div 
                      key={badge.label}
                      className={`bg-${badge.color}-50 dark:bg-${badge.color}-900/20 rounded-lg p-4 text-center`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="text-2xl mb-1">{badge.emoji}</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{badge.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 dark:bg-primary-800/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70"
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute -bottom-8 -left-4 w-72 h-72 bg-secondary-200 dark:bg-secondary-800/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70"
              animate={{ 
                scale: [1, 1.1, 1],
                x: [0, -15, 0],
                y: [0, 15, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
