import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { firestoreService } from './firestoreService';
import type { Department, CreateHotelData, UpdateHotelData, CreateDepartmentData, UpdateDepartmentData } from '../../../shared/types';

export interface Hotel {
  id: string;
  name: string;
  organizationId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  status: 'active' | 'inactive' | 'pending';
  stars: number;
  rooms: number;
  type: 'independent' | 'chain_member';
  settings: {
    timezone: string;
    currency: string;
    language: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
    branding: {
      theme: {
        primaryColor: string;
        secondaryColor: string;
      };
    };
    features: {
      documentsEnabled: boolean;
      nonConformitiesEnabled: boolean;
      auditsEnabled: boolean;
      reportsEnabled: boolean;
      analyticsEnabled: boolean;
      notificationsEnabled: boolean;
    };
    notifications: {
      emailAlerts: boolean;
      pushNotifications: boolean;
    };
    quality: {
      defaultProcesses: string[];
      auditFrequency: 'monthly' | 'quarterly' | 'yearly';
      complianceStandards: string[];
      qualityObjectives: string[];
    };
    integrations: Record<string, any>;
  };
  departments: string[];
  isActive: boolean;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: string;
  createdAt: string;
  updatedAt: string;
}

class HotelService {
  private readonly collectionName = 'hotels';
  private readonly HOTELS_COLLECTION = 'hotels';
  private readonly DEPARTMENTS_COLLECTION = 'departments';

