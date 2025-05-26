import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  User,
  UserRole,
  UserAccessContext,
  Hotel,
  HotelListItem
} from '../../../shared/types';
import type {
  Organization
} from '../../../shared/types/Organization';
import { organizationService } from './organizationService';
import { subscriptionService } from './subscriptionService';

export interface TenantContext {
  user: User;
  currentTenant: {
    type: 'platform' | 'organization' | 'hotel';
    id: string;
    name: string;
    data?: Organization | Hotel;
  };
  accessibleHotels: HotelListItem[];
  accessibleOrganizations: Organization[];
  permissions: string[];
  subscription?: any; // De subscriptionService
}

interface ExtendedAccessContext {
  accessibleHotels: HotelListItem[];
  accessibleOrganizations: Organization[];
  highestLevel: 'platform' | 'organization' | 'hotel' | 'department';
  effectivePermissions: User['permissions'];
}

class TenantService {
  
  // ======================
  // CONTEXTO DE USUARIO
  // ======================
  
  async getUserAccessContext(user: User): Promise<UserAccessContext> {
    try {
      const accessContext: UserAccessContext = {
        accessibleHotels: [],
        accessibleOrganizations: [],
        highestLevel: 'department',
        effectivePermissions: user.permissions
      };
      
      // Determinar acceso según el rol
      switch (user.role) {
        case 'super_admin':
          accessContext.highestLevel = 'platform';
          const allOrgs = await this.getAllOrganizations();
          const allHotels = await this.getAllHotels();
          accessContext.accessibleOrganizations = allOrgs.map(org => org.id);
          accessContext.accessibleHotels = allHotels.map(hotel => hotel.id);
          break;
          
        case 'chain_admin':
          accessContext.highestLevel = 'organization';
          if (user.organizationId) {
            accessContext.accessibleOrganizations = [user.organizationId];
            const orgHotels = await organizationService.getOrganizationHotels(user.organizationId);
            accessContext.accessibleHotels = orgHotels.map(hotel => hotel.id);
          }
          break;
          
        case 'hotel_admin':
        case 'quality_manager':
          accessContext.highestLevel = 'hotel';
          if (user.hotelId) {
            accessContext.accessibleHotels = [user.hotelId];
            
            // Si el hotel pertenece a una organización, incluirla
            const hotel = await this.getHotelListItem(user.hotelId);
            if (hotel?.organizationId) {
              accessContext.accessibleOrganizations = [hotel.organizationId];
            }
          }
          break;
          
        default:
          accessContext.highestLevel = 'department';
          if (user.hotelId) {
            accessContext.accessibleHotels = [user.hotelId];
          }
          break;
      }
      
      return accessContext;
    } catch (error) {
      console.error('Error obteniendo contexto de acceso:', error);
      return {
        accessibleHotels: [],
        accessibleOrganizations: [],
        highestLevel: 'department',
        effectivePermissions: user.permissions
      };
    }
  }
  
  // ======================
  // GESTIÓN DE TENANT ACTUAL
  // ======================
  
  async buildTenantContext(user: User, tenantType?: string, tenantId?: string): Promise<TenantContext> {
    try {
      const accessContext = await this.getUserAccessContext(user);
      const extendedContext = await this.resolveExtendedContext(accessContext);
      
      // Determinar tenant actual
      let currentTenant: TenantContext['currentTenant'];
      
      if (tenantType && tenantId) {
        // Tenant específico solicitado
        currentTenant = await this.resolveTenant(tenantType as any, tenantId);
        
        // Verificar que el usuario tiene acceso
        const hasAccess = await this.userHasAccessToTenant(user, tenantType as any, tenantId);
        if (!hasAccess) {
          throw new Error('Usuario no tiene acceso al tenant solicitado');
        }
      } else {
        // Determinar tenant por defecto según rol
        currentTenant = await this.getDefaultTenant(user, extendedContext);
      }
      
      // Obtener subscripción aplicable
      let subscription;
      if (currentTenant.type === 'organization') {
        const orgSubscriptions = await subscriptionService.getSubscriptionsByOrganization(currentTenant.id);
        subscription = orgSubscriptions.find(s => s.status === 'active');
      } else if (currentTenant.type === 'hotel') {
        subscription = await subscriptionService.getSubscriptionByHotel(currentTenant.id);
      }
      
      return {
        user,
        currentTenant,
        accessibleHotels: extendedContext.accessibleHotels,
        accessibleOrganizations: extendedContext.accessibleOrganizations,
        permissions: this.calculateEffectivePermissions(user, currentTenant),
        subscription
      };
    } catch (error) {
      console.error('Error construyendo contexto de tenant:', error);
      throw error;
    }
  }
  
