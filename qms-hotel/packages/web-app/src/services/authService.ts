import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  confirmPasswordReset
} from 'firebase/auth';
import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { LoginCredentials, RegisterCredentials } from '../../../shared/types';
import type { AuthError } from '../../../shared/types/Auth';
import { userService } from './userService';
import { ROLE_PERMISSIONS } from '../../../shared/types/User';
import type { User } from '../types';

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
      
      // Attempt to update last login time
      try {
        await userService.updateLastLogin(userCredential.user.uid);
      } catch (error) {
        // Log critical error but allow login to proceed
        console.error(
          'CRITICAL: Failed to update last login time for user:',
          userCredential.user.uid,
          'Error:',
          error
        );
      }
      
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(credentials: RegisterCredentials): Promise<FirebaseUser> {
    let userCredential: UserCredential | null = null; 
    try {
      // Crear usuario en Firebase Auth
      userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Actualizar perfil con displayName
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName
      });

      // Crear documento de usuario en Firestore
      try {
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
          // userService.createUser uses serverTimestamp(), so no need to pass dates here
          // createdAt: new Date(), 
          // updatedAt: new Date(),
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
      } catch (firestoreError: any) {
        console.error('Firestore user creation failed after Firebase Auth user was created. Attempting to delete Firebase Auth user.', firestoreError);
        if (userCredential && userCredential.user) {
          try {
            await deleteUser(userCredential.user);
            console.log('Orphaned Firebase Auth user deleted successfully. UID:', userCredential.user.uid);
          } catch (deleteAuthUserError: any) {
            console.error('CRITICAL: Failed to delete orphaned Firebase Auth user. Manual cleanup may be required. UID:', userCredential.user.uid, deleteAuthUserError);
            // Decide if you want to throw a custom error here indicating the critical state
            // For now, we will re-throw the firestoreError, but this critical state should be logged
          }
        }
        // Re-throw the original Firestore error or a new error indicating partial registration failure
        // Using a generic error message to avoid exposing too much detail to the client,
        // while the console has the detailed firestoreError.
        throw new Error(`Registration failed: Could not create user profile. Original error: ${firestoreError.message}`);
      }

      return userCredential.user;
    } catch (error: any) {
      // This outer catch will now also catch errors re-thrown from the inner block
      // (like the new Error for Firestore issues) or errors from the initial
      // createUserWithEmailAndPassword/updateProfile (handled by handleAuthError).
      if (error.message.startsWith('Registration failed:')) {
        // This is one of the errors we threw from the inner catch block
        // It's not a standard Firebase Auth error, so handleAuthError might not be ideal
        // We can wrap it in a similar structure as AuthError or re-throw as is.
        // For simplicity, re-throwing for now. The UI should handle this generic error.
        throw error;
      }
      // If it's a Firebase Auth error from initial creation, handle it
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
  getCurrentUser(): User | null {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'user', // TODO: Obtener rol real del usuario
      createdAt: user.metadata.creationTime || new Date().toISOString(),
      updatedAt: user.metadata.lastSignInTime || new Date().toISOString()
    };
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

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }

  /**
   * Confirmar restablecimiento de contraseña
   */
  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }
}

export const authService = new AuthService();