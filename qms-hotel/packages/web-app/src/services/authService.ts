import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { LoginCredentials, RegisterCredentials } from '../../../shared/types';
import type { AuthError } from '../../../shared/types/Auth';
import { userService } from './userService';
import { ROLE_PERMISSIONS } from '../../../shared/types/User';

class AuthService {
  /**
   * Iniciar sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      // Actualizar última fecha de login
      await userService.updateLastLogin(userCredential.user.uid);
      
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(credentials: RegisterCredentials): Promise<FirebaseUser> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Actualizar perfil con displayName
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName
      });

      // Crear documento de usuario en Firestore
      const permissions = ROLE_PERMISSIONS[credentials.role].reduce((acc, permission) => {
        acc[permission] = true;
        return acc;
      }, {} as any);

      await userService.createUser({
        id: userCredential.user.uid,
        email: credentials.email,
        displayName: credentials.displayName,
        role: credentials.role,
        hotelId: credentials.hotelId,
        departmentIds: credentials.departmentIds,
        isActive: true,
        permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'light',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            inApp: true
          }
        }
      });

      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Obtener token de autenticación
   */
  async getAuthToken(): Promise<string | null> {
    if (!auth.currentUser) return null;
    
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Obtener custom claims del usuario
   */
  async getCustomClaims(): Promise<any> {
    if (!auth.currentUser) return null;
    
    try {
      const idTokenResult = await auth.currentUser.getIdTokenResult();
      return idTokenResult.claims;
    } catch (error) {
      console.error('Error getting custom claims:', error);
      return null;
    }
  }

  /**
   * Manejar errores de autenticación
   */
  private handleAuthError(error: any): AuthError {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión',
      'auth/invalid-credential': 'Credenciales inválidas'
    };

    return {
      code: error.code || 'auth/unknown',
      message: errorMessages[error.code] || error.message || 'Error de autenticación desconocido'
    };
  }

  /**
   * Observar cambios en el estado de autenticación
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

export const authService = new AuthService();