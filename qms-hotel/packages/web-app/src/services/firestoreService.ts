import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import type {
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PaginatedResponse } from '../../../shared/types';

export interface FirestoreQueryOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  filters?: Array<{
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }>;
}

class FirestoreService {
  /**
   * Crear un documento con ID automático
   */
  async create<T>(collectionPath: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Crear un documento con ID específico
   */
  async createWithId<T>(collectionPath: string, id: string, data: Omit<T, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, id);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error creating document with ID in ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Obtener un documento por ID
   */
  async getById<T>(collectionPath: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar un documento
   */
  async update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un documento
   */
  async delete(collectionPath: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Obtener documentos con opciones de consulta
   */
  async getMany<T>(
    collectionPath: string,
    options?: FirestoreQueryOptions
  ): Promise<T[]> {
    try {
      const constraints = this.buildQueryConstraints(options);
      const q = query(collection(db, collectionPath), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as T;
      });
    } catch (error) {
      console.error(`Error getting documents from ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Obtener documentos con paginación
   */
  async getManyPaginated<T>(
    collectionPath: string,
    page: number,
    pageSize: number,
    options?: FirestoreQueryOptions
  ): Promise<PaginatedResponse<T>> {
    try {
      const constraints = this.buildQueryConstraints({
        ...options,
        limitCount: pageSize
      });
      
      const q = query(collection(db, collectionPath), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate(),
          updatedAt: docData.updatedAt?.toDate()
        } as T;
      });

      return {
        data,
        total: data.length, // En una implementación real, necesitarías contar el total
        page,
        limit: pageSize,
        hasMore: data.length === pageSize
      };
    } catch (error) {
      console.error(`Error getting paginated documents from ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToDocument<T>(
    collectionPath: string,
    id: string,
    callback: (data: T | null) => void
  ): () => void {
    const docRef = doc(db, collectionPath, id);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as T);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Suscribirse a una colección en tiempo real
   */
  subscribeToCollection<T>(
    collectionPath: string,
    callback: (data: T[]) => void,
    options?: FirestoreQueryOptions
  ): () => void {
    const constraints = this.buildQueryConstraints(options);
    const q = query(collection(db, collectionPath), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate(),
          updatedAt: docData.updatedAt?.toDate()
        } as T;
      });
      callback(data);
    });
  }

  /**
   * Construir restricciones de consulta
   */
  private buildQueryConstraints(options?: FirestoreQueryOptions): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    
    if (options?.filters) {
      options.filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
    }
    
    if (options?.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    if (options?.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }
    
    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    return constraints;
  }

  /**
   * Verificar si un documento existe
   */
  async exists(collectionPath: string, id: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking document existence in ${collectionPath}:`, error);
      return false;
    }
  }

  /**
   * Contar documentos (aproximado)
   */
  async count(collectionPath: string, options?: FirestoreQueryOptions): Promise<number> {
    try {
      const data = await this.getMany(collectionPath, options);
      return data.length;
    } catch (error) {
      console.error(`Error counting documents in ${collectionPath}:`, error);
      return 0;
    }
  }
}

export const firestoreService = new FirestoreService();