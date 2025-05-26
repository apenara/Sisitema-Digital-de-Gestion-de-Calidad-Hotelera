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
      setAuthState(prev => ({ ...prev, isLoading: true }));

      if (firebaseUser) {
        try {
          // Obtener datos del usuario desde Firestore
          const userData = await userService.getUserById(firebaseUser.uid);
          
          if (userData) {
            setAuthState({
              user: userData,
              firebaseUser,
              isLoading: false,
              isAuthenticated: true,
              error: null
            });
          } else {
            // Usuario no encontrado en Firestore
            await authService.logout();
            setAuthState({
              user: null,
              firebaseUser: null,
              isLoading: false,
              isAuthenticated: false,
              error: 'Usuario no encontrado en el sistema'
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setAuthState({
            user: null,
            firebaseUser: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Error al cargar datos del usuario'
          });
        }
      } else {
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
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.login(credentials);
      // El estado se actualizará automáticamente por onAuthStateChanged
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al iniciar sesión'
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
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al registrar usuario'
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
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al cerrar sesión'
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
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
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al actualizar perfil'
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    user: authState.user,
    firebaseUser: authState.firebaseUser,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;