# ChronoStone - Gestión Patrimonial Inteligente

Sistema SaaS completo para la digitalización, restauración y gestión del patrimonio histórico.

## 🚀 Características

- **Modelos 3D de alta precisión** - Gestión de escaneos y modelos fotorrealistas
- **Análisis con IA** - Detección automática de deterioros y patologías
- **Realidad Aumentada** - Visualización del patrimonio restaurado
- **TimeMachine4D** - Visualización histórica del patrimonio
- **Informes automáticos** - Generación de documentación técnica
- **Colaboración en equipo** - Trabajo en tiempo real
- **Multi-tenant** - Separación lógica de datos por usuario

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: 
  - Producción: Neon (PostgreSQL)
  - Desarrollo: SQLite (local)
- **Autenticación**: NextAuth.js
- **Pagos**: Stripe
- **Email**: Resend
- **Despliegue**: Netlify

## 📦 Instalación

### Requisitos

- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/chronostone.git
cd chronostone
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.development.example .env.local
```

4. **Configurar base de datos local (desarrollo)**
```bash
npm run setup:db
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos (Neon en producción)
DATABASE_URL=postgresql://user:pass@host/db

# Autenticación (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-generado

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@chronostone.es
```

### Base de Datos Local (SQLite)

El proyecto usa SQLite para desarrollo local, lo que significa:
- No necesitas instalar ningún servidor de base de datos
- Los datos se guardan en `dev.db` en la raíz del proyecto
- La estructura es la misma que Neon (PostgreSQL)

Para reiniciar la base de datos local:
```bash
rm dev.db
npm run setup:db
```

## 🎨 Sistema de Temas

ChronoStone incluye soporte para modo claro, oscuro y sistema:

- **Claro**: Fondo blanco con texto oscuro
- **Oscuro**: Fondo gris oscuro con texto claro
- **Sistema**: Sigue la preferencia del sistema operativo

El toggle de tema está disponible en:
- Navbar (landing page)
- Footer
- Header del dashboard

## 📁 Estructura del Proyecto

```
chronostone/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Páginas de autenticación
│   ├── api/               # API routes
│   ├── dashboard/         # Área privada
│   └── page.tsx           # Landing page
├── components/
│   ├── landing/           # Componentes de landing
│   ├── providers/         # Context providers
│   └── ui/                # Componentes reutilizables
├── database/
│   └── schema-neon.sql    # Schema SQL
├── hooks/                 # React hooks
├── lib/                   # Utilidades y configuración
└── scripts/               # Scripts de setup
```

## 🚢 Despliegue

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en Netlify
3. Crea una base de datos en Neon y conecta con Netlify
4. Despliega automáticamente con cada push

Ver `DEPLOYMENT-NETLIFY.md` para instrucciones detalladas.

## 📊 Planes y Precios

| Plan | Precio | Proyectos | Modelos | Almacenamiento |
|------|--------|-----------|---------|----------------|
| Starter | 49€/mes | 5 | 10 | 10GB |
| Professional | 99€/mes | Ilimitados | Ilimitados | 50GB |
| Enterprise | 199€/mes | Ilimitados | Ilimitados | 100GB |

## 🔐 Seguridad

- Autenticación segura con NextAuth.js
- Encriptación de contraseñas con bcrypt
- Separación de datos por tenant (Row Level Security)
- Cumplimiento RGPD
- Datos alojados en EU

## 📝 Licencia

Copyright © 2024 ChronoStone. Todos los derechos reservados.

## 📧 Contacto

- Email: info@chronostone.es
- Web: https://chronostone.es
