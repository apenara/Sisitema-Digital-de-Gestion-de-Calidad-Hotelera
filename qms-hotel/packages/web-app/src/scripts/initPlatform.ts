/**
 * Script para inicializar la plataforma QMS+Hotel
 * 
 * Uso:
 * 1. Desde la consola del navegador
 * 2. Como script de desarrollo
 * 3. Desde componente de setup
 */

import { bootstrapService } from '../services/bootstrapService';

// ======================
// CONFIGURACIÓN RÁPIDA
// ======================

export const QUICK_SETUP = {
  superAdmin: {
    email: 'admin@qmshotel.com',
    password: 'QMSHotel2024!',
    displayName: 'Super Administrador'
  },
  
  // Para desarrollo local
  dev: {
    email: 'dev@qmshotel.local',
    password: 'DevPassword123!',
    displayName: 'Admin Desarrollo'
  }
};

// ======================
// FUNCIONES DE SETUP
// ======================

/**
 * Inicializa la plataforma con configuración rápida
 */
export async function quickSetup(includeDemoData = true): Promise<void> {
  try {
    console.log('🚀 Iniciando configuración rápida de QMS+Hotel...\n');
    
    // Verificar si ya está inicializada
    const isInitialized = await bootstrapService.isPlatformInitialized();
    if (isInitialized) {
      console.log('✅ La plataforma ya está inicializada');
      const count = await bootstrapService.getSuperAdminCount();
      console.log(`👥 Super Admins activos: ${count}`);
      return;
    }
    
    // Inicializar con datos por defecto
    const result = await bootstrapService.initializePlatform(QUICK_SETUP.superAdmin);
    
    if (result.success) {
      console.log('✅ Plataforma inicializada exitosamente!');
      console.log('\n📋 Detalles del Super Admin:');
      console.log(`📧 Email: ${result.superAdmin?.email}`);
      console.log(`👤 Nombre: ${result.superAdmin?.displayName}`);
      console.log(`🔑 Contraseña: ${QUICK_SETUP.superAdmin.password}`);
      
      if (includeDemoData && result.superAdmin) {
        console.log('\n🎭 Creando datos de demostración...');
        await bootstrapService.createDemoData(result.superAdmin.id);
        console.log('✅ Datos de demostración creados');
      }
      
      console.log('\n🎉 ¡Configuración completada!');
      console.log('\n🔗 Próximos pasos:');
      console.log('1. Ir a la página de login');
      console.log('2. Usar las credenciales mostradas arriba');
      console.log('3. Explorar el dashboard de plataforma');
      
    } else {
      console.error('❌ Error inicializando plataforma:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Error durante la configuración:', error);
  }
}

/**
 * Setup para desarrollo local
 */
export async function devSetup(): Promise<void> {
  try {
    console.log('🔧 Configuración de desarrollo...');
    
    const result = await bootstrapService.initializePlatform(QUICK_SETUP.dev);
    
    if (result.success && result.superAdmin) {
      console.log('✅ Entorno de desarrollo configurado');
      console.log(`📧 Email: ${QUICK_SETUP.dev.email}`);
      console.log(`🔑 Contraseña: ${QUICK_SETUP.dev.password}`);
      
      // Siempre incluir datos demo en desarrollo
      await bootstrapService.createDemoData(result.superAdmin.id);
      console.log('✅ Datos de demo incluidos');
    }
    
  } catch (error) {
    console.error('Error en setup de desarrollo:', error);
  }
}

/**
 * Crear super admin personalizado
 */
export async function createCustomSuperAdmin(
  email: string,
  password: string,
  displayName: string,
  includeDemoData = false
): Promise<void> {
  try {
    console.log(`🔐 Creando super admin: ${email}...`);
    
    const result = await bootstrapService.initializePlatform({
      email,
      password,
      displayName
    });
    
    if (result.success) {
      console.log('✅ Super admin creado exitosamente');
      
      if (includeDemoData && result.superAdmin) {
        await bootstrapService.createDemoData(result.superAdmin.id);
        console.log('✅ Datos de demostración incluidos');
      }
    } else {
      console.error('❌ Error:', result.error);
    }
    
  } catch (error) {
    console.error('Error creando super admin:', error);
  }
}

/**
 * Verificar estado de la plataforma
 */
export async function checkPlatformStatus(): Promise<void> {
  try {
    console.log('🔍 Verificando estado de la plataforma...\n');
    
    const isInitialized = await bootstrapService.isPlatformInitialized();
    const superAdminCount = await bootstrapService.getSuperAdminCount();
    
    console.log(`📊 Estado: ${isInitialized ? '✅ Inicializada' : '❌ No inicializada'}`);
    console.log(`👥 Super Admins: ${superAdminCount}`);
    
    if (!isInitialized) {
      console.log('\n💡 Para inicializar la plataforma, ejecuta:');
      console.log('quickSetup()');
      console.log('\n💡 O para desarrollo:');
      console.log('devSetup()');
    }
    
  } catch (error) {
    console.error('Error verificando estado:', error);
  }
}

/**
 * Asistente interactivo (para consola del navegador)
 */
export async function setupWizard(): Promise<void> {
  await bootstrapService.runSetupWizard();
}

// ======================
// FUNCIONES GLOBALES
// ======================

// Exponer funciones globalmente para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).qmsSetup = {
    quickSetup,
    devSetup,
    createCustomSuperAdmin,
    checkPlatformStatus,
    setupWizard,
    QUICK_SETUP
  };
  
  console.log('🛠️  Funciones de setup disponibles globalmente:');
  console.log('   - qmsSetup.quickSetup()');
  console.log('   - qmsSetup.devSetup()');
  console.log('   - qmsSetup.checkPlatformStatus()');
  console.log('   - qmsSetup.createCustomSuperAdmin(email, password, name)');
  console.log('   - qmsSetup.setupWizard()');
}

// ======================
// AUTO-VERIFICACIÓN
// ======================

// Verificar automáticamente en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Pequeño delay para evitar conflictos de inicialización
  setTimeout(async () => {
    try {
      const isInitialized = await bootstrapService.isPlatformInitialized();
      
      if (!isInitialized) {
        console.log('\n🔔 PLATAFORMA NO INICIALIZADA');
        console.log('🚀 Para configuración rápida, ejecuta: qmsSetup.quickSetup()');
        console.log('🔧 Para desarrollo: qmsSetup.devSetup()');
      }
    } catch (error) {
      // Silenciar errores en auto-verificación
    }
  }, 2000);
}

export default {
  quickSetup,
  devSetup,
  createCustomSuperAdmin,
  checkPlatformStatus,
  setupWizard,
  QUICK_SETUP
};