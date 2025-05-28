import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import type { Company } from '../../../shared/types/Company';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function createTestCompany() {
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Autenticar como super admin (ajusta las credenciales según tu configuración)
    const superAdminEmail = 'admin@qmsplus.com';
    const superAdminPassword = 'your-password'; // Cambia esto
    
    await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    console.log('✓ Autenticado como super admin');

    // Crear empresa de prueba
    const companyRef = doc(collection(db, 'companies'));
    const now = Timestamp.now();
    
    const testCompany: Omit<Company, 'id'> = {
      name: 'TechInnovate Solutions',
      industry: {
        type: 'technology',
        size: 'medium',
        employeeCount: '50-200',
        certifications: ['ISO_27001', 'ISO_9001']
      },
      organizationId: undefined, // Empresa independiente para pruebas
      contact: {
        email: 'info@techinnovate.com',
        phone: '+1 (555) 123-4567',
        address: '123 Innovation Drive, Tech Valley, CA 94025, USA',
        website: 'https://techinnovate.com'
      },
      settings: {
        departments: ['desarrollo', 'qa', 'devops', 'soporte', 'ventas', 'marketing'],
        language: 'es',
        timezone: 'America/Los_Angeles',
        fiscalYearStart: 'january'
      },
      subscription: {
        planId: 'professional',
        status: 'active',
        startDate: now,
        endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // 1 año
      },
      metrics: {
        totalUsers: 15,
        activeUsers: 12,
        totalDocuments: 45,
        totalProcesses: 8,
        complianceScore: 92,
        lastActivityAt: now
      },
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    await setDoc(companyRef, testCompany);
    
    console.log('✅ Empresa de prueba creada exitosamente');
    console.log('ID de la empresa:', companyRef.id);
    console.log('Nombre:', testCompany.name);
    console.log('Industria:', testCompany.industry.type);
    console.log('Plan:', testCompany.subscription.planId);
    
    // Crear algunos datos adicionales de ejemplo
    console.log('\n📊 Métricas iniciales:');
    console.log('- Usuarios totales:', testCompany.metrics.totalUsers);
    console.log('- Documentos:', testCompany.metrics.totalDocuments);
    console.log('- Procesos:', testCompany.metrics.totalProcesses);
    console.log('- Score de cumplimiento:', testCompany.metrics.complianceScore + '%');
    
    console.log('\n🎯 Próximos pasos:');
    console.log('1. Accede al panel de super admin');
    console.log('2. Ve a la sección "Empresas"');
    console.log('3. Deberías ver "TechInnovate Solutions" en la lista');
    console.log('4. Puedes crear más empresas desde la interfaz');

  } catch (error) {
    console.error('❌ Error al crear empresa de prueba:', error);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createTestCompany();
}