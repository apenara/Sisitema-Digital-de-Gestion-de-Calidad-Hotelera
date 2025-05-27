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

// Manages user data. Users are primarily stored in the 'users' collection.
// Super admin users may also have records in the 'platform_users' collection,
// which is checked by certain methods (getUserById, updateLastLogin, updateUser, getUserByEmail).
// Creation of super admins in 'platform_users' is assumed to be handled manually or via separate admin tooling.
class UserService {
  private readonly COLLECTION = 'users';
  private readonly PLATFORM_USERS_COLLECTION = 'platform_users';

  /**
   * Crear un nuevo usuario en Firestore.
   * Operates only on the 'users' collection.
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
      // Primero buscar en la colección regular de usuarios
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
      
      // Si no se encuentra, buscar en platform_users (para super admins)
      const platformUserRef = doc(db, 'platform_users', userId);
      const platformUserDoc = await getDoc(platformUserRef);
      
      if (platformUserDoc.exists()) {
        const data = platformUserDoc.data();
        return {
          ...data,
          id: platformUserDoc.id,
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
      // Primero buscar en platform_users
      const platformUsersRef = collection(db, this.PLATFORM_USERS_COLLECTION);
      const platformQ = query(platformUsersRef, where('email', '==', email));
      const platformQuerySnapshot = await getDocs(platformQ);

      if (!platformQuerySnapshot.empty) {
        const userDoc = platformQuerySnapshot.docs[0];
        const data = userDoc.data();
        return {
          ...data,
          id: userDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as User;
      }

      // Si no se encuentra, buscar en la colección regular de usuarios
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
      console.error('Error getting user by email from either collection:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario.
   * Attempts to update in 'platform_users' first, then in 'users'.
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<void> {
    let platformError: any = null;
    try {
      const platformUserRef = doc(db, this.PLATFORM_USERS_COLLECTION, userId);
      await updateDoc(platformUserRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      // If successful, assume this was the intended user (super admin) and return.
      return;
    } catch (error: any) {
      // If the document does not exist in platform_users, updateDoc will throw an error.
      // We'll catch it and then try the regular users collection.
      platformError = error;
    }

    // If platform update failed, try regular users collection.
    // This block will be executed if platformError is not null.
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (userError) {
      // If both attempts fail, log both errors and throw the error from the second attempt.
      console.error('Error updating user in both platform_users and users collections:', { platformError, userError });
      throw userError; 
    }
  }

  /**
   * Actualizar última fecha de login
   */
  async updateLastLogin(userId: string): Promise<void> {
    let platformError: any = null;
    try {
      // Intentar actualizar en platform_users primero (para super admins)
      const platformUserRef = doc(db, 'platform_users', userId);
      await updateDoc(platformUserRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      // Si tiene éxito, no necesitamos hacer nada más.
      return;
    } catch (error) {
      platformError = error;
    }

    // Si la actualización de platform_users falló, intentar en la colección regular de users
    if (platformError) {
      try {
        const userRef = doc(db, this.COLLECTION, userId);
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (userError) {
        // Si ambas actualizaciones fallan, lanzar el error de la segunda actualización (o un error combinado)
        console.warn('Failed to update last login time in platform_users, then in users:', { platformError, userError });
        throw userError; // Propagar el error si ambas fallan
      }
    }
  }

  /**
   * Obtener usuarios de un hotel.
   * Operates only on the 'users' collection.
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
   * Obtener usuarios de un departamento.
   * Operates only on the 'users' collection.
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
   * Actualizar permisos del usuario según su rol.
   * This method uses updateUser, which now handles dual collections.
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
        'audits:manage': false,
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
   * Activar/desactivar usuario.
   * This method uses updateUser, which now handles dual collections.
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