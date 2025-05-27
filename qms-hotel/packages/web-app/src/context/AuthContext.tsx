import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User
} from '../../../shared/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('[AuthContext] onAuthStateChanged triggered.');
      setAuthState(prev => ({ ...prev, isLoading: true }));

      if (firebaseUser) {
        console.log('[AuthContext] onAuthStateChanged: firebaseUser found. UID:', firebaseUser.uid);
        try {
          console.log('[AuthContext] onAuthStateChanged: Attempting to fetch user data from Firestore for UID:', firebaseUser.uid);
          const userData = await userService.getUserById(firebaseUser.uid);
          console.log('[AuthContext] onAuthStateChanged: userService.getUserById returned:', userData);
          
          if (userData) {
            console.log('[AuthContext] onAuthStateChanged: userData found for UID:', firebaseUser.uid, 'isActive:', userData.isActive);
            if (!userData.isActive) {
              console.log('[AuthContext] onAuthStateChanged: User is not active. UID:', firebaseUser.uid);
              await authService.logout();
              console.log('[AuthContext] onAuthStateChanged: Setting state for inactive user.');
              setAuthState({
                user: null,
                firebaseUser: null,
                isLoading: false,
                isAuthenticated: false,
                error: 'Tu cuenta ha sido desactivada'
              });
              return;
            }

            console.log('[AuthContext] onAuthStateChanged: Setting state for active user:', { user: userData, firebaseUser, isLoading: false, isAuthenticated: true, error: null });
            setAuthState({
              user: userData,
              firebaseUser,
              isLoading: false,
              isAuthenticated: true,
              error: null
            });
          } else {
            console.log('[AuthContext] onAuthStateChanged: No userData found in Firestore for UID:', firebaseUser.uid);
            await authService.logout();
            console.log('[AuthContext] onAuthStateChanged: Setting state for user not found in Firestore.');
            setAuthState({
              user: null,
              firebaseUser: null,
              isLoading: false,
              isAuthenticated: false,
              error: 'Usuario no encontrado en el sistema'
            });
          }
        } catch (error) {
          console.error('[AuthContext] onAuthStateChanged: Error loading user data:', error);
          await authService.logout();
          console.log('[AuthContext] onAuthStateChanged: Setting state due to error loading user data.');
          setAuthState({
            user: null,
            firebaseUser: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Error al cargar datos del usuario'
          });
        }
      } else {
        console.log('[AuthContext] onAuthStateChanged: No firebaseUser. User is logged out.');
        console.log('[AuthContext] onAuthStateChanged: Setting state for logged out user.');
        setAuthState({
          user: null,
          firebaseUser: null,
          isLoading: false,
          isAuthenticated: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('[AuthContext] Attempting login for:', credentials.email);
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.login(credentials);
      console.log('[AuthContext] authService.login call completed for:', credentials.email);

      // Manually refresh user state after login
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        console.log('[AuthContext] Login successful, manually refreshing user data for UID:', firebaseUser.uid);
        try {
          const userData = await userService.getUserById(firebaseUser.uid);
          console.log('[AuthContext] Login: userService.getUserById returned:', userData);
          if (userData) {
            if (userData.isActive) {
              console.log('[AuthContext] Login: User is active. Setting state.');
              setAuthState({
                user: userData,
                firebaseUser,
                isLoading: false,
                isAuthenticated: true,
                error: null
              });
            } else {
              console.warn('[AuthContext] Login: User is inactive. Logging out.');
              await authService.logout(); // This will trigger onAuthStateChanged to clear state
              setAuthState(prev => ({ // Set an immediate error for the login attempt
                ...prev,
                user: null,
                firebaseUser: null,
                isLoading: false,
                isAuthenticated: false,
                error: 'Tu cuenta ha sido desactivada.'
              }));
            }
          } else {
            console.warn('[AuthContext] Login: No userData found in Firestore after login. Logging out.');
            await authService.logout(); // This will trigger onAuthStateChanged
            setAuthState(prev => ({ // Set an immediate error
              ...prev,
              user: null,
              firebaseUser: null,
              isLoading: false,
              isAuthenticated: false,
              error: 'Usuario no encontrado en el sistema después del login.'
            }));
          }
        } catch (error: any) {
          console.error('[AuthContext] Login: Error manually refreshing user data:', error);
          await authService.logout(); // Log out on error
          const processedError = authService.handleAuthError(error);
          setAuthState(prev => ({
            ...prev,
            user: null,
            firebaseUser: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Error al cargar datos del usuario después del login: ' + processedError.message
          }));
          throw error; // Re-throw error to calling component
        }
      } else {
        // This case should ideally not happen if authService.login was successful,
        // but as a fallback:
        console.warn('[AuthContext] Login: auth.currentUser is null after authService.login completed.');
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          error: 'Error de autenticación: no se pudo obtener el usuario.'
        }));
      }

    } catch (error: any) {
      console.error('[AuthContext] Login method error:', error);
      // The error from the manual refresh block (if any) would have been caught and re-thrown.
      // If the error originated from authService.login itself, it's processed here.
      const processedError = authService.handleAuthError(error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: processedError.message
      }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.register(credentials);
      // El estado se actualizará automáticamente por onAuthStateChanged
    } catch (error: any) {
      console.error('Register error:', error);
      const processedError = authService.handleAuthError(error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: processedError.message
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.logout();
      // El estado se actualizará automáticamente por onAuthStateChanged
    } catch (error: any) {
      console.error('Logout error:', error);
      const processedError = authService.handleAuthError(error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: processedError.message
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.resetPassword(email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      console.error('Reset password error:', error);
      const processedError = authService.handleAuthError(error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: processedError.message
      }));
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      if (!authState.user) {
        throw new Error('Usuario no autenticado');
      }

      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await userService.updateUser(authState.user.id, data);
      
      // Recargar datos del usuario
      const updatedUser = await userService.getUserById(authState.user.id);
      if (updatedUser) {
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
          isLoading: false
        }));
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al actualizar perfil'
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;