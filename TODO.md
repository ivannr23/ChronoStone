# ChronoStone - Lista de Tareas Completa

Este documento contiene todas las tareas necesarias para completar el SaaS según el prompt inicial.

---

## 1. LANDING PAGE (Pública)

### 1.1 Páginas
- [x] Home con hero section y valor proposición
- [x] Sección de características (Features)
- [x] Tabla de precios interactiva
- [ ] Página de Blog
- [ ] Página de Contacto con formulario
- [ ] Casos de éxito / Testimoniales reales
- [x] Footer con enlaces legales

### 1.2 Componentes Landing
- [x] Navbar con navegación
- [x] PricingTable interactivo
- [x] FeatureGrid visual
- [ ] Formulario de captación de leads
- [ ] Testimonials con casos reales
- [x] CTA (Call to Action) sections

---

## 2. AUTENTICACIÓN Y USUARIOS

### 2.1 Sistema de Auth
- [x] Login con email/contraseña (NextAuth)
- [x] Registro de usuarios
- [ ] Magic link para login sin contraseña
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [x] Protección de rutas (middleware)

### 2.2 Gestión de Usuarios
- [x] Perfil de usuario básico
- [ ] Editar perfil (nombre, empresa, avatar)
- [ ] Cambiar contraseña
- [ ] Eliminar cuenta
- [ ] Roles (user, admin)

---

## 3. SISTEMA DE SUSCRIPCIONES Y PAGOS

### 3.1 Planes y Límites
- [x] Estructura de planes (free_trial, starter, professional, enterprise)
- [x] Tabla de suscripciones en BD
- [x] Tabla de límites de uso en BD
- [ ] Verificación de límites en tiempo real (bloqueo real)
- [ ] Notificación cuando cerca del límite

### 3.2 Integración Stripe
- [x] Configuración básica de Stripe
- [x] Checkout session (parcial)
- [ ] Webhooks completos (payment_intent, subscription events)
- [ ] Portal de cliente Stripe (gestionar tarjetas, facturas)
- [ ] Upgrades automáticos
- [ ] Downgrades automáticos
- [ ] Cancelación de suscripción
- [ ] Gestión de pagos fallidos
- [ ] Facturas con IVA español

### 3.3 Prueba Gratuita
- [x] 14 días automáticos al registrarse
- [ ] Recordatorios en días 7, 10, 13
- [ ] Conversión automática o suspensión al expirar
- [ ] Página de "trial expirado"

---

## 4. PÁGINA DE BILLING / FACTURACIÓN

- [x] Página básica de billing
- [ ] Ver plan actual y uso
- [ ] Botón para upgrade/downgrade funcional
- [ ] Historial de facturas
- [ ] Descargar facturas PDF
- [ ] Método de pago actual
- [ ] Cambiar método de pago

---

## 5. DASHBOARD PRINCIPAL

- [x] Layout con sidebar
- [x] Página principal con resumen
- [ ] Widgets de estadísticas reales
- [ ] Actividad reciente
- [ ] Alertas y notificaciones
- [ ] Accesos rápidos personalizados

---

## 6. GESTIÓN DE PROYECTOS

### 6.1 CRUD Básico
- [x] Crear proyecto
- [x] Listar proyectos
- [x] Ver detalle de proyecto
- [x] Eliminar proyecto
- [ ] Editar proyecto
- [ ] Archivar proyecto
- [ ] Duplicar proyecto

### 6.2 Información del Proyecto
- [x] Nombre, descripción, ubicación
- [x] Fecha de inicio
- [ ] Fecha de fin estimada
- [ ] Estado del proyecto (planificación, en curso, pausado, completado)
- [ ] Tipo de patrimonio (iglesia, castillo, monumento, etc.)
- [ ] Nivel de protección (BIC, BRL, etc.)
- [ ] Presupuesto total
- [ ] Cliente/Propietario

### 6.3 Fases y Cronograma
- [ ] Definir fases del proyecto
- [ ] Fechas por fase
- [ ] Progreso por fase (%)
- [ ] Vista de timeline/Gantt
- [ ] Hitos importantes

### 6.4 Documentación
- [ ] Subir documentos (PDF, Word, etc.)
- [ ] Categorizar documentos (memorias, planos, informes)
- [ ] Versiones de documentos
- [ ] Visor de documentos integrado

