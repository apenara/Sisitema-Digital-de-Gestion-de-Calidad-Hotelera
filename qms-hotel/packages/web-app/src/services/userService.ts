import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, CreateUserData, UpdateUserData, UserPermissions } from '../../../shared/types';
import { ROLE_PERMISSIONS } from '../../../shared/types/User';

class UserService {
  private readonly COLLECTION = 'users';

  /**
   * Crear un nuevo usuario en Firestore
   */
  async createUser(userData: User): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userData.id);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: userDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, this.COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        return {
          ...data,
          id: userDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Actualizar última fecha de login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios de un hotel
   */
  async getUsersByHotel(hotelId: string): Promise<User[]> {
    try {
      const usersRef = collection(db, this.COLLECTION);
      const q = query(
        usersRef, 
        where('hotelId', '==', hotelId),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as User;
      });
    } catch (error) {
      console.error('Error getting users by hotel:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios de un departamento
   */
  async getUsersByDepartment(hotelId: string, departmentId: string): Promise<User[]> {
    try {
      const usersRef = collection(db, this.COLLECTION);
      const q = query(
        usersRef,
        where('hotelId', '==', hotelId),
        where('departmentIds', 'array-contains', departmentId),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as User;
      });
    } catch (error) {
      console.error('Error getting users by department:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(user: User, permission: keyof UserPermissions): boolean {
    return user.permissions[permission] || false;
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos especificados
   */
  hasAnyPermission(user: User, permissions: (keyof UserPermissions)[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   */
  hasAllPermissions(user: User, permissions: (keyof UserPermissions)[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Actualizar permisos del usuario según su rol
   */
  async updateUserPermissions(userId: string, role: User['role']): Promise<void> {
    try {
      const permissions = ROLE_PERMISSIONS[role].reduce((acc, permission) => {
        acc[permission] = true;
        return acc;
      }, {} as UserPermissions);

      // Inicializar todos los permisos como false primero
      const allPermissions: UserPermissions = {
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
        'audits:manage': false
      };

      // Activar solo los permisos del rol
      const finalPermissions = { ...allPermissions, ...permissions };

      await this.updateUser(userId, {
        role,
        permissions: finalPermissions
      });
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  /**
   * Activar/desactivar usuario
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      await this.updateUser(userId, { isActive });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }
}

export const userService = new UserService();