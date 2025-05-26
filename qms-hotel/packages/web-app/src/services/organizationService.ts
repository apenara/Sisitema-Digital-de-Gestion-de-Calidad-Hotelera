import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Hotel,
  User,
  HotelListItem
} from '../../../shared/types';
import type {
  Organization,
  OrganizationSettings,
  OrganizationMetrics,
  OrganizationUser,
  OrganizationHotel,
  CreateOrganizationInput,
  UpdateOrganizationInput
} from '../../../shared/types/Organization';

class OrganizationService {
  private readonly organizationsCollection = 'organizations';
  private readonly orgUsersCollection = 'organization_users';
  private readonly orgHotelsCollection = 'organization_hotels';
  
  // ======================
  // CRUD DE ORGANIZACIONES
  // ======================
  
  async createOrganization(data: CreateOrganizationInput, createdBy: string): Promise<Organization> {
    try {
      const organizationData = {
        ...data,
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
          },
          ...data.settings
        },
        status: 'active' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy
      };
      
      const docRef = await addDoc(collection(db, this.organizationsCollection), organizationData);
      
      const docSnap = await getDoc(docRef);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data()?.createdAt?.toDate(),
        updatedAt: docSnap.data()?.updatedAt?.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error creando organización:', error);
      throw error;
    }
  }
  
  async getOrganization(id: string): Promise<Organization> {
    try {
      const docRef = doc(db, this.organizationsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Organización no encontrada');
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error obteniendo organización:', error);
      throw error;
    }
  }
  
  async updateOrganization(id: string, updates: UpdateOrganizationInput): Promise<Organization> {
    try {
      const docRef = doc(db, this.organizationsCollection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
      return await this.getOrganization(id);
    } catch (error) {
      console.error('Error actualizando organización:', error);
      throw error;
    }
  }
  
  async deleteOrganization(id: string): Promise<void> {
    try {
      // Verificar que no tenga hoteles activos
      const hotelsSnap = await getDocs(
        query(
          collection(db, this.orgHotelsCollection),
          where('organizationId', '==', id),
          where('status', '==', 'active')
        )
      );
      
      if (!hotelsSnap.empty) {
        throw new Error('No se puede eliminar la organización: tiene hoteles activos');
      }
      
      const batch = writeBatch(db);
      
      // Eliminar organización
      const orgRef = doc(db, this.organizationsCollection, id);
      batch.delete(orgRef);
      
      // Eliminar usuarios de la organización
      const usersSnap = await getDocs(
        query(
          collection(db, this.orgUsersCollection),
          where('organizationId', '==', id)
        )
      );
      
      usersSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Eliminar relaciones de hoteles inactivos
      const inactiveHotelsSnap = await getDocs(
        query(
          collection(db, this.orgHotelsCollection),
          where('organizationId', '==', id)
        )
      );
      
      inactiveHotelsSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error eliminando organización:', error);
      throw error;
    }
  }
  
  // ======================
  // LISTADO Y BÚSQUEDA
  // ======================
  
  async getOrganizations(limitCount: number = 50): Promise<Organization[]> {
    try {
      const q = query(
        collection(db, this.organizationsCollection),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Organization[];
    } catch (error) {
      console.error('Error obteniendo organizaciones:', error);
      throw error;
    }
  }
  
  async searchOrganizations(searchQuery: string): Promise<Organization[]> {
    try {
      // Firestore no soporta búsqueda de texto completo nativamente
      // Implementar búsqueda básica por nombre
      const q = query(
        collection(db, this.organizationsCollection),
        orderBy('name'),
        limit(50)
      );
      
      const querySnap = await getDocs(q);
      const allOrganizations = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Organization[];
      
      // Filtrar localmente
      return allOrganizations.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } catch (error) {
      console.error('Error buscando organizaciones:', error);
      throw error;
    }
  }
  
  // ======================
  // GESTIÓN DE USUARIOS
  // ======================
  
  async addUserToOrganization(
    organizationId: string,
    userId: string,
    role: OrganizationUser['role'],
    invitedBy: string
  ): Promise<OrganizationUser> {
    try {
      const userData: Omit<OrganizationUser, 'permissions'> = {
        userId,
        organizationId,
        role,
        joinedAt: Timestamp.now() as any,
        invitedBy,
        status: 'active'
      };
      
      // Definir permisos según el rol
      let permissions: string[] = [];
      switch (role) {
        case 'chain_admin':
          permissions = [
            'organizations:manage',
            'hotels:manage',
            'users:manage',
            'reports:view',
            'analytics:organization'
          ];
          break;
        case 'chain_manager':
          permissions = [
            'hotels:view',
            'users:view',
            'reports:view',
            'analytics:organization'
          ];
          break;
        case 'chain_analyst':
          permissions = [
            'reports:view',
            'analytics:organization'
          ];
          break;
      }
      
      const orgUserData = { ...userData, permissions };
      const docRef = await addDoc(collection(db, this.orgUsersCollection), orgUserData);
      
      const docSnap = await getDoc(docRef);
      return {
        ...docSnap.data(),
        joinedAt: docSnap.data()?.joinedAt?.toDate()
      } as OrganizationUser;
    } catch (error) {
      console.error('Error agregando usuario a organización:', error);
      throw error;
    }
  }
  
  async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.orgUsersCollection),
        where('organizationId', '==', organizationId),
        where('userId', '==', userId)
      );
      
      const querySnap = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error removiendo usuario de organización:', error);
      throw error;
    }
  }
  
  async getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
    try {
      const q = query(
        collection(db, this.orgUsersCollection),
        where('organizationId', '==', organizationId),
        where('status', '==', 'active')
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate()
      })) as OrganizationUser[];
    } catch (error) {
      console.error('Error obteniendo usuarios de organización:', error);
      throw error;
    }
  }
  
  async updateUserRole(
    organizationId: string,
    userId: string,
    newRole: OrganizationUser['role']
  ): Promise<void> {
    try {
      const q = query(
        collection(db, this.orgUsersCollection),
        where('organizationId', '==', organizationId),
        where('userId', '==', userId)
      );
      
      const querySnap = await getDocs(q);
      
      if (querySnap.empty) {
        throw new Error('Usuario no encontrado en la organización');
      }
      
      const userDoc = querySnap.docs[0];
      
      // Actualizar permisos según el nuevo rol
      let permissions: string[] = [];
      switch (newRole) {
        case 'chain_admin':
          permissions = [
            'organizations:manage',
            'hotels:manage',
            'users:manage',
            'reports:view',
            'analytics:organization'
          ];
          break;
        case 'chain_manager':
          permissions = [
            'hotels:view',
            'users:view',
            'reports:view',
            'analytics:organization'
          ];
          break;
        case 'chain_analyst':
          permissions = [
            'reports:view',
            'analytics:organization'
          ];
          break;
      }
      
      await updateDoc(userDoc.ref, {
        role: newRole,
        permissions
      });
    } catch (error) {
      console.error('Error actualizando rol de usuario:', error);
      throw error;
    }
  }
  
  // ======================
  // GESTIÓN DE HOTELES
  // ======================
  
  async addHotelToOrganization(
    organizationId: string,
    hotelId: string,
    addedBy: string
  ): Promise<OrganizationHotel> {
    try {
      const hotelData: OrganizationHotel = {
        hotelId,
        organizationId,
        addedAt: Timestamp.now() as any,
        addedBy,
        status: 'active'
      };
      
      const docRef = await addDoc(collection(db, this.orgHotelsCollection), hotelData);
      
      // Actualizar el hotel para que pertenezca a la organización
      const hotelRef = doc(db, 'hotels', hotelId);
      await updateDoc(hotelRef, {
        organizationId,
        type: 'chain_member',
        updatedAt: Timestamp.now()
      });
      
      const docSnap = await getDoc(docRef);
      return {
        ...docSnap.data(),
        addedAt: docSnap.data()?.addedAt?.toDate()
      } as OrganizationHotel;
    } catch (error) {
      console.error('Error agregando hotel a organización:', error);
      throw error;
    }
  }
  
  async removeHotelFromOrganization(organizationId: string, hotelId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.orgHotelsCollection),
        where('organizationId', '==', organizationId),
        where('hotelId', '==', hotelId)
      );
      
      const querySnap = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Actualizar el hotel para que sea independiente
      const hotelRef = doc(db, 'hotels', hotelId);
      batch.update(hotelRef, {
        organizationId: null,
        type: 'independent',
        updatedAt: Timestamp.now()
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error removiendo hotel de organización:', error);
      throw error;
    }
  }
  
  async getOrganizationHotels(organizationId: string): Promise<HotelListItem[]> {
    try {
      // Obtener relaciones de hoteles
      const hotelsRelationQuery = query(
        collection(db, this.orgHotelsCollection),
        where('organizationId', '==', organizationId),
        where('status', '==', 'active')
      );
      
      const hotelsRelationSnap = await getDocs(hotelsRelationQuery);
      const hotelIds = hotelsRelationSnap.docs.map(doc => doc.data().hotelId);
      
      if (hotelIds.length === 0) {
        return [];
      }
      
      // Obtener datos de los hoteles
      // Nota: Firestore no soporta queries con array muy grande en 'in'
      // En producción, implementar paginación o usar subconsultas
      const hotelsData: HotelListItem[] = [];
      
      for (const hotelId of hotelIds) {
        try {
          const hotelRef = doc(db, 'hotels', hotelId);
          const hotelSnap = await getDoc(hotelRef);
          
          if (hotelSnap.exists()) {
            const hotel = hotelSnap.data() as Hotel;
            
            const hotelItem: HotelListItem = {
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
            
            hotelsData.push(hotelItem);
          }
        } catch (error) {
          console.warn(`Error obteniendo hotel ${hotelId}:`, error);
        }
      }
      
      return hotelsData;
    } catch (error) {
      console.error('Error obteniendo hoteles de organización:', error);
      throw error;
    }
  }
  
  // ======================
  // MÉTRICAS Y ESTADÍSTICAS
  // ======================
  
  async getOrganizationMetrics(organizationId: string): Promise<OrganizationMetrics> {
    try {
      const [hotels, users] = await Promise.all([
        this.getOrganizationHotels(organizationId),
        this.getOrganizationUsers(organizationId)
      ]);
      
      const activeHotels = hotels.filter(h => h.status === 'active');
      
      // Calcular métricas agregadas
      const totalDocuments = hotels.reduce((sum, hotel) => sum + hotel.statistics.totalDocuments, 0);
      const totalNonConformities = 0; // TODO: Implementar cálculo real
      const qualityScores = hotels
        .map(h => h.statistics.qualityScore)
        .filter(score => score !== undefined) as number[];
      
      const averageQualityScore = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;
      
      return {
        organizationId,
        totalHotels: hotels.length,
        totalUsers: users.length,
        activeHotels: activeHotels.length,
        totalDocuments,
        totalNonConformities,
        averageQualityScore,
        monthlyMetrics: {
          documentsCreated: 0, // TODO: Implementar cálculo real
          nonConformitiesResolved: 0,
          newUsers: 0,
          newHotels: 0
        },
        calculatedAt: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo métricas de organización:', error);
      throw error;
    }
  }
  
  // ======================
  // UTILIDADES
  // ======================
  
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    try {
      const q = query(
        collection(db, this.orgUsersCollection),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      
      const querySnap = await getDocs(q);
      const organizationIds = querySnap.docs.map(doc => doc.data().organizationId);
      
      if (organizationIds.length === 0) {
        return [];
      }
      
      const organizations: Organization[] = [];
      
      for (const orgId of organizationIds) {
        try {
          const organization = await this.getOrganization(orgId);
          organizations.push(organization);
        } catch (error) {
          console.warn(`Error obteniendo organización ${orgId}:`, error);
        }
      }
      
      return organizations;
    } catch (error) {
      console.error('Error obteniendo organizaciones del usuario:', error);
      throw error;
    }
  }
  
  async isUserInOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.orgUsersCollection),
        where('userId', '==', userId),
        where('organizationId', '==', organizationId),
        where('status', '==', 'active')
      );
      
      const querySnap = await getDocs(q);
      return !querySnap.empty;
    } catch (error) {
      console.error('Error verificando pertenencia a organización:', error);
      return false;
    }
  }
  
  async getUserRoleInOrganization(userId: string, organizationId: string): Promise<OrganizationUser['role'] | null> {
    try {
      const q = query(
        collection(db, this.orgUsersCollection),
        where('userId', '==', userId),
        where('organizationId', '==', organizationId),
        where('status', '==', 'active')
      );
      
      const querySnap = await getDocs(q);
      
      if (querySnap.empty) {
        return null;
      }
      
      return querySnap.docs[0].data().role as OrganizationUser['role'];
    } catch (error) {
      console.error('Error obteniendo rol en organización:', error);
      return null;
    }
  }
}

export const organizationService = new OrganizationService();