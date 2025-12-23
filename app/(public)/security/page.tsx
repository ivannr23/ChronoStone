'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Shield, Lock, Server, Eye, CheckCircle, AlertTriangle } from 'lucide-react'

const securityFeatures = [
  {
    icon: Lock,
    title: 'Cifrado en tránsito',
    description: 'Todas las comunicaciones están protegidas con TLS 1.3. Sus datos viajan seguros.',
  },
  {
    icon: Server,
    title: 'Cifrado en reposo',
    description: 'Los datos almacenados están cifrados con AES-256, el estándar de la industria.',
  },
  {
    icon: Shield,
    title: 'Autenticación segura',
    description: 'Soportamos 2FA, SSO empresarial y políticas de contraseñas robustas.',
  },
  {
    icon: Eye,
    title: 'Monitorización 24/7',
    description: 'Sistemas de detección de intrusiones y monitorización continua.',
  },
]

const certifications = [
  { name: 'ISO 27001', status: 'En proceso', year: '2025' },
  { name: 'SOC 2 Type II', status: 'En proceso', year: '2025' },
  { name: 'RGPD Compliant', status: 'Certificado', year: '2024' },
  { name: 'ENS (Esquema Nacional de Seguridad)', status: 'En proceso', year: '2025' },
]

const practices = [
  'Pruebas de penetración trimestrales por terceros independientes',
  'Programa de bug bounty para investigadores de seguridad',
  'Revisiones de código obligatorias para todos los cambios',
  'Backups automatizados con retención de 30 días',
  'Recuperación ante desastres con RTO < 4 horas',
  'Formación en seguridad obligatoria para empleados',
  'Gestión de vulnerabilidades con SLA de 24h para críticas',
  'Acceso basado en roles con principio de mínimo privilegio',
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full mb-4">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">Seguridad de nivel empresarial</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Seguridad
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              La seguridad de sus datos es nuestra prioridad. Implementamos las mejores prácticas 
              de la industria para proteger su patrimonio digital.
            </p>
          </div>

          {/* Security Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {securityFeatures.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <section className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Certificaciones y cumplimiento
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {certifications.map((cert) => (
                <div 
                  key={cert.name}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {cert.status === 'Certificado' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      cert.status === 'Certificado' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{cert.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cert.year}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Security Practices */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Prácticas de seguridad
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <ul className="grid md:grid-cols-2 gap-4">
                {practices.map((practice) => (
                  <li key={practice} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Infraestructura
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                ChronoStone está alojado en centros de datos de clase mundial que cumplen con 
                los más altos estándares de seguridad física y ambiental:
              </p>
              <ul>
                <li><strong>Proveedor:</strong> AWS (Amazon Web Services) / Vercel</li>
                <li><strong>Regiones:</strong> EU (Frankfurt) como región principal</li>
                <li><strong>Redundancia:</strong> Multi-AZ para alta disponibilidad</li>
                <li><strong>SLA:</strong> 99.9% de disponibilidad garantizada</li>
                <li><strong>Backups:</strong> Diarios con retención de 30 días, almacenados en región separada</li>
              </ul>
            </div>
          </section>

          {/* Report Vulnerability */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">¿Encontraste una vulnerabilidad?</h2>
            <p className="text-white/90 mb-6 max-w-2xl">
              Valoramos la comunidad de seguridad y agradecemos los reportes responsables de 
              vulnerabilidades. Si has encontrado un problema de seguridad, por favor repórtalo 
              de forma responsable.
            </p>
            <a 
              href="mailto:security@chronostone.com"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Reportar vulnerabilidad
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

