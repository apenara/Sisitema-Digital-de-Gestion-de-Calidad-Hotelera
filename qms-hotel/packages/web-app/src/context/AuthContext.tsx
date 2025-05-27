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
            // Verificar si el usuario está activo
            if (!userData.isActive) {
              await authService.logout();
              setAuthState({
                user: null,
                firebaseUser: null,
                isLoading: false,
                isAuthenticated: false,
                error: 'Tu cuenta ha sido desactivada'
              });
              return;
            }

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
          await authService.logout();
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
      console.error('Login error:', error);
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