'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Box, 
  Brain, 
  Camera, 
  Clock, 
  Cloud, 
  FileText, 
  Lock, 
  Users, 
  Zap,
  Eye,
  Download,
  Smartphone
} from 'lucide-react'

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const features = [
    {
      icon: Box,
      title: 'Modelos 3D de alta precisión',
      description: 'Crea y gestiona modelos 3D fotorrealistas de monumentos y obras patrimoniales con tecnología de escaneo avanzada.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Análisis con IA',
      description: 'Inteligencia artificial que detecta deterioros, analiza patologías y sugiere intervenciones de restauración.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Smartphone,
      title: 'Realidad Aumentada',
      description: 'Visualiza el patrimonio restaurado superpuesto en la realidad mediante AR en dispositivos móviles.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'TimeMachine4D',
      description: 'Viaja en el tiempo y visualiza cómo era el patrimonio en diferentes épocas históricas.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FileText,
      title: 'Informes automáticos',
      description: 'Genera documentación técnica, informes de estado y presupuestos de forma automática.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Users,
      title: 'Colaboración en equipo',
      description: 'Trabaja con tu equipo en tiempo real, asigna tareas y controla el progreso de proyectos.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Cloud,
      title: 'Almacenamiento en la nube',
      description: 'Todos tus datos seguros y accesibles desde cualquier lugar con copias de seguridad automáticas.',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Eye,
      title: 'Visualización inmersiva',
      description: 'Explora tus proyectos con viewers 3D interactivos y recorridos virtuales inmersivos.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Download,
      title: 'Exportación múltiple',
      description: 'Exporta en formatos estándar (PDF, CAD, BIM) compatibles con herramientas profesionales.',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Lock,
      title: 'Seguridad certificada',
      description: 'Cumplimiento RGPD, cifrado end-to-end y control de acceso granular por roles.',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Procesamiento rápido',
      description: 'Infraestructura escalable que procesa grandes volúmenes de datos en minutos.',
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      icon: Camera,
      title: 'Integración fotogramétrica',
      description: 'Importa directamente desde drones y cámaras fotogramétricas para crear modelos 3D.',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
              🚀 Funcionalidades
            </span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Todo lo que necesitas para{' '}
            <span className="gradient-text">gestionar patrimonio</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Una plataforma completa con todas las herramientas profesionales 
            que necesitas para digitalizar, analizar y restaurar el patrimonio histórico.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300"
            >
              <motion.div 
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Quieres ver todas las funcionalidades en acción?
          </p>
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Solicitar demo personalizada
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
