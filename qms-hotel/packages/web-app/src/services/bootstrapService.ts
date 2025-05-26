import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import type {
  Platform,
  PlatformSettings,
  User,
  UserPermissions,
  SubscriptionPlan
} from '../../../shared/types';
import { DEFAULT_PLANS } from '../../../shared/types/Subscription';
import { ROLE_PERMISSIONS } from '../../../shared/types/User';

interface CreateSuperAdminInput {
  email: string;
  password: string;
  displayName: string;
}

interface BootstrapResult {
  success: boolean;
  superAdmin?: User;
  platform?: Platform;
  error?: string;
}

class BootstrapService {
  
  // ======================
  // VERIFICACIÓN DE ESTADO
  // ======================
  
  async isPlatformInitialized(): Promise<boolean> {
    try {
      // Verificar si existe configuración de plataforma
      const platformDoc = await getDoc(doc(db, 'platform', 'settings'));
      if (!platformDoc.exists()) {
        return false;
      }
      
      // Verificar si existe al menos un super admin
      const superAdminsQuery = query(
        collection(db, 'platform_users'),
        where('role', '==', 'super_admin'),
        where('isActive', '==', true)
      );
      const superAdminsSnap = await getDocs(superAdminsQuery);
      
      return !superAdminsSnap.empty;
    } catch (error) {
      console.error('Error verificando inicialización de plataforma:', error);
      return false;
    }
  }
  
  async getSuperAdminCount(): Promise<number> {
    try {
      const superAdminsQuery = query(
        collection(db, 'platform_users'),
        where('role', '==', 'super_admin'),
        where('isActive', '==', true)
      );
      const superAdminsSnap = await getDocs(superAdminsQuery);
      return superAdminsSnap.size;
    } catch (error) {
      console.error('Error obteniendo cantidad de super admins:', error);
      return 0;
    }
  }
  
  // ======================
  // INICIALIZACIÓN COMPLETA
  // ======================
  
  async initializePlatform(superAdminData: CreateSuperAdminInput): Promise<BootstrapResult> {
    try {
      // Verificar que la plataforma no esté ya inicializada
      const isInitialized = await this.isPlatformInitialized();
      if (isInitialized) {
        return {
          success: false,
          error: 'La plataforma ya está inicializada'
        };
      }
      
      const batch = writeBatch(db);
      
      // 1. Crear configuración inicial de plataforma
      const platform = await this.createPlatformSettings(batch);
      
      // 2. Crear planes de subscripción por defecto
      await this.createDefaultPlans(batch);
      
      // 3. Crear super admin
      const superAdmin = await this.createFirstSuperAdmin(superAdminData);
      
      // 4. Ejecutar batch de Firestore
      await batch.commit();
      
      // 5. Registrar actividad inicial
      await this.logInitialActivity(superAdmin.id);
      
      console.log('✅ Plataforma inicializada exitosamente');
      console.log(`📧 Super Admin: ${superAdmin.email}`);
      console.log(`👤 Nombre: ${superAdmin.displayName}`);
      
      return {
        success: true,
        superAdmin,
        platform
      };
      
    } catch (error) {
      console.error('❌ Error inicializando plataforma:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  
  // ======================
  // CREAR SUPER ADMIN
  // ======================
  
  async createFirstSuperAdmin(data: CreateSuperAdminInput): Promise<User> {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      // 2. Actualizar perfil en Auth
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });
      
      // 3. Crear documento de usuario en Firestore
      const superAdminUser: Omit<User, 'id'> = {
        email: data.email,
        displayName: data.displayName,
        photoURL: userCredential.user.photoURL || undefined,
        role: 'super_admin',
        organizationId: undefined,
        hotelId: undefined,
        departmentIds: [],
        isActive: true,
        permissions: this.getSuperAdminPermissions(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        invitedBy: undefined,
        preferences: {
          theme: 'system',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            inApp: true
          }
        }
      };
      
      // 4. Guardar en colección platform_users
      const userRef = doc(db, 'platform_users', userCredential.user.uid);
      await setDoc(userRef, {
        ...superAdminUser,
        createdAt: Timestamp.fromDate(superAdminUser.createdAt),
        updatedAt: Timestamp.fromDate(superAdminUser.updatedAt),
        lastLoginAt: Timestamp.fromDate(superAdminUser.lastLoginAt!)
      });
      
      return {
        id: userCredential.user.uid,
        ...superAdminUser
      };
      
    } catch (error) {
      console.error('Error creando super admin:', error);
      throw error;
    }
  }
  
