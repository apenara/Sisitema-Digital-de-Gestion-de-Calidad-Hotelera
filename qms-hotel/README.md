# QMS+Hotel - Sistema de Gestión de Calidad para Hoteles

## 📋 Descripción

QMS+Hotel es una aplicación web moderna para la gestión de Sistemas de Gestión de Calidad (SGC) en hoteles bajo la norma ISO 9001:2015. Transforma los procesos manuales de gestión de calidad en una herramienta digital, interactiva y proactiva.

## 🏗️ Arquitectura del Proyecto

```
qms-hotel/
├── packages/
│   ├── web-app/          # React Frontend (TypeScript + Material-UI)
│   ├── functions/        # Cloud Functions (Node.js + TypeScript)  
│   ├── shared/           # Tipos TypeScript compartidos
│   └── docs/            # Documentación técnica
├── infrastructure/       # Configuración Firebase
├── design/              # Assets de diseño
└── tests/               # Tests E2E
```

## 🚀 Tecnologías Principales

### Frontend
- **React 19** + **TypeScript**
- **Material-UI v7** (Material Design 3)
- **Vite** (Build tool)
- **Redux Toolkit** + **RTK Query**
- **React Router v7**
- **React Hook Form** + **Yup**

### Backend
- **Firebase Ecosystem**
  - Firestore (Base de datos)
  - Authentication (Autenticación)
  - Cloud Functions (Serverless)
  - Cloud Storage (Archivos)
  - Hosting (Deploy)

### DevTools
- **Vitest** + **React Testing Library**
- **ESLint** + **Prettier**
- **Husky** (Git hooks)

## 📦 Instalación y Setup

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Firebase CLI
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd qms-hotel
```

### 2. Instalar dependencias del frontend
```bash
cd packages/web-app
npm install
```

### 3. Configurar Firebase (opcional para desarrollo)
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto (si es necesario)
firebase init
```

### 4. Ejecutar el proyecto en desarrollo
```bash
cd packages/web-app
npm run dev
```

El proyecto estará disponible en: `http://localhost:5173`

## 📝 Scripts Disponibles

### Frontend (packages/web-app)
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Fix automático de ESLint
npm run test         # Ejecutar tests
npm run format       # Formatear código con Prettier
```

### Cloud Functions (packages/functions)
```bash
npm run build        # Compilar TypeScript
npm run serve        # Servidor local con emulators
npm run deploy       # Deploy a Firebase
```

## 🔧 Configuración de Desarrollo

### ESLint + Prettier
El proyecto incluye configuración pre-configurada para mantener consistencia en el código:
- ESLint para análisis estático
- Prettier para formateo automático
- Husky para hooks de pre-commit

### Testing
- **Vitest** como test runner
- **React Testing Library** para testing de componentes
- **jsdom** para simular DOM en tests

### Material-UI Theme
El proyecto usa Material Design 3 con tema personalizable ubicado en:
```
src/theme/
```

## 🔥 Firebase Setup

### Configuración mínima requerida:
1. **Authentication**: Email/Password
2. **Firestore**: Base de datos principal  
3. **Cloud Storage**: Almacenamiento de archivos
4. **Hosting**: Deploy de la aplicación

### Variables de entorno (.env.local):
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Estructura del Código Frontend

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes básicos UI
│   ├── forms/          # Formularios especializados
│   └── charts/         # Visualizaciones
├── pages/              # Páginas/Vistas principales  
├── hooks/              # Custom React hooks
├── services/           # Servicios Firebase
├── store/              # Redux store
├── types/              # TypeScript definitions
├── utils/              # Utilidades
├── theme/              # Material-UI theme
└── test/               # Setup de testing
```

## 🎯 Roadmap MVP

### ✅ Sprint 0.1 - Setup y Configuración
- [x] Estructura de proyecto
- [x] Configuración React + TypeScript + Vite
- [x] Setup Material-UI v7
- [x] Configuración Firebase básica
- [x] Configuración de desarrollo (ESLint, Prettier, Testing)

### 🔄 Sprint 0.2 - Arquitectura Base (Próximo)
- [ ] Sistema de autenticación
- [ ] Estructura Firestore
- [ ] Componentes UI base
- [ ] Theme Material Design 3

### 🔄 Sprint 0.3 - MVP Core
- [ ] Dashboard básico
- [ ] Gestión de documentación
- [ ] Registro de no conformidades
- [ ] Reportes básicos

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para preguntas y soporte:
- **Documentación**: Ver `packages/docs/`
- **Issues**: Usar el sistema de issues de GitHub
- **Wiki**: Consultar la wiki del proyecto

---

**QMS+Hotel** - Transformando la gestión de calidad hotelera 🏨✨