<div align="center">
  <img src="./public/images/chronostone_banner.png" alt="ChronoStone Banner" width="100%">

  # 🏛️ ChronoStone SaaS Engine
  ### **The Future of Heritage Conservation & Management**
  
  *An advanced ecosystem for digital preservation, 3D photogrammetry visualization, and stone-heritage restoration management.*

  <br />

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 🚀 Visión General
ChronoStone no es solo un gestor de proyectos; es un **Smart OS para Monumentos**. Permite a historiadores, arquitectos y conservadores centralizar toda la vida útil de una pieza de patrimonio, desde su escaneo 3D inicial hasta su última fase de restauración.

---

## 🛠️ Arquitectura del Sistema

Hemos diseñado una arquitectura modular que separa el estado de la suscripción de la lógica de negocio, permitiendo una escalabilidad horizontal.

### Flujo de Datos y Operaciones
```mermaid
graph TD
    subgraph Client_Experience [Frontend - Next.js 14 & Framer Motion]
        A[Public Landing] --> B{Auth Guard}
        B -->|Authorized| C[Dashboard Ecosystem]
        C --> D[Project Manager]
        C --> E[3D Photogrammetry Viewer]
        C --> F[Usage & Billing Portal]
    end

    subgraph Intelligence_Layer [Business Logic & Hooks]
        G[useSubscription - Real-time trial tracking]
        H[useFeatureAccess - Permission validation]
        I[useUsage - Metric aggregation]
    end

    subgraph Data_Fortress [Database & External Services]
        J[(Dual-Engine DB: SQLite/Postgres)]
        K[Stripe API - Financial Hub]
        L[Resend - Transactional Email]
    end

    C <--> G
    D <--> H
    H <--> J
    F <--> K
    D <--> I
    I <--> J
```

---

## 💎 Características de Élite

### 🏗️ Gestión de Restauración Avanzada
*   **Pipeline de Fases**: Control detallado de cronograma para restauraciones complejas.
*   **Document Management**: Gestor documental especializado en informes técnicos y analíticas de piedra.
*   **Colaboración Multi-perfil**: Roles específicos para conservadores, inversores y auditores.

### 🛡️ Motor de Acceso y Límites (Premium)
Hemos programado un sistema de **"Feature Gating"** proactivo:
*   **Dynamic Usage Gauges**: Indicadores visuales en tiempo real del consumo de recursos.
*   **Grace Period Handling**: Lógica inteligente para periodos de prueba expirados.
*   **Unlimited Scalability**: Soporte nativo para planes Enterprise con recursos infinitos (`∞`).

### 🧬 Base de Datos Dual (Agile Development)
Capacidad única de alternar entre motores sin cambiar una sola línea de código de negocio:
*   **SQLite-Better**: Para desarrollo ultrarrápido y testing local.
*   **Neon PostgreSQL**: Conectividad Serverless para producción de alta disponibilidad.
*   **SQL Migration Engine**: Scripts automatizados que garantizan la paridad de esquemas.

---

## 📊 Modelo de Datos (Core Entities)

El esquema de la base de datos está optimizado para la trazabilidad histórica:

```mermaid
erDiagram
    USERS ||--o{ SUBSCRIPTIONS : has
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ PHASES : contains
    PROJECTS ||--o{ DOCUMENTS : includes
    PROJECTS ||--o{ USAGE_LOGS : generates
    SUBSCRIPTIONS ||--|| PLANS : defines
```

---

## 🔧 Guía de Despliegue Avanzado

```bash
# Instalación del entorno
npm install

# Configuración de base de datos dual
# Solo necesitas correr esto para tener el sistema listo
npm run db:setup
npm run db:migrate

# Creación de entorno de pruebas (Superadmin)
npm run db:superadmin

# Lanzamiento con Hot-Reload
npm run dev
```

---

## 🛣️ Roadmap de Ingeniería

### Fase 1: Cimentación (Completada) ✅
*   Arquitectura Next.js App Router.
*   Sistema de Auth con NextAuth.
*   Gestión de suscripciones y límites.

### Fase 2: Visualización y 3D (En Proceso) 🚧
*   Implementación de **Three.js** para carga de modelos `.obj` y `.glb`.
*   Anotaciones espaciales sobre modelos históricos.

### Fase 3: Inteligencia Artificial (Q3 2025) 🔮
*   Detección de patologías mediante Computer Vision.
*   Predicción de costes de restauración basada en histórico.

---

## 👨‍💻 Acerca del Autor

**ivannr23** - Lead Developer
> *"Convertir la herencia física en un activo digital eterno."*

[GitHub](https://github.com/ivannr23) | [LinkedIn](https://www.linkedin.com/in/ivannavarroramos/) | [Portfolio](https://chronostone.dev)

---

<div align="center">
  <sub>Built with high-performance standards in Next.js 14</sub>
  <br />
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%">
</div>