  async createAdditionalSuperAdmin(
    data: CreateSuperAdminInput,
    createdBy: string
  ): Promise<User> {
    try {
      // Verificar que el usuario actual sea super admin
      const currentUserDoc = await getDoc(doc(db, 'platform_users', createdBy));
      if (!currentUserDoc.exists() || currentUserDoc.data().role !== 'super_admin') {
        throw new Error('Solo super admins pueden crear otros super admins');
      }
      
      // Crear nuevo super admin (similar al primer super admin)
      const superAdmin = await this.createFirstSuperAdmin(data);
      
      // Agregar información de quién lo creó
      await updateDoc(doc(db, 'platform_users', superAdmin.id), {
        invitedBy: createdBy,
        updatedAt: Timestamp.now()
      });
      
      // Registrar actividad
      await addDoc(collection(db, 'platform_activities'), {
        type: 'user_registered',
        description: `Nuevo super admin creado: ${superAdmin.email}`,
        entityType: 'user',
        entityId: superAdmin.id,
        entityName: superAdmin.displayName,
        severity: 'info',
        timestamp: Timestamp.now(),
        metadata: { createdBy, role: 'super_admin' }
      });
      
      return superAdmin;
    } catch (error) {
      console.error('Error creando super admin adicional:', error);
      throw error;
    }
  }
  
  // ======================
  // CONFIGURACIÓN INICIAL
  // ======================
  
