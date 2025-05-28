#!/usr/bin/env node

/**
 * Script de migración para convertir la estructura de /hotels a /companies
 * 
 * Este script:
 * 1. Lee todos los documentos de la colección 'hotels'
 * 2. Transforma los datos al nuevo formato de 'companies'
 * 3. Crea los nuevos documentos en la colección 'companies'
 * 4. Mantiene la colección 'hotels' para compatibilidad temporal
 * 
 * NOTA: Ejecutar con precaución en producción
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json'); // Asegúrate de tener este archivo

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Mapeo de categorías de hotel a tipos de industria
const HOTEL_CATEGORY_TO_INDUSTRY = {
  'boutique': 'hospitality',
  'business': 'hospitality',
  'resort': 'hospitality',
  'economy': 'hospitality',
  'luxury': 'hospitality',
  'extended_stay': 'hospitality'
};

// Mapeo de tipos de hotel a tipos de empresa
const HOTEL_TYPE_TO_COMPANY_TYPE = {
  'independent': 'independent',
  'chain_member': 'subsidiary'
};

// Función para transformar un hotel en una empresa
function transformHotelToCompany(hotel) {
  const company = {
    ...hotel,
    industry: {
      type: HOTEL_CATEGORY_TO_INDUSTRY[hotel.classification?.category] || 'hospitality',
      subType: hotel.classification?.category,
      size: hotel.classification?.size || 'medium',
      employeeCount: getEmployeeRange(hotel.classification?.rooms),
      certifications: hotel.settings?.quality?.complianceStandards || []
    },
    type: HOTEL_TYPE_TO_COMPANY_TYPE[hotel.type] || 'independent'
  };

  // Remover campos específicos de hotel si es necesario
  if (company.classification) {
    delete company.classification;
  }

  // Actualizar configuraciones
  if (company.settings) {
    // Agregar nuevas características habilitadas por defecto
    company.settings.features = {
      ...company.settings.features,
      processesEnabled: true,
      risksEnabled: true,
      trainingsEnabled: true,
      suppliersEnabled: true,
      gamificationEnabled: true
    };

    // Actualizar configuración de calidad
    if (company.settings.quality) {
      company.settings.quality.kpis = [];
    }
  }

  return company;
}

// Función auxiliar para estimar empleados basándose en número de habitaciones
function getEmployeeRange(rooms) {
  if (!rooms) return '11-50';
  if (rooms <= 20) return '11-50';
  if (rooms <= 50) return '51-200';
  if (rooms <= 100) return '201-500';
  if (rooms <= 200) return '501-1000';
  return '1001-5000';
}

// Función principal de migración
async function migrateHotelsToCompanies() {
  console.log('🚀 Iniciando migración de hoteles a empresas...');
  
  try {
    // Obtener todos los hoteles
    const hotelsSnapshot = await db.collection('hotels').get();
    console.log(`📊 Se encontraron ${hotelsSnapshot.size} hoteles para migrar`);

    let migrated = 0;
    let failed = 0;

    // Procesar cada hotel
    for (const doc of hotelsSnapshot.docs) {
      try {
        const hotel = doc.data();
        const company = transformHotelToCompany(hotel);
        
        // Crear el documento en la nueva colección
        await db.collection('companies').doc(doc.id).set(company);
        
        // Migrar subcolecciones si existen
        await migrateSubcollections(doc.id);
        
        migrated++;
        console.log(`✅ Migrado: ${hotel.name} (${doc.id})`);
      } catch (error) {
        failed++;
        console.error(`❌ Error migrando hotel ${doc.id}:`, error);
      }
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`   - Total de hoteles: ${hotelsSnapshot.size}`);
    console.log(`   - Migrados exitosamente: ${migrated}`);
    console.log(`   - Fallos: ${failed}`);
    
    // Actualizar usuarios para usar companyId en lugar de hotelId
    await updateUserReferences();
    
    console.log('\n✨ Migración completada!');
    console.log('⚠️  NOTA: La colección "hotels" se mantiene para compatibilidad.');
    console.log('📝 Recuerda actualizar las reglas de Firestore y el código del frontend.');
    
  } catch (error) {
    console.error('💥 Error fatal durante la migración:', error);
  }
}

// Función para migrar subcolecciones
async function migrateSubcollections(hotelId) {
  const subcollections = [
    'users',
    'departments',
    'documents',
    'nonConformities',
    'processes',
    'audits',
    'risks',
    'trainings',
    'suppliers',
    'metrics',
    'gamification'
  ];

  for (const subcollection of subcollections) {
    try {
      const snapshot = await db
        .collection('hotels')
        .doc(hotelId)
        .collection(subcollection)
        .get();

      if (snapshot.size > 0) {
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
          const ref = db
            .collection('companies')
            .doc(hotelId)
            .collection(subcollection)
            .doc(doc.id);
          
          batch.set(ref, doc.data());
        });

        await batch.commit();
        console.log(`   📁 Migradas ${snapshot.size} entradas de ${subcollection}`);
      }
    } catch (error) {
      console.error(`   ⚠️  Error migrando subcolección ${subcollection}:`, error.message);
    }
  }
}

// Función para actualizar referencias de usuarios
async function updateUserReferences() {
  console.log('\n🔄 Actualizando referencias de usuarios...');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    let updated = 0;

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      
      if (user.hotelId) {
        await db.collection('users').doc(doc.id).update({
          companyId: user.hotelId,
          hotelId: admin.firestore.FieldValue.delete() // Opcional: eliminar el campo antiguo
        });
        updated++;
      }
    }

    console.log(`✅ Actualizados ${updated} usuarios`);
  } catch (error) {
    console.error('❌ Error actualizando usuarios:', error);
  }
}

// Script de rollback (en caso de necesitar revertir)
async function rollbackMigration() {
  console.log('⏮️  Iniciando rollback...');
  
  try {
    const companiesSnapshot = await db.collection('companies').get();
    
    for (const doc of companiesSnapshot.docs) {
      await doc.ref.delete();
    }
    
    console.log(`🗑️  Eliminadas ${companiesSnapshot.size} empresas`);
    console.log('✅ Rollback completado');
  } catch (error) {
    console.error('❌ Error durante rollback:', error);
  }
}

// Función para verificar el estado de la migración
async function checkMigrationStatus() {
  const hotels = await db.collection('hotels').get();
  const companies = await db.collection('companies').get();
  
  console.log('\n📊 Estado actual:');
  console.log(`   - Hoteles: ${hotels.size}`);
  console.log(`   - Empresas: ${companies.size}`);
  
  if (companies.size === 0) {
    console.log('⚠️  No se han migrado empresas aún');
  } else if (companies.size === hotels.size) {
    console.log('✅ Migración aparentemente completa');
  } else {
    console.log('⚠️  Migración parcial detectada');
  }
}

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

// Ejecutar comando apropiado
switch (command) {
  case 'migrate':
    migrateHotelsToCompanies();
    break;
  case 'rollback':
    rollbackMigration();
    break;
  case 'status':
    checkMigrationStatus();
    break;
  default:
    console.log('Uso: node migrate-hotels-to-companies.js [migrate|rollback|status]');
    console.log('  migrate  - Ejecutar la migración');
    console.log('  rollback - Revertir la migración');
    console.log('  status   - Verificar el estado de la migración');
}

module.exports = {
  transformHotelToCompany,
  migrateHotelsToCompanies,
  rollbackMigration,
  checkMigrationStatus
};