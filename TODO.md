
# Plan de Desarrollo - QMS+ (`TODO.md`)

Este documento describe el plan de desarrollo paso a paso para la aplicación web "QMS+" (Sistema de Gestión de Calidad Multi-industria). Se estructura en fases lógicas, detallando las tareas clave para cada componente del sistema.

## Fase 0: Preparación y Configuración Inicial

*   [ ] **0.1. Definición y Refinamiento:**
    *   [ ] 0.1.1. Revisar y validar el `PRD.md` con stakeholders clave.
    *   [ ] 0.1.2. Finalizar cualquier requisito funcional o no funcional pendiente.
*   [ ] **0.2. Configuración de Entorno:**
    *   [x] 0.2.1. Crear y configurar el proyecto en **Firebase Console**.
    *   [x] 0.2.2. Configurar el control de versiones (ej. GitHub/GitLab repository).
    *   [ ] 0.2.3. Configurar herramientas de gestión de proyectos (ej. Jira, Trello, Asana).
    *   [x] 0.2.4. Establecer estándares de codificación y revisiones de código.
*   [ ] **0.3. Arquitectura Base Multi-tenant:** (COMPLETADO PARCIALMENTE)
    *   [x] 0.3.1. Implementar estructura de tres niveles: Platform → Organization → Company.
    *   [x] 0.3.2. Crear contexto de navegación multi-tenant (TenantContext).
    *   [x] 0.3.3. Implementar roles jerárquicos (super_admin, chain_admin, company_admin).
    *   [x] 0.3.4. Crear componentes de gestión (OrganizationManagement, HotelManagement, SubscriptionManagement).
*   [ ] **0.4. Generalización del Sistema para Múltiples Industrias:**
    *   [ ] 0.4.1. Renombrar entidades de "Hotel" a "Company/Business" en tipos compartidos.
    *   [ ] 0.4.2. Actualizar estructura de Firestore de `/hotels` a `/companies`.
    *   [ ] 0.4.3. Crear sistema de departamentos/áreas configurables por industria.
    *   [ ] 0.4.4. Implementar tipos de industria (manufactura, servicios, retail, tecnología, salud, educación, etc.).
    *   [ ] 0.4.5. Reemplazar clasificaciones específicas de hotel por categorías genéricas.
    *   [ ] 0.4.6. Adaptar métricas y KPIs para ser agnósticos a la industria.
    *   [ ] 0.4.7. Actualizar UI/UX para usar terminología genérica.

## Fase 1: Diseño y Experiencia de Usuario (UX/UI)

*   [ ] **1.1. Diseño Visual (Basado en Material Design 3):**
    *   [ ] 1.1.1. Finalizar la definición de la paleta de colores tonal principal y sus variantes.
    *   [ ] 1.1.2. Seleccionar la tipografía principal y definir su escala de tipos.
    *   [ ] 1.1.3. Definir la geometría de las formas para componentes clave.
    *   [ ] 1.1.4. Seleccionar el estilo de iconografía principal de Material Symbols.
    *   [ ] 1.1.5. Desarrollar la guía de espaciado y sistema de cuadrícula.
*   [ ] **1.2. Diseño de Interfaz (Wireframes & Mockups):**
    *   [ ] 1.2.1. Crear wireframes de baja fidelidad para el flujo de usuario principal.
    *   [ ] 1.2.2. Diseñar mockups de alta fidelidad para el Dashboard Central.
    *   [ ] 1.2.3. Diseñar mockups para la Gestión de Documentación (visualizador, editor, historial).
    *   [ ] 1.2.4. Diseñar mockups para el módulo de No Conformidades (formulario de registro, seguimiento).
    *   [ ] 1.2.5. Diseñar mockups para el Constructor de Formularios Dinámicos.
    *   [ ] 1.2.6. Diseñar mockups para el módulo de Gamificación (perfil de puntos, galería de insignias, leaderboards).
    *   [ ] 1.2.7. Diseñar mockups para el proceso de autenticación y gestión de roles.
    *   [ ] 1.2.8. Diseñar mockups para los principales reportes y visualizaciones.