  private async createPlatformSettings(batch: any): Promise<Platform> {
    const platformSettings: Platform = {
      id: 'settings',
      name: 'QMS+Hotel Platform',
      version: '1.0.0',
      settings: {
        general: {
          siteName: 'QMS+Hotel',
          supportEmail: 'support@qmshotel.com',
          maxOrganizations: 1000,
          maxHotelsPerOrganization: 100,
          defaultLanguage: 'es',
          allowedLanguages: ['es', 'en'],
          timezone: 'America/Bogota'
        },
        registration: {
          allowPublicRegistration: false,
          requireEmailVerification: true,
          defaultTrialDays: 14,
          autoAssignPlan: 'free',
          requireApproval: true
        },
        billing: {
          enabled: true,
          currency: 'USD',
          taxRate: 0,
          paymentProviders: ['stripe'],
          invoicePrefix: 'QMS',
          gracePeriodDays: 7
        },
        storage: {
          maxFileSize: 10 * 1024 * 1024, // 10MB
          allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
          compressionEnabled: true,
          cdnEnabled: false,
          retentionPeriodDays: 2555 // 7 años
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
            preventReuse: 5,
            maxAge: 90
          },
          sessionTimeout: 480, // 8 horas
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          requireMFA: false,
          allowedDomains: []
        },
        notifications: {
          emailProvider: 'sendgrid',
          smsProvider: 'twilio',
          pushEnabled: true,
          templates: {
            welcome: 'Bienvenido a QMS+Hotel',
            passwordReset: 'Restablecer contraseña',
            subscriptionExpired: 'Subscripción expirada',
            paymentFailed: 'Fallo en el pago',
            maintenanceScheduled: 'Mantenimiento programado',
            securityAlert: 'Alerta de seguridad'
          }
        },
        integrations: {
          enabled: [],
          apiRateLimit: 1000,
          webhookRetries: 3,
          allowExternalWebhooks: false
        }
      },
      statistics: {
        totalOrganizations: 0,
        totalHotels: 0,
        totalUsers: 1, // El super admin inicial
        totalSubscriptions: 0,
        activeOrganizations: 0,
        activeHotels: 0,
        activeUsers: 1,
        activeSubscriptions: 0,
        totalDocuments: 0,
        totalNonConformities: 0,
        totalStorageUsed: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        totalRevenue: 0,
        averageRevenuePerUser: 0,
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        lastCalculated: new Date()
      },
      maintenance: {
        scheduled: [],
        history: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const platformRef = doc(db, 'platform', 'settings');
    batch.set(platformRef, {
      ...platformSettings,
      createdAt: Timestamp.fromDate(platformSettings.createdAt),
      updatedAt: Timestamp.fromDate(platformSettings.updatedAt),
      'statistics.lastCalculated': Timestamp.fromDate(platformSettings.statistics.lastCalculated)
    });
    
    return platformSettings;
  }
  
  private async createDefaultPlans(batch: any): Promise<void> {
    Object.entries(DEFAULT_PLANS).forEach(([key, planData]) => {
      const planRef = doc(collection(db, 'subscription_plans'));
      batch.set(planRef, {
        ...planData,
        id: key,
        isActive: true,
        isPublic: key !== 'enterprise' // Enterprise no es público
      });
    });
  }
  
  private getSuperAdminPermissions(): UserPermissions {
    const allPermissions = ROLE_PERMISSIONS.super_admin;
    const permissions: UserPermissions = {
      // Permisos de hotel
      'documents:read': false,
      'documents:write': false,
      'documents:delete': false,
      'nc:view': false,
      'nc:manage': false,
      'nc:close': false,
      'reports:view': false,
      'reports:generate': false,
      'users:manage': false,
      'settings:manage': false,
      'audits:view': false,
      'audits:manage': false,
      
      // Permisos multi-tenant
      'platform:manage': false,
      'organizations:manage': false,
      'organizations:view': false,
      'hotels:manage': false,
      'hotels:create': false,
      'hotels:view': false,
      'subscriptions:manage': false,
      'subscriptions:view': false,
      'analytics:global': false,
      'analytics:organization': false,
      'analytics:hotel': false
    };
    
    // Activar todos los permisos del super admin
    allPermissions.forEach(permission => {
      if (permission in permissions) {
        permissions[permission as keyof UserPermissions] = true;
      }
    });
    
    return permissions;
  }
  
  private async logInitialActivity(superAdminId: string): Promise<void> {
    await addDoc(collection(db, 'platform_activities'), {
      type: 'system_maintenance',
      description: 'Plataforma QMS+Hotel inicializada',
      entityType: 'system',
      entityId: 'platform',
      entityName: 'QMS+Hotel Platform',
      severity: 'success',
      timestamp: Timestamp.now(),
      metadata: { 
        action: 'platform_initialization',
        superAdminId,
        version: '1.0.0'
      }
    });
  }
  
  // ======================
  // UTILIDADES DE SETUP
  // ======================
  
  async createDemoData(superAdminId: string): Promise<void> {
    try {
      console.log('🎭 Creando datos de demostración...');
      
      // Crear organización de ejemplo
      const demoOrg = await addDoc(collection(db, 'organizations'), {
        name: 'Hoteles Demo Chain',
        description: 'Cadena hotelera de demostración',
        type: 'hotel_chain',
        status: 'active',
        settings: {
          branding: {
            primaryColor: '#1976d2',
            secondaryColor: '#424242'
          },
          features: {
            multiHotelManagement: true,
            centralizedReporting: true,
            crossHotelAnalytics: true,
            standardizedProcesses: true
          },
          integrations: {
            enabled: [],
            config: {}
          },
          notifications: {
            globalAlerts: true,
            crossHotelReports: true,
            chainMetrics: true
          }
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: superAdminId
      });
      
      // Crear hotel de ejemplo
      await addDoc(collection(db, 'hotels'), {
        name: 'Hotel Demo Plaza',
        description: 'Hotel de demostración para testing',
        address: {
          street: 'Calle 123 #45-67',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'Colombia',
          postalCode: '110111'
        },
        contact: {
          phone: '+57 1 234 5678',
          email: 'info@hoteldemoplaza.com',
          website: 'https://hoteldemoplaza.com'
        },
        organizationId: demoOrg.id,
        type: 'chain_member',
        isActive: true,
        status: 'active',
        classification: {
          category: 'business',
          stars: 4,
          rooms: 120,
          size: 'medium'
        },
        settings: {
          timezone: 'America/Bogota',
          currency: 'COP',
          language: 'es',
          branding: {
            theme: {
              primaryColor: '#1976d2',
              secondaryColor: '#424242',
              accentColor: '#ff9800'
            }
          },
          features: {
            documentsEnabled: true,
            nonConformitiesEnabled: true,
            auditsEnabled: true,
            reportsEnabled: true,
            analyticsEnabled: true,
            notificationsEnabled: true
          },
          notifications: {
            emailAlerts: true,
            pushNotifications: true
          },
          quality: {
            defaultProcesses: ['recepcion', 'housekeeping', 'alimentos_bebidas', 'mantenimiento'],
            auditFrequency: 'monthly',
            complianceStandards: ['ISO_9001'],
            qualityObjectives: []
          },
          integrations: {
            pms: { enabled: false },
            accounting: { enabled: false },
            hrms: { enabled: false }
          }
        },
        departments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ownerId: superAdminId
      });
      
      console.log('✅ Datos de demostración creados');
    } catch (error) {
      console.error('Error creando datos de demostración:', error);
    }
  }
  
  // ======================
  // COMANDOS DE CLI
  // ======================
  
  async runSetupWizard(): Promise<void> {
    console.log('\n🚀 ASISTENTE DE CONFIGURACIÓN QMS+HOTEL');
    console.log('=====================================\n');
    
    const isInitialized = await this.isPlatformInitialized();
    
    if (isInitialized) {
      console.log('✅ La plataforma ya está inicializada');
      const superAdminCount = await this.getSuperAdminCount();
      console.log(`👥 Super Admins activos: ${superAdminCount}`);
      return;
    }
    
    console.log('⚠️  La plataforma necesita ser inicializada');
    console.log('\nPara inicializar la plataforma, ejecuta:');
    console.log('bootstrapService.initializePlatform({');
    console.log('  email: "admin@tudominio.com",');
    console.log('  password: "TuPasswordSeguro123!",');
    console.log('  displayName: "Administrador Principal"');
    console.log('});\n');
  }
}

export const bootstrapService = new BootstrapService();