### 6.5 Galería de Imágenes
- [ ] Subir fotos del proyecto
- [ ] Organizar por fechas/fases
- [ ] Comparativa antes/después
- [ ] Etiquetas y descripciones

### 6.6 Presupuestos y Costes
- [ ] Presupuesto inicial
- [ ] Partidas presupuestarias
- [ ] Gastos reales
- [ ] Comparativa presupuesto vs real
- [ ] Alertas de desviación

### 6.7 Equipo y Colaboradores
- [ ] Asignar usuarios al proyecto
- [ ] Roles por proyecto (coordinador, técnico, etc.)
- [ ] Permisos por rol
- [ ] Invitar colaboradores externos

### 6.8 Notas y Comentarios
- [ ] Sistema de notas/comentarios
- [ ] Menciones a usuarios
- [ ] Historial de actividad

---

## 7. MODELOS 3D

### 7.1 Gestión
- [x] Subir modelos (STL, OBJ, GLB, GLTF, ZIP)
- [x] Listar modelos del proyecto
- [x] Imagen de previsualización
- [ ] Eliminar modelos
- [ ] Renombrar modelos
- [ ] Metadatos (fecha captura, equipo usado, etc.)

### 7.2 Visor 3D
- [x] Visor Three.js funcional
- [x] Controles de navegación
- [x] Sensibilidad ajustable
- [x] Soporte ZIP con texturas
- [ ] Anotaciones en el modelo
- [ ] Mediciones
- [ ] Secciones/cortes
- [ ] Comparativa de modelos (antes/después)

### 7.3 Funcionalidades Premium
- [ ] Análisis IA de deterioros (detectar grietas, humedades)
- [ ] TimeMachine4D (evolución histórica)
- [ ] Realidad Aumentada (ver modelo in-situ)

---

## 8. MÓDULO DE SUBVENCIONES

### 8.1 Base de Datos de Subvenciones
- [x] Catálogo de subvenciones españolas
- [x] Ministerio de Cultura
- [x] Comunidades Autónomas (17)
- [x] Fondos Europeos (Next Generation, FEDER)
- [x] Fundaciones privadas
- [x] Diputaciones y Ayuntamientos

### 8.2 Buscador de Subvenciones
- [x] Filtrar por CCAA
- [x] Filtrar por tipo de patrimonio
- [x] Filtrar por cuantía
- [x] Filtrar por fecha límite
- [x] Ordenar por relevancia

### 8.3 Alertas y Notificaciones
- [x] Suscribirse a categorías
- [x] Email cuando hay nueva convocatoria
- [x] Recordatorio de plazos
- [x] Notificación en dashboard

### 8.4 Gestor de Solicitudes
- [x] Crear solicitud vinculada a proyecto
- [x] Estados (borrador, enviada, en revisión, aprobada, denegada)
- [x] Documentación requerida (checklist)
- [x] Fecha de envío
- [x] Resolución y cuantía concedida

### 8.5 Plantillas y Ayuda
- [ ] Plantillas de memoria técnica
- [ ] Guías paso a paso
- [ ] Documentos modelo
- [ ] FAQ por convocatoria

### 8.6 Calendario
- [x] Vista de calendario con plazos
- [ ] Sincronización con Google Calendar
- [ ] Exportar a iCal

---

## 9. INFORMES Y EXPORTACIÓN

### 9.1 Generación de Informes
- [ ] Informe de estado del proyecto
- [ ] Informe técnico para subvenciones
- [ ] Informe de avance por fases
- [ ] Informe económico

### 9.2 Exportación
- [ ] Exportar a PDF
- [ ] Exportar a Word
- [ ] Plantillas personalizables
- [ ] Logo de empresa en informes

---

## 10. PANEL DE ADMINISTRACIÓN

### 10.1 Dashboard Admin
- [ ] Usuarios totales
- [ ] Suscripciones activas
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Churn rate
- [ ] Gráficos de crecimiento

### 10.2 Gestión de Usuarios
- [ ] Listar todos los usuarios
- [ ] Ver detalle de usuario
- [ ] Cambiar plan manualmente
- [ ] Suspender/activar usuario
- [ ] Impersonar usuario (login as)

### 10.3 Gestión de Suscripciones
- [ ] Ver todas las suscripciones
- [ ] Extender trial manualmente
- [ ] Aplicar descuentos
- [ ] Ver historial de pagos