*   [ ] **1.3. Prototipado y Pruebas de Usabilidad:**
    *   [ ] 1.3.1. Crear un prototipo interactivo de los flujos de usuario clave.
    *   [ ] 1.3.2. Realizar pruebas de usabilidad con usuarios objetivo (personal de hotel) para obtener retroalimentación temprana.
    *   [ ] 1.3.3. Iterar sobre el diseño basándose en el feedback.

## Fase 2: Plataforma Multi-tenant y Gestión de Suscriptores

*   [ ] **2.1. Sistema de Suscripciones:**
    *   [ ] 2.1.1. Definir planes de suscripción (Básico, Profesional, Enterprise).
    *   [ ] 2.1.2. Crear modelo de datos para suscripciones en Firestore.
    *   [ ] 2.1.3. Implementar límites por plan (usuarios, almacenamiento, funcionalidades).
    *   [ ] 2.1.4. Desarrollar sistema de períodos de prueba (trial).
*   [ ] **2.2. Integración de Pagos:**
    *   [ ] 2.2.1. Integrar Stripe/PayPal para procesamiento de pagos.
    *   [ ] 2.2.2. Implementar webhooks para eventos de pago.
    *   [ ] 2.2.3. Crear Cloud Functions para gestión de facturación.
    *   [ ] 2.2.4. Desarrollar sistema de notificaciones de pago.
*   [ ] **2.3. Onboarding de Nuevos Tenants:**
    *   [ ] 2.3.1. Crear flujo de registro para nuevas empresas.
    *   [ ] 2.3.2. Implementar wizard de configuración inicial.
    *   [ ] 2.3.3. Desarrollar plantillas de procesos por industria.
    *   [ ] 2.3.4. Sistema de migración de datos desde otras plataformas.
*   [ ] **2.4. Panel de Administración de Plataforma:**
    *   [ ] 2.4.1. Dashboard para super_admin con métricas globales.
    *   [ ] 2.4.2. Gestión de organizations y companies.
    *   [ ] 2.4.3. Monitoreo de uso y límites por tenant.
    *   [ ] 2.4.4. Sistema de soporte y tickets integrado.
*   [ ] **2.5. Analytics de Plataforma:**
    *   [ ] 2.5.1. Métricas de adopción por industria.
    *   [ ] 2.5.2. Análisis de retención y churn.
    *   [ ] 2.5.3. Reportes de ingresos y proyecciones.
    *   [ ] 2.5.4. Dashboard de salud de la plataforma.

## Fase 3: Desarrollo del Backend (Firebase Cloud Functions & Firestore)

*   [ ] **3.1. Configuración de Firebase Core:**
    *   [ ] 3.1.1. Configurar **Firebase Authentication** (métodos de inicio de sesión).
    *   [ ] 3.1.2. Definir y configurar los **Firestore Security Rules** para cada colección.
    *   [ ] 3.1.3. Establecer la estructura de datos inicial en **Cloud Firestore**.
*   [ ] **3.2. Desarrollo del Servicio de Autenticación y Autorización:**
    *   [ ] 3.2.1. Implementar funciones para registro, login, logout.
    *   [ ] 3.2.2. Implementar funciones para la gestión de usuarios (CRUD para Super Admin).
    *   [ ] 3.2.3. Implementar lógica para asignar **Custom Claims** a los usuarios para roles (Admin, Gerente de Calidad, Departamental, Colaborador).
    *   [ ] 3.2.4. Asegurar todas las **Cloud Functions** con control de acceso basado en roles.
*   [ ] **3.3. Desarrollo del Servicio de Documentación:**
    *   [ ] 3.3.1. Cloud Functions para la creación, lectura, actualización y eliminación de documentos.
    *   [ ] 3.3.2. Implementar control de versiones y historial de cambios.
    *   [ ] 3.3.3. Cloud Functions para flujos de aprobación de documentos.
    *   [ ] 3.3.4. Integrar con **Cloud Storage for Firebase** para almacenamiento de archivos (PDFs, etc.).
