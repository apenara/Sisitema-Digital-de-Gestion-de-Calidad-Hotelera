
# Arquitectura de "QMS+Hotel" (`arquitectura.md`)

## 1. Introducción

Este documento detalla la arquitectura técnica propuesta para el desarrollo de "QMS+Hotel", una aplicación web destinada a la gestión de Sistemas de Gestión de Calidad (SGC) en hoteles bajo la norma ISO 9001:2015. Adoptamos una filosofía de **desarrollo ágil, escalabilidad intrínseca y alta disponibilidad**, aprovechando al máximo la plataforma **Firebase (Backend-as-a-Service - BaaS)** de Google Cloud para reducir la complejidad operativa y acelerar el tiempo de desarrollo, manteniendo la esencia de una arquitectura orientada a microservicios y eventos.

## 2. Filosofía Arquitectónica

*   **Serverless (Sin Servidores):** Abstraer la gestión de la infraestructura subyacente, permitiendo al equipo centrarse en la lógica de negocio y la experiencia del usuario. Firebase gestiona el escalado, el mantenimiento y la operación de los servidores.
*   **Orientada a Eventos:** Utilizar las capacidades en tiempo real de Firebase para que los cambios de datos y las interacciones del usuario disparen funciones de backend y actualizaciones de UI de forma reactiva, construyendo un "sistema vivo" por diseño.
*   **API-First:** Aunque muchas interacciones son directas con los servicios de Firebase, se mantienen APIs claras para la lógica de negocio personalizada y futuras integraciones.
*   **Cloud-Native & Gestionada:** Aprovechar al máximo los servicios gestionados de Google Cloud a través de Firebase para escalabilidad automática, resiliencia, seguridad y una baja sobrecarga operativa.

## 3. Capas de la Arquitectura

### 3.1. Capa de Presentación (Frontend)

*   **Descripción:** La interfaz de usuario dinámica y responsiva con la que los hoteleros interactúan desde cualquier dispositivo (escritorio, tableta, móvil).
*   **Componentes:**
    *   **Single Page Application (SPA):** Desarrollada con un framework moderno (ej. **React, Angular, Vue.js**) para una experiencia de usuario fluida, interactiva y con dashboards en tiempo real.
    *   **Bibliotecas de UI:** Componentes preconstruidos para formularios, tablas, gráficos, etc. (ej. Material-UI, Ant Design) que facilitan la creación del constructor de formularios dinámicos y la visualización de datos.
    *   **Alojamiento:** **Firebase Hosting** para un despliegue global rápido y seguro de la SPA, incluyendo CDN y certificados SSL automáticos.
*   **Comunicación:** Se comunica directamente con los servicios de Firebase (Authentication, Firestore) y con las Firebase Functions (para lógica de negocio personalizada) a través de APIs.

### 3.2. Capa de Backend (Servicios / Lógica de Negocio)

*   **Descripción:** El corazón de la aplicación, donde reside la lógica de negocio personalizada y la orquestación. Se implementa principalmente con funciones sin servidor.
*   **Componentes:**
    *   **Firebase Authentication:** Gestiona el registro de usuarios, el inicio de sesión, el manejo de sesiones y el control de acceso. Provee la base para los roles y niveles de permiso.
    *   **Cloud Functions for Firebase:** Son el pilar de los "microservicios" de nuestra arquitectura. Cada funcionalidad lógica (ej. crear un documento, procesar una no conformidad, actualizar puntos de gamificación) puede ser una o varias funciones serverless.
        *   **Ejemplos de Funciones:**
            *   Función `crearDocumento` (maneja la lógica de validación y almacenamiento en Firestore).
            *   Función `procesarNoConformidad` (disparada por la creación de una NC, asigna tareas, envía notificaciones).
            *   Función `calcularPuntosGamificacion` (actualiza los puntos del usuario basado en eventos).
            *   Funciones `apiIntegracionPMS`, `apiIntegracionCRM`, etc. (para la comunicación con sistemas externos).
            *   Funciones disparadas por eventos de Firestore (ej. `onUpdate` de una no conformidad para enviar notificaciones).
    *   **Firebase Admin SDK:** Utilizado dentro de las Cloud Functions para interactuar de forma segura con todos los servicios de Firebase (Firestore, Storage, Authentication).
