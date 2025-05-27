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

interface SuperAdminAuthData {
  email: string;
  password: string;
  displayName: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

class BootstrapService {
  
  // ======================
  // VERIFICACIÓN DE ESTADO
  // ======================
  
  async isPlatformInitialized(): Promise<boolean> {
    try {
      // Verificar si existe al menos un super admin (condición principal)
      const superAdminsQuery = query(
        collection(db, 'platform_users'),
        where('role', '==', 'super_admin'),
        where('isActive', '==', true)
      );
      const superAdminsSnap = await getDocs(superAdminsQuery);
      
      // Si existe al menos un super admin, consideramos la plataforma inicializada
      if (!superAdminsSnap.empty) {
        console.log('✅ Plataforma inicializada: Super admin encontrado');
        return true;
      }
      
      console.log('❌ Plataforma no inicializada: No se encontraron super admins');
      return false;
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
  
  async createFirstSuperAdmin(data: SuperAdminAuthData): Promise<User> {
    let userCredential: any = null;
    
    try {
      console.log('🔐 Creando usuario en Firebase Auth...');
      
      // 1. Crear usuario en Firebase Auth
      userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      console.log('✅ Usuario creado en Auth con ID:', userCredential.user.uid);
      
      // 2. Actualizar perfil en Auth
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });
      
      console.log('✅ Perfil actualizado en Auth');
      
      // 3. Preparar datos para Firestore
      const now = new Date();
      const userPermissions = this.getSuperAdminPermissions();
      
      const firestoreData = {
        email: data.email,
        displayName: data.displayName,
        role: 'super_admin',
        departmentIds: [],
        isActive: true,
        permissions: userPermissions,
        preferences: {
          theme: 'system',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            inApp: true
          }
        },
        security: {
          twoFactorEnabled: data.twoFactorEnabled || false,
          twoFactorSecret: data.twoFactorSecret || null,
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          accountLocked: false,
          accountLockedUntil: null,
          lastLoginAt: Timestamp.fromDate(now),
          lastLoginIP: null,
          lastLoginDevice: null
        },
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      // Solo agregar photoURL si existe
      if (userCredential.user.photoURL) {
        (firestoreData as any).photoURL = userCredential.user.photoURL;
      }
      
      console.log('📝 Guardando usuario en Firestore...');
      console.log('Datos a guardar:', firestoreData);
      
      // 4. Guardar en colección platform_users
      try {
        const userRef = doc(db, 'platform_users', userCredential.user.uid);
        console.log('📍 Referencia del documento:', userRef.path);
        console.log('🔥 Base de datos:', db.app.name);
        
        console.log('⏳ Ejecutando setDoc...');
        await setDoc(userRef, firestoreData);
        console.log('✅ setDoc completado sin errores');
        
        // 5. Verificar que se guardó correctamente
        console.log('🔍 Verificando que el documento existe...');
        const savedDoc = await getDoc(userRef);
        
        if (!savedDoc.exists()) {
          console.error('❌ El documento NO existe después de setDoc');
          throw new Error('El documento no se guardó correctamente en Firestore');
        }
        
        console.log('✅ Verificación: documento existe en Firestore');
        console.log('📄 Datos guardados:', savedDoc.data());
        
      } catch (firestoreError) {
        console.error('❌ Error específico de Firestore:', firestoreError);
        console.error('❌ Código de error:', (firestoreError as any)?.code);
        console.error('❌ Mensaje:', (firestoreError as any)?.message);
        throw new Error(`Error de Firestore: ${(firestoreError as any)?.message || firestoreError}`);
      }
      
      // 6. Construir objeto User para retornar
      const userToReturn: User = {
        id: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: userCredential.user.photoURL || undefined,
        role: 'super_admin',
        organizationId: undefined,
        hotelId: undefined,
        departmentIds: [],
        isActive: true,
        permissions: userPermissions,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
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
      
      return userToReturn;
      
    } catch (error) {
      console.error('❌ Error creando super admin:', error);
      
      // Si el usuario se creó en Auth pero falló en Firestore, eliminar de Auth
      if (userCredential?.user) {
        try {
          console.log('🧹 Limpiando usuario de Auth debido al error...');
          await userCredential.user.delete();
          console.log('✅ Usuario eliminado de Auth');
        } catch (cleanupError) {
          console.error('❌ Error limpiando usuario de Auth:', cleanupError);
        }
      }
      
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
      const updateData: any = {
        invitedBy: createdBy,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(doc(db, 'platform_users', superAdmin.id), updateData);
      
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

  async recordLoginActivity(userId: string, loginData: {
    ip: string;
    device: string;
    success: boolean;
  }): Promise<void> {
    try {
      const userRef = doc(db, 'platform_users', userId);
      const now = Timestamp.now();
      
      const updateData: any = {
        'security.lastLoginAt': now,
        'security.lastLoginIP': loginData.ip,
        'security.lastLoginDevice': loginData.device
      };

      if (loginData.success) {
        updateData['security.failedLoginAttempts'] = 0;
        updateData['security.accountLocked'] = false;
        updateData['security.accountLockedUntil'] = null;
      } else {
        const userDoc = await getDoc(userRef);
        const currentAttempts = (userDoc.data()?.security?.failedLoginAttempts || 0) + 1;
        
        updateData['security.failedLoginAttempts'] = currentAttempts;
        updateData['security.lastFailedLogin'] = now;
        
        // Bloquear cuenta después de 5 intentos fallidos
        if (currentAttempts >= 5) {
          const lockUntil = new Date();
          lockUntil.setHours(lockUntil.getHours() + 1); // Bloquear por 1 hora
          
          updateData['security.accountLocked'] = true;
          updateData['security.accountLockedUntil'] = Timestamp.fromDate(lockUntil);
        }
      }

      await updateDoc(userRef, updateData);

      // Registrar actividad
      await addDoc(collection(db, 'platform_activities'), {
        type: loginData.success ? 'login_success' : 'login_failed',
        description: loginData.success ? 
          `Login exitoso desde ${loginData.device}` : 
          `Intento de login fallido desde ${loginData.device}`,
        entityType: 'user',
        entityId: userId,
        severity: loginData.success ? 'info' : 'warning',
        timestamp: now,
        metadata: {
          ip: loginData.ip,
          device: loginData.device
        }
      });

    } catch (error) {
      console.error('Error registrando actividad de login:', error);
      throw error;
    }
  }

  async checkAccountStatus(userId: string): Promise<{
    isLocked: boolean;
    lockUntil: Date | null;
    failedAttempts: number;
  }> {
    try {
      const userDoc = await getDoc(doc(db, 'platform_users', userId));
      const security = userDoc.data()?.security || {};
      
      if (security.accountLocked && security.accountLockedUntil) {
        const lockUntil = security.accountLockedUntil.toDate();
        if (lockUntil > new Date()) {
          return {
            isLocked: true,
            lockUntil,
            failedAttempts: security.failedLoginAttempts || 0
          };
        }
      }
      
      return {
        isLocked: false,
        lockUntil: null,
        failedAttempts: security.failedLoginAttempts || 0
      };
    } catch (error) {
      console.error('Error verificando estado de cuenta:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersQuery = query(
        collection(db, 'platform_users'),
        where('email', '==', email)
      );
      const usersSnap = await getDocs(usersQuery);
      
      if (usersSnap.empty) {
        return null;
      }
      
      const userDoc = usersSnap.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
      
    } catch (error) {
      console.error('Error obteniendo usuario por email:', error);
      throw error;
    }
  }
  
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'platform_users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
      
    } catch (error) {
      console.error('Error obteniendo usuario por ID:', error);
      throw error;
    }
  }
}

export const bootstrapService = new BootstrapService();