  private async resolveExtendedContext(accessContext: UserAccessContext): Promise<ExtendedAccessContext> {
    const accessibleHotels: HotelListItem[] = [];
    const accessibleOrganizations: Organization[] = [];
    
    // Resolver hoteles
    for (const hotelId of accessContext.accessibleHotels) {
      const hotel = await this.getHotelListItem(hotelId);
      if (hotel) {
        accessibleHotels.push(hotel);
      }
    }
    
    // Resolver organizaciones
    for (const orgId of accessContext.accessibleOrganizations) {
      try {
        const org = await organizationService.getOrganization(orgId);
        accessibleOrganizations.push(org);
      } catch (error) {
        console.warn(`Error obteniendo organización ${orgId}:`, error);
      }
    }
    
    return {
      accessibleHotels,
      accessibleOrganizations,
      highestLevel: accessContext.highestLevel,
      effectivePermissions: accessContext.effectivePermissions
    };
  }
  
  private async resolveTenant(type: 'platform' | 'organization' | 'hotel', id: string): Promise<TenantContext['currentTenant']> {
    switch (type) {
      case 'platform':
        return {
          type: 'platform',
          id: 'platform',
          name: 'Plataforma QMS+Hotel'
        };
        
      case 'organization':
        const org = await organizationService.getOrganization(id);
        return {
          type: 'organization',
          id: org.id,
          name: org.name,
          data: org
        };
        
      case 'hotel':
        const hotelRef = doc(db, 'hotels', id);
        const hotelSnap = await getDoc(hotelRef);
        if (!hotelSnap.exists()) {
          throw new Error('Hotel no encontrado');
        }
        const hotel = { id: hotelSnap.id, ...hotelSnap.data() } as Hotel;
        return {
          type: 'hotel',
          id: hotel.id,
          name: hotel.name,
          data: hotel
        };
        
      default:
        throw new Error('Tipo de tenant no válido');
    }
  }
  
  private async getDefaultTenant(user: User, accessContext: ExtendedAccessContext): Promise<TenantContext['currentTenant']> {
    switch (user.role) {
      case 'super_admin':
        return {
          type: 'platform',
          id: 'platform',
          name: 'Plataforma QMS+Hotel'
        };
        
      case 'chain_admin':
        if (accessContext.accessibleOrganizations.length > 0) {
          const org = accessContext.accessibleOrganizations[0];
          return {
            type: 'organization',
            id: org.id,
            name: org.name,
            data: org
          };
        }
        break;
        
      default:
        if (accessContext.accessibleHotels.length > 0) {
          const hotel = accessContext.accessibleHotels[0];
          return {
            type: 'hotel',
            id: hotel.id,
            name: hotel.name
          };
        }
        break;
    }
    
    throw new Error('No se pudo determinar tenant por defecto');
  }
  
  private calculateEffectivePermissions(user: User, tenant: TenantContext['currentTenant']): string[] {
    const basePermissions = Object.keys(user.permissions).filter(
      key => user.permissions[key as keyof typeof user.permissions]
    );
    
    // Agregar permisos específicos del contexto
    const contextPermissions: string[] = [];
    
    if (tenant.type === 'platform' && user.role === 'super_admin') {
      contextPermissions.push(
        'platform:manage',
        'organizations:manage',
        'hotels:manage',
        'subscriptions:manage',
        'analytics:global'
      );
    }
    
    if (tenant.type === 'organization' && ['super_admin', 'chain_admin'].includes(user.role)) {
      contextPermissions.push(
        'organizations:view',
        'hotels:manage',
        'analytics:organization'
      );
    }
    
    return [...new Set([...basePermissions, ...contextPermissions])];
  }
  
