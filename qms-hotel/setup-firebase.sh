#!/bin/bash

# Script para configurar Firebase para QMS+Hotel
# Ejecutar desde la raíz del proyecto qms-hotel/

echo "🔥 Configurando Firebase para QMS+Hotel..."

# Verificar si Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no está instalado."
    echo "Instalando Firebase CLI..."
    npm install -g firebase-tools
fi

echo "🔑 Iniciando sesión en Firebase..."
firebase login

echo "📋 Inicializando proyecto Firebase..."
firebase init

echo "✅ Configuración base completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Copia la configuración web de Firebase Console"
echo "2. Actualiza el archivo packages/web-app/.env con los valores reales"
echo "3. Configura las reglas de seguridad desde Firebase Console"
echo "4. Ejecuta 'npm run dev' en packages/web-app"
echo ""
echo "📖 Ver FIREBASE_SETUP.md para instrucciones detalladas"