*   [ ] **3.4. Desarrollo del Servicio de No Conformidades (NC/CAPA):**
    *   [ ] 3.4.1. Cloud Functions para el registro, asignación, seguimiento y cierre de NCs.
    *   [ ] 3.4.2. Lógica para análisis de causa raíz y vinculación de acciones correctivas/preventivas.
    *   [ ] 3.4.3. Disparar **Cloud Functions** por eventos de Firestore para notificaciones de NC (ej. nueva NC, cambio de estado).
*   [ ] **3.5. Desarrollo del Servicio de Gamificación:**
    *   [ ] 3.5.1. Cloud Functions para el cálculo y asignación de puntos basados en eventos (ej. cierre de NC, finalización de capacitación).
    *   [ ] 3.5.2. Cloud Functions para la lógica de otorgamiento de insignias.
    *   [ ] 3.5.3. Funciones para generar tablas de clasificación (leaderboards).
    *   [ ] 3.5.4. Firestore para almacenar los datos de puntos, insignias y logros de los usuarios.
*   [ ] **3.6. Desarrollo de Otros Microservicios (Cloud Functions):**
    *   [ ] 3.6.1. **Servicio de Procesos:** Definición y mapeo de procesos, vinculación a POEs.
    *   [ ] 3.6.2. **Servicio de Auditorías:** Planificación, registro de hallazgos y seguimiento de auditorías.
    *   [ ] 3.6.3. **Servicio de Gestión de Riesgos:** Identificación, análisis y seguimiento de riesgos.
    *   [ ] 3.6.4. **Servicio de Capacitación:** Registro de perfiles, cursos y seguimiento de formación.
    *   [ ] 3.6.5. **Servicio de Proveedores:** Gestión de evaluaciones y seguimiento.
    *   [ ] 3.6.6. **Servicio de Satisfacción del Cliente:** Ingesta y almacenamiento de feedback.
    *   [ ] 3.6.7. **Servicio de Formularios Dinámicos:** Almacenamiento de definiciones de formularios y datos de entradas.
    *   [ ] 3.6.8. **Servicio de Notificaciones:** Centralizar el envío de emails (ej. con SendGrid/Mailgun desde funciones), notificaciones in-app.
    *   [ ] 3.6.9. **Servicio de Reportes y Analíticas:** Funciones para agregar y pre-procesar datos para reportes.
*   [ ] **3.7. Integración de Inteligencia Artificial (QMS-AI Assistant):**
    *   [ ] 3.7.1. Cloud Functions para invocar APIs de **Google Cloud Natural Language API** (análisis de sentimiento).
    *   [ ] 3.7.2. Cloud Functions para interactuar con **Google Cloud AI Platform / Vertex AI** para modelos de generación de texto (si se despliegan modelos personalizados).
    *   [ ] 3.7.3. Implementar lógica de AI para sugerencias de contenido y verificación de cumplimiento "lite".
*   [ ] **3.8. Desarrollo de Integraciones Externas (APIs):**
    *   [ ] 3.8.1. Cloud Functions para consumir APIs de PMS (ej. Opera, Cloudbeds).
    *   [ ] 3.8.2. Cloud Functions para consumir APIs de CRM (ej. Salesforce, HubSpot).
    *   [ ] 3.8.3. Cloud Functions para consumir APIs de plataformas de opinión (ej. Tripadvisor, Google Reviews).
    *   [ ] 3.8.4. Manejo de mapeo de datos y errores en las integraciones.

## Fase 4: Desarrollo del Frontend (SPA)