*   **Tecnologías Sugeridas para Cloud Functions:** **Node.js (JavaScript/TypeScript)** o **Python**, por su buen soporte en Firebase Functions.

### 3.3. Capa de Datos

*   **Descripción:** Almacenamiento persistente de todos los datos del SGC, optimizado para operaciones en tiempo real y escalabilidad.
*   **Componentes:**
    *   **Cloud Firestore:** La base de datos principal. Una base de datos NoSQL, orientada a documentos, altamente escalable y con sincronización en tiempo real. Ideal para:
        *   Documentos del SGC (Política de Calidad, POEs, etc.).
        *   Registros de No Conformidades, Acciones Correctivas/Preventivas.
        *   Datos de Auditorías y sus hallazgos.
        *   Registros de Riesgos y Oportunidades.
        *   Perfiles de Usuarios y Registros de Competencia.
        *   Datos de Gamificación (puntos, insignias, progresos).
        *   Datos de formularios dinámicos.
        *   Feedback y satisfacción del cliente.
    *   **Cloud Storage for Firebase:** Para el almacenamiento de archivos binarios grandes y no estructurados:
        *   Versiones PDF de documentos.
        *   Imágenes adjuntas a no conformidades o auditorías.
        *   Materiales de capacitación.
*   **Justificación:** Firestore es fundamental para el "sistema vivo" debido a sus capacidades en tiempo real, lo que permite que el dashboard se actualice instantáneamente y que las notificaciones sean proactivas. Gestiona automáticamente el escalado y la redundancia.

### 3.4. Capa de Integración / Comunicación

*   **Descripción:** Facilita la comunicación interna entre componentes del backend y la integración con sistemas externos.
*   **Componentes:**
    *   **Cloud Functions:** Actúan como el pegamento. Pueden ser disparadas por:
        *   **Eventos HTTP:** Para APIs RESTful consumidas por el frontend o por sistemas externos.
        *   **Eventos de Firestore:** Cuando se crea, actualiza o elimina un documento en la base de datos (ej. una nueva NC dispara una función para enviar un email).
        *   **Eventos de Authentication:** Cuando un usuario se registra o su estado cambia.
        *   **Google Cloud Pub/Sub (Opcional):** Para escenarios más complejos de mensajería asíncrona entre funciones o para integraciones con otros servicios de Google Cloud o externos que requieran un sistema de cola de mensajes robusto.
    *   **Firebase Extensions:** Ofrecen soluciones pre-construidas para integraciones comunes o funcionalidades (ej. redimensionamiento de imágenes cargadas en Storage).
    *   **APIs Externas:** Las Cloud Functions interactuarán directamente con las APIs de sistemas externos (PMS, CRM, plataformas de opiniones como Tripadvisor, Google Reviews) para importar y exportar datos.

### 3.5. Capa de Inteligencia Artificial (AI Assistant)

*   **Descripción:** Contiene los modelos de IA y servicios necesarios para las funcionalidades del QMS-AI Assistant, orquestados a través de Cloud Functions.
*   **Componentes:**
    *   **Cloud Functions:** Sirven como la interfaz para invocar y gestionar los servicios de IA.
    *   **Google Cloud AI Platform / Vertex AI:** Para alojar y ejecutar modelos de Machine Learning más complejos (ej. modelos de Procesamiento de Lenguaje Natural para sugerencias de redacción, análisis de sentimiento avanzado). Las funciones llamarían a estas APIs.
    *   **Google Cloud Natural Language API:** Para análisis de sentimiento, clasificación de texto, y extracción de entidades en el feedback del cliente o en la descripción de no conformidades.
    *   **Modelos de Generación de Texto:** Podrían ser modelos pre-entrenados de Google (a través de APIs) o modelos más pequeños desplegados en Cloud Functions si el tamaño y la complejidad lo permiten.
    *   **Motor de Reglas/Conocimiento:** Lógica implementada dentro de las Cloud Functions para la verificación "lite" de conformidad con ISO 9001.
