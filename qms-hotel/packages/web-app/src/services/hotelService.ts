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
import { db } from '../config/firebase';
import { firestoreService } from './firestoreService';
import type {
  Department,
  CreateHotelData,
  UpdateHotelData,
  CreateDepartmentData,
  UpdateDepartmentData,
  Hotel,
  CreateHotelInput,
  UpdateHotelInput
} from '../../../shared/types/Hotel';

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
  private readonly hotelsCollection = 'hotels';
  private readonly hotelUsersCollection = 'hotel_users';
  private readonly hotelDocumentsCollection = 'hotel_documents';
  private readonly DEPARTMENTS_COLLECTION = 'departments';

  async getAll(): Promise<Hotel[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.hotelsCollection));
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
      const docRef = doc(db, this.hotelsCollection, id);
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
        collection(db, this.hotelsCollection),
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

      const docRef = await addDoc(collection(db, this.hotelsCollection), newData);
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
      const docRef = doc(db, this.hotelsCollection, id);
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
      const docRef = doc(db, this.hotelsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar hotel:', error);
      throw error;
    }
  }

  async getByStatus(status: Hotel['status']): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.hotelsCollection),
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
        collection(db, this.hotelsCollection),
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

  async createHotel(data: CreateHotelInput, createdBy: string): Promise<Hotel> {
    try {
      const hotelData = {
        ...data,
        status: 'active' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy,
        statistics: {
          totalUsers: 0,
          activeUsers: 0,
          totalDocuments: 0,
          qualityScore: 0
        }
      };

      const docRef = await addDoc(collection(db, this.hotelsCollection), hotelData);
      const docSnap = await getDoc(docRef);

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data()?.createdAt?.toDate(),
        updatedAt: docSnap.data()?.updatedAt?.toDate()
      } as Hotel;
    } catch (error) {
      console.error('Error creando hotel:', error);
      throw error;
    }
  }

  async getHotel(id: string): Promise<Hotel> {
    try {
      const docRef = doc(db, this.hotelsCollection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Hotel no encontrado');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Hotel;
    } catch (error) {
      console.error('Error obteniendo hotel:', error);
      throw error;
    }
  }

  async updateHotel(id: string, updates: UpdateHotelInput): Promise<Hotel> {
    try {
      const docRef = doc(db, this.hotelsCollection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
      return await this.getHotel(id);
    } catch (error) {
      console.error('Error actualizando hotel:', error);
      throw error;
    }
  }

  async deleteHotel(id: string): Promise<void> {
    try {
      // Verificar que no tenga usuarios activos
      const usersSnap = await getDocs(
        query(
          collection(db, this.hotelUsersCollection),
          where('hotelId', '==', id),
          where('status', '==', 'active')
        )
      );

      if (!usersSnap.empty) {
        throw new Error('No se puede eliminar el hotel: tiene usuarios activos');
      }

      const batch = writeBatch(db);

      // Eliminar hotel
      const hotelRef = doc(db, this.hotelsCollection, id);
      batch.delete(hotelRef);

      // Eliminar usuarios del hotel
      const usersQuery = query(
        collection(db, this.hotelUsersCollection),
        where('hotelId', '==', id)
      );
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Eliminar documentos del hotel
      const documentsQuery = query(
        collection(db, this.hotelDocumentsCollection),
        where('hotelId', '==', id)
      );
      const documentsSnapshot = await getDocs(documentsQuery);
      documentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error eliminando hotel:', error);
      throw error;
    }
  }

  async getHotels(limitCount: number = 50): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.hotelsCollection),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Hotel[];
    } catch (error) {
      console.error('Error obteniendo hoteles:', error);
      throw error;
    }
  }

  async getHotelsByOrganization(organizationId: string): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.hotelsCollection),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );

      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Hotel[];
    } catch (error) {
      console.error('Error obteniendo hoteles de la organización:', error);
      throw error;
    }
  }

  async searchHotels(searchQuery: string): Promise<Hotel[]> {
    try {
      const q = query(
        collection(db, this.hotelsCollection),
        orderBy('name'),
        limit(50)
      );

      const querySnap = await getDocs(q);
      const allHotels = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Hotel[];

      return allHotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.address.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } catch (error) {
      console.error('Error buscando hoteles:', error);
      throw error;
    }
  }

  async addUserToHotel(
    hotelId: string,
    userId: string,
    role: 'hotel_admin' | 'hotel_manager' | 'hotel_staff',
    addedBy: string
  ): Promise<void> {
    try {
      const userData = {
        hotelId,
        userId,
        role,
        addedAt: Timestamp.now(),
        addedBy,
        status: 'active'
      };

      await addDoc(collection(db, this.hotelUsersCollection), userData);

      // Actualizar estadísticas del hotel
      const hotelRef = doc(db, this.hotelsCollection, hotelId);
      const hotelSnap = await getDoc(hotelRef);
      const hotelData = hotelSnap.data();

      await updateDoc(hotelRef, {
        'statistics.totalUsers': (hotelData?.statistics?.totalUsers || 0) + 1,
        'statistics.activeUsers': (hotelData?.statistics?.activeUsers || 0) + 1,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error agregando usuario al hotel:', error);
      throw error;
    }
  }

  async removeUserFromHotel(hotelId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.hotelUsersCollection),
        where('hotelId', '==', hotelId),
        where('userId', '==', userId)
      );

      const querySnap = await getDocs(q);
      const batch = writeBatch(db);

      querySnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Actualizar estadísticas del hotel
      const hotelRef = doc(db, this.hotelsCollection, hotelId);
      const hotelSnap = await getDoc(hotelRef);
      const hotelData = hotelSnap.data();

      await updateDoc(hotelRef, {
        'statistics.totalUsers': Math.max(0, (hotelData?.statistics?.totalUsers || 0) - 1),
        'statistics.activeUsers': Math.max(0, (hotelData?.statistics?.activeUsers || 0) - 1),
        updatedAt: Timestamp.now()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error removiendo usuario del hotel:', error);
      throw error;
    }
  }

  async getHotelMetrics(hotelId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalDocuments: number;
    qualityScore: number;
    lastActivity: Date;
  }> {
    try {
      const hotel = await this.getHotel(hotelId);
      return {
        ...hotel.statistics,
        lastActivity: hotel.updatedAt
      };
    } catch (error) {
      console.error('Error obteniendo métricas del hotel:', error);
      throw error;
    }
  }

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
        `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentData
      );

      return departmentId;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  async getDepartmentById(hotelId: string, departmentId: string): Promise<Department | null> {
    try {
      return await firestoreService.getById<Department>(
        `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentId
      );
    } catch (error) {
      console.error('Error getting department:', error);
      throw error;
    }
  }

  async updateDepartment(hotelId: string, departmentId: string, data: UpdateDepartmentData): Promise<void> {
    try {
      await firestoreService.update<Department>(
        `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentId,
        data
      );
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(hotelId: string, departmentId: string): Promise<void> {
    try {
      await firestoreService.update<Department>(
        `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
        departmentId,
        { isActive: false }
      );
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  async getDepartmentsByHotel(hotelId: string): Promise<Department[]> {
    try {
      return await firestoreService.getMany<Department>(
        `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
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

  async getActiveDepartments(hotelId: string): Promise<Department[]> {
    try {
      return await firestoreService.getMany<Department>(
        `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
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

  async isHotelActive(hotelId: string): Promise<boolean> {
    try {
      const hotel = await this.getHotel(hotelId);
      return hotel?.isActive || false;
    } catch (error) {
      console.error('Error checking hotel status:', error);
      return false;
    }
  }

  async isSubscriptionActive(hotelId: string): Promise<boolean> {
    try {
      const hotel = await this.getHotel(hotelId);
      if (!hotel) return false;
      
      return hotel.subscriptionId ? true : false; // TODO: verificar subscripción real
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  subscribeToHotel(hotelId: string, callback: (hotel: Hotel | null) => void): () => void {
    return firestoreService.subscribeToDocument<Hotel>(this.hotelsCollection, hotelId, callback);
  }

  subscribeToDepartments(hotelId: string, callback: (departments: Department[]) => void): () => void {
    return firestoreService.subscribeToCollection<Department>(
      `${this.hotelsCollection}/${hotelId}/${this.DEPARTMENTS_COLLECTION}`,
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