*   [ ] **4.1. Configuración del Proyecto Frontend:**
    *   [ ] 4.1.1. Inicializar el proyecto con el framework SPA elegido (React/Angular/Vue.js).
    *   [ ] 4.1.2. Integrar la biblioteca de componentes **Material Design 3** (ej. Material UI para React).
    *   [ ] 4.1.3. Configurar **Firebase SDK** para interactuar con Authentication, Firestore y Cloud Functions.
*   [ ] **4.2. Implementación de Diseño UI/UX:**
    *   [ ] 4.2.1. Construir el layout principal (App Bar, Navigation Rail/Drawer).
    *   [ ] 4.2.2. Desarrollar componentes reutilizables (botones, campos de entrada, tarjetas) siguiendo la guía de estilos.
    *   [ ] 4.2.3. Implementar los temas claro y oscuro.
*   [ ] **4.3. Desarrollo de Módulos Frontend:**
    *   [ ] 4.3.1. **Dashboard Central:** Visualización en tiempo real de KPIs, gráficos interactivos.
    *   [ ] 4.3.2. **Módulo de Autenticación:** Login, registro, recuperación de contraseña.
    *   [ ] 4.3.3. **Gestión de Documentación:** Vistas de lista, editor/visualizador, historial de versiones.
    *   [ ] 4.3.4. **No Conformidades:** Formulario de registro, lista de NCs, detalle de seguimiento.
    *   [ ] 4.3.5. **Constructor de Formularios Dinámicos:** Interfaz visual para crear y previsualizar formularios.
    *   [ ] 4.3.6. **Interacción con QMS-AI Assistant:** Integrar el input/output del AI en la interfaz de redacción.
    *   [ ] 4.3.7. **Gamificación UI:** Mostrar puntos, galería de insignias, tablas de clasificación, animaciones de logros.
    *   [ ] 4.3.8. Implementar UI para el resto de módulos (Procesos, Auditorías, Riesgos, Capacitación, Proveedores, Satisfacción del Cliente, Reportes, Revisión por la Dirección).
*   [ ] **4.4. Conectividad en Tiempo Real:**
    *   [ ] 4.4.1. Conectar los componentes UI a **Cloud Firestore** para actualizaciones en tiempo real (ej. nuevas NCs aparecen sin recargar).
    *   [ ] 4.4.2. Implementar notificaciones in-app dinámicas.
*   [ ] **4.5. Manejo de Errores y Feedback:**
    *   [ ] 4.5.1. Implementar mensajes de error claros y amigables.
    *   [ ] 4.5.2. Proporcionar feedback visual para acciones de usuario (cargas, éxitos, fallos).

## Fase 5: Pruebas

*   [ ] **4.1. Pruebas Unitarias:**
    *   [ ] 4.1.1. Escribir pruebas unitarias para todas las **Cloud Functions**.
    *   [ ] 4.1.2. Escribir pruebas unitarias para componentes React/Angular/Vue.js.
*   [ ] **4.2. Pruebas de Integración:**
    *   [ ] 4.2.1. Verificar la comunicación y el flujo de datos entre el Frontend y las **Cloud Functions**.
    *   [ ] 4.2.2. Probar las integraciones con sistemas externos (PMS, CRM, etc.).
    *   [ ] 4.2.3. Probar la interacción entre las funciones de gamificación y la lógica de negocio.
    *   [ ] 4.2.4. Probar la interacción con el AI Assistant.
*   [ ] **4.3. Pruebas End-to-End (E2E):**
    *   [ ] 4.3.1. Simular flujos completos de usuario (ej. registro de NC, aprobación de documento, ejecución de auditoría).
*   [ ] **4.4. Pruebas de Rendimiento y Carga:**
    *   [ ] 4.4.1. Evaluar el rendimiento de las **Cloud Functions** bajo carga simulada.
    *   [ ] 4.4.2. Evaluar el rendimiento de las consultas a **Cloud Firestore**.
*   [ ] **4.5. Pruebas de Seguridad:**
    *   [ ] 4.5.1. Revisar y probar las **Firestore Security Rules**.
    *   [ ] 4.5.2. Probar vulnerabilidades comunes (OWASP Top 10) en las **Cloud Functions**.
    *   [ ] 4.5.3. Realizar pruebas de penetración (opcional).