### 10.4 Contenido
- [ ] Gestionar subvenciones (CRUD)
- [ ] Gestionar blog posts
- [ ] Gestionar FAQs

---

## 11. EMAILS AUTOMATIZADOS (Resend)

### 11.1 Transaccionales
- [ ] Email de bienvenida
- [ ] Confirmación de registro
- [ ] Recuperación de contraseña
- [ ] Confirmación de pago
- [ ] Factura adjunta

### 11.2 Ciclo de Vida
- [ ] Onboarding (día 1, 3, 7)
- [ ] Recordatorio trial (día 7, 10, 13)
- [ ] Trial expirado
- [ ] Renovación próxima
- [ ] Pago fallido

### 11.3 Notificaciones
- [ ] Nueva subvención disponible
- [ ] Plazo de subvención próximo
- [ ] Actividad en proyecto compartido

### 11.4 Marketing
- [ ] Newsletter mensual
- [ ] Encuestas NPS
- [ ] Promociones especiales

---

## 12. ANALÍTICAS Y MÉTRICAS

### 12.1 Conversión
- [ ] Visitas a landing
- [ ] Registros
- [ ] Trials iniciados
- [ ] Conversión a pago
- [ ] Fuentes de tráfico

### 12.2 Uso de la App
- [ ] Proyectos creados
- [ ] Modelos subidos
- [ ] Funciones más usadas
- [ ] Tiempo en la app

### 12.3 Negocio
- [ ] MRR tracking
- [ ] LTV (Lifetime Value)
- [ ] CAC (Cost per Acquisition)
- [ ] Churn mensual

---

## 13. CONFIGURACIÓN Y AJUSTES

### 13.1 Configuración de Usuario
- [ ] Preferencias de notificaciones
- [ ] Idioma
- [ ] Zona horaria
- [x] Tema claro/oscuro

### 13.2 Configuración de Empresa
- [ ] Datos fiscales
- [ ] Logo de empresa
- [ ] Información de contacto

---

## 14. ASPECTOS TÉCNICOS

### 14.1 Base de Datos
- [x] Esquema en Neon
- [x] Tablas principales
- [ ] Índices optimizados
- [ ] Backups automáticos

### 14.2 Seguridad
- [x] Autenticación segura
- [x] Row Level Security (RLS)
- [ ] Rate limiting
- [ ] Logs de auditoría
- [ ] GDPR compliance

### 14.3 Performance
- [ ] Caché de consultas
- [ ] Optimización de imágenes
- [ ] Lazy loading
- [ ] CDN para assets

### 14.4 Despliegue
- [x] Configuración Netlify/Vercel
- [x] Variables de entorno documentadas
- [ ] CI/CD pipeline
- [ ] Staging environment

---

## RESUMEN DE PROGRESO

| Sección | Completado | Total | % |
|---------|------------|-------|---|
| 1. Landing Page | 6 | 10 | 60% |
| 2. Autenticación | 5 | 10 | 50% |
| 3. Suscripciones/Pagos | 5 | 18 | 28% |
| 4. Billing | 1 | 7 | 14% |
| 5. Dashboard | 2 | 6 | 33% |
| 6. Proyectos | 6 | 35 | 17% |
| 7. Modelos 3D | 8 | 17 | 47% |
| 8. Subvenciones | 21 | 25 | 84% |
| 9. Informes | 0 | 8 | 0% |
| 10. Admin Panel | 0 | 15 | 0% |
| 11. Emails | 0 | 18 | 0% |
| 12. Analíticas | 0 | 12 | 0% |
| 13. Configuración | 1 | 8 | 13% |
| 14. Técnico | 5 | 12 | 42% |
| **TOTAL** | **60** | **201** | **30%** |

---

## PRÓXIMOS PASOS RECOMENDADOS

### Prioridad ALTA (Core del negocio)
1. [ ] Módulo de Subvenciones completo
2. [ ] Ampliar funcionalidades de Proyectos
3. [ ] Panel de Administración
4. [ ] Informes y exportación PDF

### Prioridad MEDIA (Experiencia de usuario)
5. [ ] Emails automatizados
6. [ ] Billing completo con Stripe
7. [ ] Mejoras en Dashboard

### Prioridad BAJA (Nice to have)
8. [ ] Analíticas avanzadas
9. [ ] Funcionalidades premium (IA, AR)
10. [ ] Blog y contenido

---

*Última actualización: 2 de diciembre de 2024*

