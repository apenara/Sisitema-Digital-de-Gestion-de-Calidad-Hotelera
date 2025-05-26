# Configuración de Firebase para QMS+Hotel

## 1. Crear Proyecto Firebase

### Paso 1: Crear el proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `qms-hotel-[tu-nombre]`
4. Habilita Google Analytics (opcional)
5. Selecciona una cuenta de Analytics o crea una nueva

### Paso 2: Configurar Authentication
1. En el menú lateral, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Ve a la pestaña **Sign-in method**
4. Habilita **Email/password**
5. Guarda la configuración

### Paso 3: Configurar Firestore Database
1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona **Comenzar en modo de prueba** (para desarrollo)
4. Elige una ubicación (preferiblemente South America)
5. La base de datos se creará automáticamente

### Paso 4: Configurar Storage
1. En el menú lateral, ve a **Storage**
2. Haz clic en "Comenzar"
3. Acepta las reglas de seguridad por defecto
4. Selecciona la misma ubicación que Firestore

### Paso 5: Obtener configuración web
1. En la página principal del proyecto, haz clic en el icono **Web** (`</>`)
2. Registra tu app con el nombre: `qms-hotel-web`
3. Copia la configuración que aparece (config object)

## 2. Configurar Variables de Entorno

Actualiza el archivo `.env` en `packages/web-app/.env` con los valores reales:

```env
# Firebase Configuration - Reemplazar con valores reales
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
VITE_FIREBASE_MEASUREMENT_ID=tu-measurement-id

# Development Settings (cambiar a false para usar Firebase real)
VITE_USE_FIREBASE_EMULATORS=false

# App Configuration
VITE_APP_NAME=QMS+Hotel
VITE_APP_VERSION=0.2.0
VITE_APP_ENV=development
```

## 3. Configurar Reglas de Seguridad

### Firestore Rules
En Firebase Console:
1. Ve a **Firestore Database** > **Reglas**
2. Copia el contenido de `infrastructure/firestore.rules`
3. Publica las reglas

### Storage Rules
En Firebase Console:
1. Ve a **Storage** > **Reglas**
2. Usa estas reglas básicas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. Configurar Índices de Firestore

En Firebase Console:
1. Ve a **Firestore Database** > **Índices**
2. Los índices se crearán automáticamente cuando la aplicación los necesite
3. O puedes usar Firebase CLI para subirlos desde `infrastructure/firestore.indexes.json`

## 5. Instalar Firebase CLI (Opcional)

Para desarrollo avanzado y despliegue:

```bash
npm install -g firebase-tools
firebase login
cd qms-hotel
firebase init
```

Selecciona:
- ✅ Firestore
- ✅ Functions (si planeas usar)
- ✅ Hosting
- ✅ Storage

## 6. Configurar Emuladores (Desarrollo Local)

Para desarrollo sin usar Firebase real:

```bash
firebase init emulators
```

Selecciona:
- ✅ Authentication Emulator (puerto 9099)
- ✅ Firestore Emulator (puerto 8080)
- ✅ Functions Emulator (puerto 5001)
- ✅ Storage Emulator (puerto 9199)

### Ejecutar emuladores:
```bash
firebase emulators:start
```

### En el archivo .env:
```env
VITE_USE_FIREBASE_EMULATORS=true
```

## 7. Primer Usuario Administrador

Una vez configurado Firebase, necesitarás crear el primer usuario administrador:

1. Ejecuta la aplicación
2. Ve a `/login` y haz clic en "Regístrate"
3. Llena el formulario con:
   - **Rol**: admin
   - **Hotel ID**: hotel_demo
   - **Departamentos**: administracion,calidad

4. Después del registro, ve a Firebase Console > Authentication
5. Busca tu usuario y agrega Custom Claims:

```json
{
  "role": "admin",
  "permissions": [
    "documents:read", "documents:write", "documents:delete",
    "nc:view", "nc:manage", "nc:close",
    "reports:view", "reports:generate",
    "users:manage", "settings:manage",
    "audits:view", "audits:manage"
  ],
  "hotelId": "hotel_demo"
}
```

## 8. Verificar Configuración

Prueba que todo funciona:
1. `npm run dev` en `packages/web-app`
2. Ve a `http://localhost:5173`
3. Registra un usuario
4. Inicia sesión
5. Verifica que el dashboard carga correctamente

## Problemas Comunes

### Error: Missing or insufficient permissions
- Verifica que las reglas de Firestore estén publicadas
- Asegúrate de que el usuario tenga los custom claims configurados

### Error: Firebase configuration
- Verifica que todas las variables de entorno estén configuradas
- Revisa que el proyecto ID sea correcto

### Error: CORS
- Agrega tu dominio local a los dominios autorizados en Firebase Console
- Ve a Authentication > Settings > Authorized domains