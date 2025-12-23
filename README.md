<div align="center">
  <img src="./public/images/chronostone_banner.png" alt="ChronoStone Banner" width="100%">

  # 🏛️ ChronoStone SaaS
  ### **Preservación Digital y Gestión Inteligente del Patrimonio**
  
  *Una solución integral para la digitalización, monitorización y gestión de proyectos de restauración arquitectónica.*

  [Explorar Demo](#) · [Reportar Bug](https://github.com/ivannr23/ChronoStone/issues) · [Solicitar Feature](https://github.com/ivannr23/ChronoStone/issues)

  <br />

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Stripe](https://img.shields.io/badge/Stripe-606770?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

</div>

---

## 📖 El Proyecto

**ChronoStone** nace de la necesidad de modernizar la gestión del patrimonio histórico. Mientras que la construcción moderna tiene BI (Building Intelligence), la restauración a menudo se queda atrás. Esta plataforma cierra esa brecha.

### Tres Pilares Fundamentales:

| 🏗️ Gestión de Activos | 📐 Visualización 3D | 💰 Financiación |
| :--- | :--- | :--- |
| **Control de Ciclo de Vida**: Gestión desde la inspección inicial hasta la entrega de obra. | **Integración Fotogramétrica**: Visor integrado para modelos 3D de alta densidad. | **Monitorización de Subvenciones**: Registro automático de fondos y plazos. |
| **Dual-DB Engine**: SQLite para desarrollo ágil y PostgreSQL para producción enterprise. | **Gestión de Fases**: Vinculación de modelos 3D a fases específicas del proyecto. | **Stripe Billing**: Sistema de suscripción integrado para diferentes niveles de uso. |

---

## 🚀 Innovaciones Implementadas

### 🔄 Sistema de Suscripciones Inteligente
Hemos implementado un control de acceso basado en niveles (Free Trial, Starter, Professional, Enterprise) con:
- **Trial Expiration Logic**: Detección automática de fin de periodo de prueba.
- **Usage Enforcement**: Bloqueo dinámico de acciones (creación de proyectos, carga de modelos) basado en límites del plan.
- **Enterprise Mode**: Soporte para cuotas ilimitadas (`∞`).

### 🔑 Developer Experience (DX)
- **Superuser One-Click Login**: Acceso instantáneo a todas las funciones premium en entorno de desarrollo.
- **Migration Engine**: Sistema dual de migraciones SQL compatible con diversos entornos.
- **Premium Animations**: Sistema de carga y transiciones estandarizado con Framer Motion para una experiencia "App-like".

---

## 📦 Estructura del Proyecto

```text
ChronoStone/
├── app/                # Next.js App Router
│   ├── api/            # Endpoints (Auth, Projects, Subscription, Usage)
│   ├── dashboard/      # Panel de control protegido
│   └── (public)/       # Landing page y páginas estáticas
├── components/         # Biblioteca de componentes UI
│   ├── ui/             # Componentes base (Animations, Loading, Badges)
│   └── dashboard/      # Widgets especializados (UsageWidget)
├── hooks/              # Lógica de negocio reutilizable (useSubscription, useUsage)
├── lib/                # Utilidades de DB, Auth y Email
├── database/           # Esquemas y migraciones SQL
├── public/             # Activos estáticos
└── scripts/            # Herramientas de automatización y setup
```

---

## 🛠️ Guía de Instalación Rápida

Para clonar y poner en marcha el proyecto en menos de 2 minutos:

```bash
# 1. Clonar y entrar
git clone https://github.com/ivannr23/ChronoStone.git
cd ChronoStone

# 2. Instalar el ecosistema
npm install

# 3. Preparar la Base de Datos Local (SQLite)
npm run db:setup     # Crea la base de datos local
npm run db:migrate   # Ejecuta las últimas migraciones
npm run db:superadmin # Crea el usuario admin@chronostone.dev (pass: superadmin123)

# 4. Iniciar desarrollo
npm run dev
```

> **Pro-Tip**: Una vez dentro de `/login`, busca el botón de **"Entrar como Superusuario"** para desbloquear todas las funciones al instante.

---

## 🗺️ Roadmap de Futuro

- [ ] **IA de Detección**: Implementación de reconocimiento de patologías (fisuras, humedad) sobre modelos 3D.
- [ ] **Exportación BIM**: Conversión de datos de restauración a formatos estándar de arquitectura.
- [ ] **App Móvil de Campo**: Offline-first para tomas de datos en monumentos sin conexión.
- [ ] **API Pública**: Para integración con sistemas de Ministerios de Cultura.

---

## 🤝 Contribuciones

Si quieres contribuir a la preservación del patrimonio digital, ¡eres bienvenido!
1. Haz un Fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`).
3. Haz un commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Sube la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

---

## 👨‍💻 Autor

**ivannr23**
- [GitHub](https://github.com/ivannr23)
- [LinkedIn](https://www.linkedin.com/in/ivannavarroramos/)

---

<div align="center">
  <img src="https://vignette.wikia.nocookie.net/line/images/b/b3/Divider.png/revision/latest?cb=20150917024446" width="300px">
  <br />
  <sub>Copyright © 2024 ChronoStone - Todos los derechos reservados.</sub>
</div>