*   **Justificación:** Aprovecha la experiencia de Google en IA, permitiendo funcionalidades avanzadas sin la necesidad de un equipo dedicado a la gestión de infraestructura de ML.

## 4. Infraestructura y DevOps (Gestionado por Firebase)

La principal ventaja de Firebase es que gestiona gran parte de la infraestructura y DevOps por nosotros.

*   **Infraestructura Serveless:** Google Cloud se encarga del aprovisionamiento, escalado y mantenimiento de los servidores para Firebase Hosting, Cloud Functions, Firestore y Storage.
*   **CI/CD Simplificado:**
    *   **Firebase CLI:** Permite despliegues rápidos y sencillos del frontend y las funciones.
    *   **GitHub Actions / Cloud Build:** Se pueden configurar flujos de CI/CD para automatizar las pruebas y despliegues de Cloud Functions y la SPA en Firebase Hosting.
*   **Monitoreo y Logging:**
    *   **Google Cloud Logging y Monitoring (Stackdriver):** Proporcionan logs detallados y métricas de rendimiento para todos los servicios de Firebase, permitiendo la supervisión del estado y la depuración.
*   **Seguridad:** Firebase gestiona la seguridad de la infraestructura (redes, máquinas virtuales, protección DDoS). A nivel de aplicación, se utilizan las reglas de seguridad de Firestore para controlar el acceso a los datos, y Firebase Authentication para la gestión de usuarios y roles.

## 5. Diagrama Conceptual de la Arquitectura (Descripción Textual)

Imagina un diagrama donde todas las funcionalidades están estrechamente interconectadas y gestionadas por Firebase:

1.  **Capa Superior: Cliente (Frontend)**
    *   Un navegador web o una aplicación móvil ejecutando la SPA (React/Angular/Vue.js).
    *   **Hospedado por Firebase Hosting.**
    *   Flechas de comunicación directa hacia "Firebase Authentication" y "Cloud Functions" (para API personalizada) y "Cloud Firestore" (para datos en tiempo real).

2.  **Capa Intermedia: Firebase Backend Services**
    *   **Firebase Authentication:** Gestiona los usuarios y sesiones.
    *   **Cloud Functions for Firebase:** Un conjunto de funciones individuales que representan la lógica de negocio (ej. "Función para Gestionar Documentos", "Función para No Conformidades", "Función para Gamificación", "Función para Integraciones").
        *   Flechas desde las funciones hacia "Cloud Firestore", "Cloud Storage" y "Servicios de IA".
        *   Flechas entre funciones que indican la comunicación asíncrona (posiblemente a través de eventos de Firestore o Pub/Sub).
    *   **Servicio de AI Assistant:** Se representa como un sub-componente dentro de las Cloud Functions que invoca **APIs de Google Cloud AI Platform / Vertex AI** y **Natural Language API**.

3.  **Capa Inferior: Firebase Data Services**
    *   **Cloud Firestore:** Base de datos principal, con iconos indicando sincronización en tiempo real. Varias colecciones/documentos para los datos del SGC.
    *   **Cloud Storage for Firebase:** Para archivos (PDFs, imágenes).

4.  **Componentes Laterales / Integraciones:**
    *   **Sistemas Externos (PMS, CRM, Opiniones):** Flechas bidireccionales entre "Cloud Functions" (las de integración) y estos sistemas externos, indicando el flujo de datos vía APIs.
    *   **Google Cloud Logging & Monitoring:** Una "nube" que supervisa todos los servicios de Firebase.
    *   **Firebase CLI / CI/CD (GitHub Actions / Cloud Build):** Una "nube" que representa el proceso de desarrollo y despliegue hacia Firebase Hosting y Cloud Functions.

Esta arquitectura, centrada en Firebase, proporciona un camino claro y eficiente para construir una aplicación "QMS+Hotel" robusta, escalable y con las capacidades en tiempo real necesarias para un sistema de gestión de calidad verdaderamente vivo.