  async getAll(): Promise<Hotel[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Hotel));
    } catch (error) {
      console.error('Error al obtener hoteles:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Hotel | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Hotel;
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener hotel:', error);
      throw error;
    }
  }

  async getByOrganization(organizationId: string): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('organizationId', '==', organizationId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Hotel));
    } catch (error) {
      console.error('Error al obtener hoteles de la organización:', error);
      throw error;
    }
  }

  async create(data: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> {
    try {
      const now = new Date().toISOString();
      const newData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.collectionName), newData);
      return {
        id: docRef.id,
        ...newData
      } as Hotel;
    } catch (error) {
      console.error('Error al crear hotel:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error al actualizar hotel:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar hotel:', error);
      throw error;
    }
  }

  async getByStatus(status: Hotel['status']): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Hotel));
    } catch (error) {
      console.error('Error al obtener hoteles por estado:', error);
      throw error;
    }
  }

  async getByCity(city: string): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('address.city', '==', city)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Hotel));
    } catch (error) {
      console.error('Error al obtener hoteles por ciudad:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo hotel
   */
  async createHotel(data: CreateHotelData, ownerId: string): Promise<string> {
    try {
      const hotelData = {
        ...data,
        departments: [],
        isActive: true,
        status: 'active' as const,
        subscriptionPlan: 'basic' as const,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          timezone: 'America/Bogota',
          currency: 'COP',
          language: 'es' as const,
          theme: {
            primaryColor: '#006A6B',
            secondaryColor: '#4A6363'
          },
          branding: {
            theme: {
              primaryColor: '#006A6B',
              secondaryColor: '#4A6363'
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
            defaultProcesses: [],
            auditFrequency: 'monthly' as const,
            complianceStandards: [],
            qualityObjectives: []
          },
          integrations: {},
          ...data.settings
        }
      };

      const hotelId = await firestoreService.create<Hotel>(this.HOTELS_COLLECTION, hotelData);

      // Crear departamentos iniciales
      if (data.departments && data.departments.length > 0) {
        for (const deptData of data.departments) {
          await this.createDepartment(hotelId, {
            ...deptData,
            processes: deptData.processes || []
          });
        }
      }

      return hotelId;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  }

  /**
   * Obtener hotel por ID
   */
  async getHotelById(hotelId: string): Promise<Hotel | null> {
    try {
      const hotel = await firestoreService.getById<Hotel>(this.HOTELS_COLLECTION, hotelId);
      
      if (hotel) {
        // Cargar departamentos
        const departments = await this.getDepartmentsByHotel(hotelId);
        hotel.departments = departments;
      }

      return hotel;
    } catch (error) {
      console.error('Error getting hotel:', error);
      throw error;
    }
  }

  /**
   * Actualizar hotel
   */
  async updateHotel(hotelId: string, data: UpdateHotelData): Promise<void> {
    try {
      await firestoreService.update(this.HOTELS_COLLECTION, hotelId, data as any);
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  }

  /**
   * Obtener hoteles por propietario
   */
  async getHotelsByOwner(ownerId: string): Promise<Hotel[]> {
    try {
      return await firestoreService.getMany<Hotel>(this.HOTELS_COLLECTION, {
        filters: [
          { field: 'ownerId', operator: '==', value: ownerId },
          { field: 'isActive', operator: '==', value: true }
        ],
        orderByField: 'name',
        orderDirection: 'asc'
      });
    } catch (error) {
      console.error('Error getting hotels by owner:', error);
      throw error;
    }
  }

  /**
   * Crear departamento
   */
  async createDepartment(hotelId: string, data: CreateDepartmentData): Promise<string> {
    try {
      const departmentData: Omit<Department, 'id'> = {
        ...data,
        processes: data.processes || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const departmentId = await firestoreService.create<Department>(
        `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentData
      );

      return departmentId;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  /**
   * Obtener departamento por ID
   */
  async getDepartmentById(hotelId: string, departmentId: string): Promise<Department | null> {
    try {
      return await firestoreService.getById<Department>(
        `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentId
      );
    } catch (error) {
      console.error('Error getting department:', error);
      throw error;
    }
  }

  /**
   * Actualizar departamento
   */
  async updateDepartment(hotelId: string, departmentId: string, data: UpdateDepartmentData): Promise<void> {
    try {
      await firestoreService.update<Department>(
        `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentId,
        data
      );
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  /**
   * Eliminar departamento
   */
  async deleteDepartment(hotelId: string, departmentId: string): Promise<void> {
    try {
      await firestoreService.update<Department>(
        `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentId,
        { isActive: false }
      );
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  /**
   * Obtener departamentos de un hotel
   */
  async getDepartmentsByHotel(hotelId: string): Promise<Department[]> {
    try {
      return await firestoreService.getMany<Department>(
        `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        {
          filters: [
            { field: 'isActive', operator: '==', value: true }
          ],
          orderByField: 'name',
          orderDirection: 'asc'
        }
      );
    } catch (error) {
      console.error('Error getting departments by hotel:', error);
      throw error;
    }
  }

  /**
   * Obtener departamentos activos de un hotel
   */
  async getActiveDepartments(hotelId: string): Promise<Department[]> {
    try {
      return await firestoreService.getMany<Department>(
        `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        {
          filters: [
            { field: 'isActive', operator: '==', value: true }
          ],
          orderByField: 'name',
          orderDirection: 'asc'
        }
      );
    } catch (error) {
      console.error('Error getting active departments:', error);
      throw error;
    }
  }

  /**
   * Buscar departamentos por nombre
   */
  async searchDepartments(hotelId: string, searchTerm: string): Promise<Department[]> {
    try {
      const departments = await this.getDepartmentsByHotel(hotelId);
      return departments.filter(dept => 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching departments:', error);
      throw error;
    }
  }

  /**
   * Verificar si un hotel está activo
   */
  async isHotelActive(hotelId: string): Promise<boolean> {
    try {
      const hotel = await this.getHotelById(hotelId);
      return hotel?.isActive || false;
    } catch (error) {
      console.error('Error checking hotel status:', error);
      return false;
    }
  }

  /**
   * Verificar si la suscripción del hotel está vigente
   */
  async isSubscriptionActive(hotelId: string): Promise<boolean> {
    try {
      const hotel = await this.getHotelById(hotelId);
      if (!hotel) return false;
      
      return hotel.subscriptionId ? true : false; // TODO: verificar subscripción real
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Suscribirse a cambios del hotel
   */
  subscribeToHotel(hotelId: string, callback: (hotel: Hotel | null) => void): () => void {
    return firestoreService.subscribeToDocument<Hotel>(this.HOTELS_COLLECTION, hotelId, callback);
  }

  /**
   * Suscribirse a cambios de departamentos
   */
  subscribeToDepartments(hotelId: string, callback: (departments: Department[]) => void): () => void {
    return firestoreService.subscribeToCollection<Department>(
      `${this.HOTELS_COLLECTION}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
      callback,
      {
        filters: [
          { field: 'isActive', operator: '==', value: true }
        ],
        orderByField: 'name',
        orderDirection: 'asc'
      }
    );
  }
}

export const hotelService = new HotelService();