  // ======================
  // VERIFICACIÓN DE ACCESO
  // ======================
  
  async userHasAccessToTenant(user: User, tenantType: 'platform' | 'organization' | 'hotel', tenantId: string): Promise<boolean> {
    try {
      switch (tenantType) {
        case 'platform':
          return user.role === 'super_admin';
          
        case 'organization':
          if (user.role === 'super_admin') return true;
          if (user.organizationId === tenantId) return true;
          return await organizationService.isUserInOrganization(user.id, tenantId);
          
        case 'hotel':
          if (user.role === 'super_admin') return true;
          if (user.hotelId === tenantId) return true;
          
          // Verificar si el hotel pertenece a la organización del usuario
          if (user.organizationId) {
            const hotel = await this.getHotelListItem(tenantId);
            return hotel?.organizationId === user.organizationId;
          }
          
          return false;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Error verificando acceso a tenant:', error);
      return false;
    }
  }
  
  userHasPermission(context: TenantContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }
  
  userCanManageHotel(context: TenantContext, hotelId: string): boolean {
    // Super admin puede gestionar cualquier hotel
    if (context.user.role === 'super_admin') return true;
    
    // Chain admin puede gestionar hoteles de su organización
    if (context.user.role === 'chain_admin' && context.currentTenant.type === 'organization') {
      return context.accessibleHotels.some(h => h.id === hotelId);
    }
    
    // Hotel admin puede gestionar su propio hotel
    if (context.user.role === 'hotel_admin' && context.user.hotelId === hotelId) {
      return true;
    }
    
    return false;
  }
  
  userCanManageOrganization(context: TenantContext, organizationId: string): boolean {
    // Solo super admin y chain admin de la organización
    if (context.user.role === 'super_admin') return true;
    if (context.user.role === 'chain_admin' && context.user.organizationId === organizationId) {
      return true;
    }
    
    return false;
  }
  
  // ======================
  // NAVEGACIÓN Y SWITCH
  // ======================
  
  async getAvailableTenants(user: User): Promise<Array<{ type: string; id: string; name: string; description?: string }>> {
    try {
      const accessContext = await this.getUserAccessContext(user);
      const extendedContext = await this.resolveExtendedContext(accessContext);
      const tenants: Array<{ type: string; id: string; name: string; description?: string }> = [];
      
      // Plataforma (solo super admin)
      if (user.role === 'super_admin') {
        tenants.push({
          type: 'platform',
          id: 'platform',
          name: 'Plataforma',
          description: 'Gestión global de la plataforma'
        });
      }
      
      // Organizaciones
      extendedContext.accessibleOrganizations.forEach(org => {
        tenants.push({
          type: 'organization',
          id: org.id,
          name: org.name,
          description: `Cadena hotelera - ${org.totalHotels || 0} hoteles`
        });
      });
      
      // Hoteles
      extendedContext.accessibleHotels.forEach(hotel => {
        tenants.push({
          type: 'hotel',
          id: hotel.id,
          name: hotel.name,
          description: `Hotel ${hotel.classification.category} - ${hotel.location.city}`
        });
      });
      
      return tenants;
    } catch (error) {
      console.error('Error obteniendo tenants disponibles:', error);
      return [];
    }
  }
  
  async switchTenant(user: User, newTenantType: string, newTenantId: string): Promise<TenantContext> {
    const hasAccess = await this.userHasAccessToTenant(user, newTenantType as any, newTenantId);
    
    if (!hasAccess) {
      throw new Error('No tienes acceso a este tenant');
    }
    
    return await this.buildTenantContext(user, newTenantType, newTenantId);
  }
  
  // ======================
  // UTILIDADES PRIVADAS
  // ======================
  
  private async getAllOrganizations(): Promise<Organization[]> {
    try {
      return await organizationService.getOrganizations(1000); // Límite alto para super admin
    } catch (error) {
      console.error('Error obteniendo todas las organizaciones:', error);
      return [];
    }
  }
  
  private async getAllHotels(): Promise<HotelListItem[]> {
    try {
      const q = query(
        collection(db, 'hotels'),
        orderBy('createdAt', 'desc'),
        limit(1000)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => {
        const hotel = doc.data() as Hotel;
        return {
          id: doc.id,
          name: hotel.name,
          organizationId: hotel.organizationId,
          organizationName: undefined, // TODO: Resolver nombre de organización
          type: hotel.type,
          status: hotel.status,
          classification: hotel.classification,
          location: {
            city: hotel.address.city,
            country: hotel.address.country
          },
          statistics: {
            totalUsers: hotel.statistics?.totalUsers || 0,
            activeUsers: hotel.statistics?.activeUsers || 0,
            totalDocuments: hotel.statistics?.totalDocuments || 0,
            qualityScore: hotel.statistics?.qualityScore
          },
          lastActivity: hotel.updatedAt
        };
      });
    } catch (error) {
      console.error('Error obteniendo todos los hoteles:', error);
      return [];
    }
  }
  
  private async getHotelListItem(hotelId: string): Promise<HotelListItem | null> {
    try {
      const hotelRef = doc(db, 'hotels', hotelId);
      const hotelSnap = await getDoc(hotelRef);
      
      if (!hotelSnap.exists()) {
        return null;
      }
      
      const hotel = hotelSnap.data() as Hotel;
      return {
        id: hotelSnap.id,
        name: hotel.name,
        organizationId: hotel.organizationId,
        type: hotel.type,
        status: hotel.status,
        classification: hotel.classification,
        location: {
          city: hotel.address.city,
          country: hotel.address.country
        },
        statistics: {
          totalUsers: hotel.statistics?.totalUsers || 0,
          activeUsers: hotel.statistics?.activeUsers || 0,
          totalDocuments: hotel.statistics?.totalDocuments || 0,
          qualityScore: hotel.statistics?.qualityScore
        },
        lastActivity: hotel.updatedAt
      };
    } catch (error) {
      console.error('Error obteniendo item de hotel:', error);
      return null;
    }
  }
  
  // ======================
  // BÚSQUEDA CROSS-TENANT
  // ======================
  
  async searchAcrossTenants(user: User, searchQuery: string, entityTypes: string[] = ['hotels', 'organizations']): Promise<any[]> {
    try {
      const accessContext = await this.getUserAccessContext(user);
      const extendedContext = await this.resolveExtendedContext(accessContext);
      const results: any[] = [];
      
      // Búsqueda en hoteles accesibles
      if (entityTypes.includes('hotels')) {
        const matchingHotels = extendedContext.accessibleHotels.filter(hotel =>
          hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hotel.location.city.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        results.push(...matchingHotels.map(hotel => ({
          ...hotel,
          entityType: 'hotel'
        })));
      }
      
      // Búsqueda en organizaciones accesibles
      if (entityTypes.includes('organizations')) {
        const matchingOrganizations = extendedContext.accessibleOrganizations.filter(org =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        results.push(...matchingOrganizations.map(org => ({
          ...org,
          entityType: 'organization'
        })));
      }
      
      return results;
    } catch (error) {
      console.error('Error en búsqueda cross-tenant:', error);
      return [];
    }
  }
  
  // ======================
  // MIGRACIÓN Y COMPATIBILIDAD
  // ======================
  
  async migrateUserToMultiTenant(legacyUser: any): Promise<User> {
    try {
      // Convertir usuario legacy al nuevo formato multi-tenant
      const newUser: User = {
        ...legacyUser,
        role: legacyUser.role === 'admin' ? 'hotel_admin' : legacyUser.role,
        organizationId: undefined, // Los usuarios legacy no pertenecen a organizaciones
        hotelId: legacyUser.hotelId,
        invitedBy: undefined,
        preferences: legacyUser.preferences || {
          theme: 'system',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            inApp: true
          }
        }
      };
      
      return newUser;
    } catch (error) {
      console.error('Error migrando usuario a multi-tenant:', error);
      throw error;
    }
  }
}

export const tenantService = new TenantService();