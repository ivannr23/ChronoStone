'use client'

import Link from 'next/link'
import { Mail, MapPin, Phone, Linkedin, Twitter, Youtube } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Footer() {
  const navigation = {
    producto: [
      { name: 'Características', href: '#features' },
      { name: 'Precios', href: '#pricing' },
      { name: 'Casos de éxito', href: '#testimonials' },
      { name: 'Actualizaciones', href: '/changelog' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
    recursos: [
      { name: 'Documentación', href: '/docs' },
      { name: 'API Reference', href: '/api-reference' },
      { name: 'Blog', href: '/blog' },
      { name: 'Guías', href: '/guides' },
      { name: 'Centro de ayuda', href: '/help' },
    ],
    empresa: [
      { name: 'Sobre nosotros', href: '/about' },
      { name: 'Contacto', href: '/contact' },
      { name: 'Trabajar con nosotros', href: '/careers' },
      { name: 'Partners', href: '/partners' },
      { name: 'Prensa', href: '/press' },
    ],
    legal: [
      { name: 'Privacidad', href: '/privacy' },
      { name: 'Términos de uso', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'RGPD', href: '/gdpr' },
      { name: 'Seguridad', href: '/security' },
    ],
  }

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <img src="/images/logo_con_letras.png" alt="ChronoStone" className="h-14 w-auto" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Digitalización y gestión inteligente del patrimonio histórico.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>

            {/* Theme Toggle in Footer */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Tema:</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h3 className="text-white font-semibold mb-4">Producto</h3>
            <ul className="space-y-2">
              {navigation.producto.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-primary-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              {navigation.recursos.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-primary-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {navigation.empresa.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-primary-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-primary-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-primary-400 mr-3 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white mb-1">Email</div>
                <a href="mailto:info@chronostone.es" className="text-sm hover:text-primary-400 transition-colors">
                  info@chronostone.es
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-primary-400 mr-3 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white mb-1">Teléfono</div>
                <a href="tel:+34900123456" className="text-sm hover:text-primary-400 transition-colors">
                  +34 900 123 456
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary-400 mr-3 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white mb-1">Oficina</div>
                <p className="text-sm">
                  Madrid, España
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} ChronoStone. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">🇪🇸 Hecho en España</span>
              <span className="text-sm text-gray-400">🔒 Datos en EU</span>
              <span className="text-sm text-gray-400">✓ RGPD Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