*   [ ] **4.6. Pruebas de Usabilidad y Aceptación (UAT):**
    *   [ ] 4.6.1. Realizar sesiones de UAT con gerentes de calidad y personal de hotel.
    *   [ ] 4.6.2. Recopilar feedback y registrar incidencias.
*   [ ] **4.7. Pruebas de Compatibilidad:**
    *   [ ] 4.7.1. Probar la aplicación en diferentes navegadores y dispositivos (escritorio, tablet, móvil) para asegurar la responsividad del diseño de Material Design 3.
*   [ ] **4.8. Pruebas de Accesibilidad:**
    *   [ ] 4.8.1. Verificar el cumplimiento de pautas de accesibilidad (WCAG).

## Fase 6: Despliegue y Operaciones

*   [ ] **5.1. Configuración de Despliegue:**
    *   [ ] 5.1.1. Configurar **Firebase Hosting** para la aplicación frontend.
    *   [ ] 5.1.2. Desplegar todas las **Cloud Functions**.
    *   [ ] 5.1.3. Configurar variables de entorno y secretos para las funciones.
*   [ ] **5.2. Configuración de Monitoring y Logging:**
    *   [ ] 5.2.1. Configurar dashboards y alertas en **Google Cloud Operations (Logging y Monitoring)** para Cloud Functions y Firestore.
*   [ ] **5.3. Configuración de CI/CD:**
    *   [ ] 5.3.1. Implementar pipelines de CI/CD (ej. GitHub Actions, Cloud Build) para automatizar el despliegue de frontend y backend.
*   [ ] **5.4. Revisión Final de Seguridad:**
    *   [ ] 5.4.1. Auditoría final de las **Firestore Security Rules**.
    *   [ ] 5.4.2. Revisión de los permisos de los servicios de Firebase.

## Fase 7: Post-Lanzamiento y Mejora Continua

*   [ ] **6.1. Monitoreo Activo:**
    *   [ ] 6.1.1. Monitorear el rendimiento, la estabilidad y el uso de recursos de la aplicación.
    *   [ ] 6.1.2. Analizar logs para identificar problemas.
*   [ ] **6.2. Recopilación de Feedback:**
    *   [ ] 6.2.1. Establecer canales para la recopilación continua de feedback de los usuarios.
    *   [ ] 6.2.2. Realizar encuestas periódicas de satisfacción del usuario.
*   [ ] **6.3. Planificación de Iteraciones:**
    *   [ ] 6.3.1. Analizar el feedback y los datos de uso para identificar mejoras y nuevas funcionalidades.
    *   [ ] 6.3.2. Priorizar y planificar futuras versiones y características.
*   [ ] **6.4. Mantenimiento y Actualizaciones:**
    *   [ ] 6.4.1. Mantener las dependencias de software actualizadas.
    *   [ ] 6.4.2. Realizar revisiones de seguridad periódicas.

## Fase 8: Documentación (Transversal)

*   [ ] **7.1. Documentación Técnica:**
    *   [ ] 7.1.1. Documentación de la arquitectura (actualizar según cambios).
    *   [ ] 7.1.2. Documentación de las APIs de las **Cloud Functions**.
    *   [ ] 7.1.3. Esquema de la base de datos **Firestore**.
    *   [ ] 7.1.4. Guía de despliegue y configuración.
*   [ ] **7.2. Documentación de Código:**
    *   [ ] 7.2.1. Comentarios claros en el código fuente.
    *   [ ] 7.2.2. READMEs para cada servicio/módulo.
*   [ ] **7.3. Documentación para Usuarios:**
    *   [ ] 7.3.1. Manual de usuario detallado.
    *   [ ] 7.3.2. FAQs y guías de solución de problemas.
    *   [ ] 7.3.3. Guía de inicio rápido.

---